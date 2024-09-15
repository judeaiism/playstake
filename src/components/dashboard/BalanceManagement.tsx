import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface BalanceManagementProps {
  balance: number;
  updateBalance: () => void;
}

export function BalanceManagement({ balance, updateBalance }: BalanceManagementProps) {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2">Current Balance: {user?.balance.toFixed(2)} ETH</p>
        <p className="mb-4 text-sm break-all">Wallet Address: {user?.walletAddress}</p>
        <div className="flex space-x-4">
          <Link href="/dashboard/add-funds" passHref>
            <Button>Add Funds</Button>
          </Link>
          <Link href="/dashboard/withdraw" passHref>
            <Button disabled={user?.balance === 0}>Withdraw</Button>
          </Link>
          {updateBalance && (
            <Button onClick={updateBalance}>Refresh Balance</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}