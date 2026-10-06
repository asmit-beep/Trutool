import {EverythingAI} from '@/components/everything-ai';
import {getAINews,getAIDiscussions} from '@/lib/ai-news';
import {aiStats,aiCategories} from '@/lib/ai';
import {toolResults} from '@/lib/catalog-results';
import {ToolBrowser} from '@/components/tool-browser';
import {pageMetadata} from '@/lib/seo';
import {SITE} from '@/lib/catalog';
export const revalidate=172800;
export const metadata=pageMetadata({title:'Everything AI — Agents, Chatbots, Coworkers & News',description:`Discover ${aiStats.tools} AI tools across ${aiStats.categories} focused categories. Explore agents, coworkers, chatbots, coding, creative tools, and news from official sources.`,alternates:{canonical:SITE+'/everything-ai'}});
export default async function Page({searchParams}:{searchParams:Promise<{q?:string;category?:string}>}){
 const params=await searchParams,query=params.q||'',category=aiCategories.some(c=>c.slug===params.category)?params.category!:'';
 const [news,discussions]=await Promise.all([getAINews(),getAIDiscussions()]);
 return <main id="main"><EverythingAI news={news} discussions={discussions} compact/><section className="section shell" id="ai-directory"><div className="page-intro ai-directory-intro"><div><span className="eyebrow">THE AI DIRECTORY</span><h1>Find your kind of AI.</h1><p>From everyday assistants to specialist infrastructure. Search the work you need to do, then compare the fit.</p></div><span className="chip">{aiStats.tools} AI tools · {aiStats.categories} categories</span></div><div className="page-body"><ToolBrowser key={query+'|'+category} scope="ai" initialQuery={query} category={category} initial={toolResults(query,category,'relevance',1,24,'ai')} categories={aiCategories.map(({slug,short})=>({slug,short}))}/></div></section></main>
}
