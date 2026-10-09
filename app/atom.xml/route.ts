import { publicPages } from '@/lib/cms-public';
import { atom } from '@/lib/discovery';
import { discoveryResponse } from '@/lib/discovery-response';
export const revalidate=30;
export async function GET(request:Request){return discoveryResponse(request,atom(await publicPages()),'application/atom+xml; charset=utf-8')}
