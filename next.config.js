/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  generateEtags: true,
  pageExtensions: ['js', 'jsx'],
  poweredByHeader: false,
  staticPageGenerationTimeout: 1000
};

module.exports = nextConfig;
