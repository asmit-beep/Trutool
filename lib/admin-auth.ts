import { BlobPreconditionFailedError,get,put } from '@vercel/blob';
import { cookies } from 'next/headers';
import { createHmac,randomUUID,scryptSync,timingSafeEqual } from 'node:crypto';
import 'server-only';
export const ADMIN_COOKIE='trutool_admin';
const ttl=8*3600;
const secret=()=>process.env.ADMIN_SESSION_SECRET;
const mac=(s:string)=>createHmac('sha256',secret()!).update(s).digest('hex');
export function checkPassword(password:string){const hash=process.env.ADMIN_PASSWORD_HASH;if(!hash||password.length>200)return false;const [salt,digest]=hash.split(':');if(!salt||!digest||!/^[a-f0-9]{128}$/.test(digest))return false;return timingSafeEqual(scryptSync(password,salt,64),Buffer.from(digest,'hex'));}
export function makeSession(){if(!secret())throw new Error('Admin unavailable');const payload=`${Math.floor(Date.now()/1000)}.${randomUUID()}`;return payload+'.'+mac(payload);}
export function validSession(value:string){if(!secret()||!process.env.ADMIN_PASSWORD_HASH)return false;const [at,id,sig,...extra]=value.split('.'),payload=at+'.'+id;if(extra.length||!/^\d{10}$/.test(at||'')||!/^[-a-f0-9]{36}$/.test(id||'')||!/^[a-f0-9]{64}$/.test(sig||''))return false;const age=Date.now()/1000-Number(at);return age>=0&&age<ttl&&timingSafeEqual(Buffer.from(sig,'hex'),Buffer.from(mac(payload),'hex'));}
export async function authenticated(){return validSession((await cookies()).get(ADMIN_COOKIE)?.value||'');}
export function sameOrigin(r:Request){try{const origin=new URL(r.headers.get('origin')||'');return origin.host===r.headers.get('host')&&['http:','https:'].includes(origin.protocol)&&(!process.env.VERCEL||origin.protocol==='https:');}catch{return false;}}
export const privateResponse=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff'}});
export async function loginAttempt(r:Request){
 const key=createHmac('sha256',secret()!).update(r.headers.get('x-vercel-forwarded-for')||r.headers.get('x-forwarded-for')||'unknown').digest('hex'),bucket=Math.floor(Date.now()/900000),path=`cms/security/login-${key}-${bucket}.json`;
 if(!process.env.BLOB_READ_WRITE_TOKEN){if(process.env.VERCEL)throw new Error('Admin unavailable');const key=path,counters=localAttempts;const n=counters.get(key)||0;if(n>=10)return false;counters.set(key,n+1);return true;}
 for(let i=0;i<3;i++){const res=await get(path,{access:'private',useCache:false}),n=res?.statusCode===200?Number((await new Response(res.stream).json()).count)||0:0;if(n>=10)return false;
 try{await put(path,JSON.stringify({count:n+1}),{access:'private',contentType:'application/json',addRandomSuffix:false,...(res?.statusCode===200?{ifMatch:res.blob.etag,allowOverwrite:true}:{allowOverwrite:false})});return true;}catch(e){if(!(e instanceof BlobPreconditionFailedError))throw e;}}
 return false;
}
const localAttempts=new Map<string,number>();
export const sessionOptions={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict' as const,path:'/',maxAge:ttl};
