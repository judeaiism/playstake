import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign } from "lucide-react"

interface BalanceManagementProps {
  balance: number
}

export function BalanceManagement({ balance }: BalanceManagementProps) {
  const router = useRouter()

  const handleAddFunds = () => {
    router.push('/dashboard/add-funds')
  }

  const handleWithdraw = () => {
    // Implement withdraw functionality
    console.log("Withdraw functionality to be implemented")
  }

  return (
    <Card className="bg-gradient-to-br from-blue-800 to-blue-900 border-4 border-yellow-400 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-yellow-400">Balance Management</CardTitle>
        <CardDescription className="text-white">Manage your account balance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-white">Current Balance:</span>
          <span className="text-2xl font-bold text-yellow-400">${balance.toFixed(2)}</span>
        </div>
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