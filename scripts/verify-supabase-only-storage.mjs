import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Module,{createRequire} from 'node:module';
import ts from 'typescript';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'trutool-supabase-only-'));
const previous={url:process.env.SUPABASE_URL,secret:process.env.SUPABASE_SECRET_KEY};
const oldLoad=Module._load,oldFetch=globalThis.fetch,rows=new Map(),media=new Map();let counter=0;
const require=createRequire(import.meta.url);
try{
 process.env.SUPABASE_URL='https://test.supabase.co';process.env.SUPABASE_SECRET_KEY='test-only';
 const source=fs.readFileSync('lib/private-storage.ts','utf8');
 assert.ok(!source.includes("from '@vercel/blob'"),'No direct Blob storage import');
 fs.writeFileSync(path.join(dir,'private-storage.cjs'),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
 Module._load=function(id,parent,isMain){if(id==='server-only')return {};return oldLoad.call(this,id,parent,isMain);};
 globalThis.fetch=async(url,opts={})=>{
  const u=new URL(String(url)),method=opts.method||'GET';assert.equal(u.origin,'https://test.supabase.co');
  if(u.pathname==='/rest/v1/rpc/trutool_write_object'){
   const {p_path,p_payload,p_if_match}=JSON.parse(opts.body),prior=rows.get(p_path);
   if((p_if_match&&!prior)||(p_if_match&&prior.etag!==p_if_match)||(!p_if_match&&prior))return Response.json({ok:false,conflict:true});
   const etag='etag-'+(++counter);rows.set(p_path,{path:p_path,payload:p_payload,etag,created_at:prior?.created_at||'2026-11-12T00:00:00Z',updated_at:'2026-11-12T00:00:00Z'});return Response.json({ok:true,etag});
  }
  if(u.pathname==='/rest/v1/trutool_objects'){
   const filter=u.searchParams.get('path')||'',offset=Number(u.searchParams.get('offset')||0),limit=Number(u.searchParams.get('limit')||100);
   const values=[...rows.values()].filter(r=>filter.startsWith('eq.')?r.path===filter.slice(3):filter.startsWith('like.')?r.path.startsWith(filter.slice(5,-1)):true).sort((a,b)=>a.path.localeCompare(b.path));
   return Response.json(values.slice(offset,offset+limit));
  }
  if(u.pathname.startsWith('/storage/v1/object/')){
   const key=decodeURIComponent(u.pathname.replace(/^\/storage\/v1\/object\/(?:authenticated\/)?trutool-media\//,''));
   if(method==='GET')return media.has(key)?new Response(media.get(key),{status:200}):new Response('not found',{status:404});
   if(method==='POST'){if(media.has(key))return new Response('conflict',{status:409});media.set(key,Buffer.from(opts.body));return Response.json({Key:key},{status:201});}
  }
  throw Error('Unexpected Supabase request '+method+' '+u.pathname);
 };
 const store=require(path.join(dir,'private-storage.cjs'));assert.equal(store.usingSupabaseStorage(),true);
 const key='enquiries/2026-11-12T01/hash/test.json';
 await store.put(key,JSON.stringify({message:'New enquiry',id:'1'}),{access:'private',contentType:'application/json',addRandomSuffix:false});
 assert.equal((await new Response((await store.get(key,{access:'private'})).stream).json()).message,'New enquiry');
 assert.equal((await store.list({prefix:'enquiries/'})).blobs.length,1);
 const etag=(await store.head(key)).etag;
 await assert.rejects(store.put(key,JSON.stringify({message:'lost'}),{access:'private',allowOverwrite:false}),store.BlobPreconditionFailedError);
 await store.put(key,JSON.stringify({message:'Updated'}),{access:'private',ifMatch:etag});
 await assert.rejects(store.put(key,JSON.stringify({message:'stale'}),{access:'private',ifMatch:etag}),store.BlobPreconditionFailedError);
 await store.put(key,JSON.stringify({message:'Overwrite allowed'}),{access:'private',allowOverwrite:true});
 assert.equal((await new Response((await store.get(key,{access:'private'})).stream).json()).message,'Overwrite allowed');
 const image='cms/media/11111111-1111-4111-8111-111111111111.webp',bytes=Buffer.from('RIFFxxxxWEBPsample');
 await store.put(image,bytes,{access:'private',contentType:'image/webp',addRandomSuffix:false,allowOverwrite:false});
 assert.deepEqual(Buffer.from(await new Response((await store.get(image,{access:'private'})).stream).arrayBuffer()),bytes);
 await assert.rejects(store.put(image,bytes,{access:'private',contentType:'image/webp',allowOverwrite:false}),store.BlobPreconditionFailedError);
 console.log('PASS: Supabase-only private records, image uploads, optimistic writes, duplicate protection, and exact reads.');
}finally{
 Module._load=oldLoad;globalThis.fetch=oldFetch;
 for(const [name,value] of Object.entries({SUPABASE_URL:previous.url,SUPABASE_SECRET_KEY:previous.secret}))if(value===undefined)delete process.env[name];else process.env[name]=value;
 fs.rmSync(dir,{recursive:true,force:true});
}
