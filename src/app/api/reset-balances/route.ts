import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const batch = db.batch();
    const usersSnapshot = await db.collection('users').get();

    usersSnapshot.docs.forEach((doc) => {
      const userRef = db.collection('users').doc(doc.id);
      batch.update(userRef, { balance: 0 });
    });

    await batch.commit();

    return NextResponse.json({ success: true, message: 'All user balances have been reset to zero' });
  } catch (error) {
    console.error('Error resetting balances:', error);
    return NextResponse.json({ error: 'Failed to reset balances' }, { status: 500 });
  }
}
