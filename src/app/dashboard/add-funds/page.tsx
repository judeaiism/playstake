'use client'

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const HOT_WALLET_ADDRESS = process.env.NEXT_PUBLIC_HOT_WALLET_ADDRESS;

export default function AddFundsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedToken, setSelectedToken] = useState('TRX');

  const handleCopyAddress = () => {
    if (HOT_WALLET_ADDRESS) {
      navigator.clipboard.writeText(HOT_WALLET_ADDRESS);
      toast({
        title: 'Address Copied',
        description: 'The deposit address has been copied to your clipboard.',
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
              value={HOT_WALLET_ADDRESS}
              readOnly
              className="flex-grow mr-2"
            />
            <Button onClick={handleCopyAddress} variant="secondary">
              Copy
            </Button>
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
        </CardContent>
      </Card>
    </div>
  );
}