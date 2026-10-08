import {llmsFull} from '@/lib/discovery';
import {discoveryResponse} from '@/lib/discovery-response';
export const revalidate=3600;
export async function GET(request:Request){return discoveryResponse(request,llmsFull(),'text/plain; charset=utf-8')}
