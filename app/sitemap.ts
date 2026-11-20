import { publicPages } from '@/lib/cms-public';
import { sitemapEntries } from '@/lib/sitemap-inventory';
import type { MetadataRoute } from 'next';

// Always use the latest published CMS inventory; new public pages are included automatically.
export const dynamic='force-dynamic';
export const revalidate=0;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return sitemapEntries(await publicPages());
}
