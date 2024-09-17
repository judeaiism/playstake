import { NextResponse } from 'next/server';
import { generateDepositIdentifier } from '@/services/blockchain';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const { address, memo } = await generateDepositIdentifier(userId);

    return NextResponse.json({ address, memo });
  } catch (error) {
    console.error('Error generating deposit identifier:', error);
    return NextResponse.json({ 
      error: 'Failed to generate deposit identifier', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
