import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebase-admin';
import { verifyTronTransaction } from '@/services/blockchain';

export async function POST(req: Request) {
  try {
    const { userId, amount, transactionHash, memo } = await req.json();
    console.log('Received add funds request:', { userId, amount, transactionHash, memo });

    if (!userId || !amount || !transactionHash) {
      console.log('Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Verifying transaction...');
    const transactionDetails = await verifyTronTransaction(transactionHash, amount, memo);
    console.log('Transaction verification result:', transactionDetails);

    if (!transactionDetails.isValid) {
      console.log('Transaction verification failed:', transactionDetails);
      return NextResponse.json({ error: `Invalid transaction: ${transactionDetails.error}`, details: transactionDetails }, { status: 400 });
    }

    console.log('Transaction is valid. Updating user balance...');
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      balance: admin.firestore.FieldValue.increment(Number(amount))
    });

    console.log('Logging transaction...');
    await db.collection('transactions').add({
      userId,
      amount,
      transactionHash,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'completed'
    });

    console.log('Funds added successfully');
    return NextResponse.json({ success: true, message: `Successfully added ${amount}` });
  } catch (error) {
    console.error('Error adding funds:', error);
    return NextResponse.json({ error: 'Failed to add funds: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}