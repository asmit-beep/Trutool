import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import ts from 'typescript';
import {loadContent} from './load-content.mjs';
import {contentHistory} from './generate-content-history.mjs';

const tmp=fs.mkdtempSync(path.join(process.cwd(),'scripts','.content-dates-'));
const require=createRequire(import.meta.url),content=loadContent();
try{
 const history=JSON.parse(fs.readFileSync('lib/content-history.json','utf8'));
 const later=new Date().toISOString();
 assert.deepEqual(contentHistory(content.index,history,later),{next:history,changed:[]},'A later build must preserve every committed date');
 const revised=content.index.contentPages.map(p=>p.path==='/guides'?{...p,title:p.title+' revised'}:p);
 const change=contentHistory({...content.index,contentPages:revised},history,later);
 assert.deepEqual(change.changed,['/guides']);
 assert.equal(change.next['/guides'].modified,later);
 assert.deepEqual(change.next['/tools'],history['/tools']);
 const revision=path=>content.index.contentRevision(content.index.contentPages.find(p=>p.path===path));
 for(const path of ['/guides','/community','/authors','/services'])assert.ok(!('tools' in revision(path)),path+' must not follow unrelated catalogue additions');
 assert.equal(revision('/tools/midjourney').related.length,3,'Tool profiles fingerprint only the three related cards they render');
 assert.ok(revision('/alternatives/midjourney').related.length>3,'Alternatives pages fingerprint their full rendered category inventory');

 fs.writeFileSync(path.join(tmp,'package.json'),'{"type":"commonjs"}');
 const compile=(file,output,transform=s=>s)=>fs.writeFileSync(path.join(tmp,output),ts.transpileModule(transform(fs.readFileSync(file,'utf8')),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText);
 for(const file of fs.readdirSync('lib')){
  if(file.endsWith('.json'))fs.copyFileSync('lib/'+file,path.join(tmp,file));
  else if(file.endsWith('.ts')&&file!=='cms-store.ts')compile('lib/'+file,file.replace(/\.ts$/,'.js'),s=>s.replace("import 'server-only';",''));
 }
 fs.writeFileSync(path.join(tmp,'cms-store.js'),`const {effectivePublished,contentPath}=require('./cms-types');
exports.records=[];
exports.getPublished=async()=>exports.records.map(r=>effectivePublished(r,exports.now)).filter(Boolean);
exports.hiddenPaths=async()=>new Set(exports.records.filter(r=>r.hidden).map(r=>contentPath(r.draft)));
exports.isHidden=async p=>(await exports.hiddenPaths()).has(p);`);
 const store=require(path.join(tmp,'cms-store.js'));
 const {newContent}=require(path.join(tmp,'cms-types.js'));
 const {publicPages}=require(path.join(tmp,'cms-public.js'));
 const {modifiedFor}=require(path.join(tmp,'content-index.js'));
 const {pageMarkdown}=require(path.join(tmp,'discovery.js'));
 const aliases=s=>s.replaceAll("@/lib/",'./');
 compile('components/page-structured-data.tsx','page-schema.js',aliases);
 compile('app/sitemap.ts','sitemap.js',aliases);
 const {PageStructuredData}=require(path.join(tmp,'page-schema.js'));
 const sitemap=require(path.join(tmp,'sitemap.js')).default;
 const base=Math.max(Date.now(),...Object.values(history).map(h=>Date.parse(h.modified)));
 const first=new Date(base+1000).toISOString(),edited=new Date(base+2000).toISOString();
 store.now=base+3000;
 const guide={...newContent('guide'),id:'guide-fixture',slug:'date-fixture',title:'Date fixture',description:'Test published guide',category:'local-listings',publishedAt:first,updatedAt:first};
 const record=c=>({id:c.id,draft:c,published:c,revision:1,updatedAt:c.updatedAt,history:[]});
 const before=await publicPages(),dates=pages=>new Map(pages.map(p=>[p.path,modifiedFor(p)]));
 store.records=[record(guide)];
 const published=await publicPages(),current=dates(published),baseline=dates(before);
 for(const p of ['/guides','/categories/local-listings','/authors/yash',''])assert.equal(current.get(p),first,p+' must follow its published guide');
 for(const p of ['/tools','/community','/everything-ai','/categories/design'])assert.equal(current.get(p),baseline.get(p),p+' must ignore an unrelated guide');
 const script=await PageStructuredData({path:'/guides'}),graph=JSON.parse(script.props.dangerouslySetInnerHTML.__html)['@graph'];
 assert.equal(graph.find(n=>n['@type']==='CollectionPage').dateModified,first);
 assert.equal((await sitemap()).find(p=>p.url.endsWith('/guides')).lastModified,first);
 const sourceControlled=content.sitemap.sitemapEntries([{
  path:'/guides/slack-alternatives-for-internal-communications',title:'Recovered guide',description:'Fixture',kind:'guide',
  publishedAt:'2026-10-30T00:00:00.000Z',updatedAt:'2026-10-30T00:00:00.000Z',
 }])[0];
 assert.equal(sourceControlled.lastModified,'2026-10-30T15:51:18.000Z','Recovered guide sitemap date follows its latest rendered source commit');
 assert.ok(pageMarkdown(published.find(p=>p.path==='/guides')).includes(first));
 assert.deepEqual(dates(await publicPages()),current,'Repeated requests retain the same dates');

 store.records=[record({...guide,updatedAt:edited})];
 assert.equal(dates(await publicPages()).get('/guides'),edited,'Published edits advance the collection date');
 store.records=[{...record(guide),draft:{...guide,updatedAt:edited}}];
 assert.equal(dates(await publicPages()).get('/guides'),first,'Draft edits must not advance public dates');
 store.records=[{...record(guide),hidden:true}];
 assert.deepEqual(dates(await publicPages()),baseline,'Hidden records must not contribute dates');
 store.records=[{...record(guide),published:undefined,scheduled:{...guide,publishedAt:'2099-01-01T00:00:00Z'},scheduledAt:'2099-01-01T00:00:00Z'}];
 assert.deepEqual(dates(await publicPages()),baseline,'Future scheduled content must not contribute dates');
 store.records=[record({...guide,kind:'news',slug:'news-fixture',updatedAt:edited})];
 const news=dates(await publicPages());
 assert.equal(news.get('/guides'),baseline.get('/guides'),'News is not a buying guide');
 assert.equal(news.get('/everything-ai'),edited);
 const newsGraph=JSON.parse((await PageStructuredData({path:'/guides'})).props.dangerouslySetInnerHTML.__html)['@graph'];
 assert.equal(newsGraph.find(n=>n['@type']==='ItemList').numberOfItems,before.filter(p=>p.kind==='guide').length);

 // Exercise the build command in an isolated fixture: stale history fails
 // without writing, and the intentional update is stable on subsequent checks.
 fs.cpSync('lib',path.join(tmp,'lib'),{recursive:true});
 fs.cpSync('app',path.join(tmp,'app'),{recursive:true});
 const fixtureHistory=path.join(tmp,'lib/content-history.json');
 const stale=structuredClone(history);stale['/guides'].hash='stale';
 fs.writeFileSync(fixtureHistory,JSON.stringify(stale,null,1)+'\n');
 const staleBytes=fs.readFileSync(fixtureHistory,'utf8');
 const run=args=>spawnSync(process.execPath,[path.resolve('scripts/generate-content-history.mjs'),...args],{cwd:tmp,encoding:'utf8'});
 const check=run([]);assert.notEqual(check.status,0);assert.match(check.stderr,/Content history is out of date/);
 assert.equal(fs.readFileSync(fixtureHistory,'utf8'),staleBytes,'Build validation must not mutate history');
 const write=run(['--write','--date',later]);assert.equal(write.status,0,write.stderr);
 const saved=fs.readFileSync(fixtureHistory,'utf8');
 for(let i=0;i<2;i++){const result=run([]);assert.equal(result.status,0,result.stderr);assert.equal(fs.readFileSync(fixtureHistory,'utf8'),saved);}
 console.log('PASS: stable build dates, explicit history updates, published collection revisions, sitemap/Markdown/server schema parity, draft/hidden/scheduled isolation, and news/guide separation.');
}finally{content.cleanup();fs.rmSync(tmp,{recursive:true,force:true});}
