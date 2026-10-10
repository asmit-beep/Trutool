import assert from 'node:assert/strict';
import ts from 'typescript';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {loadContent} from './load-content.mjs';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'trutool-publishing-'));
const require=createRequire(import.meta.url);
const Module=require('node:module');
const originalLoad=Module._load,originalFetch=globalThis.fetch;
const content=loadContent();
try{
 fs.writeFileSync(path.join(tmp,'package.json'),'{"type":"commonjs"}');
 for(const name of ['document-import','cms-types','visibility-refresh'])fs.writeFileSync(path.join(tmp,name+'.js'),ts.transpileModule(fs.readFileSync('lib/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
 const {documentExportUrl,importDocument,normalizeDocumentMarkdown}=require(path.join(tmp,'document-import.js'));
 const url='https://docs.google.com/document/d/'+'a'.repeat(44)+'/edit?usp=sharing&tab=t.abc';
 assert.equal(documentExportUrl(url).href,'https://docs.google.com/document/d/'+'a'.repeat(44)+'/export?format=md&tab=t.abc');
 for(const bad of ['http://docs.google.com/document/d/'+ 'a'.repeat(44),url.replace('docs.google.com','docs.google.com.evil.test'),url.replace('docs.google.com','127.0.0.1'),url.replace('https://','https://user:password@'),url.replace('docs.google.com','docs.google.com:4433'),'file:///etc/passwd','https://docs.google.com/document/d/e/published/pub'])assert.throws(()=>documentExportUrl(bad));
 const markdown='# A useful guide\n\n## Café ☕\n\n- **Check** the source\n- [Official link](https://example.com)\n\n| Tool | Fit |\n| --- | --- |\n| One | Writing |';
 const normalized=normalizeDocumentMarkdown('A [source][ref].\n\n![][image1]\n\n[ref]: <https://example.com>\n[image1]: <data:image/png;base64,AAAA>');assert.ok(normalized.markdown.includes('[source](https://example.com)'));assert.ok(!normalized.markdown.includes('base64'));assert.equal(normalized.imagesOmitted,1);
 let calls=0;
 const imported=await importDocument(url,async(target,options)=>{
  assert.equal(options.redirect,'manual');assert.equal(options.cache,'no-store');calls++;
  return calls===1?new Response(null,{status:302,headers:{Location:'https://doc-test-docstext.googleusercontent.com/export/content'}}):new Response(markdown,{headers:{'Content-Type':'text/markdown; charset=utf-8'}});
 });
 assert.equal(imported.markdown,markdown);assert.equal(imported.title,'A useful guide');assert.equal(calls,2);
 for(const response of [new Response(null,{status:403}),new Response('<html>Sign in</html>',{headers:{'Content-Type':'text/html'}}),new Response('<!DOCTYPE html>Sign in',{headers:{'Content-Type':'text/plain'}}),new Response('',{headers:{'Content-Type':'text/markdown'}}),new Response('x'.repeat(160001),{headers:{'Content-Type':'text/plain'}}),new Response(null,{status:302,headers:{Location:'http://127.0.0.1/internal'}}),new Response(null,{status:302,headers:{Location:'https://accounts.google.com/signin'}})])await assert.rejects(()=>importDocument(url,async()=>response));
 let redirects=0;await assert.rejects(()=>importDocument(url,async()=>{redirects++;return new Response(null,{status:302,headers:{Location:'https://docs.google.com/document/export'}});}));assert.equal(redirects,5);
 await assert.rejects(()=>importDocument(url,async()=>{throw new Error('network');}),/could not be downloaded/);
 console.log('PASS: Google Docs Markdown import, formatting, tab links, sharing errors, size limits, redirects, and arbitrary URL rejection.');
 const {newContent,contentPath,effectivePublished,scheduledTime}=require(path.join(tmp,'cms-types.js'));
 const now=Date.now(),before=new Date(now-86400000).toISOString(),due=new Date(now+60000).toISOString();
 const published={...newContent(),publishedAt:before,body:'original'},scheduled={...published,body:'scheduled',updatedAt:due};
 const record={id:'test',draft:scheduled,published,scheduled,scheduledAt:due,revision:1,updatedAt:before,history:[]};
 assert.equal(effectivePublished(record,now).body,'original');assert.equal(effectivePublished(record,now+60001).body,'scheduled');assert.equal(effectivePublished(record,now+60001).publishedAt,before);assert.equal(scheduledTime(record),due);
 assert.equal(effectivePublished({...record,hidden:true},now+60001),undefined);
 assert.equal(effectivePublished({...record,published:undefined,scheduledAt:undefined,scheduled:{...scheduled,publishedAt:due}},now),undefined);
 const kinds=['guide','tool','comparison','alternatives','answer','news','service','author'];
 const pages=kinds.map(kind=>{const cms={...newContent(kind),slug:'test-'+kind,title:'Test '+kind,description:'Useful original content for the reader.',body:markdown,publishedAt:before,updatedAt:new Date(now).toISOString()};return {path:contentPath(cms),title:cms.title,description:cms.description,kind:kind==='news'?'guide':kind,cms,publishedAt:before,updatedAt:cms.updatedAt};});
 for(const page of pages){assert.ok(content.discovery.llmsFull(pages).includes(page.path));assert.ok(content.discovery.rss(pages).includes(page.path));assert.ok(content.discovery.atom(pages).includes(page.path));assert.ok(content.discovery.jsonFeed(pages).items.some(item=>item.url.endsWith(page.path)));}
 const index=content.discovery.llmsIndex([...content.index.contentPages,...pages]);for(const p of pages)assert.ok(index.includes(p.path+'.md'));
 console.log('PASS: all eight CMS content types appear in LLM references and RSS/Atom/JSON feeds; scheduled edits retain original publication dates.');
 let store={version:1,revision:4,records:[record],activity:[]},saved,collision=true;
 const invalidations=[];
 class Conflict extends Error{}
 Module._load=function(id,parent){
  if(id==='server-only')return {};
  if(id==='next/cache')return {revalidatePath:(...args)=>invalidations.push(args),revalidateTag:(...args)=>invalidations.push(args)};
  if(id==='@vercel/blob')return {BlobPreconditionFailedError:Conflict};
  if(id==='./content-index'&&parent?.filename===path.join(tmp,'visibility-refresh.js'))return {absolute:p=>'https://trutool.co'+p};
  if(id==='./cms-store')return {readStore:async()=>({store:structuredClone(store),etag:'revision-'+store.revision}),writeStore:async value=>{if(collision){collision=false;store.revision++;store.records[0].draft.body='concurrent editorial edit';throw new Conflict();}saved=value;store=value;}};
  return originalLoad.apply(this,arguments);
 };
 globalThis.fetch=async url=>{assert.equal(new URL(url).origin,'https://trutool.co');return new Response('ok');};
 const {refreshVisibility,visibilityPaths}=require(path.join(tmp,'visibility-refresh.js'));
 const refreshed=await refreshVisibility();assert.ok(refreshed.ok);assert.equal(refreshed.checks.length,8);assert.equal(saved.revision,5);assert.equal(saved.records[0].draft.body,'concurrent editorial edit');assert.ok(saved.visibility.checkedAt);assert.ok(invalidations.some(args=>args[0]==='/'&&args[1]==='layout'));assert.ok(invalidations.some(args=>args[0]==='ai-sources'));
 globalThis.fetch=async url=>new Response('',{status:new URL(url).pathname==='/rss.xml'?503:200});const failed=await refreshVisibility();assert.equal(failed.ok,false);assert.equal(failed.checks.find(c=>c.path==='/rss.xml').ok,false);
 assert.deepEqual(JSON.parse(fs.readFileSync('vercel.json','utf8')).crons,[{path:'/api/cron/visibility',schedule:'0 0 * * *'}]);assert.ok(visibilityPaths.includes('/robots.txt'));
 console.log('PASS: daily discovery refresh, failure reporting, AI cache refresh, and concurrent edit preservation.');
}finally{Module._load=originalLoad;globalThis.fetch=originalFetch;content.cleanup();fs.rmSync(tmp,{recursive:true,force:true});}
