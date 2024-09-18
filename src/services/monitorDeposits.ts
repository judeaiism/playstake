import { db, admin } from '@/lib/firebase-admin';
import getTronTransactions from '@/services/blockchain';
import { logger } from '@/lib/logger'; // Changed to named import

const HOT_WALLET_ADDRESS = process.env.HOT_WALLET_ADDRESS;

export async function monitorDeposits() {
  try {
    logger.info('Starting deposit monitoring');
    const lastCheckedTimestamp = await getLastCheckedTimestamp();
    const transactions = await getTronTransactions(HOT_WALLET_ADDRESS!, lastCheckedTimestamp);

    logger.info(`Found ${transactions.length} new transactions`);

    for (const tx of transactions) {
      try {
        await processDeposit(tx);
      } catch (processError) {
        logger.error(`Error processing deposit for transaction ${tx.hash}:`, processError);
      }
    }

    if (transactions.length > 0) {
      await updateLastCheckedTimestamp(transactions[transactions.length - 1].timestamp);
    }
    
    logger.info('Deposit monitoring completed');
  } catch (error) {
    logger.error('Error monitoring deposits:', error);
    console.error('Error monitoring deposits:', error);
  }
}

async function processDeposit(tx: any) {
  const userQuery = await db.collection('users').where('depositAddress', '==', tx.to).get();

  if (!userQuery.empty) {
    const userDoc = userQuery.docs[0];
    const userId = userDoc.id;
    const amount = tx.amount;

    // Update user's balance
    await db.collection('users').doc(userId).update({
      balance: admin.firestore.FieldValue.increment(amount)
    });

    // Log the transaction
    await db.collection('transactions').add({
      userId,
      amount,
      transactionHash: tx.hash,
      depositAddress: tx.to,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'completed'
    });
  }
}

async function getLastCheckedTimestamp(): Promise<number> {
  const doc = await db.collection('system').doc('lastCheckedTimestamp').get();
  const data = doc.data();
  return doc.exists && data ? data.timestamp : 0;
}

async function updateLastCheckedTimestamp(timestamp: number) {
  await db.collection('system').doc('lastCheckedTimestamp').set({ timestamp });
}
