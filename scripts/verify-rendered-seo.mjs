import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {loadContent} from './load-content.mjs';
const {index,cleanup}=loadContent();
try{
 let count=0;
 for(const page of index.contentPages){
  const file=path.join('.next/server/app',page.path?page.path.slice(1)+'.html':'index.html');
  if(!fs.existsSync(file))continue; // Query-driven directories render at request time and are checked over HTTP.
  const html=fs.readFileSync(file,'utf8'),scripts=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  assert.ok(scripts.some(s=>s['@graph']?.some(n=>n.url===index.absolute(page.path||'/')&&['WebPage','CollectionPage','Article','ProfilePage','ContactPage','AboutPage'].includes(n['@type']))),'Missing rendered page graph: '+page.path);
  assert.ok(scripts.some(s=>s['@graph']?.some(n=>n['@type']==='WebSite')),'Missing WebSite graph');
  assert.ok(html.includes('<meta name="description" content="'),'Missing description: '+page.path);
  assert.ok(html.includes('rel="canonical"'),'Missing canonical: '+page.path);
  assert.ok(!/<meta name="robots"[^>]*content="[^"]*noindex/.test(html),'Unexpected noindex: '+page.path);
  assert.ok(html.includes('application/rss+xml')&&html.includes('text/markdown'),'Missing discovery links: '+page.path);
  count++;
 }
 assert.ok(count>4000,'Too few rendered pages validated');
 console.log(`Rendered SEO verification passed: ${count} generated HTML pages have page schema, site schema, canonical URLs, descriptions, indexing permission, and discovery links.`);
}finally{cleanup()}
