'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import TransactionListener from '@/components/transaction-listener';
import AnimatedCircularProgressBar from '@/components/magicui/animated-circular-progress-bar';

const TIMER_DURATION = 22 * 60; // 22 minutes in seconds

export default function AddFundsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [depositAddress, setDepositAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (user) {
      generateDepositAddress();
    }
  }, [user]);

  useEffect(() => {
    if (depositAddress && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      generateDepositAddress();
    }
  }, [depositAddress, timeLeft]);

  const generateDepositAddress = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-deposit-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.depositAddress) {
        setDepositAddress(data.depositAddress);
        setTimeLeft(TIMER_DURATION);
      } else {
        throw new Error('Failed to generate deposit address');
      }
    } catch (error) {
      console.error('Error generating deposit address:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate deposit address. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartListening = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount greater than 0.',
        variant: 'destructive',
      });
      return;
    }
    setIsListening(true);
  };

  const progressPercentage = Math.round(((TIMER_DURATION - timeLeft) / TIMER_DURATION) * 100);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Add Funds</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add ETH to Your Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="mb-4">Generating deposit address...</p>
          ) : depositAddress ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p>Send ETH to this address:</p>
                <AnimatedCircularProgressBar
                  max={100}
                  value={progressPercentage}
                  min={0}
                  gaugePrimaryColor="#3b82f6"
                  gaugeSecondaryColor="#e5e7eb"
                  className="size-20"
                />
              </div>
              <Input
                value={depositAddress}
                readOnly
                className="mb-4"
              />
              <p className="text-sm text-gray-500 mb-4">
                Address valid for {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? '0' : ''}{timeLeft % 60}
              </p>
            </>
          ) : (
            <Button onClick={generateDepositAddress} variant="primary" size="medium" className="mb-4">
              Generate New Address
            </Button>
          )}
          <Input
            type="number"
            placeholder="Amount in ETH"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mb-4"
          />
          <p className="text-sm text-gray-500 mb-4">
            Your balance will be updated automatically once the transaction is confirmed on the blockchain. This may take a few minutes.
          </p>
          {depositAddress && amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && !isLoading && !isListening && (
            <Button onClick={handleStartListening} variant="primary" size="medium">
              Fund Now
            </Button>
          )}
          {isListening && (
            <p>Waiting for payment confirmation...</p>
          )}
        </CardContent>
      </Card>
      {isListening && (
        <TransactionListener
          depositAddress={depositAddress}
          expectedAmount={parseFloat(amount)}
          onTransactionConfirmed={() => {
            setIsListening(false);
            toast({
              title: 'Success',
              description: 'Funds have been added to your account.',
              variant: 'default',
            });
          }}
        />
      )}
    </div>
  );
}