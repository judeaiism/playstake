import Web3 from 'web3';

const infuraUrl = 'https://sepolia.infura.io/v3/cf1f2557e0dd427d8f4cb50bb764dbbc';

const web3 = new Web3(new Web3.providers.HttpProvider(infuraUrl));

export default web3;