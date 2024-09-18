import { db } from '@/lib/firebase-admin';
import crypto from 'crypto';
import { deriveUserAddress } from '@/lib/hdWallet';
import TronWeb from 'tronweb';

// Custom type definition for TronWeb
interface CustomTronWeb extends TronWeb {
  trx: {
    getTransaction: (transactionHash: string) => Promise<any>;
    getBalance: (address: string) => Promise<number>;
    fromSun: (sunAmount: number | string) => string;
  };
  fromSun: (sunAmount: number | string) => string;
  toAscii: (hexString: string) => string;
}

// Initialize TronWeb with a default private key (you should use an environment variable for this)
const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  privateKey: process.env.TRON_PRIVATE_KEY || ''
}) as CustomTronWeb;

export async function getUserDepositAddress(userId: string): Promise<string> {
  const userDoc = await db.collection('users').doc(userId).get();
  
  if (userDoc.exists && userDoc.data()?.depositAddress) {
    return userDoc.data()?.depositAddress;
  }

  const depositAddress = deriveUserAddress(userId);

  await db.collection('users').doc(userId).set({
    depositAddress: depositAddress
  }, { merge: true });

  return depositAddress;
}

export async function generateDepositIdentifier(userId: string): Promise<{ address: string; memo: string }> {
  try {
    const depositAddress = await getUserDepositAddress(userId);

    // Generate a unique memo for this deposit
    const memo = crypto.randomBytes(4).toString('hex');

    await db.collection('users').doc(userId).set({
      [`deposits.${memo}`]: {
        status: 'pending',
        createdAt: new Date()
      }
    }, { merge: true });

    return {
      address: depositAddress,
      memo: memo
    };
  } catch (error) {
    console.error('Error in generateDepositIdentifier:', error);
    throw error;
  }
}

// Placeholder for transaction verification
export async function verifyTronTransaction(transactionHash: string, expectedAmount: string, expectedMemo: string) {
  if (!transactionHash || !expectedAmount) {
    return { isValid: false, error: 'Missing required parameters' };
  }

  try {
    const transaction = await tronWeb.trx.getTransaction(transactionHash);
    
    if (!transaction) {
      return { isValid: false, error: 'Transaction not found' };
    }

    if (!transaction.ret || transaction.ret.length === 0) {
      return { isValid: false, error: 'Invalid transaction structure' };
    }

    if (transaction.ret[0].contractRet !== 'SUCCESS') {
      return { isValid: false, error: 'Transaction failed' };
    }

    if (!transaction.raw_data || !transaction.raw_data.contract || transaction.raw_data.contract.length === 0) {
      return { isValid: false, error: 'Invalid transaction contract data' };
    }

    const contract = transaction.raw_data.contract[0];
    if (contract.type !== 'TransferContract') {
      return { isValid: false, error: 'Not a transfer transaction' };
    }

    if (!contract.parameter || !contract.parameter.value || !contract.parameter.value.amount) {
      return { isValid: false, error: 'Invalid transfer contract structure' };
    }

    const amount = tronWeb.fromSun(contract.parameter.value.amount);
    const expectedAmountNumeric = parseFloat(expectedAmount);
    if (parseFloat(amount) !== expectedAmountNumeric) {
      return { isValid: false, error: `Amount mismatch: expected ${expectedAmountNumeric}, got ${amount}` };
    }

    if (expectedMemo) {
      if (!transaction.raw_data.data) {
        return { isValid: false, error: 'Expected memo, but no data field found in transaction' };
      }
      const decodedMemo = tronWeb.toAscii(transaction.raw_data.data);
      if (decodedMemo !== expectedMemo) {
        return { isValid: false, error: `Memo mismatch: expected ${expectedMemo}, got ${decodedMemo}` };
      }
    }

    return { isValid: true };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return { isValid: false, error: `Error verifying transaction: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export default async function getTronTransactions(address: string, startTimestamp: number): Promise<any[]> {
  // Implementation of getTronTransactions
  // This is a placeholder implementation. Replace it with the actual implementation.
  return [];
}

export async function getBalance(address: string): Promise<string> {
  try {
    const balanceInSun = await tronWeb.trx.getBalance(address);
    const balanceInTRX = tronWeb.fromSun(balanceInSun);
    return balanceInTRX;
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw new Error('Failed to fetch balance');
  }
}