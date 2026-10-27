import {timingSafeEqual} from 'node:crypto';
import {refreshAICollectionSnapshot} from '@/lib/ai-discovery-snapshot';
import {getAINews} from '@/lib/ai-news';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function GET(request:Request){
 const secret=process.env.CRON_SECRET,auth=request.headers.get('authorization')||'';
 const expected=secret?'Bearer '+secret:'';
 const supplied=Buffer.from(auth),wanted=Buffer.from(expected);
 if(!expected||supplied.length!==wanted.length||!timingSafeEqual(supplied,wanted))return Response.json({error:'Unauthorized'},{status:401});
 try{
  const [result,news]=await Promise.all([refreshAICollectionSnapshot(),getAINews()]);
  return Response.json({...result,stories:news.length,source:'Product Hunt + Hacker News + verified directory',updatedAt:result.updatedAt},{status:result.ok?200:503,headers:{'Cache-Control':'no-store'}});
 }catch{
  return Response.json({ok:false,error:'Feed refresh temporarily unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});
 }
}
