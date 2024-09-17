import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Generate a unique memo
    const memo = crypto.randomBytes(4).toString('hex');

    // Store the memo in Firestore
    await db.collection('memos').doc(memo).set({
      userId,
      createdAt: new Date(),
      used: false
    });

    return NextResponse.json({ memo });
  } catch (error) {
    console.error('Error generating memo:', error);
    return NextResponse.json({ error: 'Failed to generate memo' }, { status: 500 });
  }
}
