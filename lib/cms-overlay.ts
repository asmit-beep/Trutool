import 'server-only';
import {get,put,BlobPreconditionFailedError} from '@vercel/blob';
import type {CmsStore} from './cms-types';

export const cmsOverlayPath='cms/independent-publishing-v1.json';

const empty=():CmsStore=>({version:1,revision:0,records:[],activity:[]});

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
  return {store:raw,etag:response.blob.etag};
}

export async function writeCmsOverlay(store:CmsStore,etag?:string){
  if(store.version!==1||!Array.isArray(store.records))
    throw new Error('Invalid editorial overlay');
  await put(cmsOverlayPath,JSON.stringify(store),{
    access:'private',contentType:'application/json',addRandomSuffix:false,
    allowOverwrite:Boolean(etag),
    ...(etag?{ifMatch:etag}:{}),
  });
}

export {BlobPreconditionFailedError};
