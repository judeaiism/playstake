import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getBalance, updateBalance } from '@/services/wallet';
import { startTransactionMonitor, stopTransactionMonitor } from '@/services/transactionMonitor';

export function useWallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<string>('0');

  const fetchBalance = useCallback(async () => {
    if (user?.walletAddress) {
      const newBalance = await getBalance(user.walletAddress as string);
      setBalance(newBalance);
      await updateBalance(user.uid, newBalance);
    }
  }, [user]);

  useEffect(() => {
    if (user?.walletAddress) {
      fetchBalance();
      startTransactionMonitor(user.walletAddress as string, user.uid);

      return () => {
        stopTransactionMonitor(user.walletAddress as string);
      };
    }
  }, [user, fetchBalance]);

  const refreshBalance = useCallback(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, refreshBalance };
}
