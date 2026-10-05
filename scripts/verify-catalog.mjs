import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'trutool-catalog-'));
try{
 fs.writeFileSync(path.join(tmp,'package.json'),'{"type":"commonjs"}');
 for(const file of ['catalog','guides','search','diagnostic'])fs.writeFileSync(path.join(tmp,file+'.js'),ts.transpileModule(fs.readFileSync('lib/'+file+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
 fs.copyFileSync('lib/expanded-catalog.json',path.join(tmp,'expanded-catalog.json'));
 const require=createRequire(import.meta.url),{tools,categories,guides}=require(path.join(tmp,'catalog.js')),{searchTools}=require(path.join(tmp,'search.js')),{workflows,validateBrief,pilotPlan,guideFor,matchTools,defaultWeights}=require(path.join(tmp,'diagnostic.js'));
 assert.ok(tools.length>=501);assert.ok(categories.length>40);assert.equal(new Set(tools.map(t=>t.slug)).size,tools.length);assert.equal(new Set(categories.map(c=>c.slug)).size,categories.length);
 for(const t of tools){assert.ok(categories.some(c=>c.slug===t.category),t.slug);assert.match(new URL(t.url).protocol,/https?:/);assert.ok(t.summary&&t.fit&&t.caution&&t.features.length,t.slug);assert.equal(searchTools(t.name)[0]?.slug,t.slug,'Name search: '+t.name)}
 for(const c of categories){assert.ok(tools.some(t=>t.category===c.slug),c.slug);const brief={category:c.slug,workflow:workflows[c.slug][0][0],scale:'team',style:'balanced'};assert.ok(validateBrief(brief));assert.equal(pilotPlan(brief).length,3);assert.ok(guideFor(c.slug));assert.ok(matchTools(brief,defaultWeights).length)}
 for(const [q,expected] of [['chagpt','chatgpt'],['remove image backgrounds','remove-bg'],['AI research assistants','perplexity'],['RFP response software','inventive-ai'],['meeting notes','otter'],['password manager','1password'],['create presentations','gamma'],['no-code app builders','bubble']]){const result=searchTools(q).slice(0,20);console.log(q,':',result.slice(0,6).map(t=>t.name).join(', '));assert.ok(result.some(t=>t.slug===expected),'Task search: '+q+' should include '+expected)}
 const assets=JSON.parse(fs.readFileSync('lib/catalog-brand-assets.json','utf8'));for(const src of Object.values(assets))assert.ok(fs.existsSync('public'+src),src);
 for(const g of guides)assert.ok(categories.some(c=>c.slug===g.category),g.slug);
 console.log(`PASS: ${tools.length} unique tools, ${categories.length} populated categories, ${guides.length} guides, ${Object.keys(assets).length} local catalogue brand assets; exact-name/task searches and all diagnostic paths.`);
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
