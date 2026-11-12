import 'server-only';
import { revalidatePath,revalidateTag } from 'next/cache';
import { BlobPreconditionFailedError } from './private-storage';
import { readStore,writeStore } from './cms-store';
import { contentPath,effectivePublished } from './cms-types';
import { absolute } from './content-index';
export const visibilityPaths=['/sitemap.xml','/llms.txt','/llms-full.txt','/rss.xml','/atom.xml','/feed.json','/robots.txt','/api/ai-news'] as const;
// Manual publishing invalidates only the relevant CMS pages and discovery
// endpoints. Avoid resetting every prerendered page via '/' layout or
// /guides/[slug], which can cause large rebuild work and charges.
export function invalidateDiscovery(changedPaths:readonly string[]=[]){
 revalidateTag('cms',{expire:0});
 revalidatePath('/');
 for(const archive of ['/guides','/tools','/compare','/alternatives','/community','/everything-ai','/services','/authors'])revalidatePath(archive);
 for(const path of new Set(changedPaths)){
  if(!path.startsWith('/') || path.includes('[') || /[^a-zA-Z0-9/_-]/.test(path))continue;
  revalidatePath(path);
  revalidatePath(path+'.md');
 }
 for(const path of visibilityPaths)revalidatePath(path);
}
export async function refreshVisibility(){
 const initial=await readStore();
 // A 402 fallback is public and safe, but cannot prove the original source has
 // recovered. Never report a successful recovery while its CMS data is missing.
 if(initial.legacyUnavailable)throw new Error('Original Supabase CMS is still unavailable; cannot verify recovery.');
 const publishedPaths=initial.store.records.flatMap(record=>{
  const published=effectivePublished(record);
  return published?[contentPath(published)]:[];
 });
 revalidateTag('ai-sources',{expire:0});invalidateDiscovery(publishedPaths);
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
