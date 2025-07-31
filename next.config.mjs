/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add polyfills for node modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false
      };
    }
    return config;
  },
  experimental: {
    serverActions: true
  }
};

// Change module.exports to export default for ESM
export default nextConfig;