import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateUserBalance } from '@/lib/firebase/firestore';

const API_SECRET = process.env.ATLOS_API_SECRET;

function verifySignature(apiSecret: string, signature: string, messageData: string): boolean {
  const hmac = crypto.createHmac('sha256', apiSecret);
  hmac.update(messageData);
  const messageSignature = hmac.digest('base64');
  return messageSignature === signature;
}

export async function POST(request: Request) {
  const signature = request.headers.get('signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const body = await request.json();
  const messageData = JSON.stringify(body);
  
  if (!API_SECRET || !verifySignature(API_SECRET, signature, messageData)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const {
    TransactionId,
    MerchantId,
    OrderId,
    Amount,
    OrderAmount,
    OrderCurrency,
    Status
  } = body;

  if (Status !== 100) {
    return NextResponse.json({ message: 'Transaction not confirmed yet' }, { status: 200 });
  }

  try {
    await updateUserBalance(OrderId, parseFloat(OrderAmount));
    console.log(`Updated balance for order ${OrderId}: ${OrderAmount} ${OrderCurrency}`);

    return NextResponse.json({ message: 'Balance updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating balance:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}