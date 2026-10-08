import {llmsIndex} from '@/lib/discovery';
import {discoveryResponse} from '@/lib/discovery-response';
export const revalidate=3600;
export async function GET(request:Request){return discoveryResponse(request,llmsIndex(),'text/plain; charset=utf-8')}
