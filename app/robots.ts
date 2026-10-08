import type {MetadataRoute} from 'next';
import {absolute} from '@/lib/content-index';
export default function robots():MetadataRoute.Robots{return {rules:[{userAgent:'*',allow:'/'},{userAgent:['Googlebot','Googlebot-Image','Bingbot','GPTBot','OAI-SearchBot','ChatGPT-User','PerplexityBot','ClaudeBot','Claude-SearchBot','Claude-User','anthropic-ai','Google-Extended','CCBot'],allow:'/'}],sitemap:absolute('/sitemap.xml')}}
