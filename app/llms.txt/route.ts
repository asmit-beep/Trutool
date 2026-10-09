import { publicPages } from '@/lib/cms-public';
import { llmsIndex } from '@/lib/discovery';
import { discoveryResponse } from '@/lib/discovery-response';
export const revalidate=30;
export async function GET(request:Request){return discoveryResponse(request,llmsIndex(await publicPages()),'text/plain; charset=utf-8')}
