import { timingSafeEqual } from 'node:crypto';
import { privateResponse } from '@/lib/admin-auth';
import { list } from '@/lib/private-storage';
import { deliverPendingWelcome } from '@/lib/newsletter-delivery';
import {deliverPendingProductConfirmation} from '@/lib/product-submission-confirmation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get('authorization') || '';
  const expected = secret ? 'Bearer ' + secret : '';
  const suppliedBytes = Buffer.from(header);
  const expectedBytes = Buffer.from(expected);
  if (!expected || suppliedBytes.length !== expectedBytes.length ||
      !timingSafeEqual(suppliedBytes, expectedBytes))
    return privateResponse({ error: 'Unauthorized.' }, 401);

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL)
    return privateResponse({ ready: false, reason: 'Resend credentials not configured.', processed: 0 });

  let processed = 0, sent = 0, pending = 0, scanned = 0;
  let cursor: string | undefined;
  let newsletterUnavailable = false;
  try {
    do {
      const batch = await list({ prefix: 'newsletter/subscribers/', limit: 100, cursor });
      for (const row of batch.blobs) {
        const status = await deliverPendingWelcome(row.pathname);
        scanned++;
        if (status === 'skipped') continue;
        processed++;
        if (status === 'sent') sent++;
        else pending++;
        if (processed >= 8) break; // Protect the Hobby runtime and Resend limits.
      }
      cursor = batch.hasMore ? batch.cursor : undefined;
    } while (cursor && processed < 8 && scanned < 1000);
  } catch {
    newsletterUnavailable = true;
    console.warn('Newsletter retries unavailable; independently retrying saved product receipts.');
  }
  try {
    // Product receipt retries use the same authenticated daily job and sender.
    // Older submissions have no confirmationEventId and are skipped deliberately.
    let productScanned=0,productSent=0,productPending=0;
    let productCursor:string|undefined;
    try{
      do{
        const batch=await list({prefix:'enquiries/',limit:100,cursor:productCursor});
        for(const row of batch.blobs){
          const status=await deliverPendingProductConfirmation(row.pathname);
          productScanned++;
          if(status==='sent')productSent++;
          else if(status==='pending')productPending++;
          if(productSent+productPending>=8)break;
        }
        productCursor=batch.hasMore?batch.cursor:undefined;
      }while(productCursor&&productSent+productPending<8&&productScanned<1000);
    }catch{console.error('Product confirmation retry encountered an error');}
    return privateResponse({ ready: !newsletterUnavailable, scanned, processed, sent, pending,
      newsletterUnavailable,productConfirmations:{scanned:productScanned,sent:productSent,pending:productPending} },
      newsletterUnavailable ? 503 : 200);
  } catch {
    console.error('Product confirmation retry job failed');
    return privateResponse({ error: 'Product receipt delivery retry failed.', scanned, processed, sent, pending }, 503);
  }
}
