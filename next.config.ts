import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  allowedDevOrigins: ['192.168.0.101'],
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'http://103.164.160.22',
        port: '2352',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
