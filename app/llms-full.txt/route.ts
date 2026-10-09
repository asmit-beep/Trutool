import { publicPages } from '@/lib/cms-public';
import { llmsFull } from '@/lib/discovery';
import { discoveryResponse } from '@/lib/discovery-response';
export const revalidate=30;
export async function GET(request:Request){return discoveryResponse(request,llmsFull(await publicPages()),'text/plain; charset=utf-8')}
