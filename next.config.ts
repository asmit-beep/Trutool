import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {'/api/og':['./public/identity/trutool-logo-dark.png','./public/brands/**/*','./public/covers/**/*']},
  images: {remotePatterns:[{protocol:'https',hostname:'cdn-uploads.huggingface.co'},{protocol:'https',hostname:'cdn.sanity.io'},{protocol:'https',hostname:'images.ctfassets.net'},{protocol:'https',hostname:'about.fb.com'},{protocol:'https',hostname:'blogs.nvidia.com'},{protocol:'https',hostname:'blogs.microsoft.com'},{protocol:'https',hostname:'techcrunch.com'},{protocol:'https',hostname:'news.mit.edu'},{protocol:'https',hostname:'storage.googleapis.com'},{protocol:'https',hostname:'lh3.googleusercontent.com'},{protocol:'https',hostname:'images.openai.com'},{protocol:'https',hostname:'openai.com'},{protocol:'https',hostname:'www.anthropic.com'},{protocol:'https',hostname:'huggingface.co'},{protocol:'https',hostname:'developer.nvidia.com'},{protocol:'https',hostname:'news.microsoft.com'},{protocol:'https',hostname:'techcrunch.wordpress.com'},{protocol:'https',hostname:'blog.google'}],formats:['image/webp'], minimumCacheTTL:86400},
  experimental: {turbopackFileSystemCacheForBuild: false},
};

export default nextConfig;
