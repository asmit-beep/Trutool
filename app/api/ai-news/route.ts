import {getAINews} from '@/lib/ai-news';
export const revalidate=3600;
export async function GET(){return Response.json({stories:await getAINews()},{headers:{'Cache-Control':'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'}})}
