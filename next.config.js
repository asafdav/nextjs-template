/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Add environment variables that should be available to the client
  env: {
    NEXT_PUBLIC_ENVIRONMENT: process.env.ENVIRONMENT || 'development',
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