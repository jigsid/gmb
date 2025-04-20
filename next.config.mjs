/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure permissions and caching
  experimental: {
    optimizePackageImports: ['react-icons', 'framer-motion'],
    serverActions: {
      allowedOrigins: ["localhost:3000"]
    }
  },
  
  // Configure external images for Maps API
  images: {
    domains: ['maps.googleapis.com', 'maps.gstatic.com'],
  },
  
  // Increase serverless function limits for places API
  serverRuntimeConfig: {
    MAX_DURATION: 300, // 5 minutes
  }
};

export default nextConfig;
