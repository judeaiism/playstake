import TronWeb from 'tronweb';

if (!process.env.TRON_FULL_NODE_URL || !process.env.TRON_PRIVATE_KEY) {
  throw new Error('TRON_FULL_NODE_URL and TRON_PRIVATE_KEY must be set in the environment variables');
}

const tronWeb = new TronWeb({
  fullHost: process.env.TRON_FULL_NODE_URL,
  privateKey: process.env.TRON_PRIVATE_KEY
});

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