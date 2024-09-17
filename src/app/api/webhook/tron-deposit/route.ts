import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { verifyTronTransaction } from '@/services/blockchain';

export async function POST(req: Request) {
  try {
    const { transactionHash, toAddress, amount, memo } = await req.json();

    // Verify the transaction
    const transactionDetails = await verifyTronTransaction(transactionHash, amount);

    if (!transactionDetails.isValid) {
      return NextResponse.json({ error: 'Invalid transaction' }, { status: 400 });
    }

    // Find the memo in the database
    const memoDoc = await db.collection('memos').doc(memo).get();

    if (!memoDoc.exists) {
      return NextResponse.json({ error: 'Invalid memo' }, { status: 400 });
    }

    const memoData = memoDoc.data();

    if (!memoData) {
      return NextResponse.json({ error: 'Invalid memo data' }, { status: 400 });
    }

    if (memoData.used) {
      return NextResponse.json({ error: 'Memo already used' }, { status: 400 });
    }

    // Credit the user's account
    const userRef = db.collection('users').doc(memoData.userId);
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('User not found');
      }
      const userData = userDoc.data();
      if (!userData) {
        throw new Error('User data not found');
      }
      const newBalance = (userData.balance || 0) + Number(amount);
      transaction.update(userRef, { balance: newBalance });
      transaction.update(memoDoc.ref, { used: true });
    });

    // Log the transaction
    await db.collection('transactions').add({
      userId: memoData.userId,
      amount,
      transactionHash,
      memo,
      timestamp: new Date(),
      status: 'completed'
    });

    return NextResponse.json({ success: true, message: 'Deposit processed successfully' });
  } catch (error) {
    console.error('Error processing deposit:', error);
    return NextResponse.json({ error: 'Failed to process deposit' }, { status: 500 });
  }
}
