'use client'

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface TransactionListenerProps {
  depositAddress: string;
  expectedAmount: number;
  onTransactionConfirmed: () => void;
}

export default function TransactionListener({ depositAddress, expectedAmount, onTransactionConfirmed }: TransactionListenerProps) {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  const checkTransaction = useCallback(async () => {
    if (isChecking) return;

    setIsChecking(true);
    try {
      const response = await fetch('/api/check-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ depositAddress, expectedAmount }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.confirmed) {
        onTransactionConfirmed();
      }
    } catch (error) {
      console.error('Error checking transaction:', error);
      setErrorCount(prevCount => prevCount + 1);
      
      if (errorCount < 5) {
        toast({
          title: 'Error',
          description: `Failed to verify transaction. Retrying... (Attempt ${errorCount + 1}/5)`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to verify transaction after multiple attempts. Please contact support.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsChecking(false);
    }
  }, [depositAddress, expectedAmount, onTransactionConfirmed, errorCount, isChecking]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (errorCount < 5) {
        checkTransaction();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [checkTransaction, errorCount]);

  return null; // This component doesn't render anything
}