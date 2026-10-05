import {categories} from '@/lib/catalog';
import {createHash,randomUUID} from 'node:crypto';
import {list,put} from '@vercel/blob';
export const runtime='nodejs';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Please submit this form from the website.'},{status:403});
 if(Number(request.headers.get('content-length')||0)>12000)return Response.json({error:'Your message is too long.'},{status:413});
 try{
 const raw=await request.text();if(raw.length>12000)return Response.json({error:'Your message is too long.'},{status:413});
 let x;try{x=JSON.parse(raw);}catch{return Response.json({error:'Please send a valid form submission.'},{status:400});}
 if(!x||typeof x!=='object'||Array.isArray(x))return Response.json({error:'Please send a valid form submission.'},{status:400});
 if(typeof x.website==='string'&&x.website)return Response.json({error:'Please leave the optional verification field empty.'},{status:400});
 const name=typeof x.name==='string'?x.name.trim():'';const email=typeof x.email==='string'?x.email.trim().toLowerCase():'';const topic=typeof x.topic==='string'?x.topic:'';const message=typeof x.message==='string'?x.message.trim():'';
 if(name.length<2||name.length>100||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||!['conversation','correction','suggestion','privacy'].includes(topic)||message.length<20||message.length>4000)return Response.json({error:'Check your name, email, topic, and message (20–4,000 characters).'},{status:400});
 let product:{name:string;url:string;category:string}|undefined;
 if(x.product!==undefined){
  if(topic!=='suggestion'||!x.product||typeof x.product!=='object'||Array.isArray(x.product))return Response.json({error:'Please send valid product details.'},{status:400});
  const productName=typeof x.product.name==='string'?x.product.name.trim():'';
  const productUrl=typeof x.product.url==='string'?x.product.url.trim():'';
  const category=typeof x.product.category==='string'?x.product.category:'';
  if(productName.length<2||productName.length>100||productUrl.length>2048||!(category==='other'||categories.some(c=>c.slug===category)))return Response.json({error:'Check your product name, website, and category.'},{status:400});
  let url:URL;try{url=new URL(productUrl);}catch{return Response.json({error:'Enter a valid official website starting with https:// or http://.'},{status:400});}
  if(!['https:','http:'].includes(url.protocol)||!url.hostname||url.username||url.password)return Response.json({error:'Enter a valid official website starting with https:// or http://.'},{status:400});
  product={name:productName,url:url.href,category};
 }
 if(!process.env.BLOB_READ_WRITE_TOKEN)throw new Error('Contact inbox is not configured');
 const hour=new Date().toISOString().slice(0,13);const key=createHash('sha256').update(email+process.env.BLOB_READ_WRITE_TOKEN).digest('hex');const prefix=`enquiries/${hour}/${key}/`;
 const recent=await list({prefix,limit:5});if(recent.blobs.length>=5)return Response.json({error:'You have sent several messages recently. Please try again later.'},{status:429});
 const id=randomUUID(),createdAt=new Date().toISOString();
 await put(prefix+id+'.json',JSON.stringify({id,name,email,topic,message,createdAt,...(product?{product}:{})}),{access:'private',contentType:'application/json',addRandomSuffix:false});
 return Response.json({ok:true,id});
 }catch{console.error('Contact submission could not be saved');return Response.json({error:'We could not save your message. Your text is still here; please try again.'},{status:503});}
}
