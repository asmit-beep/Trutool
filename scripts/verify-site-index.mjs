import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { loadContent } from './load-content.mjs';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'trutool-site-index-'));
const content = loadContent();
try {
  fs.writeFileSync(path.join(tmp, 'package.json'), '{"type":"commonjs"}');
  const compiled = ts.transpileModule(fs.readFileSync('lib/site-index.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  fs.writeFileSync(path.join(tmp, 'site-index.js'), compiled);
  const require = createRequire(import.meta.url);
  const { groupSiteIndex, siteIndexPaths, siteIndexPagePath, siteIndexSections, SITE_INDEX_PAGE_SIZE } = require(path.join(tmp, 'site-index.js'));
  const pages = content.index.contentPages;
  const groups = groupSiteIndex(pages);
  const groupedPaths = groups.flatMap(group => group.pages.map(page => page.path));
  assert.equal(groupedPaths.length, pages.length, 'The HTML site index must include all canonical public pages.');
  assert.equal(new Set(groupedPaths).size, groupedPaths.length, 'No page can appear twice in the HTML index.');
  assert.deepEqual(new Set(groupedPaths), new Set(pages.map(page => page.path)), 'The HTML directory and canonical inventory must match.');
  const paths = siteIndexPaths(pages);
  assert.equal(new Set(paths).size, paths.length, 'Directory URLs must be unique.');
  assert.ok(paths.includes('/site-index'));
  for (const group of groups) {
    assert.ok(siteIndexSections.some(s => s.id === group.id));
    assert.equal(group.chunks, Math.ceil(group.count / SITE_INDEX_PAGE_SIZE));
    const listed = [];
    for (let number = 1; number <= group.chunks; number++) {
      const directoryPath = siteIndexPagePath(group.id, number);
      assert.ok(paths.includes(directoryPath), 'A directory pagination page was omitted from the sitemap: ' + directoryPath);
      listed.push(...group.pages.slice((number - 1) * SITE_INDEX_PAGE_SIZE, number * SITE_INDEX_PAGE_SIZE));
    }
    assert.equal(listed.length, group.count);
  }
  for (const path of paths) assert.ok(!path.startsWith('/admin') && !path.startsWith('/api/'));
  const visibilitySource=fs.readFileSync('lib/visibility-refresh.ts','utf8');
  assert.ok(visibilitySource.includes("revalidatePath('/site-index')") && visibilitySource.includes("revalidatePath('/site-index/[section]/[page]', 'page')"), 'Publishing must refresh the complete HTML site index.');
  const sitemapSource = fs.readFileSync('app/sitemap.ts', 'utf8');
  assert.ok(sitemapSource.includes('sitemapEntries(await publicPages())'), 'XML sitemap must include published CMS pages and public inventory.');
  // The fallback inventory must retain the canonical URL of each previously
  // published original CMS record when Supabase is restricted.
  const backup=[...JSON.parse(fs.readFileSync('lib/recovered-published-guides.json','utf8')),
    ...JSON.parse(fs.readFileSync('lib/recovered-published-comparisons.json','utf8'))];
  const backupPaths=backup.map(c=>('/'+(c.kind==='guide'?'guides':'compare')+'/'+c.slug));
  assert.equal(new Set(backupPaths).size,backupPaths.length,'Duplicate recovered CMS canonical path');
  for(const c of backup)assert.ok(c.publishedAt&&c.body?.length>=80,'Published CMS recovery content is incomplete: '+c.slug);
  const recoveredOnly=backupPaths.filter(p=>!pages.some(entry=>entry.path===p));
  const recoveredPages=recoveredOnly.map(p=>({path:p,title:p,description:'Recovered published editorial content',kind:'guide'}));
  const recoveryXml=new Set(content.sitemap.sitemapEntries([...pages,...recoveredPages]).map(entry=>new URL(entry.url).pathname));
  for(const p of backupPaths)assert.ok(recoveryXml.has(p),'Sitemap excludes recovered published CMS URL: '+p);

  // Regression: new eligible editorial content is listed automatically without
  // a source-control keep-list update, while thin directory pages remain out.
  const cmsFixture = kind => ({
    path: '/' + ({ guide: 'guides', news: 'news', answer: 'community', service: 'services', author: 'authors', tool: 'tools', alternatives: 'alternatives' }[kind]) + '/published-fixture',
    title: 'Editorial fixture', description: 'Independent original page for testing.',
    kind: kind === 'news' ? 'guide' : kind, cms: {
      kind, slug: 'published-fixture', image: '',
      publishedAt: '2026-11-19T12:00:00.000Z', updatedAt: '2026-11-19T14:00:00.000Z',
    },
  });
  const editorialCms=['guide','news','answer','service','author'].map(cmsFixture);
  const cmsXml=content.sitemap.sitemapEntries([...pages,...editorialCms,cmsFixture('tool'),cmsFixture('alternatives')]);
  for (const fixture of editorialCms) assert.ok(cmsXml.some(entry=>new URL(entry.url).pathname===fixture.path),
    'New published CMS page omitted: '+fixture.path);
  for(const kind of ['tool','alternatives']) assert.ok(!cmsXml.some(entry=>new URL(entry.url).pathname===cmsFixture(kind).path),
    'Non-allowlisted thin directory page must remain out: '+kind);
  for(const entry of cmsXml) assert.equal(entry.priority,undefined, 'Sitemap priorities should be omitted.');
  const sortable=entry=>entry.lastModified?Date.parse(entry.lastModified):-1;
  assert.ok(cmsXml.every((entry,i)=>i===0||sortable(cmsXml[i-1])>=sortable(entry)),
    'Sitemap must be globally sorted by actual modification date descending.');
  assert.ok(new Set(cmsXml.map(e=>e.url)).size===cmsXml.length, 'Sitemap must deduplicate canonical URLs.');
  assert.ok(!cmsXml.some(entry=>entry.url.endsWith('/tools/hedra')||entry.url.includes('/site-index/')),
    'Withdrawn or HTML-index pages cannot enter the XML sitemap.');

  const xmlPaths = content.sitemap.sitemapEntries(pages).map(entry => new URL(entry.url).pathname);
  const keep = new Set(JSON.parse(fs.readFileSync('lib/index-keep-paths.json', 'utf8')));
  assert.equal(new Set(xmlPaths).size, xmlPaths.length, 'Duplicate canonical URL in XML sitemap.');
  assert.ok(!xmlPaths.some(path => path.startsWith('/site-index')), 'HTML index pagination is not submitted in the XML sitemap.');
  assert.ok(!xmlPaths.includes('/tools/hedra'), 'Withdrawn vendor stays out of the sitemap.');
  for (const page of pages) {
    const path = page.path || '/';
    const thinDirectory = (page.kind === 'tool' || page.kind === 'alternatives') && !keep.has(path);
    if (thinDirectory || path === '/tools/hedra') assert.ok(!xmlPaths.includes(path), 'Sitemap submitted a non-indexable URL: ' + path);
    else if (keep.has(path) || path.startsWith('/guides/') || path.startsWith('/categories/') || path === '/categories' || path.startsWith('/compare/') || path === '/compare')
      assert.ok(xmlPaths.includes(path), 'Sitemap omitted an indexable public URL: ' + path);
  }
  assert.ok(xmlPaths.every(path => !path.startsWith('/admin') && !path.startsWith('/api/')), 'Do not submit administrative or API URLs.');
  assert.ok(content.sitemap.sitemapEntries(pages).every(entry => !new URL(entry.url).search), 'Do not submit query or tracking URLs.');
  assert.ok(fs.readFileSync('components/shell.tsx', 'utf8').includes('href="/site-index"'));
  for (const source of ['app/site-index/page.tsx', 'app/site-index/[section]/[page]/page.tsx'])
    assert.ok(fs.readFileSync(source, 'utf8').includes('BreadcrumbList'), 'Missing structured-data breadcrumbs: ' + source);
  console.log('PASS: ' + pages.length + ' canonical URLs covered by the HTML index (' + paths.length + ' index URLs). XML sitemap is the keep-list plus guides, categories, and approved compares.');
} finally {
  content.cleanup();
  fs.rmSync(tmp, { recursive: true, force: true });
}
