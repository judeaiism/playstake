import { ethers } from 'ethers';
import { db } from '../config/firebase';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { infuraProviders } from '../config/infura';

export async function createWallet(userId: string): Promise<string> {
  const wallet = ethers.Wallet.createRandom();
  const address = await wallet.getAddress();

  await setDoc(doc(db, 'users', userId), {
    walletAddress: address,
    balance: 0,
  }, { merge: true });

  return address;
}

export async function getBalance(address: string): Promise<string> {
  const balance = await infuraProviders.mainnet.getBalance(address);
  return ethers.utils.formatEther(balance);
}

export async function updateBalance(userId: string, newBalance: string) {
  await updateDoc(doc(db, 'users', userId), {
    balance: newBalance,
  });
}
