import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadContent} from './load-content.mjs';
const {index,discovery,schema,cleanup}=loadContent();
try{
 const paths=new Set(index.contentPages.map(p=>p.path));assert.equal(paths.size,index.contentPages.length,'Duplicate canonical path');
 const history=JSON.parse(fs.readFileSync('lib/content-history.json','utf8'));
 for(const page of index.contentPages){
  const graph=schema.pageStructuredData(page.path);assert.ok(graph,'Missing schema: '+page.path);
  const main=graph['@graph'][0];assert.equal(main.url,index.absolute(page.path||'/'));assert.ok(main.name&&main.description);
  const serialized=schema.serializeSchema(graph);JSON.parse(serialized);assert.ok(!serialized.includes('<script'));
  const types=graph['@graph'].map(n=>n['@type']);if(page.path){assert.ok(types.includes('BreadcrumbList'));assert.ok(graph['@graph'].find(n=>n['@type']==='BreadcrumbList').itemListElement.length>=2)}
  if(page.kind==='tool')assert.ok(types.some(t=>['SoftwareApplication','Organization'].includes(t)));
  if(page.kind==='guide'||page.kind==='answer')assert.equal(main['@type'],'Article');
  if(page.kind==='alternatives'){const list=graph['@graph'].find(n=>n['@type']==='ItemList');assert.equal(list.numberOfItems,index.relatedTools(page).length)}
  assert.ok(!serialized.includes('aggregateRating'),'Invented aggregate rating');assert.ok(!serialized.includes('"offers"'),'Unverified offer');
  assert.ok(discovery.pageMarkdown(page).includes('Canonical: '+index.absolute(page.path||'/')));
  const modified=index.modifiedFor(page);assert.ok(modified&&Number.isFinite(Date.parse(modified)));assert.ok(Date.parse(modified)<=Date.now());
  assert.ok(history[page.path],'Untracked page: '+page.path);
 }
 assert.equal(index.getContentPage('/tools/does-not-exist'),undefined);
 assert.equal(schema.pageStructuredData('/does-not-exist'),undefined);
 assert.ok(schema.pageStructuredData('/compare/claude-vs-chatgpt'));
 assert.equal(index.comparisonCanonicalPath('claude-vs-chatgpt'),'/compare/chatgpt-vs-claude');
 assert.equal(index.comparisonCanonicalPath('chatgpt-vs-claude'),'/compare/chatgpt-vs-claude');
 assert.equal(index.comparisonCanonicalPath('does-not-exist-vs-chatgpt'),undefined);
 for(const page of index.contentPages){const pieces=page.path.split('/').filter(Boolean),template=pieces.length>1?`app/${pieces[0]}/[slug]/page.tsx`:page.path?`app${page.path}/page.tsx`:'app/page.tsx';assert.ok(fs.readFileSync(template,'utf8').includes('<PageStructuredData'),'Schema component absent: '+template)}
 const feed=discovery.jsonFeed();assert.equal(new Set(feed.items.map(i=>i.id)).size,feed.items.length);assert.ok(feed.items.length===100);for(const i of feed.items)assert.ok(paths.has(new URL(i.url).pathname));
 assert.ok(discovery.rss().includes('<rss version="2.0"'));assert.ok(discovery.atom().includes('http://www.w3.org/2005/Atom'));assert.ok(discovery.llmsIndex().startsWith('# TruTool\n'));
 for(const match of discovery.llmsIndex().matchAll(/\]\((https?:\/\/[^)]+)\)/g)){const url=new URL(match[1]);assert.equal(url.origin,new URL(index.absolute('/')).origin);if(url.pathname.endsWith('.md'))assert.ok(index.getContentPage(url.pathname==='/index.md'?'':url.pathname.slice(0,-3)),url.href)}
 console.log(`SEO verification passed: ${index.contentPages.length} canonical pages have valid schema graphs, dates, breadcrumbs, and Markdown references. RSS, Atom, JSON Feed, and llms.txt checked.`);
}finally{cleanup()}
