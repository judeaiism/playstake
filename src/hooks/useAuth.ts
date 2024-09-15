'use client'

import { useState, useEffect } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

interface ExtendedUser extends User {
  username?: string
  walletAddress?: string
  balance?: string
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
            id: firebaseUser.uid // Add the id property here
          })
        } else {
          setUser({
            ...firebaseUser,
            id: firebaseUser.uid // Add the id property here
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
      await auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return { user, loading, signOut }
}
