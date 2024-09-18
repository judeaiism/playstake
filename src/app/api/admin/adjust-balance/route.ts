import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { userId, amount } = await req.json();
    console.log('Adjusting balance for user:', userId, 'Amount:', amount); // Debug log

    if (!userId || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentBalance = userDoc.data()?.balance || 0;
    const newBalance = currentBalance + amount;

    await userRef.update({ balance: newBalance });
    console.log('New balance:', newBalance); // Debug log

    return NextResponse.json({ success: true, message: 'Balance adjusted successfully', newBalance });
  } catch (error) {
    console.error('Error adjusting balance:', error);
    return NextResponse.json({ error: 'Failed to adjust balance' }, { status: 500 });
  }
}