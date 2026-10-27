import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Module, { createRequire } from 'node:module';
import ts from 'typescript';

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'trutool-blob-enquiry-'));
const prev={backend:process.env.TRUTOOL_STORAGE_BACKEND,url:process.env.SUPABASE_URL,secret:process.env.SUPABASE_SECRET_KEY};
const originalLoad=Module._load,oldFetch=globalThis.fetch;
const entries=new Map(),legacy=new Map();
let restricted=true, legacyRequests=0;
class NotFound extends Error {}
class Conflict extends Error {}
const blobs={
  BlobNotFoundError: NotFound, BlobPreconditionFailedError: Conflict,
  async get(key){
    const e=entries.get(key);
    return e?{statusCode:200,stream:new Response(e.text).body,blob:{etag:e.etag}}:null;
  },
  async head(key){
    const e=entries.get(key);
    if(!e)throw new NotFound();
    return {url:key,etag:e.etag};
  },
  async put(key,body,opts={}){
    const current=entries.get(key);
    if(opts.allowOverwrite===false&&current)throw new Conflict();
    if(opts.ifMatch&&current?.etag!==opts.ifMatch)throw new Conflict();
    entries.set(key,{text:String(body),etag:String(Number(current?.etag||0)+1)});
    return {pathname:key,url:key};
  },
  async list({prefix='',limit=100,cursor}={}){
    const arr=[...entries.keys()].filter(p=>p.startsWith(prefix)).sort();
    const off=cursor?Number(cursor):0;
    return {blobs:arr.slice(off,off+limit).map(pathname=>({
       pathname,url:pathname,uploadedAt:new Date('2026-10-26T00:00:00.000Z'),
       size:entries.get(pathname).text.length,etag:entries.get(pathname).etag,downloadUrl:pathname,
    })),hasMore:off+limit<arr.length,cursor:off+limit<arr.length?String(off+limit):undefined};
  }
};
function compile(source,dest){
 const tsCode=fs.readFileSync(source,'utf8');
 const js=ts.transpileModule(tsCode,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 fs.writeFileSync(path.join(tmp,dest),js);
}
const require=createRequire(import.meta.url);
try{
  process.env.TRUTOOL_STORAGE_BACKEND='supabase';
  process.env.SUPABASE_URL='https://ztuxluvdnmbaushajshm.supabase.co';
  process.env.SUPABASE_SECRET_KEY='test-in-memory-secret-not-for-production';
  Module._load=function(id,parent,isMain){
    if(id==='@vercel/blob')return blobs;
    if(id==='server-only')return {};
    return originalLoad.call(this,id,parent,isMain);
  };
  globalThis.fetch=async url=>{
    const u=new URL(String(url));
    assert.equal(u.origin,'https://ztuxluvdnmbaushajshm.supabase.co');
    legacyRequests++;
    if(restricted)return new Response('restricted',{status:402});
    const eq=u.searchParams.get('path')||'';
    const values=[...legacy.entries()].filter(([p])=>eq.startsWith('eq.')?p===eq.slice(3):
      eq.startsWith('like.')?p.startsWith(eq.slice(5,-1)):true).sort(([a],[b])=>a.localeCompare(b));
    const off=Number(u.searchParams.get('offset')||0),limit=Number(u.searchParams.get('limit')||100);
    return Response.json(values.slice(off,off+limit).map(([path,data])=>({
      path,payload:{data},etag:'legacy',created_at:'2026-10-26T00:00:00.000Z',updated_at:'2026-10-26T00:00:00.000Z'
    })));
  };
  compile('lib/private-storage.ts','private-storage.cjs');
  const store=require(path.join(tmp,'private-storage.cjs'));
  const newPath='enquiries/2026-10-27T12/testhash/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.json';
  const oldPath='enquiries/2026-10-22T10/oldhash/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.json';
  const newMessage={id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',topic:'suggestion',
    name:'New Tool Team',email:'person@example.org',message:'Please review our software listing.',
    createdAt:'2026-10-27T12:00:00.000Z',
    product:{name:'Example Tool',url:'https://example.org/',category:'ai'}};
  const oldMessage={id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',topic:'suggestion',
    name:'Earlier Tool Team',email:'older@example.org',message:'Earlier listing request.',
    createdAt:'2026-10-22T10:00:00.000Z',
    product:{name:'Historical Tool',url:'https://earlier.example.org/',category:'ai'}};
  legacy.set(oldPath,oldMessage);
  await store.put(newPath,JSON.stringify(newMessage),{access:'private',contentType:'application/json',addRandomSuffix:false});
  assert.ok(entries.has(newPath),'New form saves to private Blob.');
  assert.equal(legacyRequests,0,'New submissions must not hit restricted Supabase.');
  assert.deepEqual(await new Response((await store.get(newPath,{access:'private'})).stream).json(),newMessage);
  const rate=await store.list({prefix:'enquiries/2026-10-27T12/testhash/',limit:5});
  assert.equal(rate.blobs.length,1,'New submissions remain subject to rate limiting.');
  assert.equal(legacyRequests,0,'Submission rate limits must not query Supabase.');
  const down=await store.list({prefix:'enquiries/',limit:100});
  assert.equal(down.blobs.length,1,'Existing private Blob messages remain visible while Supabase is blocked.');
  assert.equal(down.partialLegacy,true,'Dashboard must signal that legacy records are unavailable.');
  // An authenticated inbox can read the same newly saved record.
  assert.deepEqual(await new Response((await store.get(down.blobs[0].pathname,{access:'private'})).stream).json(),newMessage);
  restricted=false;
  const up=await store.list({prefix:'enquiries/',limit:100});
  assert.equal(up.partialLegacy,false,'Recovered Supabase must be included.');
  assert.deepEqual(new Set(up.blobs.map(x=>x.pathname)),new Set([newPath,oldPath]));
  assert.deepEqual(await new Response((await store.get(oldPath,{access:'private'})).stream).json(),oldMessage);
  assert.ok(entries.has(newPath)&&legacy.has(oldPath),'Neither store is changed by reading the union.');
  await store.put(newPath,JSON.stringify({...newMessage,confirmationSentAt:'2026-10-27T12:03:00.000Z'}),
    {access:'private',contentType:'application/json',addRandomSuffix:false,ifMatch:'1'});
  assert.equal(JSON.parse(entries.get(newPath).text).confirmationSentAt,'2026-10-27T12:03:00.000Z');
  assert.equal(legacy.get(oldPath).message,oldMessage.message,'Supabase history must remain untouched.');
  console.log('PASS: private Blob submission, bounded rate checks, Supabase 402 inbox warning, resumed merged history, unchanged legacy and receipt writes.');
} finally {
  Module._load=originalLoad;globalThis.fetch=oldFetch;
  for(const [name,value] of Object.entries({TRUTOOL_STORAGE_BACKEND:prev.backend,SUPABASE_URL:prev.url,SUPABASE_SECRET_KEY:prev.secret})){
    if(value===undefined)delete process.env[name];else process.env[name]=value;
  }
  fs.rmSync(tmp,{recursive:true,force:true});
}
