import TronWeb from 'tronweb';

export interface ExtendedTronWeb extends TronWeb {
  address: TronWeb['address'] & {
    fromPrivateKey: (privateKey: string) => string;
    fromHex: (hexAddress: string) => string;
  };
  toSun: (amount: string | number) => number;
  fromSun: (sunAmount: string | number) => number;
  trx: {
    getTransaction: (transactionHash: string) => Promise<any>;
    getTransactionInfo: (transactionHash: string) => Promise<any>;
  };
}