import { CmsList } from '@/components/cms-list';
import { PageStructuredData } from '@/components/page-structured-data';
import { ToolBrowser } from '@/components/tool-browser';
import { categories,SITE,tools } from '@/lib/catalog';
import type { DirectoryParams } from '@/lib/catalog-client';
import { categoryOptions,toolResults } from '@/lib/catalog-results';
import { publicTools } from '@/lib/cms-public';
import { pageMetadata } from '@/lib/seo';
export const revalidate=30;
export const metadata=pageMetadata({title:'Browse Software & Learning Platforms',description:`Search ${tools.length} tools across ${categories.length} categories, including AI, design, productivity, marketing, and development.`,alternates:{canonical:SITE+'/tools'}});
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){const params=await searchParams;return <main id="main" className="shell"><PageStructuredData path="/tools"/><div className="page-intro"><span className="eyebrow">THE DIRECTORY</span><h1>Find your next tool.</h1><p>Explore the platforms, compare the trade-offs, and build your shortlist.</p></div><div className="page-body"><ToolBrowser key={JSON.stringify(params)} initialQuery={params.q||''} categories={categoryOptions} initial={toolResults(params.q||'',params.category||'',params.sort||'relevance',Number(params.page||1),24,'',params.discovery||'all',await publicTools())}/></div><CmsList kind="tool" heading="Latest editorial picks"/></main>}
