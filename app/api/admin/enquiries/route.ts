import { authenticated, privateResponse } from '@/lib/admin-auth';
import { get, list } from '@/lib/private-storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  topic: 'conversation' | 'correction' | 'suggestion' | 'privacy';
  message: string;
  createdAt: string;
  product?: { name: string; url: string; category: string };
};

function isMessage(value: unknown): value is ContactMessage {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const m = value as Record<string, unknown>;
  return typeof m.id === 'string' && /^[a-f0-9-]{36}$/i.test(m.id) &&
    typeof m.name === 'string' && typeof m.email === 'string' &&
    typeof m.message === 'string' && typeof m.createdAt === 'string' &&
    ['conversation', 'correction', 'suggestion', 'privacy'].includes(String(m.topic));
}

function csvCell(value: unknown) {
  const safe = String(value ?? '').replace(/^[\s]*[=+@\-\t\r]/, "'$&");
  return '"' + safe.replace(/"/g, '""') + '"';
}

export async function GET(request: Request) {
  if (!await authenticated()) return privateResponse({ error: 'Please sign in.' }, 401);
  try {
    const messages: ContactMessage[] = [];
    let partialLegacy = false;
    let cursor: string | undefined;
    let pages = 0;
    do {
      const batch = await list({ prefix: 'enquiries/', limit: 100, cursor });
      partialLegacy ||= Boolean('partialLegacy' in batch && batch.partialLegacy);
      for (let i = 0; i < batch.blobs.length; i += 10) {
        const records = await Promise.all(batch.blobs.slice(i, i + 10).map(async blob => {
          const response = await get(blob.pathname, { access: 'private', useCache: false });
          if (!response || response.statusCode !== 200) return null;
          const item: unknown = await new Response(response.stream).json();
          return isMessage(item) ? item : null;
        }));
        for (const item of records) if (item) messages.push(item);
      }
      cursor = batch.hasMore ? batch.cursor : undefined;
      pages++;
    } while (cursor && pages < 100);
    messages.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
    if (new URL(request.url).searchParams.get('export') === 'csv') {
      const headers = ['Reference', 'Received at', 'Name', 'Email', 'Topic', 'Message', 'Product', 'Product URL', 'Category'];
      const rows = messages.map(m => [
        m.id, m.createdAt, m.name, m.email, m.topic, m.message,
        m.product?.name ?? '', m.product?.url ?? '', m.product?.category ?? '',
      ].map(csvCell).join(','));
      return new Response([headers.map(csvCell).join(','), ...rows].join('\r\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="trutool-contact-messages.csv"',
          'Cache-Control': 'private, no-store',
          'X-TruTool-Inbox-Partial': partialLegacy ? 'true' : 'false',
          'X-Robots-Tag': 'noindex, nofollow',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }
    return privateResponse({ messages, total: messages.length, truncated: Boolean(cursor), partialLegacy });
  } catch {
    console.error('Private contact inbox could not be loaded');
    return privateResponse({ error: 'Messages could not be loaded. Please try again.' }, 503);
  }
}
