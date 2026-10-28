import Link from '@/components/site-link';
import { SITE } from '@/lib/catalog';
import { publicPages } from '@/lib/cms-public';
import { pageMetadata } from '@/lib/seo';
import { groupSiteIndex, SITE_INDEX_PAGE_SIZE, siteIndexPagePath, siteIndexSections, type SiteIndexSection } from '@/lib/site-index';
import { serializeSchema } from '@/lib/structured-data';
import { notFound } from 'next/navigation';

export const revalidate=false;

type Props = { params: Promise<{ section: string; page: string }> };

export async function generateMetadata({ params }: Props) {
  const { section, page } = await params;
  const group = siteIndexSections.find(item => item.id === section);
  const number = Number(page);
  if (!group || !/^[1-9]\d*$/.test(page)) return { robots: { index: false } };
  return pageMetadata({
    title: group.label + ' — Site Index, Page ' + number,
    description: group.description + ' Browse direct links to TruTool public pages.',
    alternates: { canonical: SITE + siteIndexPagePath(group.id, number) },
  });
}

export default async function Page({ params }: Props) {
  const { section, page } = await params;
  const groupId = siteIndexSections.find(item => item.id === section)?.id;
  if (!groupId || !/^[1-9]\d*$/.test(page)) notFound();
  const number = Number(page);
  const group = groupSiteIndex(await publicPages()).find(item => item.id === groupId)!;
  if (number > group.chunks) notFound();

  const entries = group.pages.slice((number - 1) * SITE_INDEX_PAGE_SIZE, number * SITE_INDEX_PAGE_SIZE);
  const canonical = SITE + siteIndexPagePath(groupId as SiteIndexSection, number);
  const crumbs = [
    { name: 'Home', url: SITE + '/' },
    { name: 'Site index', url: SITE + '/site-index' },
    { name: group.label + ' — Page ' + number, url: canonical },
  ];
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': canonical + '#webpage',
        url: canonical,
        name: group.label + ' — Page ' + number,
        description: group.description,
        isPartOf: { '@id': SITE + '/#website' },
        breadcrumb: { '@id': canonical + '#breadcrumb' },
        mainEntity: { '@id': canonical + '#entries' },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': canonical + '#breadcrumb',
        itemListElement: crumbs.map((item, index) => ({
          '@type': 'ListItem', position: index + 1, name: item.name, item: item.url,
        })),
      },
      {
        '@type': 'ItemList',
        '@id': canonical + '#entries',
        numberOfItems: entries.length,
        itemListElement: entries.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.title,
          url: SITE + (item.path || '/'),
        })),
      },
    ],
  };

  return <main id="main" className="shell">
    <div className="page-intro">
      <div className="breadcrumb">
        <Link href="/">Home</Link><span>/</span>
        <Link href="/site-index">Site index</Link><span>/</span>
        <span>{group.label}, page {number}</span>
      </div>
      <span className="eyebrow">TRUTOOL DIRECTORY</span>
      <h1>{group.label}</h1>
      <p>{group.description} Page {number} of {group.chunks}. Every entry links directly to its public canonical page.</p>
    </div>
    <div className="page-body">
      <nav aria-label="Site index sections">
        <Link className="text-link" href="/site-index">Explore all sections →</Link>
      </nav>
      <div className="category-grid">
        {entries.map(item => <Link key={item.path} href={item.path || '/'} className="category-card">
          <h2>{item.title}</h2>
          <p>{item.description}</p>
          <span>Visit page →</span>
        </Link>)}
      </div>
      <nav className="directory-pagination" aria-label="Site index pages">
        {number > 1 ? <Link className="chip" href={siteIndexPagePath(groupId, number - 1)}>Previous</Link> : <span/>}
        <span>Page {number} of {group.chunks}</span>
        {number < group.chunks ? <Link className="chip" href={siteIndexPagePath(groupId, number + 1)}>Next</Link> : <span/>}
      </nav>
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeSchema(schema) }}/>
  </main>;
}
