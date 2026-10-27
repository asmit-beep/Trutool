import type {AIShelfTool} from './ai';
import {aiTools} from './ai';

export type AIPopularitySignal={slug:string;score:number;mentions:number;sourceUrl:string;observedAt:string};
const DAY=86400000;
const SIGNAL_REFRESH_SECONDS=14400;
const AI_CONVERSATION_TERMS=['AI tools','AI coding','AI agents','LLM','Show HN','open source AI'];
// Avoid generic words and ambiguous product names as unsubstantiated matches.
const excluded=new Set(['chatgpt','gemini','perplexity','claude','deepseek','grok','copilot','ai','bolt','motion','notion','gamma','mem','make','linear','figma','canva','v0']);
const matchable=aiTools.filter(t=>!excluded.has(t.slug)&&t.name.length>=5&&t.name.length<42&&/^[a-z0-9][a-z0-9 .+\-]*$/i.test(t.name));
const pattern=(name:string)=>new RegExp('(^|[^a-z0-9])'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s+')+'(?=$|[^a-z0-9])','i');

export function parseAIPopularity(data:unknown,now=Date.now()):AIPopularitySignal[]{
 if(!Array.isArray(data))return [];
 const seen=new Set<string>(),totals=new Map<string,AIPopularitySignal>();
 for(const hit of data as Record<string,unknown>[]){
  if(typeof hit.objectID!=='string'||!/^\d+$/.test(hit.objectID)||seen.has(hit.objectID))continue;
  seen.add(hit.objectID);
  if(typeof hit.title!=='string'||typeof hit.created_at!=='string')continue;
  const time=Date.parse(hit.created_at),age=now-time;
  if(!Number.isFinite(time)||age<0||age>30*DAY)continue;
  const points=typeof hit.points==='number'?hit.points:0,comments=typeof hit.num_comments==='number'?hit.num_comments:0;
  if(points<8||comments<2)continue;
  const matches=matchable.filter(t=>pattern(t.name).test(hit.title as string));
  if(matches.length!==1)continue; // An ambiguous multi-brand headline is not enough evidence.
  const tool=matches[0],weight=Math.round((Math.min(points,650)+3*Math.min(comments,250))*Math.max(.2,1-age/(40*DAY)));
  const older=totals.get(tool.slug);
  const url='https://news.ycombinator.com/item?id='+hit.objectID;
  totals.set(tool.slug,{slug:tool.slug,score:(older?.score||0)+weight,mentions:(older?.mentions||0)+1,
    sourceUrl:!older||weight>older.score?url:older.sourceUrl,observedAt:new Date(Math.max(time,Date.parse(older?.observedAt||'1970-01-01'))).toISOString()});
 }
 return [...totals.values()].filter(s=>s.score>=20).sort((a,b)=>b.score-a.score||b.mentions-a.mentions).slice(0,30);
}

export async function getAIPopularitySignals(now=Date.now()):Promise<AIPopularitySignal[]>{
 const since=Math.floor((now-30*DAY)/1000);
 const settled=await Promise.allSettled(AI_CONVERSATION_TERMS.map(async term=>{
  const p=new URLSearchParams({query:term,tags:'story',numericFilters:'created_at_i>'+since,hitsPerPage:'100'});
  const res=await fetch('https://hn.algolia.com/api/v1/search?'+p,{signal:AbortSignal.timeout(5500),redirect:'error',
   next:{revalidate:SIGNAL_REFRESH_SECONDS,tags:['ai-popularity']},headers:{Accept:'application/json'}});
  if(!res.ok||Number(res.headers.get('content-length'))>1000000)throw new Error('Community signal unavailable');
  const text=await res.text();if(text.length>1000000)throw new Error('Community signal too large');
  const json=JSON.parse(text);
  return Array.isArray(json.hits)?json.hits:[];
 }));
 return parseAIPopularity(settled.flatMap(r=>r.status==='fulfilled'?r.value:[]),now);
}
