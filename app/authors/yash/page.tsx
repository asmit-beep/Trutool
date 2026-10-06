import {pageMetadata} from '@/lib/seo';
import {AuthorProfile} from '@/components/author-profile';
import {GuideCard} from '@/components/guide-card';
import {guides,SITE} from '@/lib/catalog';
export const metadata=pageMetadata({title:'Yash — TruTool Editorial Team',description:'Read software buying frameworks and evaluation guides by Yash, from the TruTool editorial team.',alternates:{canonical:SITE+'/authors/yash'}});
export default function Page(){return <main id="main" className="shell"><div className="page-intro"><span className="eyebrow">MEET THE AUTHOR</span><h1>Useful questions. Clearer decisions.</h1><AuthorProfile/><p>These guides are editorial buying frameworks. They distinguish vendor descriptions, evaluation criteria, and customer reviews so you can assess each source on its own terms.</p></div><div className="guide-grid guides-index page-body">{guides.map(g=><GuideCard key={g.slug} guide={g}/>)}</div></main>}
