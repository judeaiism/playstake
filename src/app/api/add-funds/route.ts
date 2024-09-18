import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebase-admin';
import TronWeb from 'tronweb';
import { ExtendedTronWeb } from '@/types/ExtendedTronWeb'; // Ensure this interface is defined appropriately

export async function POST(req: Request) {
  try {
    const { userId, amount, transactionHash, memo } = await req.json();
    console.log('Received add funds request:', { userId, amount, transactionHash, memo });

    const fullHost = process.env.TRON_FULL_HOST;
    const privateKey = process.env.HOT_WALLET_PRIVATE_KEY;

    if (!fullHost || !privateKey) {
      throw new Error('TRON_FULL_HOST or HOT_WALLET_PRIVATE_KEY is not defined');
    }

    const tronWeb = new TronWeb({
      fullHost,
      privateKey,
    }) as ExtendedTronWeb;

    console.log('TronWeb initialized');

    // Generate Tron address from private key
    const tronAddress = tronWeb.address.fromPrivateKey(privateKey);
    console.log('Generated Tron address:', tronAddress);

    // Verify that the necessary methods exist
    if (typeof tronWeb.trx.getTransaction !== 'function') {
      throw new Error('TronWeb.trx.getTransaction is not a function');
    }

    if (typeof tronWeb.trx.getTransactionInfo !== 'function') {
      throw new Error('TronWeb.trx.getTransactionInfo is not a function');
    }

    // Get transaction details
    const transaction = await tronWeb.trx.getTransaction(transactionHash);
    const transactionInfo = await tronWeb.trx.getTransactionInfo(transactionHash);

    console.log('Transaction:', transaction);
    console.log('Transaction Info:', transactionInfo);

    // Verify the transaction
    if (!transaction || !transactionInfo) {
      throw new Error('Transaction not found or invalid');
    }

    // Check if the transaction is confirmed
    if (transactionInfo.receipt.result !== 'SUCCESS') {
      throw new Error('Transaction is not confirmed or failed');
    }

    // Verify the amount (assuming the amount is in SUN)
    const transactionAmount = transaction.raw_data.contract[0].parameter.value.amount;
    if (transactionAmount !== amount) {
      throw new Error('Transaction amount does not match');
    }

    // Update user's balance
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      balance: admin.firestore.FieldValue.increment(Number(amount))
    });

    // Log transaction
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
    return NextResponse.json({ 
      error: 'Failed to add funds: ' + (error instanceof Error ? error.message : String(error)) 
    }, { status: 500 });
  }
}