import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      }
    ]
  },
  allowedDevOrigins: ["192.168.1.7"],
  async rewrites() {
    return [
      {
        // Handle /api/owner/* routes with Next.js (no proxy)
        source: '/api/owner/:path*',
        destination: '/api/owner/:path*',
      },
      {
        // Proxy all other /api/* routes to the backend
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/$1',
      },
    ];
  },
};

export default nextConfig;