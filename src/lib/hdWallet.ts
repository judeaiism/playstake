import { BIP32Factory } from 'bip32';
import * as bip39 from 'bip39';
import TronWeb from 'tronweb';

let ecc: any;

async function loadEcc() {
  if (!ecc) {
    ecc = await import('tiny-secp256k1');
  }
  return ecc;
}

const HOT_WALLET_PRIVATE_KEY = process.env.HOT_WALLET_PRIVATE_KEY;

if (!HOT_WALLET_PRIVATE_KEY) {
  throw new Error('HOT_WALLET_PRIVATE_KEY is not set in environment variables. Please check your .env.local file and ensure it is set correctly.');
}

async function initializeBip32() {
  const eccModule = await loadEcc();
  return BIP32Factory(eccModule);
}

export async function deriveUserAddress(userId: string): Promise<string> {
  const bip32 = await initializeBip32();
  
  if (typeof HOT_WALLET_PRIVATE_KEY !== 'string') {
    throw new Error('HOT_WALLET_PRIVATE_KEY is not a valid string');
  }
  
  const seed = bip39.mnemonicToSeedSync(HOT_WALLET_PRIVATE_KEY);
  
  const master = bip32.fromSeed(seed);

  // Use a hash function to convert userId to a number
  const index = hashToNumber(userId);
  const child = master.derivePath(`m/44'/195'/${index}'/0/0`);
  const privateKey = child.privateKey;
  
  if (!privateKey) {
    throw new Error('Failed to derive private key');
  }

  const privateKeyHex = Buffer.from(privateKey).toString('hex');

  const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    privateKey: privateKeyHex
  });

  return tronWeb.address.fromPrivateKey(privateKeyHex);
}

export async function deriveChildAddress(index: number): Promise<string> {
  const bip32 = await initializeBip32();
  
  if (typeof HOT_WALLET_PRIVATE_KEY !== 'string') {
    throw new Error('HOT_WALLET_PRIVATE_KEY is not a valid string');
  }
  
  const seed = bip39.mnemonicToSeedSync(HOT_WALLET_PRIVATE_KEY);
  const master = bip32.fromSeed(seed);
  const child = master.derivePath(`m/44'/195'/${index}'/0/0`);
  const privateKey = child.privateKey;
  
  if (!privateKey) {
    throw new Error('Failed to derive private key');
  }

  const privateKeyHex = Buffer.from(privateKey).toString('hex');

  const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    privateKey: privateKeyHex
  });

  return tronWeb.address.fromPrivateKey(privateKeyHex);
}

function hashToNumber(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}