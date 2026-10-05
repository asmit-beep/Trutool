import {categoryOptions,toolResults} from '@/lib/catalog-results';
import {SITE} from '@/lib/catalog';
import {AlternativeBrowser} from '@/components/alternative-browser';
export const metadata={title:'Find Software Alternatives',alternates:{canonical:SITE+'/alternatives'}};
export default function Page(){return <main id="main" className="shell"><div className="page-intro"><span className="eyebrow">OTHER WAYS TO GET THERE</span><h1>Find your next alternative.</h1><p>Start with a platform you know. Explore other options in the same category.</p></div><div className="page-body"><AlternativeBrowser categories={categoryOptions} initial={toolResults()}/></div></main>}
