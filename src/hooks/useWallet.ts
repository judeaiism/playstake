import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { updateBalance } from '@/services/wallet';
import { startTransactionMonitor, stopTransactionMonitor } from '@/services/transactionMonitor';
import { getBalance } from '@/services/blockchain';
import { User } from '@/types/user';

export function useWallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<string>('0');

  const fetchBalance = useCallback(async () => {
    if (user?.walletAddress) {
      const newBalance = await getBalance(user.walletAddress);
      setBalance(newBalance);
      await updateBalance(user.uid, newBalance);
    }
  }, [user]);

  useEffect(() => {
    if (user?.walletAddress) {
      fetchBalance();
      startTransactionMonitor(user.walletAddress, user.uid);

      return () => {
        if (user.walletAddress) {
          stopTransactionMonitor(user.walletAddress);
        }
      };
    }
  }, [user, fetchBalance]);

  const refreshBalance = useCallback(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, refreshBalance };
}
