import {atom} from '@/lib/discovery';
import {discoveryResponse} from '@/lib/discovery-response';
export const revalidate=3600;
export async function GET(request:Request){return discoveryResponse(request,atom(),'application/atom+xml; charset=utf-8')}
