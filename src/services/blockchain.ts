import TronWeb from 'tronweb';

// Define a custom type for our TronWeb instance
interface CustomTronWeb extends TronWeb {
  trx: {
    getTransactionsRelated: (address: string, direction: string, limit: number) => Promise<any[]>;
  };
  fromSun: (sun: number | string) => number;
}

if (!process.env.TRON_FULL_NODE_URL || !process.env.TRON_PRIVATE_KEY) {
  throw new Error('TRON_FULL_NODE_URL and TRON_PRIVATE_KEY must be set in the environment variables');
}

const tronWeb = new TronWeb({
  fullHost: process.env.TRON_FULL_NODE_URL,
  privateKey: process.env.TRON_PRIVATE_KEY
}) as CustomTronWeb;

export async function verifyTronTransaction(depositAddress: string, expectedAmount: number) {
  try {
    // Get the latest transactions for the deposit address
    const transactions = await tronWeb.trx.getTransactionsRelated(depositAddress, 'to', 10);

    for (const tx of transactions) {
      if (tx.raw_data.contract[0].type === 'TransferContract') {
        const contractParams = tx.raw_data.contract[0].parameter.value;
        const amount = tronWeb.fromSun(contractParams.amount);

        if (contractParams.to_address === depositAddress && amount === expectedAmount) {
          return { isValid: true, transactionHash: tx.txID };
        }
      }
    }

    return { isValid: false };
  } catch (error) {
    console.error('Error verifying TRON transaction:', error);
    throw error;
  }
}

export async function getTronTransactions(address: string, startTimestamp: number): Promise<any[]> {
  // Implement the logic to fetch Tron transactions
  // This is a placeholder implementation
  const transactions = [
    // Sample transaction data
    {
      to: address,
      amount: 100,
      hash: '0x123...',
      memo: 'sample-memo',
      timestamp: Date.now(),
    },
  ];

  return transactions.filter(tx => tx.timestamp > startTimestamp);
}