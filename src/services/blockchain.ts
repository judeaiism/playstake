import { ethers } from 'ethers';

export async function verifyTransaction(
  provider: ethers.providers.Provider,
  transactionHash: string,
  expectedAmount: string
): Promise<{ isValid: boolean; details?: any }> {
  try {
    const transaction = await provider.getTransaction(transactionHash);
    if (!transaction) {
      return { isValid: false };
    }

    // Wait for the transaction to be mined
    const receipt = await transaction.wait();

    if (receipt.status === 0) {
      return { isValid: false };
    }

    const amountInWei = ethers.utils.parseEther(expectedAmount);
    const isAmountCorrect = transaction.value.eq(amountInWei);

    return {
      isValid: isAmountCorrect,
      details: {
        from: transaction.from,
        to: transaction.to,
        amount: ethers.utils.formatEther(transaction.value),
        blockNumber: receipt.blockNumber,
        confirmations: receipt.confirmations,
      },
    };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return { isValid: false };
  }
}