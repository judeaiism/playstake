import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { verifyTronTransaction } from '@/services/tron-blockchain';
import { logger } from '@/lib/logger'; // Implement a centralized logger

export async function POST(req: Request) {
  try {
    const { transactionHash, toAddress, amount, memo } = await req.json();
    logger.info(`Received deposit webhook: ${JSON.stringify({ transactionHash, toAddress, amount, memo })}`);

    // Verify the transaction
    const transactionDetails = await verifyTronTransaction(transactionHash, amount, toAddress);

    if (!transactionDetails.isValid) {
      return NextResponse.json({ error: 'Invalid transaction' }, { status: 400 });
    }

    // Find the user by memo or address
    let userQuery;
    if (memo) {
      userQuery = await db.collection('users').where(`deposits.${memo}.status`, '==', 'pending').get();
    }

    if (!userQuery || userQuery.empty) {
      userQuery = await db.collection('depositAddresses').where('address', '==', toAddress).where('status', '==', 'assigned').get();
    }

    if (userQuery.empty) {
      return NextResponse.json({ error: 'No matching deposit found' }, { status: 400 });
    }

    const userDoc = userQuery.docs[0];
    const userId = userDoc.data().userId || userDoc.id;

    // Update user's balance
    await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(userId);
      const user = await transaction.get(userRef);
      const newBalance = (user.data()?.balance || 0) + parseFloat(amount);

      transaction.update(userRef, { balance: newBalance });

      // Update deposit status
      if (memo) {
        transaction.update(userRef, { [`deposits.${memo}.status`]: 'completed' });
      } else {
        // If it's a unique address, mark it as available again
        const addressRef = db.collection('depositAddresses').doc(toAddress);
        transaction.update(addressRef, { status: 'available', userId: null });
      }
    });

    // Log the transaction
    await db.collection('transactions').add({
      userId,
      amount,
      transactionHash,
      memo,
      toAddress,
      timestamp: new Date(),
      status: 'completed'
    });

    return NextResponse.json({ success: true, message: 'Deposit processed successfully' });
  } catch (error) {
    logger.error('Error processing deposit:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Failed to process deposit', details: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Failed to process deposit', details: 'Unknown error' }, { status: 500 });
    }
  }
}
