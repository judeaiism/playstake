declare module 'tronweb' {
  export default class TronWeb {
    constructor(options: { fullHost: string; privateKey: string });
    address: {
      fromPrivateKey(privateKey: string): string;
    };
  }
}