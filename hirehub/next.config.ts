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
  serverExternalPackages: ['pdf-parse'],
  webpack: (config, { isServer }) => {
    // Handle canvas dependency for pdf-parse
    if (isServer) {
      config.externals.push('canvas');
    }
    
    // Ignore test files and other non-essential modules
    config.resolve.alias = {
      ...config.resolve.alias,
      'canvas': false,
    };
    
    config.module.rules.push({
      test: /\.pdf$/,
      use: 'ignore-loader'
    });
    
    return config;
  },
};

export default nextConfig;
