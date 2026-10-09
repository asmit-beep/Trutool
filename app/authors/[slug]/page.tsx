import { AuthorProfile } from '@/components/author-profile';
import { CmsArticle } from '@/components/cms-article';
import { CmsList } from '@/components/cms-list';
import { GuideCard } from '@/components/guide-card';
import { PageStructuredData } from '@/components/page-structured-data';
import Link from '@/components/site-link';
import { authorFor,authors,getAuthor } from '@/lib/authors';
import { guides,SITE } from '@/lib/catalog';
import { cmsMetadata,isHidden,publicContent } from '@/lib/cms-public';
import { communityAnswers } from '@/lib/community-answers';
import { pageMetadata } from '@/lib/seo';
import { ArrowUpRight } from 'lucide-react';
import { notFound } from 'next/navigation';
export const revalidate=30;
export function generateStaticParams(){return authors.map(a=>({slug:a.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const cmsPath='/authors/'+slug,cms=await publicContent(cmsPath);if(await isHidden(cmsPath))notFound();if(cms)return cmsMetadata(cms);const author=getAuthor(slug);return author?pageMetadata({title:author.name+' — TruTool Editorial Team',description:author.bio,alternates:{canonical:SITE+'/authors/'+author.slug},openGraph:{type:'profile',firstName:author.name}}):{title:'Author not found',robots:{index:false}}}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const cmsPath='/authors/'+slug,cms=await publicContent(cmsPath);if(await isHidden(cmsPath))notFound();if(cms)return <CmsArticle content={cms}/>;const author=getAuthor(slug);if(!author)notFound();const articles=guides.filter(g=>authorFor(g).slug===slug),answers=communityAnswers.filter(a=>authorFor(a).slug===slug);return <main id="main" className="shell author-page"><PageStructuredData path={'/authors/'+slug}/><div className="breadcrumb"><Link href="/authors">Editorial team</Link><span>/</span><span>{author.name}</span></div><header className="author-page-hero"><div><span className="eyebrow">A TRUTOOL PERSPECTIVE</span><h1>{author.name}</h1><AuthorProfile author={author}/></div><div className="author-page-topics"><span>EXPLORE THE FOCUS</span>{author.topics.map(topic=><strong key={topic}>{topic}</strong>)}<p>{articles.length} buying guides · {answers.length} community answers</p></div></header><section className="author-guides"><div className="about-section-heading"><div><span className="eyebrow">BUY SMARTER</span><h2>Buying guides by {author.name}.</h2></div><Link className="text-link" href="/guides">All buying guides <ArrowUpRight size={18}/></Link></div><div className="guide-grid guides-index">{articles.map(g=><GuideCard key={g.slug} guide={g}/>)}</div></section><section className="author-answers"><div className="about-section-heading"><div><span className="eyebrow">USEFUL QUESTIONS. PRACTICAL ANSWERS.</span><h2>From the community.</h2></div><Link className="text-link" href="/community">Explore the community <ArrowUpRight size={18}/></Link></div><div className="author-answer-grid">{answers.slice(0,6).map(a=><Link href={'/community/'+a.slug} key={a.slug}><h3>{a.question}</h3><span>Read the answer <ArrowUpRight size={17}/></span></Link>)}</div></section><CmsList author={slug} heading="Latest published work"/></main>}
