declare module 'tronweb' {
  export default class TronWeb {
    constructor(options: {
      fullHost: string;
      privateKey: string;
    });

    trx: {
      getTransactionsRelated(address: string, direction: string, limit: number): Promise<any[]>;
    };

    fromSun(amount: number): number;
  }
}