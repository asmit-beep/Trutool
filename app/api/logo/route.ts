import {getTool} from '@/lib/catalog';
import {serviceCategories} from '@/lib/services';
import vendorIcons from '@/lib/catalog-vendor-icons.json';
export const runtime='nodejs';
const providers=new Map(serviceCategories.flatMap(c=>c.providers.map(([,url])=>[new URL(url).hostname,url] as const)));
export async function GET(request:Request){
 const params=new URL(request.url).searchParams,t=getTool(params.get('slug')||'');
 const vendor=t?.url||providers.get(params.get('provider')||'');
 if(!vendor)return new Response(null,{status:404});
 const host=new URL(vendor).hostname;
 // Catalogue-only destinations; never accept a caller-provided destination.
 const verifiedIcon=t?(vendorIcons as Record<string,string>)[t.slug]:undefined;
 const endpoints=[...(verifiedIcon?[verifiedIcon]:[]),'https://www.google.com/s2/favicons?sz=128&domain='+encodeURIComponent(host),new URL('/favicon.ico',vendor).href];
 for(const url of endpoints){try{const r=await fetch(url,{signal:AbortSignal.timeout(1800),next:{revalidate:604800}}),type=r.headers.get('content-type')||'';if(r.ok&&type.startsWith('image/')){const bytes=await r.arrayBuffer();if(bytes.byteLength>0&&bytes.byteLength<500000)return new Response(bytes,{headers:{'Content-Type':type,'Cache-Control':'public, max-age=86400, s-maxage=604800','X-Content-Type-Options':'nosniff'}})}}catch{}}
 return new Response(null,{status:404,headers:{'Cache-Control':'public, max-age=3600'}});
}
