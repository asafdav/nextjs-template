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

  // Exclude infrastructure directory from the build
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Exclude specific directories from being processed by webpack
  webpack: (config, { isServer }) => {
    // Add infrastructure to the list of excluded directories
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [...(config.watchOptions?.ignored || []), '**/infrastructure/**'],
    };
    return config;
  },
};

export default nextConfig;
