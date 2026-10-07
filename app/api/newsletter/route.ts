import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
import {get,list,put,BlobPreconditionFailedError} from '@vercel/blob';
import {validateSubscription} from '@/lib/newsletter';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const respond=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
const sign=(id:string,secret:string)=>createHmac('sha256',secret).update('newsletter-manage:'+id).digest('hex');
async function load(path:string){const result=await get(path,{access:'private',useCache:false});if(!result||result.statusCode!==200)return null;return {data:await new Response(result.stream).json(),etag:result.blob.etag};}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return respond({error:'Please use the newsletter form on TruTool.'},403);
 if(Number(request.headers.get('content-length')||0)>2048)return respond({error:'Your submission is too long.'},413);
 let value:unknown;try{const raw=await request.text();if(raw.length>2048)return respond({error:'Your submission is too long.'},413);value=JSON.parse(raw);}catch{return respond({error:'Please send a valid subscription.'},400);}
 const action=value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:null;
 const subscription=action?.action==='unsubscribe'?null:validateSubscription(value);
 if(!subscription&&action?.action!=='unsubscribe')return respond({error:'Enter a valid email, choose a topic, and agree to receive the newsletter.'},400);
 const secret=process.env.BLOB_READ_WRITE_TOKEN;if(!secret)return respond({error:'Subscriptions are temporarily unavailable. Please try again shortly.'},503);
 try{
  if(action?.action==='unsubscribe'){
   const token=typeof action.token==='string'?action.token:'',parts=token.split('.'),[id,sig]=parts;
   if(parts.length!==2||!/^([a-f0-9]{64})$/.test(id)||!/^([a-f0-9]{64})$/.test(sig)||!timingSafeEqual(Buffer.from(sig),Buffer.from(sign(id,secret))))return respond({error:'This unsubscribe link is not valid.'},400);
   const path='newsletter/subscribers/'+id+'.json',existing=await load(path);
   if(existing&&existing.data.status!=='unsubscribed')await put(path,JSON.stringify({...existing.data,status:'unsubscribed',unsubscribedAt:new Date().toISOString()}),{access:'private',contentType:'application/json',addRandomSuffix:false,ifMatch:existing.etag});
   return respond({ok:true,unsubscribed:true});
  }
  const {email,topics,source}=subscription!;
  const identity=request.headers.get('x-forwarded-for')?.split(',')[0].trim()||email;
  const limiter=createHmac('sha256',secret).update('newsletter-rate:'+identity).digest('hex'),hour=new Date().toISOString().slice(0,13),ratePrefix=`newsletter/attempts/${hour}/${limiter}/`;
  const attempts=await list({prefix:ratePrefix,limit:10});if(attempts.blobs.length>=10)return respond({error:'Please wait a while before sending another subscription.'},429);
  await put(ratePrefix+randomUUID()+'.json',JSON.stringify({createdAt:new Date().toISOString()}),{access:'private',contentType:'application/json',addRandomSuffix:false});
  const id=createHmac('sha256',secret).update('newsletter-email:'+email).digest('hex'),path='newsletter/subscribers/'+id+'.json',token=id+'.'+sign(id,secret);
  const existing=await load(path);
  if(existing?.data.status==='subscribed')return respond({ok:true,already:true,manageUrl:'/newsletter?unsubscribe='+token});
  const record={email,topics,source,status:'subscribed',consentVersion:'newsletter-v1',consentedAt:new Date().toISOString(),createdAt:existing?.data.createdAt||new Date().toISOString()};
  try{await put(path,JSON.stringify(record),{access:'private',contentType:'application/json',addRandomSuffix:false,...(existing?{ifMatch:existing.etag}:{allowOverwrite:false})});}
  catch(error){if(error instanceof BlobPreconditionFailedError||(await load(path))?.data.status==='subscribed'){
   if((await load(path))?.data.status==='subscribed')return respond({ok:true,already:true,manageUrl:'/newsletter?unsubscribe='+token});
  }throw error;}
  return respond({ok:true,manageUrl:'/newsletter?unsubscribe='+token});
 }catch{console.error('Newsletter request could not be saved');return respond({error:'We could not save your request. Your email is still here; please try again.'},503);}
}
