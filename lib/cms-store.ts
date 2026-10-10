import { BlobNotFoundError,get,head,put } from '@vercel/blob';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import 'server-only';
import { authors } from './authors';
import { effectivePublished,type CmsContent,type CmsStore } from './cms-types';
const pathname='cms/content-v1.json';
export const emptyStore=():CmsStore=>({version:1,revision:0,records:[],activity:[]});
const local=()=>!process.env.VERCEL&&process.env.CMS_TEST_STORE;
export async function readStore():Promise<{store:CmsStore;etag?:string}>{
 if(local()){const fs=await import('node:fs/promises');try{return {store:JSON.parse(await fs.readFile(local() as string,'utf8'))}}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return {store:emptyStore()};throw e;}}
 if(!process.env.BLOB_READ_WRITE_TOKEN){if(process.env.VERCEL)throw new Error('Content storage unavailable');return {store:emptyStore()};}
 let metadata;try{metadata=await head(pathname);}catch(e){if(e instanceof BlobNotFoundError)return {store:emptyStore()};throw e;}
 const response=await get(metadata.url,{access:'private',useCache:false});
 if(!response)return {store:emptyStore()};if(response.statusCode!==200)throw new Error('Content storage unavailable');
 const store=await new Response(response.stream).json() as CmsStore;
 if(store.version!==1||!Array.isArray(store.records))throw new Error('Invalid content store');
 return {store,etag:metadata.etag};
}
export async function writeStore(store:CmsStore,etag?:string){
 if(local()){const fs=await import('node:fs/promises');await fs.writeFile(local() as string,JSON.stringify(store));return;}
 await put(pathname,JSON.stringify(store),{access:'private',contentType:'application/json',addRandomSuffix:false,...(etag?{ifMatch:etag,allowOverwrite:true}:{allowOverwrite:false})});
}
const persistentStore=unstable_cache(async()=>(await readStore()).store,['trutool-cms-v1'],{revalidate:30,tags:['cms']});
const cachedStore=cache(()=>persistentStore());
export async function getPublished():Promise<CmsContent[]>{const store=await cachedStore(),now=Date.now(),published=store.records.flatMap(r=>{const c=effectivePublished(r,now);return c?[c]:[];});const names=new Map(authors.map(a=>[a.slug as string,a.name as string]));for(const c of published)if(c.kind==='author')names.set(c.slug,c.title);return published.map(c=>({...c,authorName:names.get(c.authorSlug)||'TruTool'}));}
export async function isHidden(path:string){const {contentPath}=await import('./cms-types');return (await cachedStore()).records.some(r=>r.hidden&&contentPath(r.draft)===path);}

export async function hiddenPaths(){const {contentPath}=await import("./cms-types");return new Set((await cachedStore()).records.filter(r=>r.hidden).map(r=>contentPath(r.draft)));}
