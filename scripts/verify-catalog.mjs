import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'trutool-catalog-'));
try{
 fs.writeFileSync(path.join(tmp,'package.json'),'{"type":"commonjs"}');
 for(const file of ['catalog','guides','search','diagnostic','catalog-results','demo','demo-reviews','reviews','pricing','community-answers'])fs.writeFileSync(path.join(tmp,file+'.js'),ts.transpileModule(fs.readFileSync('lib/'+file+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
 fs.copyFileSync('lib/expanded-catalog.json',path.join(tmp,'expanded-catalog.json'));
 fs.copyFileSync('lib/core-source-dates.json',path.join(tmp,'core-source-dates.json'));
 fs.copyFileSync('lib/community-reviews.json',path.join(tmp,'community-reviews.json'));
 const require=createRequire(import.meta.url),{tools,categories,guides}=require(path.join(tmp,'catalog.js')),{searchTools}=require(path.join(tmp,'search.js')),{workflows,validateBrief,pilotPlan,guideFor,matchTools,defaultWeights}=require(path.join(tmp,'diagnostic.js'));
 assert.ok(tools.length>=501);assert.ok(categories.length>40);assert.equal(new Set(tools.map(t=>t.slug)).size,tools.length);assert.equal(new Set(categories.map(c=>c.slug)).size,categories.length);
 for(const t of tools){assert.ok(categories.some(c=>c.slug===t.category),t.slug);assert.match(new URL(t.url).protocol,/https?:/);assert.ok(t.summary&&t.fit&&t.caution&&t.features.length,t.slug);assert.equal(searchTools(t.name)[0]?.slug,t.slug,'Name search: '+t.name)}
 for(const c of categories){assert.ok(tools.some(t=>t.category===c.slug),c.slug);const brief={category:c.slug,workflow:workflows[c.slug][0][0],scale:'team',style:'balanced'};assert.ok(validateBrief(brief));assert.equal(pilotPlan(brief).length,3);assert.ok(guideFor(c.slug));assert.ok(matchTools(brief,defaultWeights).length)}
 for(const [q,expected] of [['chagpt','chatgpt'],['remove image backgrounds','remove-bg'],['AI research assistants','perplexity'],['RFP response software','inventive-ai'],['meeting notes','otter'],['password manager','1password'],['create presentations','gamma'],['no-code app builders','bubble']]){const result=searchTools(q).slice(0,20);console.log(q,':',result.slice(0,6).map(t=>t.name).join(', '));assert.ok(result.some(t=>t.slug===expected),'Task search: '+q+' should include '+expected)}
 fs.symlinkSync(path.resolve('node_modules'),path.join(tmp,'node_modules'),'dir');
 const reviewSource=fs.readFileSync('app/api/reviews/route.ts','utf8').replace("@/lib/catalog","./catalog");
 fs.writeFileSync(path.join(tmp,'review-route.js'),ts.transpileModule(reviewSource,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
 const {POST}=require(path.join(tmp,'review-route.js'));
 const {demoReviews,demoGuideReviews}=require(path.join(tmp,'demo-reviews.js'));
 assert.ok(demoReviews.length>=50);assert.equal(new Set(demoReviews.map(r=>r.slug)).size,demoReviews.length);
 for(const r of [...demoReviews,...demoGuideReviews]){assert.ok(r.demo&&r.rating>=4&&r.rating<5&&r.message.length>20&&r.name.length>2);assert.ok(r.kind==='tool'?tools.some(t=>t.slug===r.slug):guides.some(g=>g.slug===r.slug))}
 const {ratingFor,reviewsFor}=require(path.join(tmp,'reviews.js'));for(const t of tools){const score=ratingFor('tool',t.slug).average;assert.ok(score===null||(score>=1&&score<=5));assert.equal(ratingFor('tool',t.slug).count,reviewsFor('tool',t.slug).length)}
 console.log('PASS: presentation reviews use unique tool references, bounded ratings, and a removable data source.');
 const approvedPath=path.join(tmp,'community-reviews.json'),approvedBackup=fs.readFileSync(approvedPath,'utf8');
 fs.writeFileSync(approvedPath,JSON.stringify([{id:'test-one',kind:'tool',slug:'chatgpt',name:'Validation fixture',rating:4,message:'Isolated validation fixture; never published.',publishedAt:'2026-10-06'},{id:'test-two',kind:'tool',slug:'chatgpt',name:'Validation fixture',rating:5,message:'Isolated validation fixture; never published.',publishedAt:'2026-10-06'}]));
 const launchCheck=spawnSync(process.execPath,['-e',`const a=require('node:assert/strict'),r=require(${JSON.stringify(path.join(tmp,'reviews.js'))});a.deepEqual(r.ratingFor('tool','chatgpt'),{count:2,average:4.5});a.equal(r.ratingFor('tool','claude').average,null);a.equal(r.displayReviews.length,2);`],{env:{...process.env,NEXT_PUBLIC_DEMO_MODE:'false'},encoding:'utf8'});
 fs.writeFileSync(approvedPath,approvedBackup);assert.equal(launchCheck.status,0,launchCheck.stderr);
 console.log('PASS: organic-launch mode removes placeholders and computes approved review averages correctly.');

 const {communityAnswers,getCommunityAnswer}=require(path.join(tmp,'community-answers.js'));
 assert.ok(communityAnswers.length>=90);assert.equal(new Set(communityAnswers.map(a=>a.slug)).size,communityAnswers.length);
 for(const a of communityAnswers){assert.ok(categories.some(c=>c.slug===a.category),a.slug);assert.ok(a.answer.length>100&&a.steps.length>=3&&a.checks.length>=3,a.slug);assert.ok(a.toolSlugs.length>=2,a.slug);for(const slug of a.toolSlugs)assert.ok(tools.some(t=>t.slug===slug),a.slug+' references '+slug);assert.ok(a.helpful>=0&&a.helpful<=70);assert.equal(getCommunityAnswer(a.slug),a);}
 console.log('PASS: every community question has a complete answer, valid tools, practical steps and bounded helpful counts.');
 const launchAnswers=spawnSync(process.execPath,['-e',`const a=require('node:assert/strict'),r=require(${JSON.stringify(path.join(tmp,'community-answers.js'))});a.ok(r.communityAnswers.every(x=>x.helpful===0));`],{env:{...process.env,NEXT_PUBLIC_DEMO_MODE:'false'},encoding:'utf8'});assert.equal(launchAnswers.status,0,launchAnswers.stderr);
 fs.writeFileSync(path.join(tmp,'helpful-blob.js'),`exports.records=new Map();exports.list=async({prefix,cursor})=>({blobs:[...exports.records.keys()].filter(p=>p.startsWith(prefix)).map(pathname=>({pathname})),hasMore:false});exports.put=async(pathname,body,options)=>{if(options.access!=='private')throw Error('private storage required');exports.records.set(pathname,body);};`);
 const helpfulSource=fs.readFileSync('app/api/helpful/route.ts','utf8').replace('@/lib/community-answers','./community-answers').replace('@vercel/blob','./helpful-blob');
 fs.writeFileSync(path.join(tmp,'helpful-route.js'),ts.transpileModule(helpfulSource,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
 const helpful=require(path.join(tmp,'helpful-route.js')),voteStore=require(path.join(tmp,'helpful-blob.js')),helpfulUrl='https://trutool-directory.vercel.app/api/helpful',firstAnswer=communityAnswers[0];
 const priorToken=process.env.BLOB_READ_WRITE_TOKEN;process.env.BLOB_READ_WRITE_TOKEN='isolated-validation-key';
 const voteRequest=(slug,cookie='')=>new Request(helpfulUrl,{method:'POST',headers:{Origin:'https://trutool-directory.vercel.app',Cookie:cookie},body:JSON.stringify({slug})});
 assert.equal((await helpful.POST(new Request(helpfulUrl,{method:'POST',headers:{Origin:'https://other.example'},body:'{}'}))).status,403);
 assert.equal((await helpful.POST(voteRequest('not-an-answer'))).status,400);assert.equal(voteStore.records.size,0);
 const vote=await helpful.POST(voteRequest(firstAnswer.slug));assert.equal(vote.status,200);assert.equal((await vote.json()).count,firstAnswer.helpful+1);
 const cookie=vote.headers.get('Set-Cookie').split(';')[0];assert.match(vote.headers.get('Set-Cookie'),/HttpOnly/);assert.match(vote.headers.get('Set-Cookie'),/Secure/);
 const repeat=await Promise.all([helpful.POST(voteRequest(firstAnswer.slug,cookie)),helpful.POST(voteRequest(firstAnswer.slug,cookie))]);for(const r of repeat)assert.equal((await r.json()).count,firstAnswer.helpful+1);assert.equal(voteStore.records.size,1);
 const refreshed=await helpful.GET(new Request(helpfulUrl+'?slugs='+firstAnswer.slug,{headers:{Cookie:cookie}}));assert.deepEqual((await refreshed.json()).counts[firstAnswer.slug],{count:firstAnswer.helpful+1,voted:true});
 const another=await helpful.POST(voteRequest(firstAnswer.slug));assert.equal((await another.json()).count,firstAnswer.helpful+2);assert.equal(voteStore.records.size,2);
 const otherSlug=communityAnswers[1].slug;await helpful.POST(voteRequest(otherSlug,cookie));assert.equal(voteStore.records.size,3);
 delete process.env.BLOB_READ_WRITE_TOKEN;assert.equal((await helpful.POST(voteRequest(otherSlug,cookie))).status,503);
 if(priorToken===undefined)delete process.env.BLOB_READ_WRITE_TOKEN;else process.env.BLOB_READ_WRITE_TOKEN=priorToken;
 console.log('PASS: helpful votes persist once per browser/answer, concurrent duplicate clicks do not inflate totals, reload preserves state, and invalid submissions cannot write.');
 const communitySource=fs.readFileSync('app/api/community/route.ts','utf8').replace('@/lib/catalog','./catalog').replace('@/lib/community-answers','./community-answers').replace('@vercel/blob','./helpful-blob');
 fs.writeFileSync(path.join(tmp,'community-route.js'),ts.transpileModule(communitySource,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
 const community=require(path.join(tmp,'community-route.js')),communityUrl='https://trutool-directory.vercel.app/api/community';
 const communityRequest=(body,origin='https://trutool-directory.vercel.app')=>new Request(communityUrl,{method:'POST',headers:{Origin:origin},body:JSON.stringify(body)});
 const example={kind:'question',name:'Isolated fixture',email:'',category:'ai',question:'Which tool fits a small team?',message:'',consent:true,website:''};
 const before=voteStore.records.size;process.env.BLOB_READ_WRITE_TOKEN='isolated-community-validation-key';
 assert.equal((await community.POST(communityRequest(example,'https://other.example'))).status,403);
 assert.equal((await community.POST(communityRequest({...example,consent:false}))).status,400);
 assert.equal((await community.POST(communityRequest({...example,question:'Short'}))).status,400);
 assert.equal((await community.POST(communityRequest({...example,email:'invalid'}))).status,400);
 assert.equal((await community.POST(communityRequest({...example,category:'missing'}))).status,400);
 assert.equal((await community.POST(communityRequest({...example,website:'spam'}))).status,400);
 assert.equal(voteStore.records.size,before);
 const posted=await community.POST(communityRequest(example));assert.equal(posted.status,200);assert.ok((await posted.json()).id);
 let stored=[...voteStore.records.entries()].filter(([key])=>key.startsWith('community-submissions/')).map(([,body])=>JSON.parse(body));assert.equal(stored.length,1);assert.equal(stored[0].status,'pending');assert.equal(stored[0].question,example.question);assert.ok(!('email' in stored[0]));assert.ok(!('ip' in stored[0]));
 const perspective={...example,kind:'perspective',question:undefined,answerSlug:firstAnswer.slug,message:'This is an isolated validation of context and privacy.'};assert.equal((await community.POST(communityRequest({...perspective,answerSlug:'missing'}))).status,400);assert.equal((await community.POST(communityRequest(perspective))).status,200);
 stored=[...voteStore.records.entries()].filter(([key])=>key.startsWith('community-submissions/')).map(([,body])=>JSON.parse(body));assert.equal(stored.find(x=>x.kind==='perspective').answerSlug,firstAnswer.slug);
 for(let i=0;i<3;i++)assert.equal((await community.POST(communityRequest(example))).status,200);assert.equal((await community.POST(communityRequest(example))).status,429);
 if(priorToken===undefined)delete process.env.BLOB_READ_WRITE_TOKEN;else process.env.BLOB_READ_WRITE_TOKEN=priorToken;
 const answerPage=fs.readFileSync('app/community/[slug]/page.tsx','utf8');assert.ok(!answerPage.includes('answer-cover')&&!answerPage.includes('next/image'));assert.ok(answerPage.includes('/community?answer='));assert.ok(!answerPage.includes('/contact?message='));
 console.log('PASS: community questions and perspectives save privately for review, optional email works, context survives, invalid/spam submissions cannot write, and submissions are limited.');
 const reviewUrl='https://trutool-directory.vercel.app/api/reviews';
 const invalidOrigin=await POST(new Request(reviewUrl,{method:'POST',headers:{Origin:'https://example.com'},body:'{}'}));assert.equal(invalidOrigin.status,403);
 const invalidRating=await POST(new Request(reviewUrl,{method:'POST',headers:{Origin:'https://trutool-directory.vercel.app'},body:JSON.stringify({slug:'chatgpt',rating:8,consent:true,name:'QA check',email:'qa@example.com',message:'Validation check; no review should be stored.'})}));assert.equal(invalidRating.status,400);
 const missingConsent=await POST(new Request(reviewUrl,{method:'POST',headers:{Origin:'https://trutool-directory.vercel.app'},body:JSON.stringify({slug:'chatgpt',rating:3,name:'QA check',email:'qa@example.com',message:'Validation check; no review should be stored.'})}));assert.equal(missingConsent.status,400);
 console.log('PASS: review endpoint rejects foreign origins, invalid ratings, and missing consent without writing data.');
 const assets=JSON.parse(fs.readFileSync('lib/catalog-brand-assets.json','utf8'));for(const src of Object.values(assets))assert.ok(fs.existsSync('public'+src),src);
 assert.equal(new Set(guides.map(g=>g.slug)).size,guides.length);
 for(const g of guides){assert.ok(categories.some(c=>c.slug===g.category),g.slug);for(const field of ['publishedAt','updatedAt'])if(g[field])assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(g[field])&&!Number.isNaN(Date.parse(g[field])),g.slug+' '+field)}
 const {pairs,catalogueTotals,categoryCounts}=require(path.join(tmp,'catalog.js'));
 for(const [a,b] of pairs)assert.ok(a!==b&&tools.some(t=>t.slug===a)&&tools.some(t=>t.slug===b),'Comparison: '+a+' vs '+b);
 assert.equal(catalogueTotals.tools,tools.length);assert.equal(catalogueTotals.categories,categories.length);assert.equal(catalogueTotals.guides,guides.length);
 for(const c of categories)assert.equal(categoryCounts[c.slug],tools.filter(t=>t.category===c.slug).length);
 const {toolResults}=require(path.join(tmp,'catalog-results.js'));
 const first=toolResults(),second=toolResults('','','relevance',2);
 assert.equal(first.total,tools.length);assert.equal(first.items.length,24);assert.equal(second.page,2);assert.ok(!first.items.some(t=>second.items.some(x=>x.slug===t.slug)));
 assert.ok(first.items.every(t=>t.categoryLabel&&!('fit' in t)&&!('features' in t)),'Compact search responses');
 assert.equal(toolResults('','','',Infinity,Infinity).limit,24);assert.equal(toolResults('','','',999999).page,first.pages);
 assert.equal(toolResults('','nonexistent-category').total,0);assert.ok(toolResults('chagpt','','',1,6).items.some(t=>t.slug==='chatgpt'));
 // Simulate publication in an isolated catalogue: never add QA content to the site.
 const fixture=JSON.parse(fs.readFileSync(path.join(tmp,'expanded-catalog.json'),'utf8'));
 fixture.categories.push({...fixture.categories[0],slug:'qa-fixture-category',name:'QA Fixture category'});
 fixture.tools.push({...fixture.tools[0],slug:'qa-catalogue-fixture',name:'QA Catalogue Fixture',category:'qa-fixture-category'});
 fs.writeFileSync(path.join(tmp,'expanded-catalog.json'),JSON.stringify(fixture));
 fs.appendFileSync(path.join(tmp,'guides.js'),"\nexports.additionalGuides.push({...exports.additionalGuides[0],slug:'qa-guide-fixture',category:'qa-fixture-category',publishedAt:'2026-10-06'});\n");
 for(const file of ['catalog.js','expanded-catalog.json','guides.js','search.js','catalog-results.js'])delete require.cache[path.join(tmp,file)];
 const fresh=require(path.join(tmp,'catalog.js')),results=require(path.join(tmp,'catalog-results.js'));
 assert.equal(fresh.catalogueTotals.tools,tools.length+1);assert.equal(fresh.catalogueTotals.categories,categories.length+1);assert.equal(fresh.catalogueTotals.guides,guides.length+1);assert.equal(fresh.categoryCounts['qa-fixture-category'],1);
 assert.equal(fresh.latestGuides[0].slug,'qa-guide-fixture');assert.equal(results.toolResults('QA Catalogue Fixture').items[0].slug,'qa-catalogue-fixture');assert.ok(results.categoryOptions.some(c=>c.slug==='qa-fixture-category'));
 // The exact sitemap generator must include every newly published entity.
 const sitemapSource=fs.readFileSync('app/sitemap.ts','utf8').replaceAll('@/lib/','./');
 for(const [file,source] of [['services',fs.readFileSync('lib/services.ts','utf8')],['sitemap',sitemapSource]])fs.writeFileSync(path.join(tmp,file+'.js'),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
 const entries=require(path.join(tmp,'sitemap.js')).default();for(const a of communityAnswers)assert.ok(entries.some(e=>e.url.endsWith('/community/'+a.slug))); for(const suffix of ['/tools/qa-catalogue-fixture','/alternatives/qa-catalogue-fixture','/categories/qa-fixture-category','/guides/qa-guide-fixture'])assert.ok(entries.some(e=>e.url.endsWith(suffix)),suffix);
 assert.equal(new Set(entries.map(e=>e.url)).size,entries.length);
 console.log('PASS: publishing a tool/category/guide updates totals, menus, search, newest guides and sitemap; pagination and compact API data verified.');
 console.log(`PASS: ${tools.length} unique tools, ${categories.length} populated categories, ${guides.length} guides, ${Object.keys(assets).length} local catalogue brand assets; exact-name/task searches and all diagnostic paths.`);
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
