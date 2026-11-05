import { absolute } from '@/lib/content-index';
import type { MetadataRoute } from 'next';
export default function robots():MetadataRoute.Robots{return {rules:[{userAgent:'*',allow:'/',disallow:['/admin','/api/']},{userAgent:['Googlebot','Googlebot-Image','Bingbot','GPTBot','OAI-SearchBot','ChatGPT-User','PerplexityBot','ClaudeBot','Claude-SearchBot','Claude-User','anthropic-ai','Google-Extended','CCBot'],allow:'/',disallow:['/admin','/api/']}],sitemap:absolute('/sitemap.xml')}}
