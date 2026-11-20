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
  // CMS publication and edit timestamps describe the actual rendered article.
  // Do not let a source-controlled template fingerprint impersonate an edit.
  if (page.cms) {
    return latestIso([page.cms.updatedAt, page.cms.publishedAt, page.updatedAt, page.publishedAt]);
  }
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
 * Publish every eligible, indexable editorial CMS page automatically,
 * alongside the previously approved directory URLs and source-controlled
 * guides/categories. Keep the existing Search Console keep-list for generated
 * tools, alternatives, and comparison templates that can be thin or noindex.
 *
 * This includes newly published guides, community answers, news, author
 * profiles, and service articles without a manual allowlist edit.
 * Hidden, draft, scheduled-for-future and withdrawn pages are already
 * excluded by publicPages(), with withdrawn paths checked again here.
 */
function eligiblePage(page: ContentPage): boolean {
  if (includeInSitemap(page.path || '/')) return true;
  return Boolean(page.cms && ['guide', 'answer', 'news', 'author', 'service'].includes(page.cms.kind) &&
    !page.path.startsWith('/site-index') &&
    !page.path.startsWith('/api/') &&
    !page.path.startsWith('/admin/') &&
    !page.path.includes('?') &&
    !page.path.includes('#'));
}

export function sitemapEntries(pages: readonly ContentPage[]): MetadataRoute.Sitemap {
  type SitemapEntry = MetadataRoute.Sitemap[number];
  const rows: {entry: SitemapEntry; sortTime: number; isArticle: boolean}[] = [];
  const included = new Set<string>();

  for (const page of pages) {
    if (!eligiblePage(page)) continue;
    const url = absolute(page.path || '/');
    if (included.has(url)) continue;
    included.add(url);

    const lastModified = latestIso([sitemapLastModified(page), sourceRevision[page.path]]);
    // Long-form RFP alternatives have their own original editorial cover assets.
    const rfpCover = page.path === '/alternatives/loopio' ? '/covers/loopio-alternatives.svg'
      : page.path === '/alternatives/responsive' ? '/covers/responsive-alternatives.svg' : undefined;
    const entry: SitemapEntry = {
      url,
      ...(lastModified ? { lastModified } : {}),
      ...(rfpCover ? { images: [absolute(rfpCover)] }
        : page.cms?.image ? { images: [/^https:\/\//.test(page.cms.image) ? page.cms.image : absolute(page.cms.image)] }
        : page.guide ? { images: [absolute(coverFor(page.guide.category))] } : {}),
    };
    rows.push({
      entry,
      sortTime: lastModified ? Date.parse(lastModified) : -1,
      isArticle: Boolean(page.cms && ['guide', 'news', 'answer', 'comparison', 'alternatives'].includes(page.cms.kind)) ||
        ['guide', 'answer', 'comparison'].includes(page.kind),
    });
  }

  // Last modified first across ALL kinds, not just within each collection.
  // For equal timestamps, put actual articles before their updated hubs;
  // deterministic URL order prevents jitter between sitemap requests.
  rows.sort((a, b) =>
    b.sortTime - a.sortTime ||
    Number(b.isArticle) - Number(a.isArticle) ||
    a.entry.url.localeCompare(b.entry.url),
  );
  return rows.map(row => row.entry);
}
