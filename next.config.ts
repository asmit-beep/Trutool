import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {'/api/og':['./public/trutool-logo.png','./public/brands/**/*','./public/covers/**/*']},
  images: {formats:['image/webp'], minimumCacheTTL:86400},
  experimental: {turbopackFileSystemCacheForBuild: false},
};

export default nextConfig;
