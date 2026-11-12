import {createHash,randomUUID} from 'node:crypto';
import {list,put} from '@/lib/private-storage';
import {categories} from '@/lib/catalog';
import {getCommunityAnswer} from '@/lib/community-answers';
import {getPublished} from '@/lib/cms-store';
export const runtime='nodejs';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Submit your question from the community page.'},{status:403});
 if(Number(request.headers.get('content-length')||0)>8000)return Response.json({error:'Your submission is too long.'},{status:413});
 try{const raw=await request.text();if(raw.length>8000)return Response.json({error:'Your submission is too long.'},{status:413});let x;try{x=JSON.parse(raw)}catch{return Response.json({error:'Invalid submission.'},{status:400})}
 if(!x||typeof x!=='object'||Array.isArray(x)||x.website)return Response.json({error:'Invalid submission.'},{status:400});
 const name=typeof x.name==='string'?x.name.trim():'',email=typeof x.email==='string'?x.email.trim().toLowerCase():'',question=typeof x.question==='string'?x.question.trim():'',message=typeof x.message==='string'?x.message.trim():'',category=typeof x.category==='string'?x.category:'';
 const answer=typeof x.answerSlug==='string'?getCommunityAnswer(x.answerSlug)||((await getPublished()).find(c=>c.kind==='answer'&&c.slug===x.answerSlug)?{slug:x.answerSlug}:undefined):undefined;
 if(!['question','perspective'].includes(x.kind)||name.length<2||name.length>80||email.length>254||(email&&!/^\S+@\S+\.\S+$/.test(email))||x.consent!==true||!(category==='other'||categories.some(c=>c.slug===category))||message.length>1800||(x.kind==='question'&&(question.length<12||question.length>180))||(x.kind==='perspective'&&(message.length<20||(x.answerSlug!==undefined&&!answer))))return Response.json({error:'Check your display name, topic, question or experience, and publication consent.'},{status:400});
 const secret=process.env.ADMIN_SESSION_SECRET||process.env.TRUTOOL_SIGNING_SECRET;
 if(!secret)throw new Error('Community inbox unavailable');
 const hour=new Date().toISOString().slice(0,13),identity=email||request.headers.get('x-forwarded-for')?.split(',')[0].trim()||name,key=createHash('sha256').update(identity+secret).digest('hex'),prefix=`community-submissions/${hour}/${key}/`;
 const recent=await list({prefix,limit:5});if(recent.blobs.length>=5)return Response.json({error:'Please wait before sending another submission.'},{status:429});
 const id=randomUUID();await put(prefix+id+'.json',JSON.stringify({id,kind:x.kind,name,...(email?{email}:{}),category,...(x.kind==='question'?{question}:{answerSlug:answer?.slug}),message,status:'pending',consent:'Publication after moderation',createdAt:new Date().toISOString()}),{access:'private',contentType:'application/json',addRandomSuffix:false});
 return Response.json({ok:true,id});
 }catch{console.error('Community submission could not be saved');return Response.json({error:'We could not save your submission. Your text is still here; please try again.'},{status:503});}
}
