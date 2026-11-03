import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Module, {createRequire} from 'node:module';
import ts from 'typescript';

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'trutool-newsletter-storage-'));
const before={backend:process.env.TRUTOOL_STORAGE_BACKEND,url:process.env.SUPABASE_URL,key:process.env.SUPABASE_SECRET_KEY};
const originalLoad=Module._load,originalFetch=globalThis.fetch;
const blobs=new Map(),legacy=new Map();
let restricted=true,legacyCalls=0,blobFailure=false;
class BlobNotFoundError extends Error {}
class BlobPreconditionFailedError extends Error {}
const mockBlob={
 BlobNotFoundError,BlobPreconditionFailedError,
 async get(key) {const row=blobs.get(key);if(!row)return null;return {statusCode:200,stream:new Response(row.body).body,blob:{etag:row.etag}};},
 async head(key) {const row=blobs.get(key);if(!row)throw new BlobNotFoundError();return {url:key,etag:row.etag};},
 async put(key,body,opts={}) {
  if(blobFailure)throw Error('Independent private Blob unavailable');
  const old=blobs.get(key);
  if(opts.allowOverwrite===false&&old)throw new BlobPreconditionFailedError();
  if(opts.ifMatch&&old?.etag!==opts.ifMatch)throw new BlobPreconditionFailedError();
  blobs.set(key,{body:String(body),etag:String(Number(old?.etag||0)+1)});
  return {pathname:key,url:key};
 },
 async list({prefix='',limit=100,cursor}={}) {
  if(blobFailure)throw Error('Independent private Blob unavailable');
  const keys=[...blobs.keys()].filter(key=>key.startsWith(prefix)).sort(),i=Number(cursor||0);
  const selected=keys.slice(i,i+limit);
  return {blobs:selected.map(pathname=>({pathname,url:pathname,uploadedAt:new Date('2026-11-03T00:00:00Z'),size:blobs.get(pathname).body.length})),
   hasMore:i+limit<keys.length,cursor:i+limit<keys.length?String(i+limit):undefined};
 }
};
const historicPath='newsletter/subscribers/'+'a'.repeat(64)+'.json';
const freshPath='newsletter/subscribers/'+'b'.repeat(64)+'.json';
const ratePath='newsletter/attempts/2026-11-03T01/hashed/try.json';
const originalSubscriber={email:'old@example.test',status:'subscribed',topics:['ai'],createdAt:'2026-10-12T00:00:00Z',consentedAt:'2026-10-12T00:00:00Z'};
const freshSubscriber={email:'fresh@example.test',status:'subscribed',topics:['tools'],createdAt:'2026-11-03T00:00:00Z',consentedAt:'2026-11-03T00:00:00Z'};
try {
 process.env.TRUTOOL_STORAGE_BACKEND='supabase';
 process.env.SUPABASE_URL='https://ztuxluvdnmbaushajshm.supabase.co';
 process.env.SUPABASE_SECRET_KEY='test-fixture-only';
 legacy.set(historicPath,originalSubscriber);
 Module._load=function(id,parent,isMain){if(id==='@vercel/blob')return mockBlob;if(id==='server-only')return {};return originalLoad.call(this,id,parent,isMain)};
 globalThis.fetch=async url=>{
  const u=new URL(String(url));
  assert.equal(u.origin,'https://ztuxluvdnmbaushajshm.supabase.co');
  legacyCalls++;
  if(restricted)return new Response('Restricted',{status:402});
  const filter=u.searchParams.get('path')||'';
  const rows=[...legacy.entries()].filter(([p])=>filter.startsWith('eq.')?p===filter.slice(3):filter.startsWith('like.')?p.startsWith(filter.slice(5,-1)):true).sort(([a],[b])=>a.localeCompare(b));
  const offset=Number(u.searchParams.get('offset')||0),limit=Number(u.searchParams.get('limit')||100);
  return Response.json(rows.slice(offset,offset+limit).map(([p,record])=>({path:p,payload:{data:record},etag:'old-hash',created_at:record.createdAt,updated_at:record.createdAt})));
 };
 fs.writeFileSync(path.join(tmp,'package.json'),'{"type":"commonjs"}');
 fs.writeFileSync(path.join(tmp,'storage.js'),ts.transpileModule(fs.readFileSync('lib/private-storage.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText);
 const storage=createRequire(import.meta.url)(path.join(tmp,'storage.js'));
 // Supabase 402 must never prevent saving new rate-limits and subscribers.
 await storage.put(ratePath,JSON.stringify({createdAt:'2026-11-03T01:00:00Z'}),{access:'private',addRandomSuffix:false});
 const attempts=await storage.list({prefix:'newsletter/attempts/2026-11-03T01/hashed/',limit:10});
 assert.equal(attempts.blobs.length,1);
 assert.equal(legacyCalls,0,'A new signup rate check must not query restricted Supabase.');
 await storage.put(freshPath,JSON.stringify(freshSubscriber),{access:'private',addRandomSuffix:false,allowOverwrite:false});
 assert.equal(legacyCalls,0,'A new subscriber must be independently saved.');
 assert.deepEqual(await new Response((await storage.get(freshPath,{access:'private',useCache:false})).stream).json(),freshSubscriber);
 // Historic rows are retained, even when the original API cannot answer.
 assert.equal(await storage.get(historicPath,{access:'private',useCache:false}),null);
 const partial=await storage.list({prefix:'newsletter/subscribers/',limit:100});
 assert.equal(partial.blobs.length,1);
 assert.equal(partial.partialLegacy,true);
 assert.deepEqual(legacy.get(historicPath),originalSubscriber);
 restricted=false;
 const historical=await storage.get(historicPath,{access:'private',useCache:false});
 assert.ok(historical.blob.etag.startsWith('legacy-newsletter:'));
 assert.deepEqual(await new Response(historical.stream).json(),originalSubscriber);
 const merged=await storage.list({prefix:'newsletter/subscribers/',limit:100});
 assert.deepEqual(merged.blobs.map(x=>x.pathname).sort(),[freshPath,historicPath].sort());
 assert.equal(merged.partialLegacy,false);
 // Updates to a historical record must create an override, never mutate legacy.
 await storage.put(historicPath,JSON.stringify({...originalSubscriber,status:'unsubscribed'}),{access:'private',ifMatch:historical.blob.etag});
 assert.equal(legacy.get(historicPath).status,'subscribed');
 assert.equal((await new Response((await storage.get(historicPath,{access:'private'})).stream).json()).status,'unsubscribed');
 const noDuplicates=await storage.list({prefix:'newsletter/subscribers/',limit:100});
 assert.equal(noDuplicates.blobs.length,2,'The old and new copies must not double-count subscribers.');
 await assert.rejects(storage.put(historicPath,JSON.stringify(originalSubscriber),{access:'private',ifMatch:historical.blob.etag}),BlobPreconditionFailedError);
 const latest=await storage.get(historicPath,{access:'private'}),newETag=latest.blob.etag;
 await storage.put(historicPath,JSON.stringify({...originalSubscriber,status:'subscribed'}),{access:'private',ifMatch:newETag});
 assert.equal((await new Response((await storage.get(historicPath,{access:'private'})).stream).json()).status,'subscribed');
 blobFailure=true;
 await assert.rejects(storage.put('newsletter/subscribers/'+'c'.repeat(64)+'.json',JSON.stringify(freshSubscriber),{access:'private',allowOverwrite:false}),/Independent private Blob unavailable/);
 assert.equal(legacy.get(historicPath).status,'subscribed');
 console.log('PASS: new newsletter signups and rate limits survive Supabase 402; old subscribers remain readable, deduplicated, and safe to update via private Blob.');
} finally {
 Module._load=originalLoad;globalThis.fetch=originalFetch;
 for(const [k,v] of Object.entries(before)){const name={backend:'TRUTOOL_STORAGE_BACKEND',url:'SUPABASE_URL',key:'SUPABASE_SECRET_KEY'}[k];if(v===undefined)delete process.env[name];else process.env[name]=v}
 fs.rmSync(tmp,{recursive:true,force:true});
}
