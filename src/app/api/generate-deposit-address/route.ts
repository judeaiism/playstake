import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { db } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Generate a new Ethereum address
    const wallet = ethers.Wallet.createRandom();
    const depositAddress = await wallet.getAddress();

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
