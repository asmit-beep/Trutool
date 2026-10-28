import {RfpFeaturedLinks} from '@/components/rfp-featured-links';
import { PageStructuredData } from '@/components/page-structured-data';
import Link from '@/components/site-link';
import { ToolBrowser } from '@/components/tool-browser';
import { categories,guides,SITE } from '@/lib/catalog';
import type { DirectoryParams } from '@/lib/catalog-client';
import { categoryOptions,toolResults } from '@/lib/catalog-results';
import { publicTools } from '@/lib/cms-public';
import {inCategory} from '@/lib/category-crosslist';
import { getPublished, hiddenPaths } from '@/lib/cms-store';
import { pageMetadata,categoryMetaDescription } from '@/lib/seo';
import { notFound } from 'next/navigation';
export const revalidate=false;
export function generateStaticParams(){return categories.map(c=>({slug:c.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params,c=categories.find(x=>x.slug===slug);return c?pageMetadata({title:c.name+' — Tools & Comparisons',description:categoryMetaDescription(c),alternates:{canonical:SITE+'/categories/'+slug}}):{title:'Category not found'}}
export default async function Page({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<DirectoryParams>}){const {slug}=await params,c=categories.find(x=>x.slug===slug);if(!c)notFound();const filters=await searchParams;
 const [published,hidden]=await Promise.all([getPublished(),hiddenPaths()]);
 const publishedGuides=published.filter(item=>item.kind==='guide'&&item.category===slug&&!hidden.has('/guides/'+item.slug))
   .sort((a,b)=>(b.publishedAt||b.updatedAt||'').localeCompare(a.publishedAt||a.updatedAt||''));
 const g=guides.find(g=>g.category===slug)||guides.find(g=>g.slug==='choosing-a-software-stack')!;
 return <main id="main" className="shell"><PageStructuredData path={'/categories/'+slug}/><div className="page-intro"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/categories">Categories</Link><span>/</span><span>{c.short}</span></div><span className="eyebrow">{(await publicTools()).filter(t=>inCategory(t,slug)).length} TOOLS TO EXPLORE</span><h1>{c.name}</h1><p>{c.description}</p></div><div className="page-body">{slug==='rfp-software'&&<RfpFeaturedLinks context="category"/>}<ToolBrowser key={slug+JSON.stringify(filters)} categoryPage initialQuery={filters.q||''} category={slug} categories={categoryOptions} initial={toolResults(filters.q||'',filters.category||slug,filters.sort||'relevance',Number(filters.page||1),24,'',filters.discovery||'all',await publicTools())}/><section className="answer-block"><h2>{c.question}</h2><p>{c.answer}</p></section><section className="category-published-guides" aria-label="Related buying guides">
   <h2>Buying guides for {c.name.toLowerCase()}</h2>
   {publishedGuides.map(item=><p key={item.id}><Link className="text-link" href={'/guides/'+item.slug}>{item.title}</Link></p>)}
   {!publishedGuides.some(item=>item.slug===g.slug)&&<p><Link className="text-link" href={'/guides/'+g.slug}>{g.title}</Link></p>}
  </section></div></main>}
