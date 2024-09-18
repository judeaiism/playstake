/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  webpack: (config, { isServer, dev }) => {
    // Enable both sync and async WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
    };

    // Add rule for WebAssembly modules
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
      };
    }

    // Add polyfills for async/await
    if (!isServer) {
      const originalEntry = config.entry;
      config.entry = async () => {
        let entries;
        if (typeof originalEntry === 'function') {
          entries = await originalEntry();
        } else if (typeof originalEntry === 'object' || typeof originalEntry === 'string') {
          entries = originalEntry;
        } else {
          throw new Error('Unsupported entry type');
        }

        if (typeof entries === 'object' && entries['main.js'] && !entries['main.js'].includes('./src/polyfills.js')) {
          entries['main.js'].unshift('./src/polyfills.js');
        }
        return entries;
      };
    }

    if (dev) {
      config.devtool = 'source-map';
    }

    return config;
  },
  onError: (error, errorInfo) => {
    console.log('Next.js error:', error);
    console.log('Next.js error info:', errorInfo);
  },
  env: {
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    HOT_WALLET_PRIVATE_KEY: process.env.HOT_WALLET_PRIVATE_KEY,
  },
};

module.exports = nextConfig;