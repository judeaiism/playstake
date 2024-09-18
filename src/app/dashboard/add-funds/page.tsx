'use client'

import { useState, useEffect } from 'react';
import TronWeb from 'tronweb';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const HOT_WALLET_ADDRESS = process.env.NEXT_PUBLIC_HOT_WALLET_ADDRESS;

// Initialize TronWeb
const tronWeb = new TronWeb({
  fullHost: process.env.NEXT_PUBLIC_TRON_FULL_HOST || 'https://api.trongrid.io',
  privateKey: '' // Add an empty string as a placeholder for the private key
});

// Set the API key separately
if (process.env.NEXT_PUBLIC_TRON_API_KEY) {
  (tronWeb as any).setHeader({"TRON-PRO-API-KEY": process.env.NEXT_PUBLIC_TRON_API_KEY});
}

console.log('TronWeb fullHost:', process.env.NEXT_PUBLIC_TRON_FULL_HOST);
console.log('TronWeb API Key set:', !!process.env.NEXT_PUBLIC_TRON_API_KEY);

// After TronWeb initialization
console.log('TronWeb initialized');

async function checkTransactionOnBlockchain(txHash: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} to check transaction ${txHash}`);
      const tx = await (tronWeb as any).trx.getTransaction(txHash);
      console.log('Transaction data:', JSON.stringify(tx, null, 2));
      if (tx && tx.ret && tx.ret[0].contractRet === 'SUCCESS') {
        return { status: 'confirmed', data: tx };
      } else if (tx) {
        return { status: 'pending', data: tx };
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
    }
    // Wait for 5 seconds before the next retry
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  return { status: 'not_found', message: 'Transaction not found on the blockchain after multiple attempts.' };
}

async function checkTransactionOnExplorer(txHash: string) {
  try {
    const response = await fetch(`https://apilist.tronscan.org/api/transaction-info?hash=${txHash}`);
    const data = await response.json();
    if (data && data.confirmed) {
      return { status: 'confirmed', data };
    } else if (data) {
      return { status: 'pending', data };
    }
  } catch (error) {
    console.error('Error checking transaction on explorer:', error);
  }
  return { status: 'not_found', message: 'Transaction not found on the explorer.' };
}

export default function AddFundsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedToken, setSelectedToken] = useState('TRX');
  const [memo, setMemo] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchUniqueAddress = async () => {
    try {
      console.log('Fetching unique address...');
      setIsLoading(true);
      setError(null);

      if (!user) {
        console.log('User is not authenticated');
        throw new Error('User is not authenticated');
      }

      console.log('Sending request to /api/generate-address');
      const response = await fetch('/api/generate-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      });
      
      console.log('Response received:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
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
    console.log('User state changed:', user);
    if (user) {
      fetchUniqueAddress();
    } else {
      setWalletAddress('');
      setMemo('');
      setError('Please sign in to generate a deposit address.');
    }
  }, [user]);

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

  const checkAndUpdateBalance = async (manualAmount?: string, manualHash?: string) => {
    if (!user) return;

    const amountToUse = manualAmount || amount;
    const hashToUse = manualHash || transactionHash;

    console.log('Checking transaction:', { hash: hashToUse, amount: amountToUse });

    try {
      setIsVerifying(true);
      setTransactionStatus('Verifying transaction...');

      // Check transaction status on the blockchain
      let blockchainStatus = await checkTransactionOnBlockchain(hashToUse);
      console.log('Blockchain transaction status:', blockchainStatus);

      if (blockchainStatus.status === 'not_found') {
        console.log('Transaction not found via TronWeb, trying explorer...');
        blockchainStatus = await checkTransactionOnExplorer(hashToUse);
        console.log('Explorer transaction status:', blockchainStatus);
      }

      if (blockchainStatus.status !== 'confirmed') {
        setTransactionStatus(blockchainStatus.message || 'Transaction not confirmed');
        toast({
          title: 'Transaction Not Confirmed',
          description: blockchainStatus.message || 'Transaction is not confirmed on the blockchain.',
          variant: 'default',
        });
        return;
      }

      // If we get here, the transaction is confirmed
      console.log('Transaction confirmed, sending to API');
      const response = await fetch('/api/add-funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          amount: amountToUse,
          transactionHash: hashToUse,
        }),
      });

      const data = await response.json();
      console.log('API response:', data);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.error || 'Failed to update balance');
      }

      setTransactionStatus('Balance updated successfully');
      toast({
        title: 'Success',
        description: 'Your balance has been updated.',
        variant: 'default',
      });

    } catch (error) {
      console.error('Error updating balance:', error);
      setTransactionStatus('Failed to update balance');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
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
              <Button onClick={() => checkAndUpdateBalance(amount, transactionHash)} disabled={isVerifying}>
                {isVerifying ? 'Verifying...' : 'Check and Update Balance'}
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