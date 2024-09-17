import { BIP32Factory } from 'bip32';
import * as bip39 from 'bip39';
import TronWeb from 'tronweb';
import * as ecc from 'tiny-secp256k1';

// Create a bip32 instance using the BIP32Factory
const bip32 = BIP32Factory(ecc);

// We'll use a type assertion for ecc since tiny-secp256k1 doesn't have type declarations
const HOT_WALLET_PRIVATE_KEY = process.env.HOT_WALLET_PRIVATE_KEY;

if (!HOT_WALLET_PRIVATE_KEY) {
  throw new Error('HOT_WALLET_PRIVATE_KEY is not set in environment variables');
}

// Convert private key to seed
const seed = bip39.mnemonicToSeedSync(HOT_WALLET_PRIVATE_KEY);

// Create master node
const master = bip32.fromSeed(seed);

export function deriveUserAddress(userId: string): string {
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

export function deriveChildAddress(index: number): string {
  // Implementation of deriving child address
  // This is a placeholder implementation. Replace with actual logic.
  return `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
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