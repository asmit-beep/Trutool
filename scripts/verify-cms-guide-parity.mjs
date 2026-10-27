import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const tmp = fs.mkdtempSync(path.join(process.cwd(), 'scripts', '.cms-parity-'));
const require = createRequire(import.meta.url);
try {
  fs.writeFileSync(path.join(tmp, 'package.json'), '{"type":"commonjs"}');
  const transpile = (source, filename, replacements = []) => {
    let code = fs.readFileSync(source, 'utf8');
    for (const [from, to] of replacements) {
      assert.ok(code.includes(from), 'Missing test import: ' + from);
      code = code.replace(from, to);
    }
    fs.writeFileSync(path.join(tmp, filename), ts.transpileModule(code, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText);
  };
  transpile('lib/cms-types.ts', 'cms-types.cjs');
  transpile('lib/cms-jsonld.ts', 'cms-jsonld.cjs');
  transpile('lib/cms-markdown-structure.ts', 'cms-structure.cjs');
  transpile('components/cms-markdown.tsx', 'cms-markdown.cjs', [
    ["from '@/lib/cms-types'", "from './cms-types.cjs'"],
    ["from '@/lib/cms-markdown-structure'", "from './cms-structure.cjs'"],
  ]);
  const { cmsHeadings, cmsListMarker, cmsImageDimensions } = require(path.join(tmp, 'cms-structure.cjs'));
  const { CmsMarkdown } = require(path.join(tmp, 'cms-markdown.cjs'));
  const { guideAuthorHeading } = require(path.join(tmp, 'cms-types.cjs'));
  const { parseCmsJsonLd, cmsJsonLdMarkup } = require(path.join(tmp, 'cms-jsonld.cjs'));
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');

  const body = [
    'Healthcare listings help patients find the right location.',
    '',
    '## **Key takeaways**',
    '',
    '• Keep location data correct.',
    '',
    '• Review publisher changes.',
    '',
    '## **Best tools**',
    '',
    '| Platform | Why it matters |',
    '| --- | --- |',
    '| [**Synup**](https://synup.com) | Location data and approvals |',
    '| [**Yext**](https://www.yext.com) | Enterprise listing controls |',
    '',
    '## Review stages',
    '',
    '1) Check current records',
    '',
    '2) Confirm corrections',
    '',
    '3) Audit public listings',
    '',
    '## Review stages',
    '',
    '- **Ownership:** Keep changes governed',
    '- [**Google guidance**](https://support.google.com/business/answer/3038177)',
  ].join('\n');
  const headingItems = cmsHeadings(body);
  assert.deepEqual(headingItems.map(h => h.id), ['key-takeaways','best-tools','review-stages','review-stages-2']);
  assert.equal(cmsListMarker('• Important').type, 'ul');
  assert.equal(cmsListMarker('2) Numbered item').start, 2);
  const html = renderToStaticMarkup(React.createElement(CmsMarkdown, { body }));
  assert.ok(html.includes('id="key-takeaways"') && html.includes('id="review-stages-2"'));
  assert.ok(html.includes('<ul><li>Keep location data correct.</li><li>Review publisher changes.</li></ul>'), 'Unicode bullets must group into a list across blank lines');
  assert.match(html, /<ol(?: start="1")?><li>Check current records<\/li><li>Confirm corrections<\/li><li>Audit public listings<\/li><\/ol>/, 'Numbered steps must be sequential real list elements');
  assert.ok(html.includes('<a href="https://synup.com/" target="_blank" rel="noopener noreferrer"><strong>Synup</strong></a>'), 'Markdown bold inside links must not show asterisks');
  assert.ok(!html.includes('**'), 'No raw bold markdown residue should appear in rendered HTML');
  assert.ok(html.includes('<table>') && html.includes('<tbody>'), 'Tables must be semantic');
  const linkHtml = renderToStaticMarkup(React.createElement(CmsMarkdown, { body: '[a](/guides/x) [b](https://trutool.co/guides/y) [c](https://www.trutool.co/z) [d](https://example.com/) [e](https://nottrutool.co/)' }));
  assert.ok(linkHtml.includes('<a href="/guides/x">a</a>') && linkHtml.includes('<a href="https://trutool.co/guides/y">b</a>') && linkHtml.includes('<a href="https://www.trutool.co/z">c</a>'), 'Internal links must open in the same tab');
  assert.ok(linkHtml.includes('<a href="https://example.com/" target="_blank" rel="noopener noreferrer">d</a>') && linkHtml.includes('<a href="https://nottrutool.co/" target="_blank" rel="noopener noreferrer">e</a>'), 'External links must keep target=_blank');

  // Guides must have exactly the hero cover; inline and standalone Markdown
  // pictures are not rendered. Do not modify source article text.
  const withImages = [
    '## Examples',
    'Intro ![Inline screenshot](/media/11111111-1111-4111-8111-111111111111.webp) text.',
    '',
    '![Standalone chart](/media/22222222-2222-4222-8222-222222222222.webp)',
    '',
    '| Comparison | Preview |',
    '| --- | --- |',
    '| Winner | ![Table image](https://example.com/chart.webp) |',
    '',
    '- Option one ![Inline icon](https://example.com/icon.webp)',
    '',
    'Still a real paragraph.'
  ].join('\\n');
  const bodyWithImages = renderToStaticMarkup(React.createElement(CmsMarkdown, { body: withImages }));
  const bodyWithoutImages = renderToStaticMarkup(React.createElement(CmsMarkdown, { body: withImages, showImages: false }));
  assert.equal((bodyWithImages.match(/<img\\b/g) || []).length, 4, 'Other CMS content still renders its images normally');
  assert.ok(!/<img\\b|<figure\\b|!\\[[^\\]]*\\]\\(/.test(bodyWithoutImages), 'Guide article bodies must not render any image or raw alt syntax');
  assert.ok(!bodyWithoutImages.includes('<p></p>'), 'Removing standalone images must not leave blank paragraphs');
  assert.ok(bodyWithoutImages.includes('<table>') && bodyWithoutImages.includes('Still a real paragraph.'), 'Tables and body copy must remain');
  const restored = JSON.parse(fs.readFileSync('lib/recovered-published-guides.json', 'utf8'));
  assert.equal(restored.length, 12, 'All 12 original published guides are present');
  let removedFromGuideBodies = 0;
  for (const guide of restored) {
    const rawImages = (guide.body.match(/!\\[[^\\]]*\\]\\([^)]+\\)/g) || []).length;
    removedFromGuideBodies += rawImages;
    const rendered = renderToStaticMarkup(React.createElement(CmsMarkdown, { body: guide.body, showImages: false }));
    assert.ok(!/<img\\b|<figure\\b/.test(rendered), 'Unexpected inline guide image: ' + guide.slug);
    assert.ok(rendered.includes('<h2'), 'Guide headings were lost: ' + guide.slug);
    assert.ok(rendered.length > 1000, 'Guide text was lost: ' + guide.slug);
  }
  assert.ok(removedFromGuideBodies >= 10, 'Expected broken image markup in recovered articles');
  const article = fs.readFileSync('components/cms-article.tsx', 'utf8');
  assert.ok(article.includes('<CmsMarkdown body={c.body} showImages={!isGuide}/>'), 'All CMS guides must disable body images but retain hero cover');
  assert.ok(article.includes('<figure className="tt-article-hero-media">'), 'Guide cover must be retained');
  console.log('PASS: recovered guide bodies have zero inline images and retain text, tables and single hero cover.');

  const guides = fs.readFileSync('app/guides/page.tsx', 'utf8');
  const home = fs.readFileSync('app/page.tsx', 'utf8');
  const sitemap = fs.readFileSync('app/sitemap.ts', 'utf8');
  const category = fs.readFileSync('app/categories/[slug]/page.tsx', 'utf8');
  const index = fs.readFileSync('app/site-index/[section]/[page]/page.tsx', 'utf8');
  assert.ok(article.includes('isGuide ? <>') && article.includes('<ArticleToc items={toc}/>'), 'CMS guides must use the standard clickable TOC');
  assert.ok(article.includes('<AuthorProfile author={author} compact/>') && article.includes('<AuthorProfile author={author}/>'), 'Both author contexts must render');
  assert.ok(article.includes('className="tldr"') && article.includes('className="tt-article-hero-media"'), 'CMS guide must show TLDR and cover in header');
  const cmsGuideHeader = article.split('{isGuide ? <>')[1]?.split('</header>')[0] || '';
  assert.ok(cmsGuideHeader.includes('<h1>{c.title}</h1>'), 'CMS guide title must remain');
  assert.ok(cmsGuideHeader.includes('<p>{c.description}</p>'), 'CMS guide must preserve answer-first summary in its TLDR');
  assert.ok(!cmsGuideHeader.includes('className="article-deck"'), 'Do not repeat the answer-first summary beneath the CMS guide title');
  const toc = fs.readFileSync('components/article-toc.tsx', 'utf8');
  const css = fs.readFileSync('app/globals.css', 'utf8') + fs.readFileSync('app/styles/article.css', 'utf8');
  assert.ok(toc.includes("data-section-id={item.id}") && toc.includes('nav.scrollTo('), 'TOC must scroll its own panel to the active heading');
  assert.ok(toc.includes("window.addEventListener('scroll', queue"), 'TOC must follow the reader while scrolling');
  assert.ok(css.includes('max-height:calc(100dvh - 112px)') && css.includes('overflow-y:auto'), 'Desktop TOC must stay inside viewport and remain scrollable');
  assert.ok(css.includes('overflow-x:auto') && css.includes('overflow-y:hidden'), 'Phone TOC remains horizontal and scrollable');
  assert.ok(guides.includes('<CmsGuideCard') && guides.includes('<GuideCard') && !guides.includes('<CmsList'), 'Built-in and published guides must be in one grid');
  assert.ok(home.includes('homeGuides.map(') && home.includes('<CmsGuideCard'), 'Homepage must feature newly published guides');
  assert.ok(sitemap.includes("dynamic='force-dynamic'") && sitemap.includes('publicPages()'), 'Sitemap must incorporate current published CMS URLs');
  assert.ok(category.includes("getPublished()") && category.includes("item.kind==='guide'&&item.category===slug") && category.includes("href={'/guides/'+item.slug}"), 'Every CMS guide must gain a relevant category referring page automatically');
  assert.ok(index.includes('groupSiteIndex(await publicPages())') && index.includes('href={item.path ||'), 'All published CMS URLs must remain linked from HTML site index');

  const glanceAlt = 'At a glance table of Claude vs ChatGPT winners: coding, writing, images, price, free plan and long documents, verified 16 Oct 2026';
  const pricingAlt = 'Pricing ladder bar chart of monthly prices for Claude (Free, Pro, Max) and ChatGPT (Free, Go, Plus, Pro), verified 16 Oct 2026';
  const imageHtml = renderToStaticMarkup(React.createElement(CmsMarkdown, { body: [
    'Intro',
    '',
    '![' + glanceAlt + '](/media/c03801d1-5bec-41cf-8e53-0e337c9ea6ee.webp "1600x900")',
    '',
    'See ![inline chart](https://cdn.example/chart.webp "800x450") here.',
    '',
    '![' + pricingAlt + '](/media/211b8171-8455-45a3-a844-8a9b90ca0e45.webp){width=1600 height=900}',
    '',
    '![default ratio](/images/guides/chart.webp)',
    '',
    '![bad](javascript:alert(1))',
    '',
    '![plain http](http://evil.example/a.png)',
    '',
    '![protocol relative](//evil.example/a.png)',
    '',
    '![markup](/media/x.webp "1600x900")',
  ].join('\n').replace('![markup](/media/x.webp "1600x900")', '![a <script>alert(1)</script>](/media/x.webp "1600x900")') }));
  assert.equal((imageHtml.match(/<img /g) || []).length, 5, 'Allowed images render; javascript, http, and protocol-relative sources do not');
  assert.ok(imageHtml.includes('alt="' + glanceAlt + '"') && imageHtml.includes('src="/media/c03801d1-5bec-41cf-8e53-0e337c9ea6ee.webp"'));
  assert.ok(imageHtml.includes('alt="' + pricingAlt + '"') && imageHtml.includes('src="/media/211b8171-8455-45a3-a844-8a9b90ca0e45.webp"'));
  assert.ok(imageHtml.includes('width="1600"') && imageHtml.includes('height="900"') && imageHtml.includes('loading="lazy"') && imageHtml.includes('decoding="async"'));
  assert.ok(imageHtml.includes('width="800"') && imageHtml.includes('height="450"') && imageHtml.includes('src="https://cdn.example/chart.webp"'));
  assert.ok(imageHtml.includes('<figure class="cms-figure">') && !imageHtml.includes('<figcaption'));
  assert.ok(!imageHtml.includes('javascript:') && !imageHtml.includes('http://evil') && !imageHtml.includes('//evil') && !imageHtml.includes('![') && !imageHtml.includes('!<a'));
  assert.ok(imageHtml.includes('&lt;script&gt;') && !imageHtml.includes('<script>alert'), 'Image alt text stays escaped');
  assert.deepEqual(cmsImageDimensions('1600x900'), { width: 1600, height: 900 });
  assert.deepEqual(cmsImageDimensions('width=1200 height=675'), { width: 1200, height: 675 });
  assert.deepEqual(cmsImageDimensions('a caption'), { width: 1600, height: 900 });

  assert.equal(guideAuthorHeading({ sourceUrl: '', sourceLabel: '', toolSlugs: [] }), 'Author');
  assert.equal(guideAuthorHeading({ sourceUrl: '   ', sourceLabel: '', toolSlugs: [] }), 'Author');
  assert.equal(guideAuthorHeading({ sourceUrl: 'https://example.com', sourceLabel: '', toolSlugs: [] }), 'Author & sources');
  assert.equal(guideAuthorHeading({ sourceUrl: '', sourceLabel: 'Official page', toolSlugs: [] }), 'Author & sources');
  assert.equal(guideAuthorHeading({ sourceUrl: '', sourceLabel: '', toolSlugs: ['claude'] }), 'Author & sources');
  assert.ok(article.includes('guideAuthorHeading(c)') && article.includes('{authorHeading}'), 'Guide author heading follows whether sources exist');
  assert.ok(article.includes('extraJsonLd && <script type="application/ld+json"'), 'Optional JSON-LD is emitted on the page, including draft preview');
  assert.ok(fs.readFileSync('lib/cms-public.ts', 'utf8').includes("c.kind==='guide'?'Buying guides'"), 'Guide breadcrumb position 2 is Buying guides');
  assert.ok(fs.readFileSync('components/admin-workspace.tsx', 'utf8').includes('Structured data (JSON-LD)'), 'Search & sharing tab has the JSON-LD field');
  assert.ok(fs.readFileSync('lib/cms-validation.ts', 'utf8').includes('parseCmsJsonLd'), 'JSON-LD is validated on save');
  assert.ok(css.includes('.cms-prose .cms-figure img') && css.includes('max-width:100%'));

  const faqPath = 'scripts/fixtures/schema-faq-only.json';
  const faqText = fs.readFileSync(faqPath, 'utf8');
  const faq = JSON.parse(faqText);
  const faqMarkup = cmsJsonLdMarkup(faqText);
  assert.deepEqual(JSON.parse(faqMarkup), faq, 'FAQPage JSON-LD round-trips without changing the FAQ text');
  assert.equal(faq.mainEntity.length, 8);
  assert.equal(parseCmsJsonLd('').ok, true);
  assert.equal(cmsJsonLdMarkup('   '), null);
  assert.equal(parseCmsJsonLd('[ {"@type":"Thing"} ]').ok, true);
  const invalid = parseCmsJsonLd('{not json');
  assert.equal(invalid.ok, false);
  assert.match(invalid.error, /valid JSON/);
  const scalar = parseCmsJsonLd('"just a string"');
  assert.equal(scalar.ok, false);
  assert.match(scalar.error, /object or an array/);
  const injected = cmsJsonLdMarkup('{"name":"</script><script>alert(1)</script>"}');
  assert.ok(injected && !injected.includes('</script>') && injected.includes('\\u003c'));

  console.log('PASS: CMS guide hero, TOC, author, unified cards, fresh sitemap, Unicode bullets, table links, numbering, images, and JSON-LD.');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
