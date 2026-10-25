import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const tmp = fs.mkdtempSync(path.join(process.cwd(), 'scripts', '.cms-media-size-'));
const require = createRequire(import.meta.url);
const presentation = '/media/39f42368-6169-42f6-a604-f08205315a1f.webp';
const marketing = '/media/7502e6a0-8d29-4fd1-a5bb-08e4bfc9b6c5.webp';
const other = '/media/c03801d1-5bec-41cf-8e53-0e337c9ea6ee.webp';

// Prefixes of the live Studio files. VP8 frame header: 1600x1160 and 1600x1497.
const presentationHeader = Buffer.from('52494646d87501005745425056503820cc750100d0f8049d012a40068804', 'hex');
const marketingHeader = Buffer.from('5249464694ef0100574542505650382088ef0100d081069d012a4006d905', 'hex');

try {
  const source = fs.readFileSync('lib/cms-media-size.ts', 'utf8');
  const article = fs.readFileSync('components/cms-article.tsx', 'utf8');
  for (const file of [source, article]) {
    assert.equal(file.includes("from 'sharp'") || file.includes('from "sharp"'), false, 'CmsArticle must not statically import sharp');
    assert.equal(/import\s*\(\s*['"]sharp['"]\s*\)/.test(file), false);
    assert.equal(/require\s*\(\s*['"]sharp['"]\s*\)/.test(file), false);
  }
  assert.ok(article.includes('if (!preview)'), 'Full-page draft preview keeps the previous size behaviour');
  assert.ok(article.includes('withCmsMediaSizes(c.body)') && article.includes('cmsMediaSize(c.image)'));
  assert.ok(article.includes('<CmsMarkdown body={renderBody}/>'));

  fs.writeFileSync(path.join(tmp, 'package.json'), '{"type":"commonjs"}');
  fs.writeFileSync(path.join(tmp, 'fake-storage.cjs'), `
    module.exports.get = (...args) => reader(...args);
    module.exports.setReader = (next) => { reader = next; };
  `);
  const compiled = ts.transpileModule(source.replace("import 'server-only';\n", '').replace(
    "import { get } from '@/lib/private-storage';",
    "import { get } from './fake-storage.cjs';",
  ), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const filename = path.join(tmp, 'cms-media-size.cjs');
  fs.writeFileSync(filename, compiled);
  const { webpDimensions, cmsMediaSize, withCmsMediaSizes } = require(filename);
  const { setReader } = require(path.join(tmp, 'fake-storage.cjs'));

  assert.deepEqual(webpDimensions(presentationHeader), { width: 1600, height: 1160 });
  assert.deepEqual(webpDimensions(marketingHeader), { width: 1600, height: 1497 });
  assert.equal(webpDimensions(new Uint8Array([1, 2, 3])), undefined);
  assert.equal(webpDimensions(new Uint8Array(40)), undefined);

  const sharp = (await import('sharp')).default;
  for (const lossless of [false, true]) {
    const encoded = await sharp({
      create: { width: 1600, height: 1160, channels: 3, background: { r: 20, g: 40, b: 60 } },
    }).webp(lossless ? { lossless: true } : { quality: 80 }).toBuffer();
    assert.deepEqual(webpDimensions(encoded.subarray(0, 32)), { width: 1600, height: 1160 }, lossless ? 'VP8L' : 'VP8/VP8X');
    assert.deepEqual(await sharp(encoded).metadata().then(meta => ({ width: meta.width, height: meta.height })), { width: 1600, height: 1160 });
  }

  const calls = [];
  setReader(async (storagePath, options) => {
    calls.push([storagePath, options]);
    throw new Error('blob down');
  });
  const original = [
    'Before',
    '',
    '![Best AI presentation maker comparison table for 2026](' + presentation + ')',
    '',
    'See ![inline](https://cdn.example/chart.webp "800x450") here.',
    '',
    '![' + 'Keep this hint](' + other + ' "1600x900")',
  ].join('\n');
  assert.equal(await withCmsMediaSizes(original), original, 'Storage failure must keep the original markdown');
  assert.equal(await cmsMediaSize('/covers/ai-work.webp'), undefined);
  assert.equal(calls.some(call => call[0].includes('covers')), false, 'Non-/media covers must not touch storage');
  assert.deepEqual(calls[0][1], { access: 'private' });

  let cancelled = false;
  setReader(async (storagePath) => {
    const bytes = storagePath.endsWith(presentation.slice('/media/'.length))
      ? presentationHeader
      : marketingHeader;
    return {
      statusCode: 200,
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue(bytes.subarray(0, 10));
          controller.enqueue(bytes.subarray(10));
          controller.enqueue(new Uint8Array(64));
        },
        cancel() { cancelled = true; },
      }),
    };
  });
  const rewritten = await withCmsMediaSizes([
    '![Best AI presentation maker comparison table for 2026](' + presentation + ' "1600x900")',
    '',
    '![Comparison table of 12 AI tools for marketing](' + marketing + '){width=1600 height=900}',
    '',
    '![external](https://cdn.example/chart.webp)',
    '',
    '![local cover](/covers/ai-work.webp "1600x900")',
  ].join('\n'));
  assert.ok(rewritten.includes(presentation + ' "1600x1160"'), rewritten);
  assert.ok(rewritten.includes(marketing + ' "1600x1497"'), rewritten);
  const reactDir = path.join(tmp, 'render');
  fs.mkdirSync(reactDir);
  fs.writeFileSync(path.join(reactDir, 'package.json'), '{"type":"commonjs"}');
  const transpile = (sourcePath, output, replacements = []) => {
    let code = fs.readFileSync(sourcePath, 'utf8');
    for (const [from, to] of replacements) code = code.replaceAll(from, to);
    fs.writeFileSync(path.join(reactDir, output), ts.transpileModule(code, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText);
  };
  transpile('lib/cms-types.ts', 'cms-types.cjs');
  transpile('lib/cms-markdown-structure.ts', 'cms-structure.cjs');
  transpile('components/cms-markdown.tsx', 'cms-markdown.cjs', [
    ["from '@/lib/cms-types'", "from './cms-types.cjs'"],
    ["from '@/lib/cms-markdown-structure'", "from './cms-structure.cjs'"],
  ]);
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { CmsMarkdown } = require(path.join(reactDir, 'cms-markdown.cjs'));
  const html = renderToStaticMarkup(React.createElement(CmsMarkdown, { body: rewritten }));
  assert.ok(html.includes('src="' + presentation + '"') && html.includes('width="1600"') && html.includes('height="1160"'), html);
  assert.ok(html.includes('src="' + marketing + '"') && html.includes('height="1497"'), html);
  assert.ok(html.includes('src="https://cdn.example/chart.webp"') && html.includes('height="900"'), html);
  assert.ok(!rewritten.includes(presentation + ' "1600x900"'));
  assert.ok(!rewritten.includes('{width=1600 height=900}'));
  assert.ok(rewritten.includes('https://cdn.example/chart.webp'));
  assert.ok(rewritten.includes('/covers/ai-work.webp "1600x900"'));
  assert.equal(cancelled, true, 'Header reads must cancel the rest of the blob stream');
  assert.deepEqual(await cmsMediaSize(presentation), { width: 1600, height: 1160 });

  setReader(() => new Promise(() => {}));
  const started = Date.now();
  const hung = await withCmsMediaSizes('![slow](/media/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.webp)');
  assert.equal(hung, '![slow](/media/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.webp)');
  const elapsed = Date.now() - started;
  assert.ok(elapsed < 4000, 'A stuck storage read must not hang the page, took ' + elapsed + 'ms');

  console.log('PASS: WebP headers match stored Studio sizes, non-media hints stay put, and lookup failure falls open.');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
