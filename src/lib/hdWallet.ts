import TronWeb from 'tronweb';

console.log('Environment variables:');
console.log('MASTER_SEED:', process.env.MASTER_SEED ? '[SET]' : '[NOT SET]');
console.log('TRON_FULL_HOST:', process.env.TRON_FULL_HOST);
console.log('TRON_API_KEY:', process.env.TRON_API_KEY ? '[SET]' : '[NOT SET]');
console.log('HOT_WALLET_PRIVATE_KEY:', process.env.HOT_WALLET_PRIVATE_KEY ? '[SET]' : '[NOT SET]');

const MASTER_SEED = process.env.MASTER_SEED;
const TRON_FULL_HOST = process.env.TRON_FULL_HOST || 'https://api.trongrid.io';
const TRON_API_KEY = process.env.TRON_API_KEY;

if (!MASTER_SEED) {
  throw new Error('MASTER_SEED is not defined in environment variables');
}

if (!TRON_API_KEY) {
  throw new Error('TRON_API_KEY is not defined in environment variables');
}

const tronWeb = new TronWeb({
  fullHost: TRON_FULL_HOST,
  headers: { "TRON-PRO-API-KEY": TRON_API_KEY },
});

export async function deriveUserAddress(userId: string): Promise<string | null> {
  try {
    console.log('Deriving user address for userId:', userId);
    
    // Generate a deterministic seed for this user
    const userSeed = `${MASTER_SEED}-${userId}`;
    
    // Generate a private key from the user seed
    const privateKey = tronWeb.sha3(userSeed).substring(2, 66);
    
    // Generate Tron address from private key
    const address = tronWeb.address.fromPrivateKey(privateKey);
    
    console.log('Tron address generated successfully:', address);

    return address;
  } catch (error) {
    console.error('Error deriving user address:', error);
    return null;
  }
}

export function getHotWalletPrivateKey(): string {
  const privateKey = process.env.HOT_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('HOT_WALLET_PRIVATE_KEY is not set in environment variables');
  }
  return privateKey;
}

