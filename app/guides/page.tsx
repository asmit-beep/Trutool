import {PageStructuredData} from '@/components/page-structured-data';
import {pageMetadata} from '@/lib/seo';
import {GuideCard} from '@/components/guide-card';
import {guides,latestGuides,SITE} from '@/lib/catalog';
export const metadata=pageMetadata({title:'Software & Learning Buying Guides',description:'Practical buying guides for AI, design, marketing, productivity, local listings, proposals, and more.',alternates:{canonical:SITE+'/guides'}});
export default function Page(){return <main id="main" className="shell"><PageStructuredData path="/guides"/><div className="page-intro"><span className="eyebrow">BUY SMARTER</span><h1>Know what to look for.</h1><p>Practical buying checklists. Better questions. Decisions built around your actual work.</p><div className="byline">{guides.length} published buying guides</div></div><div className="guide-grid guides-index page-body">{latestGuides.map(g=><GuideCard key={g.slug} guide={g}/>)}</div></main>}
