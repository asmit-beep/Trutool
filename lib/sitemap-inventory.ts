import { absolute, modifiedFor, type ContentPage } from './content-index';
import { coverFor } from './covers';
import { siteIndexPaths } from './site-index';
import type { MetadataRoute } from 'next';

// Recovered CMS snapshots are source-controlled while legacy storage is
// restricted. Keep sitemap-only revision times tied to the exact commit that
// last changed the rendered snapshot; page metadata remains CMS-owned.
const sourceRevision: Record<string, string> = {
  '/guides/slack-alternatives-for-internal-communications': '2026-10-30T15:51:18.000Z',
};

/**
 * Every published public URL is generated from the same inventory as the HTML site index.
 * The index and its pagination pages are indexable URLs too.
 * Leave tracking URLs, redirects, API and unpublished CMS records out of this inventory.
 */
export function sitemapEntries(pages: readonly ContentPage[]): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const included = new Set<string>();

  for (const page of pages) {
    const url = absolute(page.path || '/');
    if (included.has(url)) continue;
    included.add(url);
    const lastModified = [modifiedFor(page), sourceRevision[page.path]]
      .filter((value): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value)))
      .sort()
      .at(-1);
    // Long-form RFP alternatives have their own original editorial cover assets.
    const rfpCover = page.path === '/alternatives/loopio' ? '/covers/loopio-alternatives.svg'
      : page.path === '/alternatives/responsive' ? '/covers/responsive-alternatives.svg' : undefined;
    entries.push({
      url,
      ...(lastModified ? { lastModified } : {}),
      ...(rfpCover ? { images: [absolute(rfpCover)] }
        : page.cms?.image ? { images: [/^https:\/\//.test(page.cms.image) ? page.cms.image : absolute(page.cms.image)] }
        : page.guide ? { images: [absolute(coverFor(page.guide.category))] } : {}),
      priority: page.path === '' ? 1 : rfpCover ? 0.85 : page.kind === 'tool' ? 0.8 : 0.6,
    });
  }

  for (const path of siteIndexPaths(pages)) {
    const url = absolute(path);
    if (included.has(url)) continue;
    included.add(url);
    entries.push({ url });
  }

  return entries;
}
