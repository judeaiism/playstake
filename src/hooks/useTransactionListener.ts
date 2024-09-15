import { useEffect } from 'react'
import { ethers } from 'ethers'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { useAuth } from './useAuth'

const INFURA_PROJECT_ID = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID

export function useTransactionListener() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.walletAddress) return

    const provider = new ethers.providers.InfuraProvider('sepolia', INFURA_PROJECT_ID)

    const filter = {
      address: user.walletAddress,
      // You can add more filters if needed
    }

    const onReceive = async (from: string, amount: ethers.BigNumber, tx: ethers.providers.TransactionResponse) => {
      try {
        const ethAmount = ethers.utils.formatEther(amount)
        if (user.id) {
          const userDocRef = doc(db, 'users', user.id)
          await updateDoc(userDocRef, {
            balance: ethers.utils.parseEther(
              (parseFloat(ethAmount) + parseFloat(user.balance || '0')).toString()
            ).toString()
          })
        }
        // TODO: Implement notification
      } catch (error) {
        console.error('Error updating balance:', error)
      }
    }

    provider.on(filter, (log: ethers.providers.Log) => {
      provider.getTransaction(log.transactionHash).then(tx => {
        if (tx && tx.to?.toLowerCase() === user.walletAddress?.toLowerCase()) {
          const amount = tx.value
          onReceive(tx.from, amount, tx)
        }
      })
    })

    return () => {
      provider.removeAllListeners(filter)
    }
  }, [user])
}
