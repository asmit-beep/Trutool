import { publicPages } from '@/lib/cms-public';
import { rss } from '@/lib/discovery';
import { discoveryResponse } from '@/lib/discovery-response';
export const revalidate=30;
export async function GET(request:Request){return discoveryResponse(request,rss(await publicPages()),'application/rss+xml; charset=utf-8')}
