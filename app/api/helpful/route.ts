import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
import {list,put} from '@vercel/blob';
import {getCommunityAnswer} from '@/lib/community-answers';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const prefix='community-helpful/',cookieName='trutool_helpful';
type Snapshot={counts:Map<string,number>;voters:Map<string,Set<string>>};
let snapshot:{expires:number;value:Snapshot}|undefined,pending:Promise<Snapshot>|undefined;
const attempts=new Map<string,{count:number;expires:number}>();
const secret=()=>process.env.BLOB_READ_WRITE_TOKEN;
function sign(id:string){return createHmac('sha256',secret()!).update('trutool-helpful:'+id).digest('hex');}
function visitor(request:Request){const value=(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);if(!value||!secret())return null;const [id,sig]=value.split('.');if(!/^[a-f0-9-]{36}$/.test(id||'')||!/^[a-f0-9]{64}$/.test(sig||''))return null;const expected=sign(id);return timingSafeEqual(Buffer.from(sig),Buffer.from(expected))?id:null;}
const voterKey=(id:string)=>createHmac('sha256',secret()!).update('vote:'+id).digest('hex');
async function loadSnapshot():Promise<Snapshot>{
 if(!secret())return {counts:new Map(),voters:new Map()};
 if(snapshot&&snapshot.expires>Date.now())return snapshot.value;
 if(pending)return pending;
 pending=(async()=>{const counts=new Map<string,number>(),voters=new Map<string,Set<string>>();let cursor:string|undefined;
 do{const page=await list({prefix,limit:1000,cursor});for(const blob of page.blobs){const [slug,key]=blob.pathname.slice(prefix.length).split('/');if(!getCommunityAnswer(slug)||!/^[a-f0-9]{64}\.json$/.test(key||''))continue;const set=voters.get(slug)||new Set<string>();set.add(key.slice(0,-5));voters.set(slug,set);counts.set(slug,set.size);}cursor=page.hasMore?page.cursor:undefined;}while(cursor);
 const value={counts,voters};snapshot={value,expires:Date.now()+15000};return value;})();
 try{return await pending;}finally{pending=undefined;}
}
function response(data:unknown,status=200,headers:Record<string,string>={}){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store',...headers}});}
export async function GET(request:Request){
 const raw=new URL(request.url).searchParams.get('slugs')||'';if(raw.length>1600)return response({error:'Too many answers requested.'},400);
 const slugs=[...new Set(raw.split(',').filter(Boolean))];if(!slugs.length||slugs.length>16||slugs.some(s=>!getCommunityAnswer(s)))return response({error:'Choose up to 16 published answers.'},400);
 try{const data=await loadSnapshot(),id=visitor(request),key=id?voterKey(id):null;return response({counts:Object.fromEntries(slugs.map(slug=>[slug,{count:getCommunityAnswer(slug)!.helpful+(data.counts.get(slug)||0),voted:Boolean(key&&data.voters.get(slug)?.has(key))}]))});}catch{return response({error:'Helpful counts are temporarily unavailable.'},503);}
}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return response({error:'Mark an answer as helpful from this website.'},403);
 if(Number(request.headers.get('content-length')||0)>512)return response({error:'Invalid vote.'},413);
 let slug:string;try{const raw=await request.text();if(raw.length>512)return response({error:'Invalid vote.'},413);const value=JSON.parse(raw);if(!value||typeof value!=='object'||typeof value.slug!=='string'||!getCommunityAnswer(value.slug))return response({error:'Answer not found.'},400);slug=value.slug;}catch{return response({error:'Invalid vote.'},400);}
 if(!secret())return response({error:'We could not save your vote. Please try again later.'},503);
 const existing=visitor(request),id=existing||randomUUID(),key=voterKey(id),now=Date.now();
 for(const [entry,value] of attempts)if(value.expires<now)attempts.delete(entry);
 const attempt=attempts.get(key);if(attempt&&attempt.expires>now&&attempt.count>=30)return response({error:'Please wait before marking more answers.'},429);
 attempts.set(key,{count:(attempt?.count||0)+1,expires:attempt?.expires||now+3600000});
 const headers:Record<string,string>=existing?{}:{'Set-Cookie':`${cookieName}=${id}.${sign(id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${new URL(request.url).protocol==='https:'?'; Secure':''}`};
 try{
 // One deterministic object per answer and signed browser identity: concurrent
 // clicks overwrite the same record, so they cannot increment the total twice.
 await put(prefix+slug+'/'+key+'.json',JSON.stringify({createdAt:new Date().toISOString()}),{access:'private',contentType:'application/json',addRandomSuffix:false,allowOverwrite:true});
 const voters=new Set<string>();let cursor:string|undefined;do{const page=await list({prefix:prefix+slug+'/',limit:1000,cursor});for(const blob of page.blobs)if(/^[a-f0-9]{64}\.json$/.test(blob.pathname.split('/').at(-1)||''))voters.add(blob.pathname);cursor=page.hasMore?page.cursor:undefined;}while(cursor);
 // Keep public counts fresh without using an in-flight snapshot from before the write.
 if(pending)await pending.catch(()=>{}); snapshot=undefined;return response({ok:true,count:getCommunityAnswer(slug)!.helpful+voters.size,voted:true},200,headers);
 }catch{console.error('Helpful vote could not be saved');return response({error:'We could not save your vote. Please try again.'},503);}
}
