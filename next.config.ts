import type { NextConfig } from "next";
import { webpack } from "next/dist/compiled/webpack/webpack";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
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
