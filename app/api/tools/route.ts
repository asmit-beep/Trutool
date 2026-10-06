import {toolResults} from '@/lib/catalog-results';
export async function GET(request:Request){
 const p=new URL(request.url).searchParams;
 const result=toolResults(p.get('q')||'',p.get('category')||'',p.get('sort')||'',Number(p.get('page')||1),Number(p.get('limit')||24),p.get('scope')||'');
 return Response.json(result,{headers:{'Cache-Control':'public, max-age=30, s-maxage=300, stale-while-revalidate=60','X-Content-Type-Options':'nosniff'}});
}
