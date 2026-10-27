import { BlobNotFoundError,get,head,put,usingSupabaseStorage } from './private-storage';
import { readCmsOverlay,writeCmsOverlay } from './cms-overlay';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import 'server-only';
import { authors } from './authors';
import recoveredPublishedGuides from './recovered-published-guides.json';
import { contentPath,effectivePublished,type CmsContent,type CmsRecord,type CmsStore } from './cms-types';
const pathname='cms/content-v1.json';
export const emptyStore=():CmsStore=>({version:1,revision:0,records:[],activity:[]});
const local=()=>!process.env.VERCEL&&process.env.CMS_TEST_STORE;
type CmsRead = {store:CmsStore;etag?:string;legacyUnavailable?:boolean;collisionPaths?:string[]};
type Snapshot = {sourceHashes:Map<string,string>;overlayIds:Set<string>;overlayStore:CmsStore};
const snapshots = new WeakMap<CmsStore,Snapshot>();
const isRestricted=(error:unknown)=>error instanceof Error && /private storage read failed: 402/.test(error.message);

export async function readStore():Promise<CmsRead>{
 if(local()){
  const fs=await import('node:fs/promises');
  try{return {store:JSON.parse(await fs.readFile(local() as string,'utf8'))};}
  catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return {store:emptyStore()};throw e;}
 }
 // During prerendering, only built-in source-controlled pages are generated.
 // Never hammer the private Blob store or restricted Supabase from thousands of workers.
 // Real requests read the complete primary+overlay inventory at runtime.
 if(process.env.TRUTOOL_BUILD_MODE==='1')
  return {store:emptyStore(),legacyUnavailable:true};
 if(!process.env.BLOB_READ_WRITE_TOKEN){
  if(process.env.VERCEL)throw new Error('Content storage unavailable');
  return {store:emptyStore()};
 }

 // This is a separate private store: an empty overlay does not mean old
 // Supabase content has disappeared. Never delete or overwrite that source.
 const overlay=await readCmsOverlay();
 let primary=emptyStore(),legacyUnavailable=false;
 try{
  if(usingSupabaseStorage()){
   // Unlike the former head()+get() pair, get() transfers the JSON only once.
   const response=await get(pathname,{access:'private',useCache:false});
   if(!response||response.statusCode!==200)throw new Error('Original editorial content unavailable');
   primary=await new Response(response.stream).json() as CmsStore;
  }else{
   let meta;
   try{meta=await head(pathname);}catch(e){if(!(e instanceof BlobNotFoundError))throw e;}
   if(meta){
    const response=await get(meta.url,{access:'private',useCache:false});
    if(!response||response.statusCode!==200)throw new Error('Original editorial content unavailable');
    primary=await new Response(response.stream).json() as CmsStore;
   }
  }
  if(primary.version!==1||!Array.isArray(primary.records)||!Array.isArray(primary.activity))
   throw new Error('Original CMS snapshot is invalid; refusing to replace it');
 }catch(e){
  if(!isRestricted(e))throw e;
  legacyUnavailable=true;
  // The original CMS is unreadable during Supabase's Fair Use restriction.
  // Keep it intact and use only independently saved Blob records.
  primary=emptyStore();
 }

 const sourceHashes=new Map(primary.records.map(r=>[r.id,JSON.stringify(r)]));
 const overlayIds=new Set(overlay.store.records.map(r=>r.id));
 const records=new Map(primary.records.map(r=>[r.id,r]));
 const existingPaths=new Map(primary.records.map(r=>[contentPath(r.draft),r.id]));
 const collisionPaths:string[]=[];
 for(const record of overlay.store.records){
  const path=contentPath(record.draft),owner=existingPaths.get(path);
  if(owner&&owner!==record.id){
   // Keep the original public URL when old and new records conflict.
   // The overlay copy stays in Blob so no data is thrown away.
   collisionPaths.push(path);
   continue;
  }
  records.set(record.id,record);
  existingPaths.set(path,record.id);
 }
 const activity=[...overlay.store.activity,...primary.activity]
  .filter((a,i,items)=>items.findIndex(b=>a.at===b.at&&a.title===b.title&&a.action===b.action)===i)
  .sort((a,b)=>b.at.localeCompare(a.at)).slice(0,200);
 const store:CmsStore={
  ...primary,
  revision:Math.max(primary.revision,overlay.store.revision),
  records:[...records.values()],
  activity,
  ...(overlay.store.featuredAlternativeSlugs!==undefined?
    {featuredAlternativeSlugs:overlay.store.featuredAlternativeSlugs}:{}),
  ...(overlay.store.visibility?{visibility:overlay.store.visibility}:{}),
 };
 snapshots.set(store,{sourceHashes,overlayIds,overlayStore:overlay.store});
 return {store,etag:overlay.etag,legacyUnavailable,collisionPaths};
}

export function isOriginalCmsRecord(store:CmsStore,id:string){
 const ctx=snapshots.get(store);
 return Boolean(ctx?.sourceHashes.has(id)&&!ctx.overlayIds.has(id));
}

export async function writeStore(store:CmsStore,etag?:string){
 if(local()){
  const fs=await import('node:fs/promises');
  await fs.writeFile(local() as string,JSON.stringify(store));return;
 }
 if(!usingSupabaseStorage()){
  await put(pathname,JSON.stringify(store),{access:'private',contentType:'application/json',
   addRandomSuffix:false,...(etag?{ifMatch:etag,allowOverwrite:true}:{allowOverwrite:false})});
  return;
 }
 const ctx=snapshots.get(store);
 if(!ctx)throw new Error('Content snapshot provenance missing; refusing to overwrite content');
 const overlayRecords: CmsRecord[]=store.records.filter(r=>
  ctx.overlayIds.has(r.id)||!ctx.sourceHashes.has(r.id)||
  ctx.sourceHashes.get(r.id)!==JSON.stringify(r));
 const next:CmsStore={
  ...ctx.overlayStore,
  version:1,
  revision:Math.max(store.revision,ctx.overlayStore.revision+1),
  records:overlayRecords,
  activity:store.activity.slice(0,200),
  ...(store.visibility?{visibility:store.visibility}:{}),
  ...(store.featuredAlternativeSlugs!==undefined?
    {featuredAlternativeSlugs:store.featuredAlternativeSlugs}:{}),
 };
 // Conditional private Blob write: concurrent editors cannot silently
 // overwrite each other. This NEVER writes to original Supabase.
 await writeCmsOverlay(next,etag);
}
const persistentStore=unstable_cache(async()=>(await readStore()).store,['trutool-cms-v1'],{revalidate:30,tags:['cms']});
const cachedStore=cache(()=>persistentStore());
/**
 * Restore only the public, already-published editorial guide snapshots while
 * legacy Supabase REST is returning HTTP 402. This NEVER changes the original
 * private Supabase CMS records, drafts or revision history.
 *
 * When Supabase is available again, live records take precedence and the
 * read-only source snapshot is automatically ignored. This also includes
 * the recovered guides in the public sitemap and guide index during builds.
 */
export async function getPublished():Promise<CmsContent[]>{
 const {store,legacyUnavailable}=await cachedStore(),now=Date.now();
 const live=store.records.flatMap(r=>{const c=effectivePublished(r,now);return c?[c]:[];});
 const byPath=new Map<string,CmsContent>();
 if(legacyUnavailable){
  for(const guide of recoveredPublishedGuides as CmsContent[]){
   if(guide.kind!=='guide'||!guide.slug||!guide.publishedAt||Date.parse(guide.publishedAt)>now)continue;
   // Historical media remain in the original Supabase project. Use the
   // existing category artwork rather than show a broken private image until
   // the original storage service is restored. Keep original links in JSON.
   const safeCover=guide.image?.startsWith('/media/')?{...guide,image:''}:guide;
   byPath.set(contentPath(safeCover),safeCover);
  }
 }
 for(const c of live){
  const key=contentPath(c);
  // Legacy public slugs retain priority while source reads are restricted;
  // never let a newly entered duplicate shadow an original published guide.
  if(legacyUnavailable&&byPath.has(key))continue;
  byPath.set(key,c);
 }
 const published=[...byPath.values()];
 const names=new Map(authors.map(a=>[a.slug as string,a.name as string]));
 for(const c of published)if(c.kind==='author')names.set(c.slug,c.title);
 return published.map(c=>({...c,authorName:names.get(c.authorSlug)||'TruTool'}));
}
export async function isHidden(path:string){const {contentPath}=await import('./cms-types');return (await cachedStore()).records.some(r=>r.hidden&&contentPath(r.draft)===path);}

export async function hiddenPaths(){const {contentPath}=await import("./cms-types");return new Set((await cachedStore()).records.filter(r=>r.hidden).map(r=>contentPath(r.draft)));}
