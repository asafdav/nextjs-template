/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Change output to export for static site generation
  output: 'export',
  // Disable image optimization since it's not supported with export
  images: {
    unoptimized: true,
  },
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