// Irreversible cleanup: only runs in an explicitly armed, isolated Vercel preview build.
// Verifies every current source object against its byte-identical archived copy in Supabase.
// No object is deleted if source/archive differs, the inventory grows, or Supabase isn't healthy.
import {createHash} from 'node:crypto';
import {list as blobList,get as blobGet,del as blobDelete} from '@vercel/blob';
const expectedBranch='migration/trutool-storage-consolidation-20261112';
if(process.env.VERCEL_ENV!=='preview'||process.env.VERCEL_GIT_COMMIT_REF!==expectedBranch){
 console.log('Legacy Blob deletion deliberately skipped outside dedicated migration preview');
 process.exit(0);
}
if(process.env.TRUTOOL_BLOB_DELETE_CONFIRMED!=='true')throw Error('Legacy Blob deletion not authorized in branch environment');
const root=(process.env.SUPABASE_URL||'').replace(/\/$/,'');
const secret=process.env.SUPABASE_SECRET_KEY;
if(root!=='https://jbhifpklfxbixnutklfv.supabase.co'||!secret||!process.env.BLOB_READ_WRITE_TOKEN)throw Error('Expected source/destination credentials missing');
const sha=b=>createHash('sha256').update(b).digest('hex');
const headers={apikey:secret,Authorization:'Bearer '+secret};
const enc=p=>p.split('/').map(encodeURIComponent).join('/');
async function storage(bucket,key){
 const response=await fetch(root+'/storage/v1/object/authenticated/'+bucket+'/'+enc(key),{headers,cache:'no-store'});
 if(!response.ok)throw Error('Supabase archived object unavailable: '+response.status);
 return Buffer.from(await response.arrayBuffer());
}
const countsRes=await fetch(root+'/rest/v1/trutool_objects?select=path&limit=1',{headers:{...headers,Prefer:'count=exact'},cache:'no-store'});
if(!countsRes.ok)throw Error('Supabase database health check failed');
const count=Number((countsRes.headers.get('content-range')||'').split('/').at(-1));
if(!(count>=192))throw Error('Destination database unexpectedly sparse');
const filesRes=await fetch(root+'/storage/v1/object/list/trutool-media',{method:'POST',headers:{...headers,'content-type':'application/json'},body:JSON.stringify({prefix:'',limit:1000,offset:0})});
if(!filesRes.ok)throw Error('Destination storage media health check failed');
const blobs=[];let cursor;
do{
 const page=await blobList({cursor,limit:1000});
 blobs.push(...page.blobs);cursor=page.hasMore?page.cursor:undefined;
 if(cursor&&(!page.blobs.length||blobs.length>20000))throw Error('Blob listing/pagination failed');
}while(cursor);
if(blobs.length!==104||new Set(blobs.map(x=>x.pathname)).size!==104)throw Error('Expected exactly 104 original Blob objects; found '+blobs.length);
let checked=0,mediaMatched=0,recordMatched=0,legacyRevisionArchived=0;
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
let index=0;
await Promise.all(Array.from({length:8},async()=>{
 while(index<blobs.length){
  const item=blobs[index++],key=item.pathname;
  if(!/^[a-z0-9][a-z0-9/_-]*\.(?:json|webp)$/i.test(key)||key.includes('..'))throw Error('Invalid storage pathname');
  const r=await blobGet(key,{access:'private',useCache:false});
  if(!r||r.statusCode!==200)throw Error('Blob read failed');
  const original=Buffer.from(await new Response(r.stream).arrayBuffer());
  const archive=await storage('trutool-migration-archive','vercel-blob/'+key);
  if(sha(original)!==sha(archive))throw Error('Source/archive SHA256 mismatch; refusing to delete');
  if(key.endsWith('.webp')){
   const active=await storage('trutool-media',key);
   if(sha(original)!==sha(active))throw Error('Active media SHA256 mismatch; refusing to delete');
   mediaMatched++;
  }else if(key==='cms/content-v1.json'){legacyRevisionArchived++;}
  else{
   const q=new URLSearchParams({select:'payload',path:'eq.'+key,limit:'1'});
   const result=await fetch(root+'/rest/v1/trutool_objects?'+q,{headers,cache:'no-store'});
   if(!result.ok)throw Error('DB read failed: '+result.status);
   const rows=await result.json();
   if(rows.length!==1||!equal(rows[0].payload?.data,JSON.parse(original.toString('utf8'))))throw Error('Active JSON record differs; refusing to delete');
   recordMatched++;
  }
  checked++;
 }
}));
if(checked!==104||mediaMatched!==11||recordMatched!==92||legacyRevisionArchived!==1)throw Error('Unrecognized object breakdown: '+JSON.stringify({checked,mediaMatched,recordMatched,legacyRevisionArchived}));
console.log('TRUTOOL_LEGACY_BLOB_DELETION_PRECHECK '+JSON.stringify({source:104,archivedByteForByte:104,activeMediaMatched:mediaMatched,activeRecordMatched:recordMatched,oldCmsRevisionArchived:1,dbRows:count}));
for(let i=0;i<blobs.length;i+=25)await blobDelete(blobs.slice(i,i+25).map(x=>x.pathname));
const remaining=[];cursor=undefined;
do{
 const page=await blobList({cursor,limit:1000});remaining.push(...page.blobs);cursor=page.hasMore?page.cursor:undefined;
 if(cursor&&(!page.blobs.length||remaining.length>20000))throw Error('Post-deletion pagination failed');
}while(cursor);
if(remaining.length)throw Error('Deletion incomplete: '+remaining.length+' objects remain');
console.log('TRUTOOL_LEGACY_BLOB_DELETION_COMPLETE '+JSON.stringify({deleted:104,remaining:0,archiveRetained:104,mediaRetained:40}));
