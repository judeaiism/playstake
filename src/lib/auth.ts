import { signOut as firebaseSignOut } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

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
