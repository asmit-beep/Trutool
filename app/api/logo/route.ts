import {getTool} from '@/lib/catalog';
import {serviceCategories} from '@/lib/services';
import vendorIcons from '@/lib/catalog-vendor-icons.json';
export const runtime='nodejs';
const providers=new Map(serviceCategories.flatMap(c=>c.providers.map(([,url])=>[new URL(url).hostname,url] as const)));
const PLACEHOLDER='<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#142333"/><circle cx="32" cy="32" r="12" fill="#D6EF82"/></svg>';
function placeholder(cache='public, max-age=86400, s-maxage=86400'){
 return new Response(PLACEHOLDER,{status:200,headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':cache,'X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex'}});
}
export async function GET(request:Request){
 const params=new URL(request.url).searchParams,t=getTool(params.get('slug')||'');
 const vendor=t?.url||providers.get(params.get('provider')||'');
 if(!vendor)return placeholder();
 const host=new URL(vendor).hostname;
 // Catalogue-only destinations; never accept a caller-provided destination.
 const verifiedIcon=t?(vendorIcons as Record<string,string>)[t.slug]:undefined;
 const endpoints=[...(verifiedIcon?[verifiedIcon]:[]),'https://www.google.com/s2/favicons?sz=128&domain='+encodeURIComponent(host),new URL('/favicon.ico',vendor).href];
 for(const url of endpoints){try{const r=await fetch(url,{signal:AbortSignal.timeout(1800),next:{revalidate:604800}}),type=r.headers.get('content-type')||'';if(r.ok&&type.startsWith('image/')){const bytes=await r.arrayBuffer();if(bytes.byteLength>0&&bytes.byteLength<500000)return new Response(bytes,{headers:{'Content-Type':type,'Cache-Control':'public, max-age=86400, s-maxage=604800','X-Content-Type-Options':'nosniff'}})}}catch{}}
 return placeholder('public, max-age=3600');
}
