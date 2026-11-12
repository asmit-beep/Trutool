import 'server-only';
import { createHmac } from 'node:crypto';
import { get, put } from './private-storage';
import { sendDispatchWelcome } from './dispatch-welcome';
import { newsletterTopics, type NewsletterTopic } from './newsletter';

export type StoredSubscriber = {
  email: string;
  topics: NewsletterTopic[];
  status: string;
  welcomeEventId?: string;
  welcomeSentAt?: string;
  [key: string]: unknown;
};

export function newsletterSecret() {
  // Prefer the original secret so existing subscriber IDs and signed unsubscribe links never change.
  return process.env.TRUTOOL_SIGNING_SECRET || process.env.BLOB_READ_WRITE_TOKEN || process.env.ADMIN_SESSION_SECRET;
}

export function subscriberPath(id: string) {
  if (!/^[0-9a-f]{64}$/.test(id)) throw new Error('Invalid subscriber ID');
  return 'newsletter/subscribers/' + id + '.json';
}

function manageUrl(id: string) {
  const secret = newsletterSecret();
  if (!secret) throw new Error('Newsletter secret is unavailable');
  const sig = createHmac('sha256', secret).update('newsletter-manage:' + id).digest('hex');
  return '/newsletter?unsubscribe=' + id + '.' + sig;
}

export async function deliverPendingWelcome(path: string): Promise<'sent' | 'pending' | 'skipped'> {
  const id = /^newsletter\/subscribers\/([0-9a-f]{64})\.json$/.exec(path)?.[1];
  if (!id) return 'skipped';
  const row = await get(path, { access: 'private', useCache: false });
  if (!row || row.statusCode !== 200) return 'skipped';
  const record = await new Response(row.stream).json() as StoredSubscriber;
  if (record.status !== 'subscribed' || !record.welcomeEventId || record.welcomeSentAt ||
      typeof record.email !== 'string' || !Array.isArray(record.topics) ||
      record.topics.some(t => !newsletterTopics.some(option => option.id === t))) return 'skipped';

  let result: 'sent' | 'pending' = 'pending';
  try {
    result = await sendDispatchWelcome({
      email: record.email,
      topics: record.topics,
      manageUrl: manageUrl(id),
      eventId: record.welcomeEventId,
    });
  } catch (error) {
    console.error('Dispatch welcome send failed', error instanceof Error ? error.name : 'unknown');
  }
  if (result === 'sent') {
    try {
      // Check that the subscriber did not unsubscribe or replace their subscription during delivery.
      const fresh = await get(path, { access: 'private', useCache: false });
      if (fresh?.statusCode === 200) {
        const current = await new Response(fresh.stream).json() as StoredSubscriber;
        if (current.status === 'subscribed' && current.welcomeEventId === record.welcomeEventId && !current.welcomeSentAt) {
          await put(path, JSON.stringify({ ...current, welcomeSentAt: new Date().toISOString() }), {
            access: 'private', contentType: 'application/json',
            addRandomSuffix: false, ifMatch: fresh.blob.etag,
          });
        }
      }
    } catch {
      console.error('Dispatch welcome was accepted but delivery state could not be recorded');
    }
  }
  return result;
}
