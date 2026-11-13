import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // One vendor, one canonical profile. Retain legacy links as permanent redirects.
  async redirects(){return [
    {source:'/tools/kit-email',destination:'/tools/kit',permanent:true},
    {source:'/alternatives/kit-email',destination:'/alternatives/kit',permanent:true},
  ]},
  async rewrites(){return {beforeFiles:[{source:'/:resource*.md',destination:'/api/content-markdown/:resource*'}],afterFiles:[],fallback:[]}},
  async headers(){return [{source:'/:asset(identity|brands|covers)/:path*',headers:[{key:'Cache-Control',value:'public, max-age=86400, stale-while-revalidate=604800'}]},{source:'/alternatives/loopio',headers:[{key:'X-Robots-Tag',value:'index, follow, max-image-preview:large'}]},{source:'/alternatives/responsive',headers:[{key:'X-Robots-Tag',value:'index, follow, max-image-preview:large'}]},{source:'/admin/:path*',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'},{key:'X-Frame-Options',value:'DENY'},{key:'Cache-Control',value:'private, no-store'}]},{source:'/:path((?!api/content-markdown|.*\\.md$).*)',headers:[{key:'Link',value:'</llms.txt>; rel="describedby"; type="text/markdown"'}]}]},
  outputFileTracingIncludes: {'/api/og':['./public/identity/trutool-logo-dark.png','./public/identity/trutool-icon-dark.svg','./public/brands/**/*','./public/covers/**/*']},
  images: {remotePatterns:[{protocol:'https',hostname:'cdn-uploads.huggingface.co'},{protocol:'https',hostname:'cdn.sanity.io'},{protocol:'https',hostname:'images.ctfassets.net'},{protocol:'https',hostname:'about.fb.com'},{protocol:'https',hostname:'blogs.nvidia.com'},{protocol:'https',hostname:'blogs.microsoft.com'},{protocol:'https',hostname:'techcrunch.com'},{protocol:'https',hostname:'news.mit.edu'},{protocol:'https',hostname:'storage.googleapis.com'},{protocol:'https',hostname:'lh3.googleusercontent.com'},{protocol:'https',hostname:'images.openai.com'},{protocol:'https',hostname:'openai.com'},{protocol:'https',hostname:'www.anthropic.com'},{protocol:'https',hostname:'huggingface.co'},{protocol:'https',hostname:'developer.nvidia.com'},{protocol:'https',hostname:'news.microsoft.com'},{protocol:'https',hostname:'techcrunch.wordpress.com'},{protocol:'https',hostname:'blog.google'}],formats:['image/webp'], minimumCacheTTL:86400},
  experimental: {turbopackFileSystemCacheForBuild: false},
};

export default nextConfig;
