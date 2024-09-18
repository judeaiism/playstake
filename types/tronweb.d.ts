declare module 'tronweb' {
  export default class TronWeb {
    constructor(options: { fullHost: string; privateKey: string });
    setHeader(header: Record<string, string>): void;
    trx: {
      getTransaction(transactionHash: string): Promise<any>;
    };
    fromSun(sunAmount: string | number): string;
    address: {
      fromHex(hexAddress: string): string;
      fromPrivateKey(privateKey: string): string;
    };
  }
}