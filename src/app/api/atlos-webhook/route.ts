import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { updateUserBalance } from '@/lib/firebase/firestore';

const API_SECRET = process.env.ATLOS_API_SECRET;

function verifySignature(apiSecret: string, signature: string, messageData: string): boolean {
  const hmac = crypto.createHmac('sha256', apiSecret);
  hmac.update(messageData);
  const messageSignature = hmac.digest('base64');
  return messageSignature === signature;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const signature = req.headers['signature'] as string;
  if (!signature) {
    return res.status(400).json({ error: 'Missing signature' });
  }

  const messageData = JSON.stringify(req.body);
  if (!API_SECRET || !verifySignature(API_SECRET, signature, messageData)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const {
    TransactionId,
    MerchantId,
    OrderId,
    Amount,
    OrderAmount,
    OrderCurrency,
    Status
  } = req.body;

  if (Status !== 100) {
    return res.status(200).json({ message: 'Transaction not confirmed yet' });
  }

  try {
    await updateUserBalance(OrderId, parseFloat(OrderAmount));
    console.log(`Updated balance for order ${OrderId}: ${OrderAmount} ${OrderCurrency}`);

    res.status(200).json({ message: 'Balance updated successfully' });
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}