import {getAINews,getAIDiscussions,AI_REFRESH_SECONDS} from '@/lib/ai-news';
export const revalidate=172800;
export async function GET(){const newsPromise=getAINews();const [stories,discussions]=await Promise.all([newsPromise,getAIDiscussions(newsPromise)]);return Response.json({stories,discussions,refreshSeconds:AI_REFRESH_SECONDS},{headers:{'Cache-Control':'public, max-age=300, s-maxage=172800, stale-while-revalidate=86400'}})}
