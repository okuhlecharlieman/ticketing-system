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
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(js|mjs)$/,
      include: /node_modules\/undici/,
      use: {
        loader: 'next-swc-loader',
      },
    });
    return config;
  },
};

export default nextConfig;
