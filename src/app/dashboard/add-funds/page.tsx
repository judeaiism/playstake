'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Add this import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const HOT_WALLET_ADDRESS = process.env.NEXT_PUBLIC_HOT_WALLET_ADDRESS;

export default function AddFundsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedToken, setSelectedToken] = useState('TRX');
  const [memo, setMemo] = useState('');
  const [walletAddress, setWalletAddress] = useState(''); // Initialize with an empty string
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const generateMemo = async () => {
        try {
          const response = await fetch('/api/generate-memo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.uid }),
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setMemo(data.memo);
        } catch (error) {
          console.error('Error generating memo:', error);
          toast({
            title: 'Error',
            description: 'Failed to generate memo. Please try again.',
            variant: 'destructive',
          });
        }
      };
      generateMemo();
    }
  }, [user, toast]);

  useEffect(() => {
    const fetchWalletAddress = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/wallet-address');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setWalletAddress(data.address || '');
      } catch (error) {
        console.error('Error fetching wallet address:', error);
        setError('Failed to fetch wallet address. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletAddress();
  }, []);

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
            <Label htmlFor="memo">Memo (Required)</Label>
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
              You must include this memo with your transaction for us to credit your account.
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
        </CardContent>
      </Card>
    </div>
  );
}