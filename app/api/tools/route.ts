import { toolResults } from '@/lib/catalog-results';
import { publicTools } from '@/lib/cms-public';
export async function GET(request:Request){
 const p=new URL(request.url).searchParams;
 const result=toolResults(p.get('q')||'',p.get('category')||'',p.get('sort')||'',Number(p.get('page')||1),Number(p.get('limit')||24),p.get('scope')||'',p.get('discovery')||'all',await publicTools());
 return Response.json(result,{headers:{'Cache-Control':'public, max-age=30, s-maxage=30, stale-while-revalidate=0','X-Content-Type-Options':'nosniff'}});
}
