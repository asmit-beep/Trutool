import type {AIShelfTool} from './ai';
// Source-based discovery is not automatic vendor approval. External launches link to their public record.
export const LAUNCH_REFRESH_SECONDS=14400;
const DAY=86400000;
const aiWords=/\b(ai|llm|agentic|machine learning|generative|chatbot|text.to.image|text.to.video|voice agent|code assistant|model)\b/i;
const strip=(value:string)=>value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const tag=(item:string,name:string)=>item.match(new RegExp('<'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)</'+name+'>','i'))?.[1]||'';
function feedLink(item:string){
 const raw=strip(tag(item,'link'));
 if(raw.startsWith('https://www.producthunt.com/')||raw.startsWith('https://producthunt.com/'))return raw;
 for(const fragment of item.match(/<link\\b[^>]*\\/?\s*>/gi)||[]){
  const href=strip(fragment.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]||'');
  if(/^https:\\/\\/(?:www\\.)?producthunt\\.com\\/(?:posts|products)\\/[a-z0-9-]+\\/?$/i.test(href))return href;
 }
 return raw;
}
export function parseProductHuntLaunches(xml:string,now=Date.now(),categoryFiltered=true):AIShelfTool[]{
 if(xml.length>1500000)return [];
 const found:AIShelfTool[]=[];const seen=new Set<string>();
 for(const item of (xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>|<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/gi)||[]).slice(0,100)){
  const raw=strip(tag(item,'title')).slice(0,160);
  const desc=strip(tag(item,'description')||tag(item,'summary')||tag(item,'content')).slice(0,200);
  const rawLink=feedLink(item);
  const at=Date.parse(strip(tag(item,'pubDate')||tag(item,'published')||tag(item,'updated')));
  if(!raw||!desc||!Number.isFinite(at)||at>now||at<now-21*DAY)continue;
  if(!categoryFiltered&&!aiWords.test(raw+' '+desc))continue;
  if(/^(chatgpt|gemini|perplexity|claude)(?:\\b|\\s)/i.test(raw))continue;
  try{
   const url=new URL(rawLink);
   if(url.protocol!=='https:'||!['producthunt.com','www.producthunt.com'].includes(url.hostname)||!/^\/(posts|products)\/[a-z0-9-]+\/?$/i.test(url.pathname)||url.username||url.password)continue;
   const slug=url.pathname.split('/').filter(Boolean).at(-1)!;
   if(seen.has(slug))continue;
   seen.add(slug);
   const name=raw.split(/\s+[—–]\s+/)[0].slice(0,75);
   if(name.length<2)continue;
   found.push({slug:'launch-'+slug,name,initial:name[0].toUpperCase(),category:'ai',categoryLabel:'Product Hunt launch',format:'New discovery',summary:desc,useCase:desc,launchedAt:new Date(at).toISOString().slice(0,10),launchStatus:'Product Hunt listing',externalUrl:url.origin+url.pathname});
  }catch{/* Exclude invalid publisher links rather than guessing an official vendor URL. */}
 }
 return found.sort((a,b)=>(b.launchedAt||'').localeCompare(a.launchedAt||'')).slice(0,18);
}
async function fetchFeed(url:string){
 const res=await fetch(url,{signal:AbortSignal.timeout(5000),redirect:'error',next:{revalidate:LAUNCH_REFRESH_SECONDS,tags:['ai-launches']},headers:{Accept:'application/rss+xml, application/atom+xml, application/xml'}});
 if(!res.ok||Number(res.headers.get('content-length'))>1500000)throw Error('Launch feed unavailable');
 const text=await res.text();
 if(text.length>1500000)throw Error('Launch feed too large');
 return text;
}

export function parseShowHNLaunches(data:unknown,now=Date.now()):AIShelfTool[]{
 if(!data||typeof data!=='object'||!('hits' in data)||!Array.isArray(data.hits))return [];
 const selected:AIShelfTool[]=[];
 for(const hit of data.hits.slice(0,100) as Record<string,unknown>[]){
  if(typeof hit.title!=='string'||typeof hit.objectID!=='string'||!/^\d+$/.test(hit.objectID))continue;
  const title=hit.title.trim();
  if(!/^Show HN:\s+/i.test(title)||/chatgpt/i.test(title)||!aiWords.test(title))continue;
  const date=Date.parse(typeof hit.created_at==='string'?hit.created_at:'');
  if(!Number.isFinite(date)||date>now||date<now-14*DAY)continue;
  if(typeof hit.points!=='number'||hit.points<8||typeof hit.num_comments!=='number'||hit.num_comments<2)continue;
  const description=title.replace(/^Show HN:\s+/i,'').slice(0,170);
  const name=description.split(/\s+[—–:-]\s+/)[0].trim().slice(0,65);
  if(!name||name.length<2||name.length>65||name.split(/\s+/).length>4||description===name)continue;
  const summary=description===name?'New AI project discussed by the Hacker News community.':description.slice(name.length).replace(/^[\s—–:-]+/,'').trim().slice(0,145);
  selected.push({slug:'hn-'+hit.objectID,name,initial:name.charAt(0).toUpperCase(),category:'ai',categoryLabel:'Hacker News launch',format:'Community launch',summary,useCase:summary,launchedAt:new Date(date).toISOString().slice(0,10),launchStatus:'Show HN discussion',externalUrl:'https://news.ycombinator.com/item?id='+hit.objectID});
 }
 return selected.sort((a,b)=>(b.launchedAt||'').localeCompare(a.launchedAt||'')).slice(0,10);
}
async function getShowHNLaunches(now:number):Promise<AIShelfTool[]>{
 // Search by topic, not just the latest 100 Show HN stories (which are largely
 // unrelated to AI). Every result must still pass the title/date/engagement check.
 const since=Math.floor((now-21*DAY)/1000);
 const terms=['AI','LLM','agent','machine learning','open source model'];
 const sources=await Promise.allSettled(terms.map(async term=>{
  const qs=new URLSearchParams({query:term,tags:'show_hn',numericFilters:'created_at_i>'+since,hitsPerPage:'100'});
  const url='https://hn.algolia.com/api/v1/search_by_date?'+qs;
  const response=await fetch(url,{signal:AbortSignal.timeout(5000),redirect:'error',
   next:{revalidate:LAUNCH_REFRESH_SECONDS,tags:['ai-launches']},headers:{Accept:'application/json'}});
  if(!response.ok||Number(response.headers.get('content-length'))>900000)throw new Error('Community launch feed unavailable');
  const raw=await response.text();
  if(raw.length>900000)throw new Error('Community launch feed too large');
  const parsed=JSON.parse(raw);return Array.isArray(parsed.hits)?parsed.hits:[];
 }));
 const hits=new Map<string,unknown>();
 for(const outcome of sources)if(outcome.status==='fulfilled')for(const h of outcome.value)
  if(h&&typeof h.objectID==='string'&&!hits.has(h.objectID))hits.set(h.objectID,h);
 return parseShowHNLaunches({hits:[...hits.values()]},now);
}
export async function getAIProductLaunches(now=Date.now()):Promise<AIShelfTool[]>{
 const feeds:[string,boolean][]=[['https://www.producthunt.com/feed?category=artificial-intelligence',true],['https://www.producthunt.com/feed',false]];
 // Prefer the official AI category feed; use the general feed only if the category is inaccessible.
 const result=await Promise.allSettled(feeds.map(async([url,categoryFiltered])=>parseProductHuntLaunches(await fetchFeed(url),now,categoryFiltered)));
 const verified=result.flatMap(x=>x.status==='fulfilled'?x.value:[]);
 const community=await getShowHNLaunches(now).catch(()=>[] as AIShelfTool[]);
 const unique=new Map<string,AIShelfTool>();
 for(const card of [...verified,...community])if(!unique.has(card.externalUrl||card.slug))unique.set(card.externalUrl||card.slug,card);
 return [...unique.values()].sort((a,b)=>(b.launchedAt||'').localeCompare(a.launchedAt||'')).slice(0,16);
}
