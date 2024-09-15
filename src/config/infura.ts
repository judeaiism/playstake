import { ethers } from 'ethers';

const INFURA_PROJECT_ID = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID;

export const infuraProvider = new ethers.providers.InfuraProvider('mainnet', INFURA_PROJECT_ID);
