/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable trace files that might cause permission issues
  tracing: {
    traceFn: () => null // Disable tracing completely
  },
  
  // Configure permissions and caching
  experimental: {
    optimizePackageImports: ['react-icons', 'framer-motion'],
    serverActions: true
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
