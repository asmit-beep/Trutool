import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {formats:['image/webp'], minimumCacheTTL:86400},
  experimental: {turbopackFileSystemCacheForBuild: false},
};

export default nextConfig;
