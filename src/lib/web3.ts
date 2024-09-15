import Web3 from 'web3';

const INFURA_PROJECT_ID = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID;
const ETHEREUM_NETWORK = process.env.NEXT_PUBLIC_ETHEREUM_NETWORK;

const provider = new Web3.providers.HttpProvider(`https://${ETHEREUM_NETWORK}.infura.io/v3/${INFURA_PROJECT_ID}`);
const web3 = new Web3(provider);

export default web3;