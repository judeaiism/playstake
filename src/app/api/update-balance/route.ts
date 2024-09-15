import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { userId, amount } = await req.json();

    if (!userId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      balance: admin.firestore.FieldValue.increment(Number(amount))
    });

    return NextResponse.json({ success: true, message: 'Balance updated successfully' });
  } catch (error) {
    console.error('Error updating balance:', error);
    return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
  }
}
