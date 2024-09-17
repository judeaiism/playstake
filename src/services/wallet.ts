import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function createWallet(userId: string): Promise<string> {
  // Replace ethers wallet creation with a simple random address generation
  const address = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

  await setDoc(doc(db, 'users', userId), {
    walletAddress: address,
    balance: 0,
  }, { merge: true });

  return address;
}

// Remove getBalance function as it uses ethers

export async function updateBalance(userId: string, newBalance: string) {
  await updateDoc(doc(db, 'users', userId), {
    balance: newBalance,
  });
}
