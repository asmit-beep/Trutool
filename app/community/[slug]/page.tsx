import { ArticleToc } from '@/components/article-toc';
import { AuthorProfile } from '@/components/author-profile';
import { CmsArticle } from '@/components/cms-article';
import { HelpfulVote } from '@/components/helpful-vote';
import { PageStructuredData } from '@/components/page-structured-data';
import Link from '@/components/site-link';
import { Monogram } from '@/components/tool-card';
import { authorFor } from '@/lib/authors';
import { categoryOf,getTool,guides,SITE,type Tool } from '@/lib/catalog';
import { cmsMetadata,isHidden,publicContent } from '@/lib/cms-public';
import { communityAnswers,getCommunityAnswer,relatedAnswers } from '@/lib/community-answers';
import { pricingFor } from '@/lib/pricing';
import { pageMetadata } from '@/lib/seo';
import { ArrowLeft,ArrowUpRight,Clock3,MessageCircle } from 'lucide-react';
import { notFound } from 'next/navigation';
export const revalidate=30;
const sections=[{id:'short-answer',label:'Quick answer'},{id:'practical-steps',label:'What to do'},{id:'relevant-tools',label:'Useful tools'},{id:'answer-checklist',label:'Before you decide'},{id:'helpful',label:'Was this helpful?'}];
export function generateStaticParams(){return communityAnswers.map(a=>({slug:a.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const cmsPath='/community/'+slug,cms=await publicContent(cmsPath);if(await isHidden(cmsPath))notFound();if(cms)return cmsMetadata(cms);const a=getCommunityAnswer(slug);return a?pageMetadata({title:a.question,description:a.answer,alternates:{canonical:SITE+'/community/'+a.slug},authors:[{name:authorFor(a).name,url:SITE+'/authors/'+authorFor(a).slug}],openGraph:{authors:[SITE+'/authors/'+authorFor(a).slug],type:'article',title:a.question,description:a.answer}}):{title:'Answer not found',robots:{index:false}};}
function BrandText({text,items}:{text:string;items:Tool[]}){
 const names=items.map(t=>t.name).sort((a,b)=>b.length-a.length);if(!names.length)return <>{text}</>;
 const pattern=new RegExp('('+names.map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','g');
 return <>{text.split(pattern).map((part,index)=>{const t=items.find(t=>t.name===part);return t?<Link key={index} className="answer-inline-brand" href={'/tools/'+t.slug}><Monogram tool={t}/><span>{t.name}</span></Link>:<span key={index}>{part}</span>;})}</>;
}
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const cmsPath='/community/'+slug,cms=await publicContent(cmsPath);if(await isHidden(cmsPath))notFound();if(cms)return <CmsArticle content={cms}/>;const a=getCommunityAnswer(slug);if(!a)notFound();
 const category=categoryOf(a.category),items=a.toolSlugs.map(getTool).filter((t):t is Tool=>Boolean(t)),related=relatedAnswers(a),guide=guides.find(g=>g.category===a.category);
 const words=[a.answer,...a.steps.map(s=>s.body),...items.map(t=>t.fit),...a.checks,a.pitfall].join(' ').split(/\s+/).length,minutes=Math.max(2,Math.ceil(words/180));
 const dateLabel=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(a.publishedAt));
 return <main id="main" className="shell article-page community-answer-page"><PageStructuredData path={'/community/'+slug}/>
  <header className="article-header answer-header">
   <div className="breadcrumb"><Link href="/community#questions">Community</Link><span>/</span><Link href={'/categories/'+category.slug}>{category.short}</Link></div>
   <h1>{a.question}</h1>
   <div className="article-meta"><AuthorProfile author={authorFor(a)} compact/><div><time dateTime={a.publishedAt}>Published {dateLabel}</time><span><Clock3 size={13} aria-hidden="true"/> {minutes} minute read</span></div></div>
  </header>
  <div className="article-layout"><aside><ArticleToc items={sections}/></aside><article className="article-content answer-content">
   <section id="short-answer" className="answer-quick"><span className="eyebrow">QUICK ANSWER</span><p><BrandText text={a.answer} items={items}/></p></section>
   <section id="practical-steps"><h2>What to do next</h2><div className="answer-step-list">{a.steps.map((step,i)=><div key={step.title} className="answer-step"><span className="answer-step-index" aria-hidden="true">{i+1}</span><div><h3>{step.title}</h3><p><BrandText text={step.body} items={items}/></p></div></div>)}</div></section>
   <section id="relevant-tools"><h2>Useful tools to explore</h2><p>Open a profile for more detail, or check the vendor’s current plans.</p><div className="answer-tool-list">{items.map(t=><div className="answer-tool-row" key={t.slug}><Link className="answer-tool-name" href={'/tools/'+t.slug}><Monogram tool={t}/><strong>{t.name}</strong></Link><p>{t.fit}</p><div className="answer-tool-links"><Link href={'/tools/'+t.slug}>Profile ↗</Link><a href={t.url} target="_blank" rel="noopener noreferrer">Website ↗</a><a href={pricingFor(t).url} target="_blank" rel="noopener noreferrer">{pricingFor(t).direct?'Pricing ↗':'Ask about pricing ↗'}</a></div></div>)}</div></section>
   <section id="answer-checklist"><h2>Before you decide</h2><ul className="answer-simple-checks">{a.checks.map(check=><li key={check}>{check}</li>)}</ul><div className="answer-note"><strong>Keep in mind</strong><p>{a.pitfall}</p></div></section>
   <div className="answer-next-links"><Link className="answer-perspective-button" href={'/community?answer='+encodeURIComponent(a.slug)+'#ask'}><MessageCircle size={17} aria-hidden="true"/><span>Add your perspective</span><ArrowUpRight size={15} aria-hidden="true"/></Link>{guide&&<Link className="answer-secondary-link" href={'/guides/'+guide.slug}>Related buying guide <ArrowUpRight size={15}/></Link>}</div>
   <section id="helpful"><HelpfulVote slug={a.slug} initialCount={a.helpful}/></section>
   {related.length>0&&<section className="answer-related"><h2>Related questions</h2>{related.map(r=><Link key={r.slug} href={'/community/'+r.slug}><span>{r.question}</span><ArrowUpRight size={18}/></Link>)}</section>}
   <Link className="answer-back-link" href="/community#questions"><ArrowLeft size={16}/> Back to all community questions</Link>
  </article></div>

 </main>;
}
