import { db, admin } from '@/lib/firebase-admin';
import { getTronTransactions } from '@/services/blockchain';

const HOT_WALLET_ADDRESS = process.env.HOT_WALLET_ADDRESS;

export async function monitorDeposits() {
  try {
    const lastCheckedTimestamp = await getLastCheckedTimestamp();
    const transactions = await getTronTransactions(HOT_WALLET_ADDRESS!, lastCheckedTimestamp);

    for (const tx of transactions) {
      if (tx.to === HOT_WALLET_ADDRESS) {
        await processDeposit(tx);
      }
    }

    if (transactions.length > 0) {
      await updateLastCheckedTimestamp(transactions[transactions.length - 1].timestamp);
    }
  } catch (error) {
    console.error('Error monitoring deposits:', error);
  }
}

async function processDeposit(tx: any) {
  const memoDoc = await db.collection('memos').doc(tx.memo).get();

  if (memoDoc.exists) {
    const data = memoDoc.data();
    if (data && !data.used) {
      const userId = data.userId;
      const amount = tx.amount;

      // Update user's balance
      await db.collection('users').doc(userId).update({
        balance: admin.firestore.FieldValue.increment(amount)
      });

      // Mark memo as used
      await memoDoc.ref.update({ used: true });

      // Log the transaction
      await db.collection('transactions').add({
        userId,
        amount,
        transactionHash: tx.hash,
        memo: tx.memo,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'completed'
      });
    }
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
