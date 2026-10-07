import type {DirectoryParams} from '@/lib/catalog-client';
import {pageMetadata} from '@/lib/seo';
import {categoryOptions,toolResults} from '@/lib/catalog-results';
import {ToolBrowser} from '@/components/tool-browser';
import {SITE,tools,categories} from '@/lib/catalog';
export const metadata=pageMetadata({title:'Browse Software & Learning Platforms',description:`Search ${tools.length} tools across ${categories.length} categories, including AI, design, productivity, marketing, and development.`,alternates:{canonical:SITE+'/tools'}});
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){const params=await searchParams;return <main id="main" className="shell"><div className="page-intro"><span className="eyebrow">THE DIRECTORY</span><h1>Find your next tool.</h1><p>Explore the platforms, compare the trade-offs, and build your shortlist.</p></div><div className="page-body"><ToolBrowser key={params.q||''} initialQuery={params.q||''} categories={categoryOptions} initial={toolResults(params.q||'',params.category||'',params.sort||'relevance',Number(params.page||1),24,'',params.discovery||'all')}/></div></main>}
