import { absolute } from '@/lib/content-index';
import type { MetadataRoute } from 'next';

// /compare?tools=a,b is an on-demand picker, not a document. Block the query
// form without blocking /compare or the approved /compare/a-vs-b paths.
const disallow = ['/admin', '/api/', '/compare?', '/compare/?'];

export default function robots(): MetadataRoute.Robots {
  const rule = { allow: '/', disallow };
  return {
    rules: [
      { userAgent: '*', ...rule },
      {
        userAgent: ['Googlebot', 'Googlebot-Image', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai', 'Google-Extended', 'CCBot'],
        ...rule,
      },
    ],
    sitemap: absolute('/sitemap.xml'),
  };
}
