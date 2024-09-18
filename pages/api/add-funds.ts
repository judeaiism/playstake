import { NextApiRequest, NextApiResponse } from 'next';
import TronWeb from 'tronweb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId, amount, transactionHash, memo } = req.body;

  try {
    // Initialize TronWeb
    const tronWeb = new TronWeb({
      fullHost: process.env.TRON_FULL_HOST,
      privateKey: process.env.TRON_PRIVATE_KEY,
    });

    console.log('TronWeb version:', TronWeb.version);
    console.log('TronWeb methods:', Object.keys(tronWeb.trx));

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

    // Update user's balance (implement your balance update logic here)
    // For example:
    // await updateUserBalance(userId, amount);

    res.status(200).json({ success: true, message: 'Balance updated successfully' });
  } catch (error) {
    console.error('Error in add-funds API:', error);
    res.status(400).json({ 
      error: 'Invalid transaction', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}