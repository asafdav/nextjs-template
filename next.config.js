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
  // Disable API routes for static export
  // API routes are not supported in static exports
  // We'll use the static JSON files in the public directory instead
};

module.exports = nextConfig;
