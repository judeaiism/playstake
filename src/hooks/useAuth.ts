'use client'

import { useState, useEffect } from 'react'
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

interface ExtendedUser extends User {
  username?: string
  walletAddress?: string
  balance: number
  id: string
}

export function useAuth() {
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid)
        const userDocSnap = await getDoc(userDocRef)
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data()
          setUser({ 
            ...firebaseUser, 
            username: userData.username, 
            walletAddress: userData.walletAddress,
            balance: Number(userData.balance) || 0, // Ensure balance is a number
            id: firebaseUser.uid
          })
        } else {
          setUser({
            ...firebaseUser,
            balance: 0, // Set balance to 0 if user document doesn't exist
            id: firebaseUser.uid
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return { user, loading, signOut }
}
