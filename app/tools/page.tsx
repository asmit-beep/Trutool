import {ToolBrowser} from '@/components/tool-browser';
import {SITE} from '@/lib/catalog';
export const metadata={title:'Browse Software & Learning Platforms',description:'Search and filter 24 platforms for local listings, RFP responses, communication, and professional education.',alternates:{canonical:SITE+'/tools'}};
export default async function Page({searchParams}:{searchParams:Promise<{q?:string}>}){const params=await searchParams;return <main id="main" className="shell"><div className="page-intro"><span className="eyebrow">THE DIRECTORY</span><h1>Find your next tool.</h1><p>Explore the platforms, compare the trade-offs, and build your shortlist.</p></div><div className="page-body"><ToolBrowser initialQuery={params.q||''}/></div></main>}
