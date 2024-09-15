import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { db, admin } from '@/lib/firebase-admin';

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;

export async function POST(req: Request) {
  try {
    const { depositAddress, expectedAmount } = await req.json();

    if (!depositAddress || !expectedAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const provider = new ethers.providers.InfuraProvider('homestead', INFURA_PROJECT_ID);

    const latestBlock = await provider.getBlockNumber();
    const startBlock = latestBlock - 10; // Check the last 10 blocks

    for (let i = startBlock; i <= latestBlock; i++) {
      const block = await provider.getBlockWithTransactions(i);
      for (const transaction of block.transactions) {
        if (
          transaction.to?.toLowerCase() === depositAddress.toLowerCase() &&
          Number(ethers.utils.formatEther(transaction.value)) >= expectedAmount
        ) {
          // Add transaction to Firestore
          const userDoc = await db.collection('users').doc(/* user identifier */).get();
          
          if (!userDoc.exists) {
            console.error('User document does not exist');
            return NextResponse.json(
              { error: 'User not found' },
              { status: 404 }
            );
          }

          await db.collection('transactions').add({
            userId: userDoc.id,
            amount: expectedAmount,
            transactionHash: transaction.hash,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'completed',
            details: {
              from: transaction.from,
              to: transaction.to,
              blockNumber: block.number,
            },
          });

          // Update user balance
          await db.collection('users').doc(userDoc.id).update({
            balance: admin.firestore.FieldValue.increment(Number(expectedAmount)),
          });

          return NextResponse.json(
            { confirmed: true, message: `Successfully added ${expectedAmount} ETH` }
          );
        }
      }
    }

    // If no matching transaction is found
    return NextResponse.json(
      { confirmed: false, message: 'Transaction not found or not confirmed yet' }
    );
  } catch (error: unknown) {
    console.error('Error checking transaction:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to check transaction', details: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to check transaction', details: 'An unknown error occurred' },
        { status: 500 }
      );
    }
  }
}
