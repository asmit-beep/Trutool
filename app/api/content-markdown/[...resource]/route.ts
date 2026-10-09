import { publicPages } from '@/lib/cms-public';
import { isHidden } from '@/lib/cms-store';
import { getContentPage } from '@/lib/content-index';
import { pageMarkdown } from '@/lib/discovery';
import { discoveryResponse } from '@/lib/discovery-response';
export const revalidate=30;
export async function GET(request:Request,{params}:{params:Promise<{resource:string[]}>}){
 const {resource}=await params,path='/'+resource.join('/');
 const original=path==='/index'?'':path,pages=await publicPages(),page=pages.find(p=>p.path===original)||(!await isHidden(original)?getContentPage(original):undefined);
 if(!page)return new Response('Not found',{status:404,headers:{'X-Robots-Tag':'noindex'}});
 return discoveryResponse(request,pageMarkdown(page,pages),'text/markdown; charset=utf-8',page.path);
}
