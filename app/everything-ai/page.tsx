import { CmsList } from '@/components/cms-list';
import { EverythingAI } from '@/components/everything-ai';
import { PageStructuredData } from '@/components/page-structured-data';
import { ToolBrowser } from '@/components/tool-browser';
import { aiCategories,aiStats } from '@/lib/ai';
import { getAIDiscussions,getAINews } from '@/lib/ai-news';
import { SITE } from '@/lib/catalog';
import type { DirectoryParams } from '@/lib/catalog-client';
import { toolResults } from '@/lib/catalog-results';
import { publicTools } from '@/lib/cms-public';
import { pageMetadata } from '@/lib/seo';
export const revalidate=30;
export const metadata=pageMetadata({title:'Everything AI — Agents, Chatbots, Coworkers & News',description:`Discover ${(await publicTools()).filter(t=>t.ai||t.category.startsWith('ai')).length} AI tools across ${aiStats.categories} focused categories. Explore agents, coworkers, chatbots, coding, creative tools, and news from official sources.`,alternates:{canonical:SITE+'/everything-ai'}});
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){
 const params=await searchParams,query=params.q||'',category=aiCategories.some(c=>c.slug===params.category)?params.category!:'';
 const newsPromise=getAINews();const [news,discussions]=await Promise.all([newsPromise,getAIDiscussions(newsPromise)]);
 return <main id="main"><PageStructuredData path="/everything-ai"/><EverythingAI news={news} discussions={discussions} compact/><section className="section shell" id="ai-directory"><div className="page-intro ai-directory-intro"><div><span className="eyebrow">THE AI DIRECTORY</span><h1>Find your kind of AI.</h1><p>From everyday assistants to specialist infrastructure. Search the work you need to do, then compare the fit.</p></div><span className="chip">{(await publicTools()).filter(t=>t.ai||t.category.startsWith('ai')).length} AI tools · {aiStats.categories} categories</span></div><div className="page-body"><ToolBrowser key={JSON.stringify(params)} scope="ai" initialQuery={query} category={category} initial={toolResults(query,category,params.sort||'relevance',Number(params.page||1),24,'ai',params.discovery||'all',await publicTools())} categories={aiCategories.map(({slug,short})=>({slug,short}))}/></div></section><div className="shell"><CmsList kind="news" heading="From the TruTool desk"/></div></main>
}
