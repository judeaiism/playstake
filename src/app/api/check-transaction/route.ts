import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebase-admin';
import { verifyTronTransaction } from '@/services/tron-blockchain';

export async function POST(req: Request) {
  try {
    const { depositAddress, expectedAmount } = await req.json();

    if (!depositAddress || !expectedAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the transaction on the TRON blockchain
    const transactionDetails = await verifyTronTransaction(depositAddress, expectedAmount);

    if (transactionDetails.isValid) {
      // Update user's balance in Firestore
      const userRef = db.collection('users').doc(depositAddress);
      await userRef.update({
        balance: admin.firestore.FieldValue.increment(Number(expectedAmount))
      });

      // Log the successful transaction
      await db.collection('transactions').add({
        depositAddress,
        amount: expectedAmount,
        transactionHash: transactionDetails.transactionHash,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'completed'
      });

      return NextResponse.json({ confirmed: true, message: `Successfully added ${expectedAmount} TRX/USDT` });
    } else {
      return NextResponse.json({ confirmed: false, error: 'Transaction not found or not confirmed' });
    }
  } catch (error) {
    console.error('Error checking transaction:', error);
    return NextResponse.json({ error: 'Failed to check transaction' }, { status: 500 });
  }
}
