import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import Module from 'node:module';
import ts from 'typescript';

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'trutool-cms-overlay-test-'));
const require=createRequire(import.meta.url),originalLoad=Module._load;
const originalEnv={blob:process.env.BLOB_READ_WRITE_TOKEN,backend:process.env.TRUTOOL_STORAGE_BACKEND,vercel:process.env.VERCEL};
const blobs=new Map();
let restricted=true,sourceReadCount=0,sourceWriteCount=0;
const stamp=()=>new Date().toISOString();
const record=(id,slug)=>{const now='2026-10-27T10:00:00.000Z';const draft={
  id,kind:'guide',slug,title:'Guide '+slug,description:'A useful source-backed summary for '+slug,
  body:'This is a full example guide with enough detail to be displayed to readers.',
  category:'ai',authorSlug:'yash',metaTitle:'',metaDescription:'',image:'',imageAlt:'',
  sourceUrl:'',sourceLabel:'',tags:'',toolSlugs:[],publishedAt:now,updatedAt:now};
 return {id,draft,published:{...draft},revision:1,updatedAt:now,history:[]};
};
const original={version:1,revision:7,records:[record('legacy-1','legacy-guide')],activity:[]};
const sourceSnapshot=JSON.stringify(original);
let revision=0;
const blob={
 BlobNotFoundError:class BlobNotFoundError extends Error{},
 BlobPreconditionFailedError:class BlobPreconditionFailedError extends Error{},
 async get(key,{access}) {
  assert.equal(access,'private');
  const item=blobs.get(key);
  return item?{statusCode:200,stream:new Response(item.body).body,blob:{etag:item.etag}}:null;
 },
 async put(key,body,opts) {
  assert.equal(opts.access,'private');
  const item=blobs.get(key);
  if(item && (!opts.allowOverwrite || !opts.ifMatch || item.etag!==opts.ifMatch))
   throw new blob.BlobPreconditionFailedError();
  if(!item&&opts.ifMatch)throw new blob.BlobPreconditionFailedError();
  const etag=String(++revision);
  blobs.set(key,{etag,body:String(body)});
  return {pathname:key,etag};
 },
};
const storage={
 BlobNotFoundError:blob.BlobNotFoundError,
 get:async()=>{sourceReadCount++;if(restricted)throw new Error('TruTool private storage read failed: 402');return {statusCode:200,stream:new Response(JSON.stringify(original)).body,blob:{etag:'legacy-etag'}};},
 head:async()=>{throw Error('Unexpected expensive head call');},
 put:async()=>{sourceWriteCount++;throw Error('Must never write original Supabase');},
 usingSupabaseStorage:()=>true
};
function transpile(source,dest){
 fs.writeFileSync(path.join(temp,dest),ts.transpileModule(fs.readFileSync(source,'utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}
 }).outputText);
}
try{
 process.env.BLOB_READ_WRITE_TOKEN='local-mock-only';
 process.env.TRUTOOL_STORAGE_BACKEND='supabase';
 delete process.env.VERCEL;
 fs.writeFileSync(path.join(temp,'package.json'),JSON.stringify({type:'commonjs'}));
 transpile('lib/cms-types.ts','cms-types.js');
 transpile('lib/cms-overlay.ts','cms-overlay.js');
 fs.copyFileSync('lib/recovered-published-guides.json',path.join(temp,'recovered-published-guides.json'));
 transpile('lib/cms-store.ts','cms-store.js');
 Module._load=function(id,parent,isMain){
  if(id==='server-only')return {};
  if(id==='@vercel/blob')return blob;
  if(id==='next/cache')return {unstable_cache:callback=>callback};
  if(id==='react')return {cache:callback=>callback};
  if(id==='./private-storage')return storage;
  if(id==='./authors')return {authors:[{slug:'yash',name:'Yash'}]};
  return originalLoad.call(this,id,parent,isMain);
 };
 const cms=require(path.join(temp,'cms-store.js'));
 const backup=JSON.parse(fs.readFileSync('lib/recovered-published-guides.json','utf8'));
 assert.equal(backup.length,12,'All previously published CMS guides must be backed up');
 assert.equal(new Set(backup.map(r=>r.slug)).size,12,'Guide slugs must be unique');
 assert.ok(backup.every(r=>r.kind==='guide'&&r.publishedAt&&r.body.length>1000));
 const recovered=await cms.getPublished();
 assert.equal(recovered.filter(r=>r.kind==='guide').length,12,'Public guide list must restore all published source records during 402');
 assert.ok(recovered.some(g=>g.slug==='claude-vs-chatgpt'));
 assert.ok(recovered.filter(g=>g.image.startsWith('/media/')).length===0,'Unavailable old covers must use safe category images');
 const first=await cms.readStore();
 assert.equal(first.legacyUnavailable,true);
 assert.equal(first.store.records.length,0,'Unverified legacy content must not be presented as migrated');
 first.store.records.push(record('new-1','independent-guide'));
 first.store.revision++;
 await cms.writeStore(first.store,first.etag);
 assert.equal(blobs.size,1);
 assert.equal(sourceWriteCount,0);
 let saved=await cms.readStore();
 assert.equal(saved.store.records.length,1);
 assert.equal(saved.store.records[0].draft.slug,'independent-guide');
 assert.equal(saved.legacyUnavailable,true);
 assert.equal(cms.isOriginalCmsRecord(saved.store,'new-1'),false);
 const second=await cms.readStore();
 saved.store.records[0].draft.title='Updated original independent draft';
 await cms.writeStore(saved.store,saved.etag);
 second.store.records[0].draft.title='Stale edit';
 await assert.rejects(()=>cms.writeStore(second.store,second.etag),blob.BlobPreconditionFailedError,
  'Conflicting edits must not silently overwrite');
 restricted=false;
 const liveGuides=await cms.getPublished();
 assert.equal(liveGuides.filter(g=>g.kind==='guide').length,2,'Recovered guide snapshots must not override live Supabase records');
 let merged=await cms.readStore();
 assert.equal(merged.legacyUnavailable,false);
 assert.deepEqual(new Set(merged.store.records.map(r=>r.id)),new Set(['legacy-1','new-1']));
 assert.equal(cms.isOriginalCmsRecord(merged.store,'legacy-1'),true);
 assert.equal(JSON.stringify(original),sourceSnapshot,'Supabase content never changed');
 merged.store.records.find(r=>r.id==='legacy-1').draft.title='Shadowed edit';
 await cms.writeStore(merged.store,merged.etag);
 assert.equal(JSON.stringify(original),sourceSnapshot,'Legacy records are preserved');
 const overlay=JSON.parse(blobs.get('cms/independent-publishing-v1.json').body);
 assert.equal(overlay.records.length,2,'Only edited legacy record and new independent record copied');
 assert.equal(sourceWriteCount,0);
 // A new unpublished slug matching a recovered Supabase slug cannot replace the old page.
 const before=await cms.readStore();
 before.store.records.push(record('new-collision','legacy-guide'));
 await cms.writeStore(before.store,before.etag);
 const collision=await cms.readStore();
 assert.ok(collision.collisionPaths.includes('/guides/legacy-guide'));
 assert.equal(collision.store.records.filter(r=>r.draft.slug==='legacy-guide').length,1);
 assert.equal(collision.store.records.find(r=>r.draft.slug==='legacy-guide').id,'legacy-1');
 assert.equal(JSON.stringify(original),sourceSnapshot);
 console.log('PASS: 402-safe independent CMS writes, ETag collision rejection, recovered legacy union, preserved Supabase, and canonical URL collision isolation.');
}finally{
 Module._load=originalLoad;
 for(const [k,v] of Object.entries({BLOB_READ_WRITE_TOKEN:originalEnv.blob,TRUTOOL_STORAGE_BACKEND:originalEnv.backend,VERCEL:originalEnv.vercel})){
  if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
 fs.rmSync(temp,{recursive:true,force:true});
}
