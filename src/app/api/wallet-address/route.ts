import { NextResponse } from 'next/server';

const HOT_WALLET_ADDRESS = process.env.NEXT_PUBLIC_HOT_WALLET_ADDRESS;

export async function GET() {
  if (!HOT_WALLET_ADDRESS) {
    return NextResponse.json({ error: 'Wallet address not configured' }, { status: 500 });
  }

  return NextResponse.json({ address: HOT_WALLET_ADDRESS });
}