import { absolute, modifiedFor, type ContentPage } from './content-index';
import { coverFor } from './covers';
import { includeInSitemap } from './index-policy';
import type { MetadataRoute } from 'next';

// Recovered CMS snapshots are source-controlled while legacy storage is
// restricted. Keep sitemap-only revision times tied to the exact commit that
// last changed the rendered snapshot; page metadata remains CMS-owned.
const sourceRevision: Record<string, string> = {
  '/guides/slack-alternatives-for-internal-communications': '2026-10-30T15:51:18.000Z',
};

function latestIso(values: Array<string | null | undefined>): string | undefined {
  return values
    .filter((value): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value)))
    .sort((a, b) => Date.parse(a) - Date.parse(b))
    .at(-1);
}

/**
 * Tool and alternatives lastmod follows the catalogue or CMS record.
 * content-history fingerprints move together when a shared template changes
 * (4,380 directory URLs were stamped 2026-11-13) and are not a content date.
 */
export function sitemapLastModified(page: ContentPage): string | undefined {
  if (page.kind === 'tool' || page.kind === 'alternatives') {
    return latestIso([
      page.cms?.updatedAt,
      page.updatedAt,
      page.cms?.publishedAt,
      page.publishedAt,
      page.tool?.updatedAt,
      page.tool?.addedAt,
      page.tool?.sourceChecked,
    ]);
  }
  return modifiedFor(page);
}

/**
 * Submit the Search Console keep-list, plus guides, categories, and approved
 * compares added after that list. The HTML site index still lists every public
 * URL; those pagination pages are not sitemap documents.
 * Leave tracking URLs, redirects, API and unpublished CMS records out.
 */
export function sitemapEntries(pages: readonly ContentPage[]): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const included = new Set<string>();

  for (const page of pages) {
    if (!includeInSitemap(page.path || '/')) continue;
    const url = absolute(page.path || '/');
    if (included.has(url)) continue;
    included.add(url);
    const lastModified = [sitemapLastModified(page), sourceRevision[page.path]]
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

  return entries;
}
