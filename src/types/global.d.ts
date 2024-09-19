interface Window {
  atlos: {
    Pay: (options: {
      merchantId: string;
      orderId: string;
      orderAmount: number;
      orderCurrency: string;
      recurrence: any;
      onSuccess: (transactionDetails: any) => void;
      onCanceled: () => void;
      onError?: (error: Error) => void;  // Add this line
      theme: 'light' | 'dark';
    }) => void;
    RECURRENCE_NONE: any;
  };
}
