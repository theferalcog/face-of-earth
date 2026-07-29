/**
 * Next.js Configuration
 * Face of Earth v0.1
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  generateEtags: true,
  pageExtensions: ['js', 'jsx'],
  poweredByHeader: false,
  
  // Allow large static content
  staticPageGenerationTimeout: 1000,
  
  // API routes configuration
  api: {
    responseLimit: '8mb'
  },

  // Environment variables
  env: {
    FACE_VERSION: '0.1.0',
    BUILD_DATE: new Date().toISOString()
  }
};

module.exports = nextConfig;
