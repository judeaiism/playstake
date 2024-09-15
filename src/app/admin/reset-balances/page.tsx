'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function ResetBalancesPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthenticate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (data.success) {
        setIsAuthenticated(true);
        toast({
          title: 'Success',
          description: 'Authentication successful',
          variant: 'default',
        });
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: 'Error',
        description: 'Authentication failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetBalances = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reset-balances', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'All user balances have been reset to zero',
          variant: 'default',
        });
      } else {
        throw new Error(data.error || 'Failed to reset balances');
      }
    } catch (error) {
      console.error('Error resetting balances:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reset balances. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Authentication</h1>
        <Input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
        />
        <Button onClick={handleAuthenticate} disabled={isLoading}>
          {isLoading ? 'Authenticating...' : 'Authenticate'}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Reset User Balances</h1>
      <Button onClick={handleResetBalances} disabled={isLoading}>
        {isLoading ? 'Resetting...' : 'Reset All Balances to Zero'}
      </Button>
    </div>
  );
}