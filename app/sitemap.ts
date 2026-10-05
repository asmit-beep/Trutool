import {serviceCategories} from '@/lib/services';
import type {MetadataRoute} from 'next';
import {SITE,tools,categories,guides,pairs} from '@/lib/catalog';
export default function sitemap():MetadataRoute.Sitemap{
 const paths=['','/tools','/categories','/compare','/alternatives','/guides','/about','/editorial-policy','/contact','/list-your-product','/diagnostic','/methodology','/privacy','/terms','/cookies','/services','/sources','/authors/yash',...serviceCategories.map(c=>'/services/'+c.slug),...tools.flatMap(t=>['/tools/'+t.slug,'/alternatives/'+t.slug]),...categories.map(c=>'/categories/'+c.slug),...guides.map(g=>'/guides/'+g.slug),...pairs.map(([a,b])=>'/compare/'+a+'-vs-'+b)];
 const updated=new Map([...tools.filter(t=>t.updatedAt).map(t=>['/tools/'+t.slug,t.updatedAt!] as const),...guides.map(g=>['/guides/'+g.slug,g.updatedAt||g.publishedAt||'2026-10-05'] as const)]);
 return [...new Set(paths)].map(p=>({url:SITE+p,...(updated.has(p)?{lastModified:updated.get(p)}:{}),priority:p===''?1:p.startsWith('/tools/')?.8:.6}));
}
