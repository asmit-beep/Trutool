import type { Metadata } from 'next';
import { isAllowlistedCompareSlug } from './compare-pairs';
import { DEMO_MODE } from './demo';
import keepPaths from './index-keep-paths.json';

/**
 * Approved public URLs from Search Console: clicked pages, tools and
 * alternatives with at least 7 pre-drop impressions, plus guides, categories,
 * hubs, approved compares, and core/author/service pages.
 * New guides, categories, and allowlisted compares are included by rule.
 * New template tool and alternatives pages stay out until they are added here.
 */
export const indexKeepPaths: readonly string[] = keepPaths;

const keep = new Set(indexKeepPaths);

/**
 * Publisher takedown (PR #48). /tools/hedra is on the Search Console keep-list
 * because it earned impressions before removal. The URL returns 410 and must
 * not be submitted again.
 */
const withdrawn = new Set(['/tools/hedra', '/alternatives/hedra']);

export function normalizePublicPath(path: string): string {
  if (path === '' || path === '/') return '/';
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

export function isWithdrawnPath(path: string): boolean {
  return withdrawn.has(normalizePublicPath(path));
}

function isGuideOrCategory(path: string): boolean {
  return path === '/guides' || path.startsWith('/guides/') || path === '/categories' || path.startsWith('/categories/');
}

function isApprovedCompare(path: string): boolean {
  if (path === '/compare') return true;
  if (!path.startsWith('/compare/')) return false;
  const slug = path.slice('/compare/'.length);
  return !slug.includes('/') && isAllowlistedCompareSlug(slug);
}

/** XML sitemap membership. Thin tool and alternatives URLs require the keep-list. */
export function includeInSitemap(path: string): boolean {
  const normalized = normalizePublicPath(path);
  if (isWithdrawnPath(normalized) || normalized.startsWith('/site-index')) return false;
  if (keep.has(normalized) || isGuideOrCategory(normalized) || isApprovedCompare(normalized)) return true;
  return false;
}

export function isDirectoryProfile(path: string): boolean {
  const normalized = normalizePublicPath(path);
  return /^\/(?:tools|alternatives)\/[^/]+$/.test(normalized);
}

/** Kept directory pages stay indexable. Every other tool or alternatives profile is noindex, follow. */
export function directoryRobots(path: string): Metadata['robots'] | undefined {
  if (!isDirectoryProfile(path) || DEMO_MODE) return undefined;
  const normalized = normalizePublicPath(path);
  const index = keep.has(normalized) && !isWithdrawnPath(normalized);
  return {
    index,
    follow: true,
    googleBot: { index, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  };
}

export function withDirectoryRobots<T extends Metadata>(metadata: T, path: string): T {
  const robots = directoryRobots(path);
  return robots ? { ...metadata, robots } : metadata;
}
