import { publicPages } from '@/lib/cms-public';
import { jsonFeed } from '@/lib/discovery';
import { discoveryResponse } from '@/lib/discovery-response';
export const revalidate=30;
export async function GET(request:Request){return discoveryResponse(request,JSON.stringify(jsonFeed(await publicPages())),'application/feed+json; charset=utf-8')}
