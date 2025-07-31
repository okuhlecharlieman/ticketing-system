/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: [],
  },
  experimental: {
    webpackBuildWorker: true,
  },
};

export default nextConfig;
