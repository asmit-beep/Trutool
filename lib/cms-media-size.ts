import 'server-only';
import sharp from 'sharp';
import { get } from '@/lib/private-storage';

export type CmsMediaSize = { width: number; height: number };

const mediaPath = /^\/media\/([a-f0-9-]{36}\.webp)$/;
const cache = new Map<string, Promise<CmsMediaSize | undefined>>();

// Real pixel size of an uploaded Studio image (/media/<id>.webp). Studio does not
// store dimensions, so read them from the stored file once per server instance.
export function cmsMediaSize(src?: string): Promise<CmsMediaSize | undefined> {
  const id = src?.match(mediaPath)?.[1];
  if (!id) return Promise.resolve(undefined);
  let pending = cache.get(id);
  if (!pending) {
    pending = (async () => {
      try {
        const file = await get('cms/media/' + id, { access: 'private' });
        if (!file || file.statusCode !== 200 || !file.stream) return undefined;
        const { width, height } = await sharp(Buffer.from(await new Response(file.stream).arrayBuffer())).metadata();
        return width && height ? { width, height } : undefined;
      } catch { return undefined; }
    })();
    cache.set(id, pending);
    pending.then(size => { if (!size) cache.delete(id); });
  }
  return pending;
}

const bodyImage = /!\[([^\]]*)\]\((\/media\/[a-f0-9-]{36}\.webp)(?:\s+"[^"]*")?\)(?:\{[^}]*\})?/g;

// Rewrites /media image size hints in a CMS body to the stored file's real size,
// so the renderer never emits a guessed 16:9 box. Other images are unchanged.
export async function withCmsMediaSizes(body: string) {
  const sources = [...new Set([...body.matchAll(bodyImage)].map(m => m[2]))];
  if (!sources.length) return body;
  const sizes = new Map(await Promise.all(sources.map(async src => [src, await cmsMediaSize(src)] as const)));
  return body.replace(bodyImage, (whole, alt: string, src: string) => {
    const size = sizes.get(src);
    return size ? '![' + alt + '](' + src + ' "' + size.width + 'x' + size.height + '")' : whole;
  });
}
