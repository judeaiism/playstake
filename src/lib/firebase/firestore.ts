import { getFirestore, doc, getDoc, setDoc, updateDoc, runTransaction } from 'firebase/firestore';
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

export async function updateUserBalance(orderId: string, amount: number): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await transaction.get(orderRef);
    
    if (!orderDoc.exists()) {
      throw new Error(`Order ${orderId} not found`);
    }

    const userId = orderDoc.data()?.userId;
    if (!userId) {
      throw new Error(`User ID not found for order ${orderId}`);
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists()) {
      throw new Error(`User ${userId} not found`);
    }

    const currentBalance = userDoc.data()?.balance || 0;
    const newBalance = currentBalance + amount;

    transaction.update(userRef, { balance: newBalance });
    transaction.update(orderRef, { status: 'completed' });
  });
}