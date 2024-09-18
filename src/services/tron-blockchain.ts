/// <reference types="winston" />

import TronWeb from 'tronweb';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'tron-blockchain.log' })
  ]
});

// Extend the TronWeb type
interface ExtendedTronWeb extends TronWeb {
  setHeader(header: Record<string, string>): void;
  trx: {
    getTransaction(transactionHash: string): Promise<any>;
  };
  fromSun(sunAmount: string | number): string;
  address: {
    fromHex(hexAddress: string): string;
    fromPrivateKey(privateKey: string): string;
  };
}

// Initialize TronWeb with appropriate configuration
const tronWeb = new TronWeb({
  fullHost: process.env.TRON_FULL_NODE_URL || 'https://api.trongrid.io',
  privateKey: process.env.TRON_PRIVATE_KEY || '',
}) as ExtendedTronWeb;

// Set the API key separately
if (process.env.TRON_API_KEY) {
  tronWeb.setHeader({ "TRON-PRO-API-KEY": process.env.TRON_API_KEY });
}

interface TransactionDetails {
  isValid: boolean;
  amount?: number;
  toAddress?: string;
}

export async function verifyTronTransaction(transactionHash: string, expectedAmount: string, expectedAddress: string): Promise<TransactionDetails> {
  try {
    logger.info(`Verifying transaction: ${transactionHash}`);
    const transaction = await tronWeb.trx.getTransaction(transactionHash);

    if (!transaction) {
      logger.warn(`Transaction not found: ${transactionHash}`);
      return { isValid: false };
    }

    // Check if the transaction is confirmed
    if (transaction.ret[0].contractRet !== 'SUCCESS') {
      console.error(`Transaction not successful: ${transactionHash}`);
      return { isValid: false };
    }

    // Extract the relevant details from the transaction
    const contractData = transaction.raw_data.contract[0];
    if (contractData.type !== 'TransferContract') {
      console.error(`Not a transfer transaction: ${transactionHash}`);
      return { isValid: false };
    }

    const { amount, to_address } = contractData.parameter.value;

    // Convert the amount from SUN to TRX
    const amountInTrx = tronWeb.fromSun(amount);

    // Verify the amount and recipient address
    if (
      amountInTrx === expectedAmount &&
      tronWeb.address.fromHex(to_address) === expectedAddress
    ) {
      logger.info(`Transaction verified successfully: ${transactionHash}`);
      return {
        isValid: true,
        amount: parseFloat(amountInTrx),
        toAddress: tronWeb.address.fromHex(to_address)
      };
    } else {
      logger.error(`Transaction details mismatch: ${transactionHash}`);
      return { isValid: false };
    }
  } catch (error) {
    logger.error('Error verifying TRON transaction:', error);
    console.error('Error verifying TRON transaction:', error);
    return { isValid: false };
  }
}