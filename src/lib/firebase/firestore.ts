import { auth, db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, runTransaction, increment } from 'firebase/firestore';
import { getCurrentUser } from './auth';

export async function getUserBalance(userId: string): Promise<number> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data().balance || 0;
  }
  return 0;
}

export async function createOrder(orderId: string, userId: string, amount: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const orderRef = doc(db, 'orders', orderId);
  await setDoc(orderRef, { userId, amount, status: 'pending' });
}

export async function updateUserBalance(orderId: string, amount: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const orderRef = doc(db, 'orders', orderId);
  const orderDoc = await getDoc(orderRef);

  if (!orderDoc.exists()) {
    throw new Error('Order not found');
  }

  const userId = orderDoc.data().userId;
  if (user.uid !== userId) {
    throw new Error('Unauthorized to update this order');
  }

  const userRef = doc(db, 'users', userId);

  await updateDoc(userRef, {
    balance: increment(amount)
  });
}