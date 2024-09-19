import { useState, useEffect } from 'react'
import { signOut as firebaseSignOut, Auth, User, onAuthStateChanged } from 'firebase/auth'
import { doc, updateDoc, Firestore } from 'firebase/firestore'
import { auth as firebaseAuth, db as firebaseDb } from './firebase/firebase'

// Explicitly type the imported auth and db
const auth: Auth = firebaseAuth
const db: Firestore = firebaseDb

export const signOut = async () => {
  try {
    const user = auth.currentUser
    if (user) {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, { isOnline: false })
    }
    await firebaseSignOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, loading }
}
