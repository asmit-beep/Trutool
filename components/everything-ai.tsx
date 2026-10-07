import {MotionSymbol} from './motion-symbol';
import {ArrowUpRight,ArrowRight,Sparkles,Globe2} from 'lucide-react';
import Image from 'next/image';
import Link from './site-link';
import {aiStats,getAIShelves} from '@/lib/ai';
import type {AINews,AIDiscussion} from '@/lib/ai-news';
import {AIToolShelves} from './ai-tool-shelves';
import {MotionVisibility} from './motion-visibility';
const date=(value:string)=>new Date(value+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});
const platformLogos:Record<string,string>={X:'/brands/x-platform.png',Reddit:'/brands/reddit-platform.png','Hacker News':'/brands/hacker-news-platform.svg'};
function PlatformMark({platform}:{platform:string}){const logo=platformLogos[platform];return <span className={'ai-platform-mark platform-'+platform.toLowerCase().replace(/\s+/g,'-')} aria-hidden="true">{logo?<Image src={logo} alt="" width={24} height={24} unoptimized={logo.endsWith('.svg')}/>:<Globe2 size={18}/>}</span>}
export function EverythingAI({news,discussions,compact=false}:{news:AINews[];discussions:AIDiscussion[];compact?:boolean}){
 const lead=news.find(n=>n.image)||news[0];if(!lead)return null;
 const seen=new Set([lead.publisher]);const others=news.filter(n=>{if(seen.has(n.publisher))return false;seen.add(n.publisher);return true}).slice(0,3);
 const discussionPicks=discussions.slice(0,3);
 return <section className={'everything-ai section '+(compact?'ai-destination':'')} id="everything-ai" data-motion="idle">
  <MotionVisibility selector="#everything-ai"/>
  <div className="shell"><div className="ai-section-heading"><div><h2>Everything <span>AI.</span><Sparkles className="ai-heading-spark" aria-hidden="true"/></h2><p>What changed. What’s useful. What people are talking about.</p></div><Link className="ai-universe-link" href="/everything-ai#ai-directory"><span>Find your next AI<small>{aiStats.tools} tools · {aiStats.categories} AI categories</small></span><ArrowUpRight size={21}/></Link></div></div>
  <div className="ai-ticker-viewport"><div className="ai-ticker-label"><MotionSymbol kind="signal" size={13}/> IN THE LOOP</div><div className="ai-ticker-track">{[0,1].map(copy=><div className="ai-ticker-group" aria-hidden={copy===1||undefined} key={copy}>{news.slice(0,9).map(n=><a href={n.url} key={n.id} target="_blank" rel="noopener noreferrer" tabIndex={copy===1?-1:undefined}><small>{n.publisher}</small><span>{n.title}</span><ArrowUpRight size={12}/></a>)}</div>)}</div></div>
  <div className="shell"><div className="ai-news-grid">
   <article className="ai-news-panel ai-lead-story"><div className="ai-panel-heading"><span><MotionSymbol kind="news" size={14}/> From the source</span><span className="ai-panel-chip">Featured</span></div>
    {lead.image&&<a className="ai-source-cover" href={lead.url} target="_blank" rel="noopener noreferrer"><Image src={lead.image} alt={lead.title+' — original article cover from '+lead.publisher} fill sizes="(max-width: 760px) 90vw, (max-width: 1100px) 45vw, 30vw" quality={75}/></a>}
    <div className="ai-lead-copy"><span className="ai-brief-meta">{lead.publisher}<time dateTime={lead.publishedAt}>{date(lead.publishedAt)}</time><span>{lead.topic}</span></span><a className="ai-headline-link" href={lead.url} target="_blank" rel="noopener noreferrer"><h3>{lead.title}</h3></a><p>{lead.summary}</p><a className="ai-read-source" href={lead.url} target="_blank" rel="noopener noreferrer">Read the story <ArrowUpRight size={15}/></a></div>
   </article>
   <div className="ai-news-panel ai-news-side"><div className="ai-panel-heading"><span><Globe2 size={14}/> Across the AI landscape</span><span className="ai-panel-dot"/></div><div className="ai-panel-rows">{others.map(n=><article className="ai-brief" key={n.id}><a href={n.url} target="_blank" rel="noopener noreferrer"><div><span className="ai-brief-meta">{n.publisher}<time dateTime={n.publishedAt}>{date(n.publishedAt)}</time></span><h3>{n.title}</h3><p>{n.summary}</p></div><ArrowUpRight size={15}/></a></article>)}</div><div className="ai-panel-foot">Labs, launches, research, and the work behind them.</div></div>
   <div className="ai-news-panel ai-discussions"><div className="ai-panel-heading"><span><MotionSymbol kind="conversation" size={14}/> In the conversation</span><span className="ai-panel-chip">Open threads</span></div><div className="ai-panel-rows">{discussionPicks.map(n=><article className="ai-discussion-row" key={n.id}><a href={n.url} target="_blank" rel="noopener noreferrer"><PlatformMark platform={n.platform}/><div><span className="ai-brief-meta">{n.platform}<time dateTime={n.publishedAt}>{date(n.publishedAt)}</time></span><h3>{n.title}</h3><span className="ai-discussion-topic">{n.topic}</span></div><ArrowUpRight size={14}/></a></article>)}</div><div className="ai-panel-foot"><a href="https://x.com/EthanJPerez/status/2094154910933852480" target="_blank" rel="noopener noreferrer">Also in the debate: AI safety & development limits <ArrowUpRight size={10}/></a></div></div>
  </div>
  <AIToolShelves shelves={getAIShelves()}/>
  <div className="ai-section-foot"><span><MotionSymbol kind="signal" size={13}/> A wider view of AI. Feed refresh every 2 days.</span><div>{[['ai-agents','Agents'],['ai-coworkers','Coworkers'],['ai-chatbots','Chatbots'],['ai-voice-agents','Voice']].map(([slug,label])=><Link key={slug} href={'/categories/'+slug}>{label}<ArrowUpRight size={12}/></Link>)}<Link href="/everything-ai#ai-directory">All AI tools <ArrowRight size={12}/></Link></div></div>
  </div>
 </section>
}
