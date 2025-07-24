/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // For efficient server deployment, reduces bundle size
  reactStrictMode: true,  // Helps catch performance issues
  images: {
    domains: [],  // Add if using external images
  },
};

export default nextConfig;