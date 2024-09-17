import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebase-admin';
import { verifyTransaction } from '@/services/blockchain';

export async function POST(req: Request) {
  try {
    const { userId, amount, transactionHash } = await req.json();

    if (!userId || !amount || !transactionHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Implement alternative transaction verification logic here
    const transactionDetails = await verifyTransaction(transactionHash, amount);

    if (transactionDetails.isValid) {
      // Update user's balance in Firestore
      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        balance: admin.firestore.FieldValue.increment(Number(amount))
      });

      // Log the successful transaction
      await db.collection('transactions').add({
        userId,
        amount,
        transactionHash,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'completed'
      });

      return NextResponse.json({ success: true, message: `Successfully added ${amount}` });
    } else {
      return NextResponse.json({ error: 'Invalid transaction' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error adding funds:', error);
    return NextResponse.json({ error: 'Failed to add funds' }, { status: 500 });
  }
}