import * as functions from 'firebase-functions';
import { db } from './firebase-admin';
import { getTronTransactions } from './blockchain-service';

interface TronTransaction {
  hash: string;
  to_address: string;
  amount: number;
  memo: string;
}

export const checkTronDeposits = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  const lastCheckedTimestamp = await getLastCheckedTimestamp();
  const newTransactions = await getTronTransactions(lastCheckedTimestamp);

  for (const transaction of newTransactions) {
    await processTransaction(transaction);
  }

  await updateLastCheckedTimestamp();
});

async function processTransaction(transaction: TronTransaction) {
  const { hash, to_address, amount, memo } = transaction;

  const response = await fetch('https://your-api-url.com/api/webhook/tron-deposit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transactionHash: hash,
      toAddress: to_address,
      amount,
      memo
    })
  });

  if (!response.ok) {
    console.error(`Failed to process transaction ${hash}`);
  }
}

async function getLastCheckedTimestamp(): Promise<number> {
  const doc = await db.collection('system').doc('tron-deposits').get();
  return doc.data()?.lastCheckedTimestamp || 0;
}

async function updateLastCheckedTimestamp(): Promise<void> {
  await db.collection('system').doc('tron-deposits').set({
    lastCheckedTimestamp: Date.now()
  }, { merge: true });
}
