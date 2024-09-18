'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
}

export default function ResetBalancesPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [adjustAmount, setAdjustAmount] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('admin'); // Add this line

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        console.log('Fetched users:', data.users); // Debug log
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast({
        title: 'Error',
        description: 'Failed to fetch users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    setIsLoading(true);
    setError(null);
    try {
      // Simulating authentication for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsAuthenticated(true);
      toast({
        title: 'Success',
        description: 'Authenticated successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
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

  const handleAdjustBalance = async (userId: string) => {
    setIsLoading(true);
    try {
      const amount = parseFloat(adjustAmount[userId]);
      if (isNaN(amount)) {
        throw new Error('Invalid amount');
      }

      const response = await fetch('/api/admin/adjust-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount }),
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: `Balance adjusted for user ${userId}`,
          variant: 'default',
        });
        fetchUsers(); // Refresh user list
      } else {
        throw new Error(data.error || 'Failed to adjust balance');
      }
    } catch (error) {
      console.error('Error adjusting balance:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to adjust balance. Please try again.',
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
        <form onSubmit={handleAuthenticate}>
          {/* Hidden username field */}
          <input
            type="text"
            id="admin-username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="hidden"
          />
          
          <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-2">
            Admin Password
          </label>
          <Input
            id="admin-password"
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
            autoComplete="current-password"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Authenticate'}
          </Button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">User Balance Management</h1>
      <Button onClick={handleResetBalances} disabled={isLoading} className="mb-8">
        {isLoading ? 'Resetting...' : 'Reset All Balances to Zero'}
      </Button>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {isLoading ? (
        <p>Loading users...</p>
      ) : users.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Current Balance</TableHead>
              <TableHead>Adjust Balance</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>${user.balance.toFixed(2)}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={adjustAmount[user.id] || ''}
                    onChange={(e) => setAdjustAmount({ ...adjustAmount, [user.id]: e.target.value })}
                    className="w-24"
                  />
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleAdjustBalance(user.id)} disabled={isLoading}>
                    Adjust
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
}