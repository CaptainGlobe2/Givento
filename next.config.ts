import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    unoptimized: true,
  },
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
