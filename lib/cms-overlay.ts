import 'server-only';
import {get,head,put,BlobNotFoundError,BlobPreconditionFailedError} from './private-storage';
import type {CmsStore} from './cms-types';

export const cmsOverlayPath='cms/independent-publishing-v1.json';

const empty=():CmsStore=>({version:1,revision:0,records:[],activity:[]});

/**
 * If-Match uses strong comparison. A weak `W/` tag never matches (RFC 9110),
 * and `get()` copies the raw HTTP ETag, which proxies often weaken. `head()`
 * returns the Blob API etag that conditional `put({ ifMatch })` expects.
 * Keep an already-correct token unchanged, including unquoted test etags.
 */
export function normalizeBlobEtag(etag?: string | null): string | undefined {
  if (etag == null) return undefined;
  let value = String(etag).trim();
  if (!value) return undefined;
  const weak = /^W\/\s*(.*)$/i.exec(value);
  if (weak) value = weak[1].trim();
  return value || undefined;
}

function etagCandidates(etag?: string | null): string[] {
  const normalized = normalizeBlobEtag(etag);
  if (!normalized) return [];
  const unquoted = normalized.replace(/^"(.*)"$/, '$1');
  const quoted = `"${unquoted}"`;
  return [...new Set([normalized, quoted, unquoted].filter(Boolean))];
}

/**
 * New editorial drafts and publications are stored separately in the existing
 * PRIVATE Blob store. Supabase is never modified by this module.
 *
 * This intentionally does not reuse cms/content-v1.json: that path may contain
 * a historical Blob snapshot, which must not be replaced.
 */
export async function readCmsOverlay():Promise<{store:CmsStore;etag?:string}>{
  const response=await get(cmsOverlayPath,{access:'private',useCache:false});
  if(!response)return {store:empty()};
  if(response.statusCode!==200)throw new Error('Independent editorial storage unavailable');
  const raw=await new Response(response.stream).json() as CmsStore;
  if(raw.version!==1||!Array.isArray(raw.records)||!Array.isArray(raw.activity))
    throw new Error('Invalid editorial overlay; refusing to treat it as empty');
  return {store:raw,etag:normalizeBlobEtag(response.blob.etag)};
}

async function putOverlay(body:string,etag?:string){
  await put(cmsOverlayPath,body,{
    access:'private',contentType:'application/json',addRandomSuffix:false,
    allowOverwrite:Boolean(etag),
    ...(etag?{ifMatch:etag}:{}),
  });
}

async function canonicalEtag():Promise<string|undefined>{
  if(typeof head!=='function')return;
  try{
    const meta=await head(cmsOverlayPath);
    return meta?.etag;
  }catch(error){
    if(error instanceof BlobNotFoundError)return;
    // A metadata lookup failure must not block the content-matched fallback.
    return;
  }
}

/**
 * Writes only the independent editorial overlay.
 * `baseline` is JSON.stringify of the overlay captured at read time, before
 * the caller mutates the merged store. A changed blob is a real concurrent
 * edit and still raises BlobPreconditionFailedError. An unchanged blob whose
 * ETag cannot satisfy If-Match is a format mismatch: retry once with the
 * fresh get()/head() etag, then overwrite this overlay without ifMatch.
 * This never writes cms/content-v1.json or Supabase.
 */
export async function writeCmsOverlay(store:CmsStore,etag?:string,baseline?:string){
  if(store.version!==1||!Array.isArray(store.records))
    throw new Error('Invalid editorial overlay');
  const body=JSON.stringify(store);
  const tried=new Set<string>();
  const attempt=async(candidate?:string)=>{
    if(candidate){
      if(tried.has(candidate))return false;
      tried.add(candidate);
    }
    await putOverlay(body,candidate);
    return true;
  };
  let lastError:unknown;
  const candidates=etagCandidates(etag);
  if(!candidates.length){
    try{await attempt();return;}
    catch(error){
      if(!(error instanceof BlobPreconditionFailedError))throw error;
      lastError=error;
    }
  }else{
    for(const candidate of candidates){
      try{if(await attempt(candidate))return;}
      catch(error){
        if(!(error instanceof BlobPreconditionFailedError))throw error;
        lastError=error;
      }
    }
  }
  const fresh=await readCmsOverlay();
  if(baseline===undefined||JSON.stringify(fresh.store)!==baseline){
    throw lastError instanceof BlobPreconditionFailedError?lastError:new BlobPreconditionFailedError();
  }
  for(const candidate of [...etagCandidates(fresh.etag),...etagCandidates(await canonicalEtag())]){
    try{if(await attempt(candidate))return;}
    catch(error){
      if(!(error instanceof BlobPreconditionFailedError))throw error;
      lastError=error;
    }
  }
  await put(cmsOverlayPath,body,{
    access:'private',contentType:'application/json',addRandomSuffix:false,
    allowOverwrite:true,
  });
}

export {BlobPreconditionFailedError};
