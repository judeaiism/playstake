/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    // Add source map support for better error reporting
    if (dev) {
      config.devtool = 'source-map';
    }
    return config;
  },
  // Add this to get more detailed error logs
  onError: (error, errorInfo) => {
    console.log('Next.js error:', error);
    console.log('Next.js error info:', errorInfo);
  },
};

module.exports = nextConfig;