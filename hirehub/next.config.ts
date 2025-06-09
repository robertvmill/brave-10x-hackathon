import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignore ESLint during build (for Vercel deployment)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during build (for Vercel deployment)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
