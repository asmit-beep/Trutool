import { publicPages } from '@/lib/cms-public';
import { absolute,modifiedFor } from '@/lib/content-index';
import { coverFor } from '@/lib/covers';
import type { MetadataRoute } from 'next';
export const revalidate=30;
export default async function sitemap():Promise<MetadataRoute.Sitemap>{return (await publicPages()).map(page=>({url:absolute(page.path||'/'),...(modifiedFor(page)?{lastModified:modifiedFor(page)}:{}),...(page.cms?.image?{images:[/^https:\/\//.test(page.cms.image)?page.cms.image:absolute(page.cms.image)]}:page.guide?{images:[absolute(coverFor(page.guide.category))]}:{}),priority:page.path===''?1:page.kind==='tool'?.8:.6}))}
