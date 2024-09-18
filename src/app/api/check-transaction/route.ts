import { NextRequest, NextResponse } from 'next/server';

const TRON_API_KEY = process.env.TRON_API_KEY;
const TRON_API_URL = 'https://api.trongrid.io';

export async function POST(req: NextRequest) {
  const { address, token } = await req.json();

  if (!address || !token) {
    return NextResponse.json({ error: 'Address and token are required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${TRON_API_URL}/v1/accounts/${address}/transactions?only_to=true&limit=5`, {
      headers: {
        'TRON-PRO-API-KEY': TRON_API_KEY || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transactions from Tron API');
    }

    const data = await response.json();
    const transactions = data.data;

    let transactionDetected = false;
    let transactionConfirmed = false;

    for (const tx of transactions) {
      if (isRelevantTransaction(tx, token)) {
        if (tx.ret[0].contractRet === 'SUCCESS') {
          transactionConfirmed = true;
          break;
        } else {
          transactionDetected = true;
        }
      }
    }

    return NextResponse.json({ transactionDetected, transactionConfirmed });
  } catch (error) {
    console.error('Error checking transactions:', error);
    return NextResponse.json({ error: 'Failed to check transactions' }, { status: 500 });
  }
}

function isRelevantTransaction(tx: any, token: string) {
  if (token === 'TRX') {
    return tx.raw_data.contract[0].type === 'TransferContract';
  } else if (token === 'USDT') {
    return tx.raw_data.contract[0].type === 'TriggerSmartContract' &&
           tx.raw_data.contract[0].parameter.value.contract_address === 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // USDT contract address
  }
  return false;
}
