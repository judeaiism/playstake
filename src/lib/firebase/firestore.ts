import { getFirestore, doc, getDoc, setDoc, updateDoc, runTransaction, increment } from 'firebase/firestore';
import { app } from './firebase'; // Ensure this file exists and initializes Firebase

const db = getFirestore(app);

export async function getUserBalance(userId: string): Promise<number> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data().balance || 0;
  }
  return 0;
}

export async function createOrder(orderId: string, userId: string, amount: number) {
  const orderRef = doc(db, 'orders', orderId);
  await setDoc(orderRef, { userId, amount, status: 'pending' });
}

export async function updateUserBalance(orderId: string, amount: number) {
  const orderRef = doc(db, 'orders', orderId);
  const orderDoc = await getDoc(orderRef);

  if (!orderDoc.exists()) {
    throw new Error('Order not found');
  }

  const userId = orderDoc.data().userId;
  const userRef = doc(db, 'users', userId);

  await updateDoc(userRef, {
    balance: increment(amount)
  });
}