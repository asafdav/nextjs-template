/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Output configuration for static site generation
  output: 'export',
  
  // Add trailingSlash for better compatibility with Amplify hosting
  trailingSlash: true,
  
  // Disable image optimization since it's not supported with export
  images: {
    unoptimized: true,
    // Keep domains configuration from TS file for development mode
    domains: ['example.com'],
  },
  
  // Combine environment variables from both files
  env: {
    NEXT_PUBLIC_ENVIRONMENT: process.env.ENVIRONMENT || 'development',
    AMPLIFY_REGION: process.env.REGION || 'us-east-1',
  },
  
  // Ensure the app is exported to the correct directory structure
  distDir: '.next',
  
  // Disable the build ID to ensure consistent file names
  generateBuildId: () => 'build',
  
  // Ensure the app page is exported as index.html in the root
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      '/index': { page: '/' },
    };
  },
  
  // TypeScript configuration from TS file
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Exclude specific directories from being processed by webpack
  // This was in the TS file and is useful to keep
  webpack: (config, { isServer }) => {
    // Add infrastructure to the list of excluded directories
    config.watchOptions = {
      ...config.watchOptions,
      ignored: '**/infrastructure/**',
    };
    return config;
  },
};

module.exports = nextConfig;
