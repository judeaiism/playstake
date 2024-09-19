import { db } from '@/lib/firebase/firebase'
import { doc, updateDoc, addDoc, collection, increment, arrayUnion } from 'firebase/firestore'

export function useFirestore() {
  const updateDocument = async (collectionName: string, docId: string, data: any) => {
    const docRef = doc(db, collectionName, docId)
    await updateDoc(docRef, data)
  }

  const addDocument = async (collectionName: string, data: any) => {
    const collectionRef = collection(db, collectionName)
    await addDoc(collectionRef, data)
  }

  const incrementField = async (collectionName: string, docId: string, field: string, amount: number) => {
    const docRef = doc(db, collectionName, docId)
    await updateDoc(docRef, {
      [field]: increment(amount)
    })
  }

  return { updateDocument, addDocument, incrementField }
}
