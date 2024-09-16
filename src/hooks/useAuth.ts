'use client'

import { useState, useEffect } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser)
        const userRef = doc(db, 'users', authUser.uid)
        const userSnap = await getDoc(userRef)
        
        if (userSnap.exists()) {
          await updateDoc(userRef, { isOnline: true })
        } else {
          await setDoc(userRef, {
            email: authUser.email,
            username: authUser.displayName || authUser.email?.split('@')[0] || 'User',
            isOnline: true,
            createdAt: new Date().toISOString(),
          })
        }
      } else {
        setUser(null)
        // If there was a previous user, set them as offline
        if (user) {
          const userRef = doc(db, 'users', user.uid)
          await updateDoc(userRef, { isOnline: false })
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  return { user, loading }
}
