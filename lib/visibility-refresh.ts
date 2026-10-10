import 'server-only';
import { revalidatePath,revalidateTag } from 'next/cache';
import { BlobPreconditionFailedError } from '@vercel/blob';
import { readStore,writeStore } from './cms-store';
import { absolute } from './content-index';
export const visibilityPaths=['/sitemap.xml','/llms.txt','/llms-full.txt','/rss.xml','/atom.xml','/feed.json','/robots.txt','/api/ai-news'] as const;
export function invalidateDiscovery(){
 revalidateTag('cms',{expire:0});
 // All public archives, article metadata, related content and Markdown representations share this inventory.
 revalidatePath('/','layout');
 revalidatePath('/api/content-markdown/[...resource]','page');
 for(const path of visibilityPaths)revalidatePath(path);
}
export async function refreshVisibility(){
 await readStore(); // Fail before reporting success if the persistent content source is unavailable.
 revalidateTag('ai-sources',{expire:0});invalidateDiscovery();
 const checks=await Promise.all(visibilityPaths.map(async path=>{
  try{const response=await fetch(absolute(path),{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(25000)});const ok=response.ok;await response.body?.cancel();return {path,ok};}catch{return {path,ok:false};}
 }));
 const visibility={checkedAt:new Date().toISOString(),ok:checks.every(c=>c.ok),checks};
 // A concurrent editorial save wins: retry against its newest ETag, never overwrite its content.
 for(let attempt=0;attempt<3;attempt++){
  const {store,etag}=await readStore();store.visibility=visibility;
  try{await writeStore(store,etag);revalidateTag('cms',{expire:0});return visibility;}catch(e){if(!(e instanceof BlobPreconditionFailedError)||attempt===2)throw e;}
 }
 throw new Error('Could not record refresh status.');
}
