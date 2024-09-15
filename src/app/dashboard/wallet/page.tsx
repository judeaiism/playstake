'use client'

import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { BalanceManagement } from '@/components/dashboard/BalanceManagement';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

export default function WalletPage() {
  const { user } = useAuth();
  const { balance, refreshBalance } = useWallet();

  if (!user) {
    return <div>Loading...</div>;
  }

  const numericBalance = parseFloat(balance);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Wallet</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Address</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="break-all">{user.walletAddress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{balance} ETH</p>
          </CardContent>
        </Card>
        <BalanceManagement 
          balance={numericBalance} 
          updateBalance={refreshBalance} 
        />
      </div>
    </div>
  );
}