import { ethers } from 'ethers';

export const infuraProviders = {
  mainnet: new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'),
  sepolia: new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID')
};

export const getInfuraProvider = (network: 'mainnet' | 'sepolia') => {
  return infuraProviders[network];
};
