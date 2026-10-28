import { PageStructuredData } from '@/components/page-structured-data';
import Link from '@/components/site-link';
import { SITE } from '@/lib/catalog';
import { publicPages } from '@/lib/cms-public';
import { pageMetadata } from '@/lib/seo';
import { groupSiteIndex, siteIndexPagePath } from '@/lib/site-index';
import { serializeSchema } from '@/lib/structured-data';

export const revalidate=false;
export const metadata = pageMetadata({
  title: 'TruTool Site Index — All Public Pages',
  description: 'Browse all TruTool tool profiles, alternatives, categories, guides, comparisons, community answers, and other public pages.',
  alternates: { canonical: SITE + '/site-index' },
});

export default async function Page() {
  const groups = groupSiteIndex(await publicPages());
  const entries = groups.filter(group => group.count > 0);
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': SITE + '/site-index#webpage',
        url: SITE + '/site-index',
        name: 'TruTool site index',
        isPartOf: { '@id': SITE + '/#website' },
        breadcrumb: { '@id': SITE + '/site-index#breadcrumb' },
        mainEntity: { '@id': SITE + '/site-index#entries' },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': SITE + '/site-index#breadcrumb',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: 'Site index', item: SITE + '/site-index' },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': SITE + '/site-index#entries',
        numberOfItems: entries.length,
        itemListElement: entries.map((group, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: group.label,
          url: SITE + siteIndexPagePath(group.id, 1),
        })),
      },
    ],
  };

  return <main id="main" className="shell">
    <div className="page-intro">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Site index</span></div>
      <span className="eyebrow">TRUTOOL DIRECTORY</span>
      <h1>Explore the complete site.</h1>
      <p>Browse every public, canonical page through direct HTML links, organized by topic.</p>
    </div>
    <div className="page-body">
      <div className="category-grid">
        {entries.map(group => <Link key={group.id} href={siteIndexPagePath(group.id, 1)} className="category-card">
          <h2>{group.label}</h2>
          <p>{group.description}</p>
          <span>{group.count} {group.count === 1 ? 'page' : 'pages'} · {group.chunks} {group.chunks === 1 ? 'section' : 'sections'} →</span>
        </Link>)}
      </div>
      <p className="editor-note">For the machine-readable list of canonical URLs, see the <Link href="/sitemap.xml">XML sitemap</Link>.</p>
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeSchema(schema) }}/>
  </main>;
}
