"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowDownIcon, ArrowUpIcon, DollarSignIcon, SparklesIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast";

export default function FundsPage() {
  const { toast } = useToast();
  const [isFlashing, setIsFlashing] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [showAllTransactions, setShowAllTransactions] = useState(false)
  const [isAtlosLoaded, setIsAtlosLoaded] = useState(false);
  const [atlosError, setAtlosError] = useState<string | null>(null);

  useEffect(() => {
    const flashInterval = setInterval(() => {
      setIsFlashing((prev) => !prev)
    }, 500)

    return () => clearInterval(flashInterval)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.atlos) {
        setIsAtlosLoaded(true);
      } else {
        const script = document.querySelector('script[src="https://atlos.io/packages/app/atlos.js"]');
        if (script) {
          script.addEventListener('load', () => {
            setIsAtlosLoaded(true);
            console.log('ATLOS script loaded', window.atlos);
          });
        } else {
          console.error('ATLOS script not found in the document');
          setAtlosError('ATLOS script not found');
        }
      }
    }
  }, []);

  const handleAtlosPayment = () => {
    if (isAtlosLoaded && window.atlos) {
      const amount = parseFloat(depositAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid deposit amount.",
          variant: "destructive",
        });
        return;
      }

      console.log('Initiating ATLOS payment');
      const paymentDetails = {
        merchantId: process.env.NEXT_PUBLIC_ATLOS_MERCHANT_ID, // Use an environment variable
        orderId: `deposit-${Date.now()}`,
        orderAmount: amount,
        orderCurrency: 'USD',
        recurrence: window.atlos.RECURRENCE_NONE,
        onSuccess: (result: any) => {
          console.log('ATLOS payment successful', result);
          handleDeposit(result);
        },
        onCanceled: () => {
          console.log('ATLOS payment canceled');
          toast({
            title: "Payment Canceled",
            description: "The payment process was canceled.",
            variant: "default",
          });
        },
        onError: (error: any) => {
          console.error('ATLOS payment error:', error);
          let errorMessage = 'An unknown error occurred';
          if (error.message) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
          console.error('Error details:', JSON.stringify(error, null, 2));
          setAtlosError(errorMessage);
          toast({
            title: "Payment Error",
            description: `Error: ${errorMessage}. Please check your network connection and try again.`,
            variant: "destructive",
          });
        },
        theme: 'light',
      };

      console.log('Payment details:', JSON.stringify(paymentDetails, null, 2));

      try {
        window.atlos.Pay(paymentDetails);
      } catch (error) {
        console.error('Error calling ATLOS Pay:', error);
        setAtlosError('Error initiating payment');
        toast({
          title: "Payment Error",
          description: "Failed to initiate payment. Please check your network connection and try again.",
          variant: "destructive",
        });
      }
    } else {
      console.error('ATLOS not loaded or unavailable');
      toast({
        title: "Error",
        description: atlosError || "Payment system is not ready. Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  const handleDeposit = (transactionDetails: any) => {
    console.log("Deposit successful:", transactionDetails);
    // Here you would typically update the user's balance in your backend
    // and then update the UI to reflect the new balance
    toast({
      title: "Deposit Successful",
      description: `Successfully deposited ${depositAmount} USD`,
      variant: "default",
    });
    setDepositAmount("");
  };

  const handleWithdraw = () => {
    console.log("Withdrawing:", withdrawAmount)
  }

  const transactions = [
    { type: 'Deposit', amount: 500, date: '2023-06-15' },
    { type: 'Withdrawal', amount: -200, date: '2023-06-10' },
    { type: 'Deposit', amount: 1000, date: '2023-06-05' },
    { type: 'Withdrawal', amount: -150, date: '2023-06-01' },
    { type: 'Deposit', amount: 300, date: '2023-05-28' },
    { type: 'Withdrawal', amount: -100, date: '2023-05-25' },
    { type: 'Deposit', amount: 750, date: '2023-05-20' },
    { type: 'Withdrawal', amount: -300, date: '2023-05-15' },
  ]

  const visibleTransactions = showAllTransactions ? transactions : transactions.slice(0, 4)

  const toggleTransactions = () => {
    setShowAllTransactions(!showAllTransactions)
  }

  return (
    <div className="container mx-auto py-10 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <h1 className="text-4xl font-bold mb-8 text-white text-center">Funds Management</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Current Balance</CardTitle>
            <CardDescription className="text-center">Your available funds for betting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <DollarSignIcon className="mr-2 h-8 w-8 text-green-500" />
              <span className="text-5xl font-bold text-green-500">0</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Manage Funds</CardTitle>
            <CardDescription className="text-center">Deposit or withdraw funds from your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deposit-amount" className="text-green-600">Deposit Amount</Label>
                <div className="relative">
                  <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                  <Input
                    id="deposit-amount"
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-8 border-green-500"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600" 
                  onClick={handleAtlosPayment}
                  disabled={!isAtlosLoaded || !!atlosError}
                >
                  <ArrowDownIcon className="mr-2 h-4 w-4" />
                  {isAtlosLoaded ? (atlosError ? 'ATLOS Error' : 'Deposit with ATLOS') : 'Loading ATLOS...'}
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount" className="text-red-600">Withdraw Amount</Label>
                <div className="relative">
                  <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500" />
                  <Input
                    id="withdraw-amount"
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-8 border-red-500"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>
                <Button className="w-full bg-red-500 hover:bg-red-600" onClick={handleWithdraw}>
                  <ArrowUpIcon className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-8 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Transaction History</CardTitle>
          <CardDescription className="text-center">Recent deposits and withdrawals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {visibleTransactions.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center w-1/3">
                  {transaction.type === 'Deposit' ? (
                    <ArrowDownIcon className="mr-2 h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowUpIcon className="mr-2 h-4 w-4 text-red-500" />
                  )}
                  <span>{transaction.type}</span>
                </div>
                <div className="w-1/3 text-center">
                  <span className={`inline-flex items-center ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <DollarSignIcon className="mr-1 h-4 w-4" />
                    <span className="tabular-nums">{Math.abs(transaction.amount).toFixed(2)}</span>
                  </span>
                </div>
                <span className="w-1/3 text-right text-sm text-gray-500">{transaction.date}</span>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" className="w-full" onClick={toggleTransactions}>
            {showAllTransactions ? "Show Less Transactions" : "View All Transactions"}
          </Button>
        </CardFooter>
      </Card>
      <div className="fixed bottom-4 right-4">
        <SparklesIcon 
          className={`h-12 w-12 ${isFlashing ? 'text-yellow-400' : 'text-yellow-200'} transition-colors duration-300`} 
          aria-hidden="true"
        />
      </div>
    </div>
  )
}