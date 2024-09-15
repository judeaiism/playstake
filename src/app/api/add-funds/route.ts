import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { db, admin } from '@/lib/firebase-admin';
import { verifyTransaction } from '@/services/blockchain';

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;

export async function POST(req: Request) {
  try {
    const { userId, amount, transactionHash } = await req.json();

    if (!userId || !amount || !transactionHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const provider = new ethers.providers.InfuraProvider('mainnet', INFURA_PROJECT_ID);

    // Verify the transaction on the blockchain
    const transactionDetails = await verifyTransaction(provider, transactionHash, amount);

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

      return NextResponse.json({ success: true, message: `Successfully added ${amount} ETH` });
    } else {
      return NextResponse.json({ error: 'Invalid transaction' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error adding funds:', error);
    return NextResponse.json({ error: 'Failed to add funds' }, { status: 500 });
  }
}