import { CmsGuideCard } from '@/components/cms-guide-card';
import { GuideCard } from '@/components/guide-card';
import { PageStructuredData } from '@/components/page-structured-data';
import { latestGuides,SITE } from '@/lib/catalog';
import { getPublished,hiddenPaths } from '@/lib/cms-store';
import { pageMetadata } from '@/lib/seo';
export const revalidate=false;
export const metadata=pageMetadata({title:'Software & Learning Buying Guides',description:'Practical buying guides for AI, design, marketing, productivity, local listings, proposals, and more.',alternates:{canonical:SITE+'/guides'}});
export default async function Page() {
  const [hidden, published] = await Promise.all([hiddenPaths(), getPublished()]);
  const publishedGuides = published.filter(c => c.kind === 'guide' && !hidden.has('/guides/' + c.slug))
    .sort((a, b) => (b.publishedAt || b.updatedAt || '').localeCompare(a.publishedAt || a.updatedAt || ''));
  const builtInGuides = latestGuides.filter(g => !hidden.has('/guides/' + g.slug) && !publishedGuides.some(c => c.slug === g.slug));
  return <main id="main" className="shell">
    <PageStructuredData path="/guides"/>
    <div className="page-intro">
      <span className="eyebrow">BUY SMARTER</span>
      <h1>Know what to look for.</h1>
      <p>Practical buying checklists. Better questions. Decisions built around your actual work.</p>
      <div className="byline">{builtInGuides.length + publishedGuides.length} published buying guides</div>
    </div>
    <div className="guide-grid guides-index page-body">
      {publishedGuides.map(guide => <CmsGuideCard key={'cms-' + guide.id} guide={guide}/>)}
      {builtInGuides.map(guide => <GuideCard key={guide.slug} guide={guide}/>)}
    </div>
  </main>;
}
