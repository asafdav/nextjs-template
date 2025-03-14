/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Enable verbose logging for debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Add environment variables that should be available to the client
  env: {
    NEXT_PUBLIC_ENVIRONMENT: process.env.ENVIRONMENT || 'development',
    NEXT_PUBLIC_DEPLOYMENT_URL: process.env.DEPLOYMENT_URL || 'http://localhost:3000',
  },
  // Configure headers for better security and caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  // Configure redirects for better user experience
  async redirects() {
    return [
      {
        source: '/health',
        destination: '/api/debug',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig; 