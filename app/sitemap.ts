import type {MetadataRoute} from 'next';
import {contentPages,absolute,modifiedFor} from '@/lib/content-index';
import {coverFor} from '@/lib/covers';
export const revalidate=3600;
export default function sitemap():MetadataRoute.Sitemap{return contentPages.map(page=>({url:absolute(page.path||'/'),...(modifiedFor(page)?{lastModified:modifiedFor(page)}:{}),...(page.guide?{images:[absolute(coverFor(page.guide.category))]}:{}),priority:page.path===''?1:page.kind==='tool'?.8:.6}))}
