/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // For efficient server deployment, reduces bundle size
  reactStrictMode: true,  // Helps catch performance issues
  images: {
    domains: [],  // Add if using external images
  },
  webpack: (config) => {
    // Custom loader for handling private fields in undici (parse error fix)
    config.module.rules.push({
      test: /\.(js|mjs)$/,
      include: /node_modules\/undici/,
      use: {
        loader: 'next-swc-loader',  // Ensure SWC handles modern syntax
      },
    });
  experimental: {
    webpackBuildWorker: true,  // Force-enable if custom config disables it (remove after upgrading to >=14.1.0)
  },
    return config;
  },
};

export default nextConfig;
