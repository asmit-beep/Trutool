import {createHash} from 'node:crypto';
import {absolute} from './content-index';
export function discoveryResponse(request:Request,body:string,type:string,canonical?:string){
 const etag='"'+createHash('sha256').update(body).digest('hex')+'"';
 const headers={'Content-Type':type,'Cache-Control':'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400','X-Robots-Tag':'noindex, follow','X-Content-Type-Options':'nosniff',ETag:etag,Link:`<${absolute('/llms.txt')}>; rel="describedby"; type="text/markdown"${canonical!==undefined?`, <${absolute(canonical||'/')}>; rel="canonical"`:''}`};
 return new Response(request.headers.get('if-none-match')===etag?null:body,{status:request.headers.get('if-none-match')===etag?304:200,headers});
}
