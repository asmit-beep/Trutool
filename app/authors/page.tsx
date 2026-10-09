import { AuthorCards } from '@/components/author-card';
import { CmsList } from '@/components/cms-list';
import { PageStructuredData } from '@/components/page-structured-data';
import { SITE } from '@/lib/catalog';
import { pageMetadata } from '@/lib/seo';
export const revalidate=30;
export const metadata=pageMetadata({title:'Meet the TruTool Editorial Team',description:'Explore buying guides and practical software perspectives from Yash, Snehil, Sandeep, and Asmit.',alternates:{canonical:SITE+'/authors'}});
export default async function Page(){return <main id="main" className="shell team-index"><PageStructuredData path="/authors"/><div className="page-intro"><span className="eyebrow">THE TRUTOOL EDITORIAL TEAM</span><h1>Different perspectives.<br/>Clearer choices.</h1><p>Meet Yash, Snehil, Sandeep, and Asmit. Find buying guides and answers around the work that interests you.</p></div><AuthorCards/><CmsList kind="author"/></main>}
