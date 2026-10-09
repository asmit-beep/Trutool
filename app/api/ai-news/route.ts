import { AI_REFRESH_SECONDS,getAIDiscussions,getAINews } from '@/lib/ai-news';
export const revalidate=30;
export async function GET(){const newsPromise=getAINews();const [stories,discussions]=await Promise.all([newsPromise,getAIDiscussions(newsPromise)]);return Response.json({stories,discussions,refreshSeconds:AI_REFRESH_SECONDS},{headers:{'Cache-Control':'public, max-age=0, s-maxage=30, stale-while-revalidate=0'}})}
