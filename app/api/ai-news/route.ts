import { getAIDiscussions,getAINews } from '@/lib/ai-news';
export const revalidate=false;
export async function GET(){const newsPromise=getAINews();const [stories,discussions]=await Promise.all([newsPromise,getAIDiscussions(newsPromise)]);return Response.json({stories,discussions,refreshSeconds:0},{headers:{'Cache-Control':'public, max-age=0, s-maxage=3600, stale-while-revalidate=0'}})}
