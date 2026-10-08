import {jsonFeed} from '@/lib/discovery';
import {discoveryResponse} from '@/lib/discovery-response';
export const revalidate=3600;
export async function GET(request:Request){return discoveryResponse(request,JSON.stringify(jsonFeed()),'application/feed+json; charset=utf-8')}
