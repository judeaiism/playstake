import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, MinusCircle } from "lucide-react"

interface BalanceManagementProps {
  balance: number
}

export function BalanceManagement({ balance }: BalanceManagementProps) {
  const handleAddBalance = () => {
    // Implement add balance logic here
    console.log('Add balance')
  }

  const handleWithdraw = () => {
    // Implement withdraw logic here
    console.log('Withdraw')
  }

  return (
    <Card className="bg-gradient-to-br from-blue-800 to-blue-900 border-4 border-yellow-400 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-yellow-400">Balance Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-white">Current Balance:</span>
          <span className="text-2xl font-bold text-yellow-400">${balance.toFixed(2)}</span>
        </div>
        <div className="flex space-x-4">
          <Button
            onClick={handleAddBalance}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Funds
          </Button>
          <Button
            onClick={handleWithdraw}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
          >
            <MinusCircle className="mr-2 h-4 w-4" /> Withdraw
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}