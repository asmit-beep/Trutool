import {rss} from '@/lib/discovery';
import {discoveryResponse} from '@/lib/discovery-response';
export const revalidate=3600;
export async function GET(request:Request){return discoveryResponse(request,rss(),'application/rss+xml; charset=utf-8')}
