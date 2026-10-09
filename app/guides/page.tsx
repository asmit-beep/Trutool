import { CmsList } from '@/components/cms-list';
import { GuideCard } from '@/components/guide-card';
import { PageStructuredData } from '@/components/page-structured-data';
import { latestGuides,SITE } from '@/lib/catalog';
import { getPublished,hiddenPaths } from '@/lib/cms-store';
import { pageMetadata } from '@/lib/seo';
export const revalidate=30;
export const metadata=pageMetadata({title:'Software & Learning Buying Guides',description:'Practical buying guides for AI, design, marketing, productivity, local listings, proposals, and more.',alternates:{canonical:SITE+'/guides'}});
export default async function Page(){const hidden=await hiddenPaths(),published=await getPublished(),baseGuides=latestGuides.filter(g=>!hidden.has('/guides/'+g.slug)&&!published.some(c=>c.kind==='guide'&&c.slug===g.slug));return <main id="main" className="shell"><PageStructuredData path="/guides"/><div className="page-intro"><span className="eyebrow">BUY SMARTER</span><h1>Know what to look for.</h1><p>Practical buying checklists. Better questions. Decisions built around your actual work.</p><div className="byline">{baseGuides.length+published.filter(c=>c.kind==='guide').length} published buying guides</div></div><div className="guide-grid guides-index page-body">{baseGuides.map(g=><GuideCard key={g.slug} guide={g}/>)}</div><CmsList kind="guide"/></main>}
