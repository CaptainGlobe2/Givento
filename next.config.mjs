
/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,

  images: {
    unoptimized: true,
  },

  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
