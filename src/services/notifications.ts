import { db } from '@/config/firebase';
import { addDoc, collection } from 'firebase/firestore';

export async function createNotification(userId: string, message: string) {
  await addDoc(collection(db, 'notifications'), {
    userId,
    message,
    createdAt: new Date(),
    read: false,
  });
}
