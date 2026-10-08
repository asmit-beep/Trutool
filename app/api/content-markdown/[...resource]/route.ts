import {getContentPage} from '@/lib/content-index';
import {pageMarkdown} from '@/lib/discovery';
import {discoveryResponse} from '@/lib/discovery-response';
export const revalidate=3600;
export async function GET(request:Request,{params}:{params:Promise<{resource:string[]}>}){
 const {resource}=await params,path='/'+resource.join('/');
 const original=path==='/index'?'':path,page=getContentPage(original);
 if(!page)return new Response('Not found',{status:404,headers:{'X-Robots-Tag':'noindex'}});
 return discoveryResponse(request,pageMarkdown(page),'text/markdown; charset=utf-8',page.path);
}
