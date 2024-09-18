import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, Clock } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal'
  amount: number
  date: string
}

interface BalanceManagementProps {
  balance: number
  transactions?: Transaction[]
}

export function BalanceManagement({ balance, transactions = [] }: BalanceManagementProps) {
  const router = useRouter()
  const [showHistory, setShowHistory] = useState(false)

  const handleAddFunds = () => {
    router.push('/dashboard/add-funds')
  }

  const handleWithdraw = () => {
    // Implement withdraw functionality
    console.log("Withdraw functionality to be implemented")
  }

  const toggleHistory = () => {
    setShowHistory(!showHistory)
  }

  return (
    <Card className="bg-gradient-to-br from-blue-800 to-blue-900 border-4 border-yellow-400 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-yellow-400">Balance Management</CardTitle>
        <CardDescription className="text-white">Manage your account balance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-medium text-white">Current Balance:</span>
          <span className="text-2xl font-bold text-yellow-400">${balance.toFixed(2)}</span>
        </div>
        <Button
          variant="secondary"
          size="small"
          className="text-white border-white hover:bg-blue-700"
          onClick={toggleHistory}
        >
          <Clock className="mr-2 h-4 w-4" /> {showHistory ? 'Hide' : 'Show'} Transaction History
        </Button>
        {showHistory && (
          transactions.length > 0 ? (
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-yellow-400">Type</TableHead>
                  <TableHead className="text-yellow-400">Amount</TableHead>
                  <TableHead className="text-yellow-400">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-white capitalize">{transaction.type}</TableCell>
                    <TableCell className="text-white">${transaction.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-white">{transaction.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-white mt-4">No transaction history available.</p>
          )
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="default"
          size="large"
          className="bg-green-500 hover:bg-green-600 text-white font-bold"
          onClick={handleAddFunds}
        >
          <DollarSign className="mr-2 h-4 w-4" /> Add Funds
        </Button>
        <Button
          variant="default"
          size="large"
          className="bg-red-500 hover:bg-red-600 text-white font-bold"
          onClick={handleWithdraw}
        >
          <DollarSign className="mr-2 h-4 w-4" /> Withdraw
        </Button>
      </CardFooter>
    </Card>
  )
}