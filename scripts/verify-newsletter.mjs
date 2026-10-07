import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import ts from 'typescript';

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'trutool-newsletter-'));
const previous=process.env.BLOB_READ_WRITE_TOKEN;
try{
 fs.writeFileSync(path.join(temp,'package.json'),'{"type":"commonjs"}');
 const compile=(source,file)=>fs.writeFileSync(path.join(temp,file),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
 compile(fs.readFileSync('lib/newsletter.ts','utf8'),'newsletter.js');
 compile(fs.readFileSync('app/api/newsletter/route.ts','utf8').replace('@vercel/blob','./blob').replace('@/lib/newsletter','./newsletter'),'route.js');
 fs.writeFileSync(path.join(temp,'blob.js'),`
 const records=new Map();let fail=false,version=0;
 class BlobPreconditionFailedError extends Error{}
 module.exports={records,BlobPreconditionFailedError,setFailure(value){fail=value},
 async list({prefix,limit}){if(fail)throw Error('Unavailable');return {blobs:[...records.keys()].filter(p=>p.startsWith(prefix)).slice(0,limit).map(pathname=>({pathname}))}},
 async get(path,options){if(fail)throw Error('Unavailable');if(options.access!=='private'||options.useCache!==false)throw Error('Private fresh reads required');const row=records.get(path);if(!row)return null;return {statusCode:200,stream:new Response(row.body).body,blob:{etag:row.etag}}},
 async put(path,body,options){if(fail)throw Error('Unavailable');if(options.access!=='private')throw Error('Private writes required');const row=records.get(path);if(options.ifMatch&&row?.etag!==options.ifMatch)throw new BlobPreconditionFailedError();if(row&&options.allowOverwrite===false)throw Error('Exists');records.set(path,{body,etag:String(++version)});return {pathname:path}}
 };`);
 const require=createRequire(import.meta.url),{POST}=require(path.join(temp,'route.js')),blob=require(path.join(temp,'blob.js'));
 process.env.BLOB_READ_WRITE_TOKEN='unit-test-secret';
 const request=(value,{origin='https://trutool.test',ip='192.0.2.1',raw}={})=>new Request('https://trutool.test/api/newsletter',{method:'POST',headers:{origin,'content-type':'application/json','x-forwarded-for':ip},body:raw??JSON.stringify(value)});
 const subscription={email:' Reader@Example.com ',topics:['ai','tools'],consent:true,website:'',source:'/guides/choosing-ai-assistants'};
 const rows=()=>[...blob.records.entries()].filter(([key])=>key.startsWith('newsletter/subscribers/')).map(([key,row])=>({key,data:JSON.parse(row.body)}));
 for(const value of [{...subscription,consent:false},{...subscription,email:'bad'},{...subscription,email:'reader@other@example.com'},{...subscription,topics:[]},{...subscription,topics:['unknown']},{...subscription,website:'bot.example'},null])assert.equal((await POST(request(value))).status,400);
 assert.equal(blob.records.size,0,'Invalid requests cannot write.');
 assert.equal((await POST(request(subscription,{origin:'https://other.test'}))).status,403);
 assert.equal((await POST(request(null,{raw:'not-json'}))).status,400);
 assert.equal((await POST(request(null,{raw:'x'.repeat(2050)}))).status,413);
 const first=await POST(request(subscription));assert.equal(first.status,200);const saved=await first.json();assert.ok(saved.ok);assert.ok(saved.manageUrl.startsWith('/newsletter?unsubscribe='));assert.equal(rows().length,1);assert.equal(rows()[0].data.email,'reader@example.com');assert.deepEqual(rows()[0].data.topics,['ai','tools']);assert.equal(rows()[0].data.status,'subscribed');assert.equal(rows()[0].data.consentVersion,'newsletter-v1');assert.ok(!rows()[0].key.includes('reader')&&!JSON.stringify(rows()).includes('192.0.2.1'));
 const duplicate=await (await POST(request(subscription))).json();assert.ok(duplicate.already);assert.equal(rows().length,1);assert.equal(rows()[0].data.consentedAt,rows()[0].data.createdAt);
 const concurrent=await Promise.all([POST(request({...subscription,email:'second@example.com'},{ip:'192.0.2.2'})),POST(request({...subscription,email:'second@example.com'},{ip:'192.0.2.2'}))]);assert.ok(concurrent.every(r=>r.status===200));assert.equal(rows().length,2,'Concurrent signups cannot duplicate subscribers.');
 const token=new URL(saved.manageUrl,'https://trutool.test').searchParams.get('unsubscribe');
 assert.equal((await POST(request({action:'unsubscribe',token:token.slice(0,-1)+'x'}))).status,400);
 assert.equal(rows().find(row=>row.data.email==='reader@example.com').data.status,'subscribed');
 const unsubscribe=await POST(request({action:'unsubscribe',token}));assert.equal(unsubscribe.status,200);assert.ok((await unsubscribe.json()).unsubscribed);assert.equal(rows().find(row=>row.data.email==='reader@example.com').data.status,'unsubscribed');
 assert.equal((await POST(request({action:'unsubscribe',token}))).status,200,'Unsubscribe is idempotent.');
 assert.equal((await POST(request({...subscription,topics:['guides']}))).status,200);assert.equal(rows().length,2);assert.equal(rows().find(row=>row.data.email==='reader@example.com').data.status,'subscribed');assert.deepEqual(rows().find(row=>row.data.email==='reader@example.com').data.topics,['guides']);
 for(let i=0;i<10;i++)assert.equal((await POST(request({...subscription,email:'rate'+i+'@example.com'},{ip:'192.0.2.3'}))).status,200);
 assert.equal((await POST(request({...subscription,email:'overflow@example.com'},{ip:'192.0.2.3'}))).status,429);assert.ok(!rows().some(row=>row.data.email==='overflow@example.com'));
 blob.setFailure(true);assert.equal((await POST(request(subscription,{ip:'192.0.2.4'}))).status,503);blob.setFailure(false);
 delete process.env.BLOB_READ_WRITE_TOKEN;assert.equal((await POST(request(subscription))).status,503);
 console.log('PASS: newsletter validation, consent, origin, payload limits, private storage, deduplication, concurrent signups, signed unsubscribe, resubscribe, rate limiting, and failure handling.');
}finally{if(previous===undefined)delete process.env.BLOB_READ_WRITE_TOKEN;else process.env.BLOB_READ_WRITE_TOKEN=previous;fs.rmSync(temp,{recursive:true,force:true});}
