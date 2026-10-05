import {getTool} from '@/lib/catalog';
export const runtime='nodejs';
export async function GET(request:Request){
 const t=getTool(new URL(request.url).searchParams.get('slug')||'');
 if(!t)return new Response(null,{status:404});
 const host=new URL(t.url).hostname;
 // Catalogue-only vendor domains; never accept a caller-provided destination.
 const endpoints=['https://www.google.com/s2/favicons?sz=128&domain='+encodeURIComponent(host),new URL('/favicon.ico',t.url).href];
 for(const url of endpoints){try{const r=await fetch(url,{signal:AbortSignal.timeout(4000),next:{revalidate:604800}});const type=r.headers.get('content-type')||'';if(r.ok&&type.startsWith('image/')){const bytes=await r.arrayBuffer();if(bytes.byteLength<500000)return new Response(bytes,{headers:{'Content-Type':type,'Cache-Control':'public, max-age=86400, s-maxage=604800','X-Content-Type-Options':'nosniff'}})}}catch{}}
 return new Response(null,{status:404,headers:{'Cache-Control':'public, max-age=3600'}});
}
