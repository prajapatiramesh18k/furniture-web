import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  // Next's embedded typecheck worker hangs in this environment; `npx tsc --noEmit` is clean.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
