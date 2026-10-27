import 'server-only';
import {get,put} from '@vercel/blob';
import {getAIProductLaunches} from './launch-discovery';
import {getAIPopularitySignals,type AIPopularitySignal} from './ai-signals';
import type {AIShelfTool} from './ai';

const path='ai-discovery/shelves-v1.json';
const DAY=86400000;
export type AICollectionSnapshot={version:1;updatedAt:string;launches:AIShelfTool[];signals:AIPopularitySignal[]};
const isValid=(raw:unknown):raw is AICollectionSnapshot=>{
 if(!raw||typeof raw!=='object')return false;
 const r=raw as AICollectionSnapshot;
 return r.version===1&&typeof r.updatedAt==='string'&&Number.isFinite(Date.parse(r.updatedAt))&&
 Array.isArray(r.launches)&&r.launches.length<=30&&Array.isArray(r.signals)&&r.signals.length<=35&&
 r.launches.every(x=>typeof x.name==='string'&&typeof x.slug==='string'&&typeof x.launchedAt==='string'&&
  x.externalUrl?.startsWith('https://'))&&
 r.signals.every(x=>typeof x.slug==='string'&&Number.isFinite(x.score)&&Number.isFinite(x.mentions));
};

export async function readAICollectionSnapshot():Promise<AICollectionSnapshot|null>{
 if(!process.env.BLOB_READ_WRITE_TOKEN||process.env.TRUTOOL_BUILD_MODE==='1')return null;
 try{
  const result=await get(path,{access:'private',useCache:false});
  if(!result||result.statusCode!==200)return null;
  const raw=await new Response(result.stream).json();
  return isValid(raw)?raw:null;
 }catch{
  // A stale/missing private snapshot must never crash the homepage.
  return null;
 }
}

async function discover(now:number){
 const [launches,signals]=await Promise.all([getAIProductLaunches(now).catch(()=>[] as AIShelfTool[]),
  getAIPopularitySignals(now).catch(()=>[] as AIPopularitySignal[])]);
 return {launches,signals};
}

/**
 * Called by Vercel Cron every four hours. Write a compact private last-good
 * snapshot so the homepage does not regress to older static cards when one
 * feed is temporarily down. No Supabase data or CMS records are touched.
 */
export async function refreshAICollectionSnapshot(now=Date.now()){
 const previous=await readAICollectionSnapshot();
 const current=await discover(now);
 const launches=current.launches.length?current.launches:
  (previous&&now-Date.parse(previous.updatedAt)<2*DAY?previous.launches:[]);
 const signals=current.signals.length?current.signals:
  (previous&&now-Date.parse(previous.updatedAt)<2*DAY?previous.signals:[]);
 if(!launches.length&&!signals.length){
  return {ok:false,updatedAt:previous?.updatedAt||null,launches:0,signals:0,reason:'No verified source data'};
 }
 const updatedAt=new Date(now).toISOString(),snapshot:AICollectionSnapshot={version:1,updatedAt,launches,signals};
 if(!process.env.BLOB_READ_WRITE_TOKEN)throw new Error('Private discovery storage is unavailable');
 await put(path,JSON.stringify(snapshot),{access:'private',contentType:'application/json',
  addRandomSuffix:false,allowOverwrite:true});
 return {ok:true,updatedAt,launches:launches.length,signals:signals.length};
}

export async function getAICollectionData(now=Date.now()){
 if(process.env.TRUTOOL_BUILD_MODE==='1')return {launches:[] as AIShelfTool[],signals:[] as AIPopularitySignal[],updatedAt:null as string|null};
 const stored=await readAICollectionSnapshot();
 if(stored&&now-Date.parse(stored.updatedAt)<3*DAY)
  return {launches:stored.launches,signals:stored.signals,updatedAt:stored.updatedAt};
 const live=await discover(now);
 return {launches:live.launches,signals:live.signals,updatedAt:null as string|null};
}
