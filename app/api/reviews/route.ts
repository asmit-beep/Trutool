import {getTool} from '@/lib/catalog';
import {createHash,randomUUID} from 'node:crypto';
import {put,list} from '@vercel/blob';
export const runtime='nodejs';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Submit your review from the website.'},{status:403});
 try{const raw=await request.text();if(raw.length>12000)return Response.json({error:'Your review is too long.'},{status:413});let x;try{x=JSON.parse(raw)}catch{return Response.json({error:'Invalid review submission.'},{status:400})}
 if(!x||typeof x!=='object'||Array.isArray(x))return Response.json({error:'Invalid review submission.'},{status:400});
 const name=typeof x.name==='string'?x.name.trim():'',email=typeof x.email==='string'?x.email.trim().toLowerCase():'',message=typeof x.message==='string'?x.message.trim():'';
 if(x.consent!==true||x.website||typeof x.slug!=='string'||!getTool(x.slug)||!Number.isInteger(x.rating)||x.rating<1||x.rating>5||name.length<2||name.length>100||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||message.length<20||message.length>4000)return Response.json({error:'Check your name, email, rating, and review (20–4,000 characters).'},{status:400});
 if(!process.env.BLOB_READ_WRITE_TOKEN)throw new Error('Inbox unavailable');
 const hour=new Date().toISOString().slice(0,13),key=createHash('sha256').update(email+process.env.BLOB_READ_WRITE_TOKEN).digest('hex'),prefix=`reviews/${hour}/${key}/`;
 const recent=await list({prefix,limit:5});if(recent.blobs.length>=5)return Response.json({error:'Please wait before sending another review.'},{status:429});
 const id=randomUUID();await put(prefix+id+'.json',JSON.stringify({id,slug:x.slug,rating:x.rating,name,email,message,status:'pending',createdAt:new Date().toISOString(),consent:'Publication after moderation'}),{access:'private',contentType:'application/json',addRandomSuffix:false});return Response.json({ok:true,id});
 }catch{return Response.json({error:'We could not save your review. Your text is still here; please try again.'},{status:503})}
}
