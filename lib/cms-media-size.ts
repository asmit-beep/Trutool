import 'server-only';
import { get } from '@/lib/private-storage';

export type CmsMediaSize = { width: number; height: number };

// Studio files are /media/<uuid>.webp. The pixel size is in the container
// header, so a guide can reserve the real box without decoding the image.
//
// Do not import sharp from this module. CmsArticle is on every CMS guide's
// module graph, and Next.js 16 Turbopack turns a static `import sharp` into
// `import("sharp-<hash>")` while the page module is still evaluating. That
// runs outside any try/catch. If the hashed package is missing from the
// serverless function, every guide returns HTTP 500 — including guides with
// no /media images. Lookup failures here fall open to the renderer's
// 1600x900 hint instead.

const mediaId = /^\/media\/([a-f0-9-]{36}\.webp)$/;
const cache = new Map<string, Promise<CmsMediaSize | undefined>>();
const headerBytes = 32;
const lookupBudgetMs = 2000;

function ascii(bytes: Uint8Array, offset: number, length: number) {
  let text = '';
  for (let index = 0; index < length; index++) text += String.fromCharCode(bytes[offset + index] || 0);
  return text;
}

function finiteSize(width: number, height: number): CmsMediaSize | undefined {
  if (!Number.isInteger(width) || !Number.isInteger(height)) return;
  if (width < 1 || height < 1 || width > 8000 || height > 8000) return;
  return { width, height };
}

// VP8 (lossy), VP8L (lossless) and VP8X (extended) all store the canvas size
// in the first chunk. Studio's sharp encode writes one of these.
export function webpDimensions(bytes: Uint8Array): CmsMediaSize | undefined {
  if (bytes.byteLength < 30) return;
  if (ascii(bytes, 0, 4) !== 'RIFF' || ascii(bytes, 8, 4) !== 'WEBP') return;
  const chunk = ascii(bytes, 12, 4);
  if (chunk === 'VP8X') {
    const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
    const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
    return finiteSize(width, height);
  }
  if (chunk === 'VP8 ') {
    if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) return;
    const width = (bytes[26] | (bytes[27] << 8)) & 0x3fff;
    const height = (bytes[28] | (bytes[29] << 8)) & 0x3fff;
    return finiteSize(width, height);
  }
  if (chunk === 'VP8L' && bytes[20] === 0x2f) {
    const bits = (bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24)) >>> 0;
    return finiteSize((bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1);
  }
  return;
}

function isWebStream(value: unknown): value is ReadableStream<Uint8Array> {
  return !!value && typeof (value as ReadableStream<Uint8Array>).getReader === 'function';
}

async function readPrefix(stream: ReadableStream<Uint8Array>, length: number) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let got = 0;
  try {
    while (got < length) {
      const { done, value } = await reader.read();
      if (done || !value?.byteLength) break;
      chunks.push(value);
      got += value.byteLength;
    }
  } finally {
    try { await reader.cancel(); } catch { /* a stream error must not escape */ }
  }
  const out = new Uint8Array(Math.min(got, length));
  let offset = 0;
  for (const chunk of chunks) {
    if (offset >= out.byteLength) break;
    const slice = chunk.subarray(0, out.byteLength - offset);
    out.set(slice, offset);
    offset += slice.byteLength;
  }
  return out;
}

async function readStoredSize(id: string): Promise<CmsMediaSize | undefined> {
  const file = await get('cms/media/' + id, { access: 'private' });
  if (!file || file.statusCode !== 200 || !isWebStream(file.stream)) return;
  return webpDimensions(await readPrefix(file.stream, headerBytes));
}

export function cmsMediaSize(src?: string): Promise<CmsMediaSize | undefined> {
  const id = src?.match(mediaId)?.[1];
  if (!id) return Promise.resolve(undefined);
  const existing = cache.get(id);
  if (existing) return existing;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const pending = new Promise<CmsMediaSize | undefined>(resolve => {
    timer = setTimeout(() => resolve(undefined), lookupBudgetMs);
    readStoredSize(id).then(
      size => { if (timer) clearTimeout(timer); resolve(size); },
      () => { if (timer) clearTimeout(timer); resolve(undefined); },
    );
  });
  cache.set(id, pending);
  pending.then(size => { if (!size) cache.delete(id); }, () => cache.delete(id));
  return pending;
}

function mediaImagePattern() {
  return /!\[([^\]]*)\]\((\/media\/[a-f0-9-]{36}\.webp)(?:\s+"[^"]*")?\)(?:\{[^}]*\})?/g;
}

// Rewrites /media image size hints to the stored file's real size so the
// renderer does not keep a guessed 16:9 box. Other images stay untouched.
// Any failure returns the original markdown.
export async function withCmsMediaSizes(body: string) {
  try {
    if (typeof body !== 'string' || !body.includes('/media/')) return body;
    const sources = [...new Set([...body.matchAll(mediaImagePattern())].map(match => match[2]).filter((src): src is string => Boolean(src)))];
    if (!sources.length) return body;
    const sizes = new Map(await Promise.all(sources.map(async src => [src, await cmsMediaSize(src)] as const)));
    return body.replace(mediaImagePattern(), (whole, alt: string, src: string) => {
      const size = sizes.get(src);
      return size ? '![' + alt + '](' + src + ' "' + size.width + 'x' + size.height + '")' : whole;
    });
  } catch {
    return typeof body === 'string' ? body : '';
  }
}
