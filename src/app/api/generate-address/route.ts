import { NextResponse } from 'next/server';
import { deriveUserAddress } from '@/lib/hdWallet';

export async function POST(req: Request) {
  console.log('API route hit: /api/generate-address');
  try {
    const body = await req.json();
    console.log('Request body:', body);
    const { userId } = body;

    if (!userId) {
      console.error('userId is missing in the request');
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    console.log(`Generating address for user: ${userId}`);

    const userAddress = await deriveUserAddress(userId);

    if (!userAddress) {
      console.error(`Failed to derive address for user: ${userId}`);
      return NextResponse.json({ error: 'Failed to generate address' }, { status: 500 });
    }

    console.log(`Generated address for user ${userId}: ${userAddress}`);

    const memo = `${userId}-${Date.now()}`;

    return NextResponse.json({ address: userAddress, memo });
  } catch (error) {
    console.error('Error in generate-address route:', error);
    return NextResponse.json({ 
      error: 'Failed to generate address', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}