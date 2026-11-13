import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadContent} from './load-content.mjs';
const {index,discovery,schema,sitemap,cleanup}=loadContent();
try{
 const paths=new Set(index.contentPages.map(p=>p.path));assert.equal(paths.size,index.contentPages.length,'Duplicate canonical path');
 assert.ok(!paths.has('/tools/kit-email')&&!paths.has('/alternatives/kit-email'),'Duplicate Kit vendor profiles should redirect instead of appearing as separate canonical pages');
 const nextConfig=fs.readFileSync('next.config.ts','utf8');
 for(const [source,destination] of [['/tools/kit-email','/tools/kit'],['/alternatives/kit-email','/alternatives/kit']])
  assert.ok(nextConfig.includes(`source:'${source}',destination:'${destination}',permanent:true`),`Missing permanent alias redirect ${source}`);

 const history=JSON.parse(fs.readFileSync('lib/content-history.json','utf8'));
 for(const page of index.contentPages){
  const graph=schema.pageStructuredData(page.path);assert.ok(graph,'Missing schema: '+page.path);
  const main=graph['@graph'][0];assert.equal(main.url,index.absolute(page.path||'/'));assert.ok(main.name&&main.description);
  const serialized=schema.serializeSchema(graph);JSON.parse(serialized);assert.ok(!serialized.includes('<script'));
  const types=graph['@graph'].map(n=>n['@type']);if(page.path){assert.ok(types.includes('BreadcrumbList'));assert.ok(graph['@graph'].find(n=>n['@type']==='BreadcrumbList').itemListElement.length>=2)}
  if(page.kind==='tool')assert.ok(types.some(t=>['SoftwareApplication','Organization'].includes(t)));
  if(page.kind==='guide'||page.kind==='answer')assert.equal(main['@type'],'Article');
  if(page.kind==='alternatives'){const list=graph['@graph'].find(n=>n['@type']==='ItemList');assert.ok(list.numberOfItems<=6,'Automated alternatives must have a bounded shortlist');assert.equal(list.numberOfItems,list.itemListElement.length)}
  assert.ok(!serialized.includes('aggregateRating'),'Invented aggregate rating');assert.ok(!serialized.includes('"offers"'),'Unverified offer');
  assert.ok(discovery.pageMarkdown(page).includes('Canonical: '+index.absolute(page.path||'/')));
  const modified=index.modifiedFor(page);assert.ok(modified&&Number.isFinite(Date.parse(modified)));assert.ok(Date.parse(modified)<=Date.now());
  assert.ok(history[page.path],'Untracked page: '+page.path);
 }
 assert.equal(index.getContentPage('/tools/does-not-exist'),undefined);
 // Legal/editorial takedown: the former AI video product is removed from all
 // public canonical inventories, sitemap URLs, comparisons and derived listings.
 const removedCatalog=JSON.parse(fs.readFileSync('lib/ai-catalog.json','utf8'));
 assert.ok(!removedCatalog.tools.some(t=>t.slug==='hedra'||t.name?.toLowerCase()==='hedra'),'Removed vendor remains in source catalogue');
 for(const removed of ['/tools/hedra','/alternatives/hedra'])assert.equal(index.getContentPage(removed),undefined,'Removed vendor still generates a canonical page: '+removed);
 assert.ok(!index.contentPages.some(page=>JSON.stringify(page).toLowerCase().includes('hedra')),'Public inventory still contains removed vendor');
 assert.ok(!sitemap.sitemapEntries(index.contentPages).some(entry=>new URL(entry.url).pathname.includes('hedra')),'Sitemap must not list removed vendor URLs');
 const cmsSource=fs.readFileSync('lib/cms-public.ts','utf8');
 assert.ok(cmsSource.includes('isRemovedBrandContent')&&cmsSource.includes('if(isRemovedBrandContent(c))continue'),
   'Published CMS pages must not reintroduce the withdrawn vendor');


 assert.equal(schema.pageStructuredData('/does-not-exist'),undefined);
 assert.ok(schema.pageStructuredData('/compare/claude-vs-chatgpt'));
 assert.equal(index.comparisonCanonicalPath('claude-vs-chatgpt'),'/compare/chatgpt-vs-claude');
 assert.equal(index.comparisonCanonicalPath('chatgpt-vs-claude'),'/compare/chatgpt-vs-claude');
 assert.equal(index.comparisonCanonicalPath('does-not-exist-vs-chatgpt'),undefined);
 assert.equal(index.pairs.length,50,'Compare allowlist is the 50-slug list');
 assert.deepEqual(index.pairs.slice(0,7),[['chatgpt','claude'],['notion','obsidian'],['figma','canva'],['synup','yext'],['inventive-ai','loopio'],['slack','microsoft-teams'],['staragile','simplilearn']],'Keep the original curated display order');
 assert.equal(index.comparisonCanonicalPath('smallpdf-vs-adobe-acrobat'),'/compare/smallpdf-vs-adobe-acrobat');
 assert.equal(index.comparisonCanonicalPath('adobe-acrobat-vs-smallpdf'),'/compare/smallpdf-vs-adobe-acrobat');
 assert.equal(index.comparisonCanonicalPath('jan-vs-chatbox-ai'),'/compare/jan-vs-chatbox-ai');
 assert.equal(index.comparisonCanonicalPath('chatbox-ai-vs-jan'),'/compare/jan-vs-chatbox-ai');
 assert.equal(index.allowlistedCompareRedirect('claude,chatgpt'),'/compare/chatgpt-vs-claude');
 assert.equal(index.allowlistedCompareRedirect('chatgpt,claude'),'/compare/chatgpt-vs-claude');
 assert.equal(index.allowlistedCompareRedirect(' chatgpt , claude '),'/compare/chatgpt-vs-claude');
 assert.equal(index.allowlistedCompareRedirect('jan,chatbox-ai'),'/compare/jan-vs-chatbox-ai');
 assert.equal(index.allowlistedCompareRedirect('chatgpt,gemini'),undefined);
 assert.equal(index.allowlistedCompareRedirect('chatgpt,claude,gemini'),undefined);
 assert.equal(index.allowlistedCompareRedirect('chatgpt'),undefined);
 assert.deepEqual(index.compareRobots('chatgpt-vs-claude'),{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1}});
 assert.equal(index.compareRobots('claude-vs-chatgpt').index,true);
 assert.equal(index.compareRobots('chatgpt-vs-gemini').index,false);
 assert.equal(index.compareRobots('chatgpt-vs-gemini').follow,true);
 assert.equal(index.comparisonCanonicalPath('gemini-vs-chatgpt'),'/compare/chatgpt-vs-gemini');
 const comparePaths=index.contentPages.filter(p=>p.path==='/compare'||p.path.startsWith('/compare/')).map(p=>p.path);
 assert.deepEqual(comparePaths,['/compare',...index.pairs.map(([a,b])=>'/compare/'+a+'-vs-'+b)]);
 const xmlCompare=sitemap.sitemapEntries(index.contentPages).map(entry=>new URL(entry.url).pathname).filter(p=>p==='/compare'||/^\/compare\/[^/]+$/.test(p));
 assert.equal(xmlCompare.length,index.pairs.length+1,'Sitemap compare paths are the hub plus the allowlist');
 assert.ok(!xmlCompare.includes('/compare/chatgpt-vs-gemini'),'Tail compare paths stay out of the sitemap');
 assert.ok(!index.contentPages.some(p=>p.path==='/compare/chatgpt-vs-gemini'));
 assert.equal(index.ALTERNATIVES_COMPARE_LINK_LIMIT,5);
 const janPartners=index.pairs.flatMap(([a,b])=>a==='jan'?[b]:b==='jan'?[a]:[]);
 assert.deepEqual(janPartners,['msty','chatbox-ai','tencent-yuanbao','librechat']);
 for(const page of index.contentPages){const pieces=page.path.split('/').filter(Boolean),template=pieces.length>1?`app/${pieces[0]}/[slug]/page.tsx`:page.path?`app${page.path}/page.tsx`:'app/page.tsx';assert.ok(fs.readFileSync(template,'utf8').includes('<PageStructuredData'),'Schema component absent: '+template)}
 const feed=discovery.jsonFeed();assert.equal(new Set(feed.items.map(i=>i.id)).size,feed.items.length);assert.ok(feed.items.length===100);for(const i of feed.items)assert.ok(paths.has(new URL(i.url).pathname));
 assert.ok(discovery.rss().includes('<rss version="2.0"'));assert.ok(discovery.atom().includes('http://www.w3.org/2005/Atom'));assert.ok(discovery.llmsIndex().startsWith('# TruTool\n'));
 for(const match of discovery.llmsIndex().matchAll(/\]\((https?:\/\/[^)]+)\)/g)){const url=new URL(match[1]);assert.equal(url.origin,new URL(index.absolute('/')).origin);if(url.pathname.endsWith('.md'))assert.ok(index.getContentPage(url.pathname==='/index.md'?'':url.pathname.slice(0,-3)),url.href)}
 const alternativesSource=fs.readFileSync('app/alternatives/[slug]/page.tsx','utf8');
 assert.ok(alternativesSource.includes("'/compare?tools='+encodeURIComponent(t.slug+','+x.slug)"),'Non-allowlist alternatives keep query comparison links.');
 assert.ok(alternativesSource.includes('allowlistedComparePath(t.slug,x.slug)'),'Allowlisted alternatives use the canonical compare path.');
 assert.ok(alternativesSource.includes('ALTERNATIVES_COMPARE_LINK_LIMIT'),'Alternatives path links are capped.');
 assert.ok(!alternativesSource.includes("href={'/compare/'+t.slug+'-vs-'+x.slug}"),'Do not generate thousands of uncurated crawlable comparison URLs.');
 const proxySource=fs.readFileSync('proxy.ts','utf8');
 assert.ok(proxySource.includes('allowlistedCompareRedirect'),'Allowlisted query pairs redirect before render.');
 assert.ok(proxySource.includes("'/tools/hedra'")&&proxySource.includes("'/alternatives/hedra'"),'Removed product and alternatives routes must be covered');
 assert.match(proxySource,/status: 410/,'Old vendor routes must return HTTP 410 Gone');

 assert.match(proxySource,/NextResponse\.redirect\(\s*target,\s*301\s*\)/,'Allowlisted query pairs use HTTP 301.');
 const comparePage=fs.readFileSync('app/compare/page.tsx','utf8');
 assert.ok(comparePage.includes("canonical:SITE+'/compare'")||comparePage.includes("SITE+'/compare'"),'The compare hub stays canonical.');
 assert.ok(comparePage.includes('index:false'),'Unlisted compare?tools= queries are noindex.');
 assert.ok(fs.readFileSync('app/robots.ts','utf8').includes("'/api/'"),'Robots disallows /api/.');
 assert.ok(fs.readFileSync('app/api/logo/route.ts','utf8').includes('image/svg+xml'),'Missing logos return an SVG placeholder.');
 assert.ok(!fs.readFileSync('app/api/logo/route.ts','utf8').includes('status:404'),'Logo route must not answer 404.');
 assert.ok(proxySource.includes("X-Robots-Tag', 'noindex, follow'"),'Unlisted compare queries send noindex before render.');
 const compareSlug=fs.readFileSync('app/compare/[slug]/page.tsx','utf8');
 assert.ok(compareSlug.includes('withCompareRobots'),'Tail compare paths must be able to noindex.');
 console.log(`SEO verification passed: ${index.contentPages.length} canonical pages have valid schema graphs, dates, breadcrumbs, and Markdown references. RSS, Atom, JSON Feed, and llms.txt checked.`);
}finally{cleanup()}
