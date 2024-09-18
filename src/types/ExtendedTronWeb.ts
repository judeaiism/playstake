import TronWeb from 'tronweb';

export interface ExtendedTronWeb extends TronWeb {
  trx: {
    getTransaction: (hash: string) => Promise<any>;
    getTransactionInfo: (hash: string) => Promise<any>;
  };
  address: {
    fromPrivateKey: (privateKey: string) => string;
  };
}