import { BIP32Factory } from 'bip32';
import * as bip39 from 'bip39';
import TronWeb from 'tronweb';

// We'll use a type assertion for ecc since tiny-secp256k1 doesn't have type declarations
const ecc = require('tiny-secp256k1') as any;

const bip32 = BIP32Factory(ecc);

const HOT_WALLET_PRIVATE_KEY = process.env.HOT_WALLET_PRIVATE_KEY;

if (!HOT_WALLET_PRIVATE_KEY) {
  throw new Error('HOT_WALLET_PRIVATE_KEY is not set in environment variables');
}

// Convert private key to seed
const seed = bip39.mnemonicToSeedSync(HOT_WALLET_PRIVATE_KEY);

// Create master node
const master = bip32.fromSeed(seed);

export function deriveChildAddress(index: number): string {
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