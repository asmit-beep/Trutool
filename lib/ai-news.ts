import curated from './ai-news.json';
import conversations from './ai-discussions.json';
export const AI_REFRESH_SECONDS=172800;
export type AINews={id:string;title:string;summary:string;publisher:string;publishedAt:string;url:string;toolSlug?:string;topic:string;image?:string;imageSource?:string};
export type AIDiscussion={id:string;title:string;summary:string;platform:string;publishedAt:string;url:string;topic:string};
export const officialFeeds=[
 {url:'https://openai.com/news/rss.xml',publisher:'OpenAI',hosts:['openai.com'],toolSlug:'chatgpt'},
 {url:'https://huggingface.co/blog/feed.xml',publisher:'Hugging Face',hosts:['huggingface.co']},
 {url:'https://blog.google/technology/ai/rss/',publisher:'Google',hosts:['blog.google'],toolSlug:'gemini'},
 {url:'https://about.fb.com/feed/',publisher:'Meta',hosts:['about.fb.com']},
 {url:'https://blogs.nvidia.com/feed/',publisher:'NVIDIA',hosts:['blogs.nvidia.com']},
 {url:'https://blogs.microsoft.com/feed/',publisher:'Microsoft',hosts:['blogs.microsoft.com']},
 {url:'https://techcrunch.com/category/artificial-intelligence/feed/',publisher:'TechCrunch',hosts:['techcrunch.com']},
 {url:'https://news.mit.edu/rss/topic/artificial-intelligence2',publisher:'MIT News',hosts:['news.mit.edu']}
];
const aiPattern=/(?:\bAI\b|artificial intelligence|\bagents?\b|\bLLMs?\b|GPT|Gemini|Claude|Copilot|machine learning|diffusion|hugging face|transformer|neural|language model|open.weight|coding model)/i;
const decode=(value:string)=>value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#x([\da-f]+);/gi,(_,n)=>String.fromCodePoint(Math.min(parseInt(n,16),0x10ffff))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Math.min(Number(n),0x10ffff))).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const clean=(value:string)=>decode(value).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const excerpt=(value:string)=>clean(value).split(' ').slice(0,18).join(' ').slice(0,140);
const tag=(value:string,name:string)=>value.match(new RegExp('<'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)</'+name+'>','i'))?.[1]||'';
const attribute=(value:string,name:string)=>decode(value.match(new RegExp('\\b'+name+'\\s*=\\s*["\']([^"\']+)["\']','i'))?.[1]||'');
const imageHosts=['cdn-uploads.huggingface.co','huggingface.co','cdn.sanity.io','images.ctfassets.net','about.fb.com','blogs.nvidia.com','developer.nvidia.com','blogs.microsoft.com','news.microsoft.com','techcrunch.com','techcrunch.wordpress.com','news.mit.edu','storage.googleapis.com','lh3.googleusercontent.com','blog.google','images.openai.com','openai.com','www.anthropic.com'];
export function safeNewsImage(value:string):string|undefined{try{const url=new URL(decode(value));return url.protocol==='https:'&&!url.username&&!url.password&&imageHosts.includes(url.hostname)&&!url.pathname.toLowerCase().endsWith('.svg')?url.href:undefined}catch{return undefined}}
export function articleCover(html:string):string|undefined{for(const meta of html.match(/<meta\b[^>]*>/gi)||[]){if(['og:image','twitter:image'].includes(attribute(meta,'property')||attribute(meta,'name'))){const image=safeNewsImage(attribute(meta,'content'));if(image)return image}}return undefined}
export function parseOfficialFeed(xml:string,feed:(typeof officialFeeds)[number],now=Date.now()):AINews[]{
 if(xml.length>2_000_000)return [];
 return (xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>|<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/gi)||[]).slice(0,40).flatMap(item=>{
  const title=clean(tag(item,'title')).slice(0,160),summary=excerpt(tag(item,'description')||tag(item,'summary'));
  const url=clean(tag(item,'link'))||attribute(item.match(/<link\b[^>]*>/i)?.[0]||'','href');
  const date=new Date(clean(tag(item,'pubDate')||tag(item,'published')||tag(item,'updated')));
  try{const parsed=new URL(url);if(parsed.protocol!=='https:'||parsed.username||parsed.password||!feed.hosts.includes(parsed.hostname.replace(/^www\./,''))||!title||!Number.isFinite(date.getTime())||date.getTime()>now||date.getTime()<now-60*86400000||!aiPattern.test(title+' '+summary))return [];
   const media=item.match(/<(?:media:content|media:thumbnail|enclosure)\b[^>]*>/gi)||[],image=media.map(m=>safeNewsImage(attribute(m,'url'))).find(Boolean);
   return [{id:url,title,summary,publisher:feed.publisher,publishedAt:date.toISOString().slice(0,10),url,toolSlug:feed.toolSlug,topic:'Latest update',...(image?{image,imageSource:url}:{})}];
  }catch{return []}
 });
}
export function mergeAINews(live:AINews[],now=Date.now()):AINews[]{
 const unique=new Map<string,AINews>();
 // Publisher-checked launch information and covers take precedence over excerpts.
 for(const story of [...curated,...live])if(new Date(story.publishedAt).getTime()<=now&&new Date(story.publishedAt).getTime()>=now-60*86400000&&!unique.has(story.url))unique.set(story.url,story);
 const sorted=[...unique.values()].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)),selected:AINews[]=[],counts=new Map<string,number>();
 // One headline per publisher first, then a second pass to prevent feed monopolies.
 for(const cap of [1,2])for(const story of sorted){if(selected.length>=12)break;if(!selected.some(s=>s.url===story.url)&&(counts.get(story.publisher)||0)<cap){selected.push(story);counts.set(story.publisher,(counts.get(story.publisher)||0)+1)}}
 return selected;
}
async function fetchText(url:string,accept:string):Promise<string>{
 const response=await fetch(url,{signal:AbortSignal.timeout(4000),redirect:'error',next:{revalidate:AI_REFRESH_SECONDS},headers:{Accept:accept}});
 if(!response.ok||Number(response.headers.get('content-length'))>2_000_000)throw new Error('Source unavailable');
 const reader=response.body?.getReader();if(!reader)throw new Error('Empty source');let size=0,text='';const decoder=new TextDecoder();
 try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>2_000_000){await reader.cancel();throw new Error('Source too large')}text+=decoder.decode(value,{stream:true})}return text+decoder.decode()}finally{reader.releaseLock()}
}
export async function getAINews():Promise<AINews[]>{
 const feeds=await Promise.allSettled(officialFeeds.map(async feed=>parseOfficialFeed(await fetchText(feed.url,'application/rss+xml, application/atom+xml, application/xml'),feed)));
 const stories=mergeAINews(feeds.flatMap(f=>f.status==='fulfilled'?f.value:[]));
 // Covers come exclusively from the corresponding article's metadata.
 const covers=await Promise.allSettled(stories.slice(0,6).map(async story=>{if(story.image)return story;const image=articleCover(await fetchText(story.url,'text/html'));return image?{...story,image,imageSource:story.url}:story}));
 return stories.map((story,index)=>{const cover=covers[index];return cover?.status==='fulfilled'?cover.value:story});
}
export function parseHNDiscussions(data:unknown,now=Date.now()):AIDiscussion[]{
 if(!data||typeof data!=='object'||!('hits' in data)||!Array.isArray(data.hits))return [];
 return data.hits.slice(0,30).flatMap((hit:Record<string,unknown>)=>{
  if(typeof hit.title!=='string'||typeof hit.objectID!=='string'||!/^\d+$/.test(hit.objectID)||typeof hit.created_at!=='string'||!aiPattern.test(hit.title)||typeof hit.num_comments!=='number'||hit.num_comments<3)return [];
  const date=new Date(hit.created_at);if(!Number.isFinite(date.getTime())||date.getTime()>now||date.getTime()<now-30*86400000)return [];
  return [{id:'hn-'+hit.objectID,title:clean(hit.title).slice(0,140),summary:'Read the community’s questions, practical experiences, and competing viewpoints.',platform:'Hacker News',publishedAt:date.toISOString().slice(0,10),url:'https://news.ycombinator.com/item?id='+hit.objectID,topic:'Community discussion'}];
 });
}
export async function getAIDiscussions():Promise<AIDiscussion[]>{
 const now=Date.now();let live:AIDiscussion[]=[];
 try{live=parseHNDiscussions(JSON.parse(await fetchText('https://hn.algolia.com/api/v1/search_by_date?query=AI&tags=story&numericFilters=points%3E5&hitsPerPage=30','application/json')),now)}catch{/* Source-linked conversations remain available during outages. */}
 const pool=[...live,...conversations].filter(s=>new Date(s.publishedAt).getTime()<=now&&new Date(s.publishedAt).getTime()>=now-60*86400000).sort((a,b)=>{const priority=(s:AIDiscussion)=>s.id==='hn-huggingface'&&Date.parse(s.publishedAt)>=now-14*86400000?1:0;return priority(b)-priority(a)||b.publishedAt.localeCompare(a.publishedAt)}),selected:AIDiscussion[]=[];
 for(const cap of [1,3])for(const story of pool){if(selected.length>=6)break;if(!selected.some(s=>s.url===story.url)&&selected.filter(s=>s.platform===story.platform).length<cap)selected.push(story)}
 return selected;
}
