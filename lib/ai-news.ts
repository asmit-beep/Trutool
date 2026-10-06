import curated from './ai-news.json';
export type AINews={id:string;title:string;summary:string;publisher:string;publishedAt:string;url:string;toolSlug?:string;topic:string};
export const officialFeeds=[
 {url:'https://openai.com/news/rss.xml',publisher:'OpenAI',hosts:['openai.com'],toolSlug:'chatgpt'},
 {url:'https://huggingface.co/blog/feed.xml',publisher:'Hugging Face',hosts:['huggingface.co']},
 {url:'https://blog.google/technology/ai/rss/',publisher:'Google',hosts:['blog.google'],toolSlug:'gemini'}
];
const clean=(text:string)=>text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
const tag=(text:string,name:string)=>text.match(new RegExp('<'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)</'+name+'>','i'))?.[1]||'';
export function parseOfficialFeed(xml:string,feed:(typeof officialFeeds)[number],now=Date.now()):AINews[]{
 if(xml.length>2_000_000)return [];
 return (xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>|<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/gi)||[]).slice(0,40).flatMap(item=>{
  const title=clean(tag(item,'title')).slice(0,180),summary=clean(tag(item,'description')||tag(item,'summary')).slice(0,150);
  const url=clean(tag(item,'link'))||item.match(/<link\b[^>]*href=["']([^"']+)["']/i)?.[1]||'';
  const date=new Date(clean(tag(item,'pubDate')||tag(item,'published')||tag(item,'updated')));
  try{const parsed=new URL(url);if(parsed.protocol!=='https:'||!feed.hosts.includes(parsed.hostname.replace(/^www\./,''))||!title||!Number.isFinite(date.getTime())||date.getTime()>now||!/(?:\bai\b|artificial intelligence|agent|model|gpt|gemini|claude|robot|llm|machine learning|diffusion|hugging face|transformer)/i.test(title+' '+summary))return [];return [{id:url,title,summary,publisher:feed.publisher,publishedAt:date.toISOString().slice(0,10),url,toolSlug:feed.toolSlug,topic:'From the source'}];}catch{return []}
 });
}
export function mergeAINews(live:AINews[],now=Date.now()):AINews[]{
 const unique=new Map<string,AINews>();
 for(const story of [...live,...curated])if(new Date(story.publishedAt).getTime()<=now&&!unique.has(story.url))unique.set(story.url,story);
 return [...unique.values()].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)).slice(0,12);
}
export async function getAINews():Promise<AINews[]>{
 const feeds=await Promise.allSettled(officialFeeds.map(async feed=>{
  const response=await fetch(feed.url,{signal:AbortSignal.timeout(2500),next:{revalidate:3600},headers:{Accept:'application/rss+xml, application/atom+xml, application/xml, text/xml'}});
  if(!response.ok||Number(response.headers.get('content-length'))>2_000_000)return [];
  const reader=response.body?.getReader();if(!reader)return [];let size=0,xml='';const decoder=new TextDecoder();
  try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>2_000_000){await reader.cancel();return []}xml+=decoder.decode(value,{stream:true});}xml+=decoder.decode();return parseOfficialFeed(xml,feed);}finally{reader.releaseLock()}
 }));
 return mergeAINews(feeds.flatMap(f=>f.status==='fulfilled'?f.value:[]));
}
