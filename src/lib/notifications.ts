import { toast } from 'react-hot-toast'

export const notifyDeposit = (amount: string) => {
  // Implement your notification logic, e.g., using toast
  // Example with react-hot-toast
  toast.success(`Successfully deposited ${amount} ETH`)
}
