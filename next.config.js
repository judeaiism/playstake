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
  },
};

module.exports = nextConfig;