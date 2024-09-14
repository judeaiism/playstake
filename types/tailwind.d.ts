declare module 'tailwindcss' {
  export interface Config {
    content: string[];
    theme: {
      extend: {
        [key: string]: any;
      };
      [key: string]: any;
    };
    plugins: any[];
    [key: string]: any;
  }
}