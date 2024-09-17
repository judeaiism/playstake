import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Generate a simple random address instead of using ethers
    const depositAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

    // Store the deposit address in Firestore
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      depositAddress: depositAddress,
      depositAddressCreatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ depositAddress });
  } catch (error) {
    console.error('Error generating deposit address:', error);
    return NextResponse.json({ error: 'Failed to generate deposit address' }, { status: 500 });
  }
}
