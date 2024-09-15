import { infuraProviders } from '@/config/infura';
import { updateBalance } from './wallet';
import { ethers } from 'ethers';
import { createNotification } from './notifications';

export function startTransactionMonitor(address: string, userId: string) {
  infuraProviders.mainnet.on(address, async (balance: ethers.BigNumber) => {
    const newBalance = ethers.utils.formatEther(balance);
    await updateBalance(userId, newBalance);
    await createNotification(userId, `Your wallet balance has been updated to ${newBalance} ETH`);
  });
}

export function stopTransactionMonitor(address: string) {
  infuraProviders.mainnet.removeAllListeners(address);
}