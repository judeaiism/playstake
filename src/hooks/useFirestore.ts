import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, addDoc, collection, increment, serverTimestamp } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'
import { toast } from 'react-hot-toast'

export function useFirestore() {
  const updateDocument = async (collectionName: string, docId: string, data: any) => {
    try {
      const docRef = doc(db, collectionName, docId)
      await updateDoc(docRef, data)
    } catch (error) {
      handleFirestoreError(error)
      throw error
    }
  }

  const addDocument = async (collectionName: string, data: any) => {
    try {
      const collectionRef = collection(db, collectionName)
      return await addDoc(collectionRef, {
        ...data,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      handleFirestoreError(error)
      throw error
    }
  }

  const incrementField = async (collectionName: string, docId: string, field: string, amount: number) => {
    try {
      const docRef = doc(db, collectionName, docId)
      await updateDoc(docRef, {
        [field]: increment(amount)
      })
    } catch (error) {
      handleFirestoreError(error)
      throw error
    }
  }

  const handleFirestoreError = (error: any) => {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'permission-denied':
          toast.error('You do not have permission to perform this action. Please contact support.')
          break
        case 'not-found':
          toast.error('The requested data was not found. Please try again.')
          break
        default:
          toast.error(`An error occurred: ${error.message}`)
      }
    } else {
      toast.error('An unexpected error occurred. Please try again.')
    }
  }

  return { updateDocument, addDocument, incrementField }
}
