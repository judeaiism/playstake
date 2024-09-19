/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    TRON_API_KEY: process.env.TRON_API_KEY,
    TRON_FULL_HOST: process.env.TRON_FULL_HOST,
    MASTER_SEED: process.env.MASTER_SEED,
    HOT_WALLET_PRIVATE_KEY: process.env.HOT_WALLET_PRIVATE_KEY,
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
}

module.exports = nextConfig