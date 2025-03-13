import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Enable static exports for Amplify hosting
  output: 'standalone',

  // Configure image domains if needed
  images: {
    domains: ['example.com'],
  },

  // Add environment variables
  env: {
    AMPLIFY_REGION: process.env.AMPLIFY_REGION || 'us-east-1',
  },
};

export default nextConfig;
