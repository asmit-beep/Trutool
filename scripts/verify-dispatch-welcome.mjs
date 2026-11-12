import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(),'trutool-dispatch-test-'));
const require = createRequire(import.meta.url);
const saveEnv = ['RESEND_API_KEY','RESEND_FROM_EMAIL','RESEND_REPLY_TO','BLOB_READ_WRITE_TOKEN','ADMIN_SESSION_SECRET'].map(k=>[k,process.env[k]]);
const originalFetch = globalThis.fetch;
let requests = [];
const records = new Map();
let n=0;
try {
  fs.writeFileSync(path.join(tmp,'package.json'),'{"type":"commonjs"}');
  const transpile = (source,file,replace=[]) => {
    let s=fs.readFileSync(source,'utf8').replace("import 'server-only';",'');
    for (const [a,b] of replace) {assert.ok(s.includes(a),'Missing mock path '+a);s=s.replace(a,b);}
    const js=ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
    fs.writeFileSync(path.join(tmp,file),js);
  };
  transpile('lib/newsletter.ts','newsletter.js');
  transpile('lib/dispatch-welcome.ts','dispatch.js',[["from './newsletter'","from './newsletter'"]]);
  fs.writeFileSync(path.join(tmp,'storage.js'),`
class BlobPreconditionFailedError extends Error {}
const entries=globalThis.testDispatchRecords;
module.exports={
trutoolSigningSecret:()=>process.env.ADMIN_SESSION_SECRET,
async get(path){const row=entries.get(path);return row?{statusCode:200,stream:new Response(row.body).body,blob:{etag:row.etag}}:null;},
async put(path,body,opt){const row=entries.get(path);if(opt.ifMatch && row?.etag !== opt.ifMatch)throw new BlobPreconditionFailedError();entries.set(path,{body,etag:String(++globalThis.testDispatchVersion)});return {pathname:path};},
async list({prefix,limit,cursor}){const arr=[...entries.keys()].filter(p=>p.startsWith(prefix)).sort();const offset=Number(cursor||0);return {blobs:arr.slice(offset,offset+limit).map(pathname=>({pathname})),hasMore:arr.length>offset+limit,cursor:arr.length>offset+limit?String(offset+limit):undefined};}
};`);
  transpile('lib/newsletter-delivery.ts','delivery.js',[
    ["from './private-storage'","from './storage'"],
    ["from './dispatch-welcome'","from './dispatch'"],
  ]);
  globalThis.testDispatchRecords=records;
  globalThis.testDispatchVersion=0;
  const dispatch=require(path.join(tmp,'dispatch.js'));
  const delivery=require(path.join(tmp,'delivery.js'));
  const secret='welcome-check-secret';
  process.env.ADMIN_SESSION_SECRET=secret;delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.RESEND_API_KEY;delete process.env.RESEND_FROM_EMAIL;
  const id='1'.repeat(64),email='person@example.test',at='2026-10-11T10:00:00.000Z';
  const subscriberPath=delivery.subscriberPath(id);
  const eventId=dispatch.welcomeEventId(id,at);
  records.set(subscriberPath,{body:JSON.stringify({email,topics:['ai','tools'],source:'/newsletter',status:'subscribed',welcomeEventId:eventId,createdAt:at,consentedAt:at}),etag:'0'});
  assert.equal(await delivery.deliverPendingWelcome(subscriberPath),'pending');
  assert.equal(JSON.parse(records.get(subscriberPath).body).welcomeSentAt,undefined);
  const template=dispatch.welcomeEmail({email,topics:['ai','tools'],manageUrl:'/newsletter?unsubscribe=token',eventId});
  assert.ok(template.html.includes('Less noise.') && template.html.includes('Better discoveries.'));
  assert.ok(template.html.includes('Everything AI') && template.html.includes('New &amp; useful tools'));
  assert.ok(template.html.includes('https://trutool.co/newsletter?unsubscribe=token'));
  assert.ok(template.html.includes('<table') && template.text.includes('Unsubscribe'));
  assert.ok(!template.html.includes('undefined'));
  process.env.RESEND_API_KEY='test-only-no-real-requests';
  process.env.RESEND_FROM_EMAIL='TruTool Dispatch <dispatch@trutool.co>';
  globalThis.fetch=async(url,init)=>{
    assert.equal(url,'https://api.resend.com/emails');
    requests.push({url,init});
    return Response.json({id:'fake-resend-email-id'});
  };
  assert.equal(await delivery.deliverPendingWelcome(subscriberPath),'sent');
  assert.equal(requests.length,1);
  assert.equal(requests[0].init.headers['Idempotency-Key'],eventId);
  assert.equal(JSON.parse(requests[0].init.body).to[0],email);
  assert.ok(JSON.parse(records.get(subscriberPath).body).welcomeSentAt);
  assert.equal(await delivery.deliverPendingWelcome(subscriberPath),'skipped');
  assert.equal(requests.length,1,'Accepted welcomes must never resend from stored state.');
  assert.equal(await delivery.deliverPendingWelcome('newsletter/subscribers/bad.json'),'skipped');
  const unsubId='2'.repeat(64);
  records.set(delivery.subscriberPath(unsubId),{body:JSON.stringify({email:'unsub@example.test',topics:['tools'],status:'unsubscribed',welcomeEventId:'x'}),etag:'11'});
  assert.equal(await delivery.deliverPendingWelcome(delivery.subscriberPath(unsubId)),'skipped');
  assert.equal(requests.length,1,'Unsubscribed readers must not receive welcome messages.');
  const failedId='3'.repeat(64),failedPath=delivery.subscriberPath(failedId);
  records.set(failedPath,{body:JSON.stringify({email:'pending@example.test',topics:['guides'],status:'subscribed',welcomeEventId:'event-3'}),etag:'12'});
  globalThis.fetch=async()=>Response.json({error:'rate limited'},{status:429});
  assert.equal(await delivery.deliverPendingWelcome(failedPath),'pending');
  assert.equal(JSON.parse(records.get(failedPath).body).welcomeSentAt,undefined,'Failed Resend sends must remain retryable.');
  const orig=fs.readFileSync('vercel.json','utf8'),cron=JSON.parse(orig);
  assert.ok(cron.crons.some(c=>c.path==='/api/cron/newsletter-welcome' && /\* \* \*$/.test(c.schedule)));
  const admin=fs.readFileSync('components/admin-workspace.tsx','utf8');
  const inbox=fs.readFileSync('components/admin-enquiry-inbox.tsx','utf8');
  assert.ok(admin.includes("navigate('submissions')") && admin.includes('<AdminEnquiryInbox onlyTools/>'));
  assert.ok(inbox.includes('(!onlyTools || Boolean(m.product))'));
  const form=fs.readFileSync('components/product-submission-form.tsx','utf8');
  assert.ok(form.includes("topic:'suggestion'") && form.includes("product:{name:"));
  console.log('PASS: responsive HTML welcome + plain text + unsubscribe, exact once after acceptance, pending provider retry, subscription-safety, cron schedule, and tool listing inbox.');
} finally {
  globalThis.fetch=originalFetch;
  for(const [k,v] of saveEnv){if(v===undefined)delete process.env[k];else process.env[k]=v;}
  delete globalThis.testDispatchRecords;delete globalThis.testDispatchVersion;
  fs.rmSync(tmp,{recursive:true,force:true});
}
