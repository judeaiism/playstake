'use client'

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Add this import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const HOT_WALLET_ADDRESS = process.env.NEXT_PUBLIC_HOT_WALLET_ADDRESS;

export default function AddFundsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedToken, setSelectedToken] = useState('TRX');
  const [memo, setMemo] = useState('');
  const [walletAddress, setWalletAddress] = useState(''); // Initialize with an empty string
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [transactionHash, setTransactionHash] = useState('');

  const transactionListenerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUniqueAddress = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User is not authenticated');
      }

      const response = await fetch('/api/generate-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}, details: ${errorData.details || 'No details provided'}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setWalletAddress(data.address);
      setMemo(data.memo || '');
    } catch (error) {
      console.error('Error generating unique address:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate unique address. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUniqueAddress();
      setupTransactionListener();
    } else {
      setWalletAddress('');
      setMemo('');
      setError('Please sign in to generate a deposit address.');
    }

    return () => {
      // Clean up the transaction listener using the ref
      if (transactionListenerRef.current) {
        clearInterval(transactionListenerRef.current);
      }
    };
  }, [user]);

  const setupTransactionListener = () => {
    if (!user || !walletAddress) return;

    transactionListenerRef.current = setInterval(async () => {
      try {
        const response = await fetch('/api/check-transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: walletAddress, token: selectedToken }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // ... handle transaction status ...

      } catch (error) {
        console.error('Error checking transactions:', error);
        toast({
          title: 'Error',
          description: 'Failed to check transaction status. Please refresh the page.',
          variant: 'destructive',
        });
      }
    }, 30000);
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: 'Address Copied',
        description: 'The deposit address has been copied to your clipboard.',
        variant: 'default',
      });
    }
  };

  const handleCopyMemo = () => {
    if (memo) {
      navigator.clipboard.writeText(memo);
      toast({
        title: 'Memo Copied',
        description: 'The memo has been copied to your clipboard.',
        variant: 'default',
      });
    }
  };

  const checkAndUpdateBalance = async () => {
    if (!user || !transactionHash || !amount) return;

    console.log('Memo value:', memo);

    try {
      setIsLoading(true);
      setTransactionStatus('Verifying transaction...');
      const response = await fetch('/api/add-funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          amount,
          transactionHash,
          memo
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error response:', data);
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        setTransactionStatus('Transaction confirmed and balance updated');
        toast({
          title: 'Success',
          description: `Your balance has been updated with ${amount} ${selectedToken}`,
          variant: 'default',
        });
      } else {
        setTransactionStatus('Transaction verification failed');
        toast({
          title: 'Error',
          description: data.error || 'Failed to verify transaction',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      setTransactionStatus('Failed to update balance');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update balance. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Add Funds</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add {selectedToken} to Your Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Send {selectedToken} to the following address:</p>
          <div className="flex items-center mb-4">
            <Input
              value={walletAddress}
              readOnly
              className="flex-grow mr-2"
            />
            <Button onClick={handleCopyAddress} variant="secondary" aria-label="Copy wallet address">
              Copy
            </Button>
          </div>
          <div className="mb-4">
            <Label htmlFor="memo">Memo (Optional)</Label>
            <div className="flex items-center">
              <Input
                id="memo"
                value={memo}
                readOnly
                className="flex-grow mr-2"
              />
              <Button onClick={handleCopyMemo} variant="secondary" aria-label="Copy memo">
                Copy
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              If your wallet supports memos, please include this memo with your transaction. If not, you can ignore it.
            </p>
          </div>
          <Select
            value={selectedToken}
            onValueChange={(value: string) => setSelectedToken(value)}
          >
            <SelectTrigger className="mb-4">
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TRX">TRX</SelectItem>
              <SelectItem value="USDT">USDT</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mb-4">
            Your balance will be updated automatically once the transaction is confirmed on the blockchain. This may take a few minutes.
          </p>
          <p className="text-sm text-gray-500">
            Important: Only send {selectedToken} to this address. Sending any other token may result in permanent loss.
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="wallet-address">Wallet Address</Label>
              {isLoading ? (
                <p>Loading wallet address...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <Input
                  id="wallet-address"
                  value={walletAddress}
                  readOnly
                  className="font-mono"
                />
              )}
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Confirm Transaction</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter the amount you sent"
                />
              </div>
              <div>
                <Label htmlFor="transaction-hash">Transaction Hash</Label>
                <Input
                  id="transaction-hash"
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                  placeholder="Enter the transaction hash"
                />
              </div>
              <Button onClick={checkAndUpdateBalance} disabled={isLoading}>
                {isLoading ? 'Checking...' : 'Check and Update Balance'}
              </Button>
            </div>
          </div>
          {transactionStatus && (
            <Alert className="mt-4">
              <AlertTitle>Transaction Status</AlertTitle>
              <AlertDescription>{transactionStatus}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}