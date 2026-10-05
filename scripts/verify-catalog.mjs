import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'trutool-catalog-'));
try{
 fs.writeFileSync(path.join(tmp,'package.json'),'{"type":"commonjs"}');
 for(const file of ['catalog','guides','search','diagnostic','catalog-results'])fs.writeFileSync(path.join(tmp,file+'.js'),ts.transpileModule(fs.readFileSync('lib/'+file+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
 fs.copyFileSync('lib/expanded-catalog.json',path.join(tmp,'expanded-catalog.json'));
 fs.copyFileSync('lib/core-source-dates.json',path.join(tmp,'core-source-dates.json'));
 const require=createRequire(import.meta.url),{tools,categories,guides}=require(path.join(tmp,'catalog.js')),{searchTools}=require(path.join(tmp,'search.js')),{workflows,validateBrief,pilotPlan,guideFor,matchTools,defaultWeights}=require(path.join(tmp,'diagnostic.js'));
 assert.ok(tools.length>=501);assert.ok(categories.length>40);assert.equal(new Set(tools.map(t=>t.slug)).size,tools.length);assert.equal(new Set(categories.map(c=>c.slug)).size,categories.length);
 for(const t of tools){assert.ok(categories.some(c=>c.slug===t.category),t.slug);assert.match(new URL(t.url).protocol,/https?:/);assert.ok(t.summary&&t.fit&&t.caution&&t.features.length,t.slug);assert.equal(searchTools(t.name)[0]?.slug,t.slug,'Name search: '+t.name)}
 for(const c of categories){assert.ok(tools.some(t=>t.category===c.slug),c.slug);const brief={category:c.slug,workflow:workflows[c.slug][0][0],scale:'team',style:'balanced'};assert.ok(validateBrief(brief));assert.equal(pilotPlan(brief).length,3);assert.ok(guideFor(c.slug));assert.ok(matchTools(brief,defaultWeights).length)}
 for(const [q,expected] of [['chagpt','chatgpt'],['remove image backgrounds','remove-bg'],['AI research assistants','perplexity'],['RFP response software','inventive-ai'],['meeting notes','otter'],['password manager','1password'],['create presentations','gamma'],['no-code app builders','bubble']]){const result=searchTools(q).slice(0,20);console.log(q,':',result.slice(0,6).map(t=>t.name).join(', '));assert.ok(result.some(t=>t.slug===expected),'Task search: '+q+' should include '+expected)}
 fs.symlinkSync(path.resolve('node_modules'),path.join(tmp,'node_modules'),'dir');
 const reviewSource=fs.readFileSync('app/api/reviews/route.ts','utf8').replace("@/lib/catalog","./catalog");
 fs.writeFileSync(path.join(tmp,'review-route.js'),ts.transpileModule(reviewSource,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
 const {POST}=require(path.join(tmp,'review-route.js'));
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
 const entries=require(path.join(tmp,'sitemap.js')).default();for(const suffix of ['/tools/qa-catalogue-fixture','/alternatives/qa-catalogue-fixture','/categories/qa-fixture-category','/guides/qa-guide-fixture'])assert.ok(entries.some(e=>e.url.endsWith(suffix)),suffix);
 assert.equal(new Set(entries.map(e=>e.url)).size,entries.length);
 console.log('PASS: publishing a tool/category/guide updates totals, menus, search, newest guides and sitemap; pagination and compact API data verified.');
 console.log(`PASS: ${tools.length} unique tools, ${categories.length} populated categories, ${guides.length} guides, ${Object.keys(assets).length} local catalogue brand assets; exact-name/task searches and all diagnostic paths.`);
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
