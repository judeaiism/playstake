'use client'

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ethers } from 'ethers';
import { infuraProviders } from '@/config/infura';
import { useToast } from '@/components/ui/use-toast';

export default function AddFundsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddFunds = async () => {
    setError('');
    setSuccess('');

    if (!amount || isNaN(Number(amount))) {
      setError('Please enter a valid amount');
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      const amountWei = ethers.utils.parseEther(amount);
      const wallet = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY!, infuraProviders.mainnet);
      
      const tx = await wallet.sendTransaction({
        to: user?.walletAddress,
        value: amountWei
      });

      await tx.wait();
      setSuccess(`Successfully added ${amount} ETH to your wallet`);
      toast({
        title: 'Success',
        description: `Successfully added ${amount} ETH to your wallet`,
        variant: 'default',
      });
      setAmount('');
    } catch (err) {
      setError('Failed to add funds. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to add funds. Please try again.',
        variant: 'destructive',
      });
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Add Funds</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add ETH to Your Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="number"
            placeholder="Amount in ETH"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleAddFunds}>Add Funds</Button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {success && <p className="text-green-500 mt-2">{success}</p>}
        </CardContent>
      </Card>
    </div>
  );
}