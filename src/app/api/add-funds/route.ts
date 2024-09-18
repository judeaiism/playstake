import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebase-admin';
import TronWeb from 'tronweb';
import { ExtendedTronWeb } from '@/types/ExtendedTronWeb';

const tronWeb = new TronWeb({
  fullHost: process.env.TRON_FULL_HOST || 'https://api.trongrid.io',
  privateKey: '' // Add an empty string as a placeholder for the private key
}) as unknown as ExtendedTronWeb;

// Set the API key separately
if (process.env.TRON_API_KEY) {
  (tronWeb as any).setHeader({"TRON-PRO-API-KEY": process.env.TRON_API_KEY});
}

export async function POST(req: Request) {
  try {
    const { userId, amount, transactionHash } = await req.json();
    console.log('Received add funds request:', { userId, amount, transactionHash });

    // Verify transaction
    const transaction = await tronWeb.trx.getTransaction(transactionHash);
    console.log('Transaction details:', JSON.stringify(transaction, null, 2));

    if (!transaction || !transaction.ret || transaction.ret[0].contractRet !== 'SUCCESS') {
      console.error('Transaction is not confirmed or failed');
      return NextResponse.json({ error: 'Transaction is not confirmed or failed' }, { status: 400 });
    }

    // Verify amount
    const transactionAmount = tronWeb.fromSun(transaction.raw_data.contract[0].parameter.value.amount);
    if (Number(transactionAmount) !== Number(amount)) {
      console.error('Transaction amount does not match', { expected: amount, actual: transactionAmount });
      return NextResponse.json({ error: 'Transaction amount does not match' }, { status: 400 });
    }

    // Update user's balance
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      balance: admin.firestore.FieldValue.increment(Number(amount))
    });

    console.log('Balance updated successfully');
    return NextResponse.json({ success: true, message: 'Balance updated successfully' });
  } catch (error) {
    console.error('Error adding funds:', error);
    return NextResponse.json({ 
      error: 'Failed to add funds: ' + (error instanceof Error ? error.message : String(error)) 
    }, { status: 500 });
  }
}