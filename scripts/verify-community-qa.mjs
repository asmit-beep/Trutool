import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'trutool-community-qa-'));
const require=createRequire(import.meta.url);
const Module=require('node:module'),originalLoad=Module._load;
const originalSecret=process.env.ADMIN_SESSION_SECRET;
const rows=new Map();
const categories=[{slug:'ai',short:'AI'},{slug:'productivity',short:'Productivity'}];
const legacy=[{slug:'baseline',category:'ai',label:'AI',question:'A baseline question?',answer:'Legacy answer',helpful:2,tools:[]}];
let signedIn=false;
let version=0;
const storage={
  async list({prefix,limit=100,cursor}){
    const keys=[...rows.keys()].filter(k=>k.startsWith(prefix)).sort();
    const offset=Number(cursor||0);
    return {blobs:keys.slice(offset,offset+limit).map(pathname=>({pathname})),hasMore:keys.length>offset+limit,cursor:keys.length>offset+limit?String(offset+limit):undefined};
  },
  async put(pathname,body) {rows.set(pathname,JSON.parse(body));version++;return {pathname};},
  async get(pathname){const result=rows.get(pathname);return result?{statusCode:200,stream:new Response(JSON.stringify(result)).body}:null;}
};
function build(from,to){
  const source=fs.readFileSync(from,'utf8').replaceAll("import 'server-only';",'');
  const out=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
  fs.writeFileSync(path.join(tmp,to+'.cjs'),out);
}
try{
  build('lib/community-cms-cards.ts','cards');
  build('app/api/community/route.ts','public');
  build('app/api/admin/community-submissions/route.ts','admin');
  process.env.ADMIN_SESSION_SECRET='community-test-key';
  Module._load=function(id,parent,isMain){
    if(id==='@/lib/private-storage')return storage;
    if(id==='@/lib/catalog'||id==='./catalog')return {categories,getTool:slug=>slug==='valid-tool'?{slug,name:'Valid Tool',initial:'V'}:undefined,categoryOf:slug=>categories.find(c=>c.slug===slug)};
    if(id==='@/lib/community-answers'||id==='./community-answers')return {getCommunityAnswer:slug=>slug==='baseline'?{slug}:undefined,communityQuestionCards:legacy};
    if(id==='@/lib/cms-store')return {getPublished:async()=>[]};
    if(id==='@/lib/admin-auth')return {authenticated:async()=>signedIn,privateResponse:(content,status=200)=>Response.json(content,{status,headers:{'Cache-Control':'private, no-store'}})};
    return originalLoad.apply(this,arguments);
  };
  const {communityCardsWithPublished}=require(path.join(tmp,'cards.cjs'));
  const today='2026-10-13T00:00:00.000Z';
  const cards=communityCardsWithPublished([
    {kind:'answer',slug:'new-question',title:'How do I compare tools?',description:'Test them on your actual workflow.',category:'ai',publishedAt:today,toolSlugs:['valid-tool','deleted-tool']},
    {kind:'answer',slug:'baseline',title:'Updated baseline?',description:'This replaces an older response.',category:'ai',publishedAt:today,toolSlugs:[]},
    {kind:'guide',slug:'not-question',title:'Not a question',publishedAt:today,toolSlugs:[]},
    {kind:'answer',slug:'unpublished',title:'Draft',category:'ai',toolSlugs:[]},
  ]);
  assert.equal(cards.length,2);
  assert.deepEqual(cards.map(c=>c.slug),['new-question','baseline']);
  assert.equal(cards[0].tools.length,1);
  assert.equal(cards[1].question,'Updated baseline?');
  const {POST}=require(path.join(tmp,'public.cjs'));
  const payload={kind:'question',name:'A Reader',email:'reader@example.test',question:'How should I choose a project management tool?',category:'ai',message:'Our team has five users and a limited budget.',consent:true,website:''};
  const request=(data,origin='https://trutool.co')=>new Request('https://trutool.co/api/community',{method:'POST',headers:{'Content-Type':'application/json',origin},body:JSON.stringify(data)});
  assert.equal((await POST(request(payload,'https://attacker.test'))).status,403);
  const posted=await POST(request(payload));
  assert.equal(posted.status,200);
  assert.equal(rows.size,1);
  const submitted=[...rows.values()][0];
  assert.equal(submitted.status,'pending');
  assert.equal(submitted.question,payload.question);
  assert.ok([...rows.keys()][0].startsWith('community-submissions/'));
  assert.equal((await POST(request({...payload,consent:false}))).status,400);
  const {GET}=require(path.join(tmp,'admin.cjs'));
  const unauth=await GET();
  assert.equal(unauth.status,401);
  signedIn=true;
  const admin=await GET(),result=await admin.json();
  assert.equal(admin.status,200);
  assert.equal(result.submissions.length,1);
  assert.equal(result.submissions[0].email,payload.email);
  assert.equal(admin.headers.get('cache-control'),'private, no-store');
  assert.ok(fs.readFileSync('app/community/page.tsx','utf8').includes('communityCardsWithPublished(await getPublished())'));
  assert.ok(fs.readFileSync('components/admin-workspace.tsx','utf8').includes('<AdminCommunityQueue onCreateAnswer={draftCommunityAnswer}/>'));
  const privateStorageSource=fs.readFileSync('lib/private-storage.ts','utf8');assert.ok(privateStorageSource.includes('trutool_objects')&&!privateStorageSource.includes("from '@vercel/blob'"),'Community submissions must use private Supabase storage');
  const sitemap=fs.readFileSync('app/sitemap.ts','utf8');
  assert.ok(sitemap.includes('publicPages()'), 'Q&A pages must be included in dynamic sitemap');
  console.log('PASS: CMS community Q&A merges into public grid; private question intake, admin auth, draft workflow, and sitemap use live records.');
} finally {
  Module._load=originalLoad;
  if(originalSecret===undefined)delete process.env.ADMIN_SESSION_SECRET;else process.env.ADMIN_SESSION_SECRET=originalSecret;
  fs.rmSync(tmp,{recursive:true,force:true});
}
