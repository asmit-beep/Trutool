import 'server-only';
import {createDecipheriv,hkdfSync} from 'node:crypto';

// Keep all previously issued newsletter links and helpful-vote cookies valid
// after the legacy Blob store and its Vercel-managed token are deleted.
// The legacy signing seed is AES-256-GCM wrapped under ADMIN_SESSION_SECRET.
export function trutoolSigningSecret():string|undefined{
 const wrapped=process.env.TRUTOOL_SIGNING_SECRET_ENCRYPTED;
 if(wrapped){
  const master=process.env.ADMIN_SESSION_SECRET;
  if(!master)throw new Error('TruTool legacy signing master secret is unavailable');
  const data=Buffer.from(wrapped,'base64url');
  if(data.length<40)throw new Error('Invalid wrapped TruTool signing secret');
  const key=Buffer.from(hkdfSync('sha256',Buffer.from(master),Buffer.from('trutool-signing-encryption-2026'),Buffer.from('legacy-blob-signature-seed-v1'),32));
  const d=createDecipheriv('aes-256-gcm',key,data.subarray(0,12));
  d.setAAD(Buffer.from('trutool-legacy-sign-v1'));d.setAuthTag(data.subarray(12,28));
  const secret=Buffer.concat([d.update(data.subarray(28)),d.final()]).toString('utf8');
  if(!secret)throw new Error('Empty TruTool signing secret');
  return secret;
 }
 return process.env.TRUTOOL_SIGNING_SECRET||process.env.ADMIN_SESSION_SECRET;
}


// Compatibility error types for the site's existing callers; no Vercel Blob SDK is used.
export class BlobNotFoundError extends Error { constructor(){super('Private object not found');this.name='BlobNotFoundError';} }
export class BlobPreconditionFailedError extends Error { constructor(){super('Private object was modified concurrently');this.name='BlobPreconditionFailedError';} }
export const usingSupabaseStorage=()=>true;

type StoredRow={path:string;payload:Record<string,unknown>;etag:string;created_at:string;updated_at:string};
type PutOptions={access:'private';contentType?:string;addRandomSuffix?:boolean;allowOverwrite?:boolean;ifMatch?:string};
const mime=(row:StoredRow)=>String(row.payload.contentType||'application/json');
const objectPath=(path:string)=>path.split('/').map(encodeURIComponent).join('/');
function configuration(){
 const url=process.env.SUPABASE_URL,secret=process.env.SUPABASE_SECRET_KEY;
 if(!url||!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||!secret)throw Error('TruTool Supabase storage is not configured');
 return {url,secret};
}
async function request(path:string,init:RequestInit={}){
 const {url,secret}=configuration();
 return fetch(url+path,{...init,cache:'no-store',headers:{apikey:secret,Authorization:'Bearer '+secret,...init.headers}});
}
async function findRow(path:string):Promise<StoredRow|null>{
 const query=new URLSearchParams({select:'path,payload,etag,created_at,updated_at',path:'eq.'+path,limit:'1'});
 const res=await request('/rest/v1/trutool_objects?'+query);
 if(!res.ok)throw Error('TruTool private storage read failed: '+res.status);
 const rows=await res.json() as StoredRow[];return rows[0]||null;
}
async function writeRow(path:string,payload:Record<string,unknown>,ifMatch?:string){
 const res=await request('/rest/v1/rpc/trutool_write_object',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({p_path:path,p_payload:payload,p_if_match:ifMatch||null})});
 if(!res.ok)throw Error('TruTool private storage write failed: '+res.status);
 const out=await res.json() as {ok:boolean;etag?:string};
 if(!out.ok)throw new BlobPreconditionFailedError();
 return out.etag!;
}
export async function head(path:string){
 const row=await findRow(path);
 if(!row)throw new BlobNotFoundError();
 return {url:row.path,pathname:row.path,etag:row.etag,contentType:mime(row)};
}
export async function get(path:string,_options:{access:'private';useCache?:boolean}){
 const row=await findRow(path);if(!row)return null;
 if(row.payload.media===true){
  const res=await request('/storage/v1/object/authenticated/trutool-media/'+objectPath(path));
  if(res.status===404)return null;
  if(res.status===400){const message=await res.text();if(/not found|404|does not exist/i.test(message))return null;throw Error('TruTool private media read failed: 400');}
  if(!res.ok||!res.body)throw Error('TruTool private media read failed: '+res.status);
  return {statusCode:200 as const,stream:res.body,blob:{etag:row.etag}};
 }
 return {statusCode:200 as const,stream:new Response(JSON.stringify(row.payload.data)).body!,blob:{etag:row.etag}};
}
export async function put(path:string,body:string|Buffer,options:PutOptions){
 if(options.access!=='private'||path.length>500||!/[.]json$|[.]webp$/i.test(path)||path.includes('..')||path.startsWith('/'))throw Error('Unsupported private object path');
 if(path.startsWith('cms/media/')){
  if(!/^cms\/media\/[a-f0-9-]{36}\.webp$/i.test(path)||!Buffer.isBuffer(body))throw Error('Invalid media upload');
  const res=await request('/storage/v1/object/trutool-media/'+objectPath(path),{method:'POST',headers:{'content-type':options.contentType||'image/webp','x-upsert':'false'},body:new Uint8Array(body)});
  if(res.status===409||res.status===400)throw new BlobPreconditionFailedError();
  if(!res.ok)throw Error('TruTool media upload failed: '+res.status);
  await writeRow(path,{media:true,size:body.length,contentType:options.contentType||'image/webp'});
  return {url:'/media/'+path.split('/').at(-1),pathname:path};
 }
 if(typeof body!=='string')throw Error('Expected JSON string for private record');
 let parsed:unknown;try{parsed=JSON.parse(body);}catch{throw Error('Invalid JSON private record');}
 const payload={data:parsed,contentType:options.contentType||'application/json'};
 if(options.ifMatch)await writeRow(path,payload,options.ifMatch);
 else if(options.allowOverwrite){
  // Safe compare-and-swap so independent admin or public writers never clobber a concurrent update.
  let updated=false;
  for(let attempt=0;attempt<5;attempt++){
   const current=await findRow(path);
   try{await writeRow(path,payload,current?.etag);updated=true;break;}
   catch(e){if(!(e instanceof BlobPreconditionFailedError)||attempt===4)throw e;}
  }
  if(!updated)throw new BlobPreconditionFailedError();
 }else await writeRow(path,payload);
 return {url:path,pathname:path};
}
export async function list(options:{prefix?:string;limit?:number;cursor?:string}={}){
 const limit=Math.max(1,Math.min(1000,options.limit||100));
 if(options.cursor&&!/^\d+$/.test(options.cursor))throw Error('Invalid private storage cursor');
 const offset=Number(options.cursor||0);
 const query=new URLSearchParams({select:'path,payload,etag,created_at,updated_at',path:'like.'+(options.prefix||'')+'*',order:'path.asc',limit:String(limit+1),offset:String(offset)});
 const res=await request('/rest/v1/trutool_objects?'+query);
 if(!res.ok)throw Error('TruTool private storage list failed: '+res.status);
 const rows=await res.json() as StoredRow[];
 const hasMore=rows.length>limit;
 return {blobs:rows.slice(0,limit).map(row=>({pathname:row.path,url:row.path,uploadedAt:new Date(row.created_at),size:Number(row.payload.size||JSON.stringify(row.payload.data||{}).length)})),hasMore,cursor:hasMore?String(offset+limit):undefined,partialLegacy:false};
}
