// One-time migration utility. Runs only in a dedicated Vercel preview build.
// Never deletes source objects, overwrites conflicts, or prints private contents.
import {createHash} from 'node:crypto';
import {list as blobList,get as blobGet} from '@vercel/blob';
const branch='migration/trutool-storage-consolidation-20261112';
if(process.env.VERCEL_ENV!=='preview'||process.env.VERCEL_GIT_COMMIT_REF!==branch){
 console.log('TruTool migration skipped outside dedicated staging branch');process.exit(0);
}
const apply=process.env.TRUTOOL_MIGRATION_APPLY==='true';
const root=(process.env.SUPABASE_URL||'').replace(/\/$/,'');
const secret=process.env.SUPABASE_SECRET_KEY;
const legacyToken=process.env.TRUTOOL_LEGACY_EXPORT_TOKEN;
if(root!=='https://jbhifpklfxbixnutklfv.supabase.co'||!secret||!legacyToken||!process.env.BLOB_READ_WRITE_TOKEN)throw Error('Migration credentials/destination invalid');
const auth={apikey:secret,Authorization:'Bearer '+secret};
const oldFn='https://ztuxluvdnmbaushajshm.supabase.co/functions/v1/trutool-legacy-media-export';
const sha=buffer=>createHash('sha256').update(buffer).digest('hex');
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
const encodePath=p=>p.split('/').map(encodeURIComponent).join('/');
const assertOk=(r,label)=>{if(!r.ok)throw Error(label+' HTTP '+r.status);return r;};
const api=(p,opts={})=>fetch(root+p,{...opts,cache:'no-store',headers:{...auth,...opts.headers}});
async function legacy(action,path){
 const u=new URL(oldFn);u.searchParams.set('action',action);if(path)u.searchParams.set('path',path);
 return fetch(u,{cache:'no-store',headers:{'x-trutool-legacy-token':legacyToken}});
}
async function getStored(bucket,path){
 const r=await api('/storage/v1/object/authenticated/'+bucket+'/'+encodePath(path));
 if(r.status===404)return null;
 if(r.status===400){
  const t=await r.text();
  if(/not found|does not exist|404|no such object/i.test(t))return null;
  throw Error('Storage read invalid '+bucket+' HTTP 400');
 }
 return Buffer.from(await assertOk(r,'Storage read '+bucket).arrayBuffer());
}
async function storeBytes(bucket,path,data,mime){
 const prior=await getStored(bucket,path);
 if(prior){if(sha(prior)!==sha(data))throw Error('Existing file differs '+bucket+'/'+path);return 'identical';}
 if(!apply)return 'missing';
 const r=await api('/storage/v1/object/'+bucket+'/'+encodePath(path),{method:'POST',body:data,headers:{'content-type':mime,'x-upsert':'false'}});
 if(!r.ok){
  const concurrent=await getStored(bucket,path);
  if(!concurrent||sha(concurrent)!==sha(data))throw Error('Upload '+bucket+' HTTP '+r.status);
 }
 const check=await getStored(bucket,path);
 if(!check||sha(check)!==sha(data))throw Error('SHA256 verification failed '+bucket+'/'+path);
 return 'copied';
}
async function getRow(path){
 const query=new URLSearchParams({select:'path,payload',path:'eq.'+path,limit:'1'});
 const data=await assertOk(await api('/rest/v1/trutool_objects?'+query),'Read DB row').json();
 return data[0]||null;
}
async function saveIfMissing(path,payload){
 const row=await getRow(path);
 if(row)return equal(row.payload,payload)?'identical':'conflict';
 if(!apply)return 'missing';
 assertOk(await api('/rest/v1/trutool_objects?on_conflict=path',{method:'POST',body:JSON.stringify({path,payload}),headers:{'content-type':'application/json',Prefer:'resolution=ignore-duplicates,return=minimal'}}),'Insert DB row');
 const saved=await getRow(path);
 if(!saved||!equal(saved.payload,payload))throw Error('Stored DB row failed validation');
 return 'copied';
}
const blobs=[];
let cursor;
do{
 const page=await blobList({cursor,limit:1000});
 blobs.push(...page.blobs);
 cursor=page.hasMore?page.cursor:undefined;
 if(cursor&&(!page.blobs.length||blobs.length>20000))throw Error('Blob pagination failed');
}while(cursor);
if(blobs.length<104||new Set(blobs.map(x=>x.pathname)).size!==blobs.length)throw Error('Unexpected Vercel Blob inventory: '+blobs.length);
const legacyFiles=await assertOk(await legacy('list'),'Old media inventory').json();
if(!Array.isArray(legacyFiles)||legacyFiles.length!==29||new Set(legacyFiles.map(x=>x.name)).size!==29)throw Error('Unexpected old media inventory');
const summary={apply,blobObjects:blobs.length,oldMedia:legacyFiles.length,sourcePrefixes:{},oldMediaResults:{copied:0,missing:0,identical:0},archive:{copied:0,missing:0,identical:0},media:{copied:0,missing:0,identical:0},db:{copied:0,missing:0,identical:0,conflict:0},conflicts:[]};
async function eachConcurrent(items,limit,work){
 let next=0;
 await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{
  while(next<items.length){const i=next++;await work(items[i]);}
 }));
}
await eachConcurrent(legacyFiles,8,async(item)=>{
 const path=item.name;
 if(!/^cms\/media\/[a-f0-9-]{36}\.webp$/i.test(path))throw Error('Unrecognized old image path');
 const file=await assertOk(await legacy('get',path),'Download old image');
 const bytes=Buffer.from(await file.arrayBuffer());
 if(bytes.length<16||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')throw Error('Old image damaged '+path);
 const r=await storeBytes('trutool-media',path,bytes,'image/webp');
 summary.oldMediaResults[r]++;
});
await eachConcurrent(blobs,8,async(blob)=>{
 const path=blob.pathname;
 if(!/^[a-z0-9][a-z0-9/_-]*\.(?:json|webp)$/i.test(path)||path.includes('..')||path.startsWith('/'))throw Error('Unexpected Blob pathname '+path);
 const prefix=path.split('/')[0];summary.sourcePrefixes[prefix]=(summary.sourcePrefixes[prefix]||0)+1;
 const result=await blobGet(path,{access:'private',useCache:false});
 if(!result||result.statusCode!==200)throw Error('Private Blob read failed '+path);
 const bytes=Buffer.from(await new Response(result.stream).arrayBuffer());
 if(!bytes.length)throw Error('Zero-length Blob '+path);
 const media=path.endsWith('.webp'),mime=media?'image/webp':'application/json';
 // Archive original source bytes under their exact original keys, never overwrite.
 try{
  summary.archive[await storeBytes('trutool-migration-archive','vercel-blob/'+path,bytes,mime)]++;
 }catch(error){
  if(!(error instanceof Error)||!error.message.startsWith('Existing file differs'))throw error;
  // A source object changed during cutover. Preserve both byte-for-byte versions.
  summary.archive[await storeBytes('trutool-migration-archive','vercel-blob-revisions/'+sha(bytes)+'/'+path,bytes,mime)]++;
  summary.conflicts.push('source-revised:'+path);
 }
 if(media){
  const existing=await getStored('trutool-media',path);
  if(existing&&sha(existing)!==sha(bytes)){summary.conflicts.push('media differs: '+path);return;}
  summary.media[await storeBytes('trutool-media',path,bytes,mime)]++;
  const state=await saveIfMissing(path,{media:true,size:bytes.length,contentType:mime});
  summary.db[state]++;if(state==='conflict')summary.conflicts.push(path);
 }else{
  let parsed;try{parsed=JSON.parse(bytes.toString('utf8'));}catch{throw Error('Invalid Blob JSON '+path);}
  if(path==='cms/content-v1.json'){
   const existing=await getRow(path),source=parsed,dest=existing?.payload?.data;
   if(Array.isArray(source?.records)&&Array.isArray(dest?.records)){
    const sourceMap=new Map(source.records.map(r=>[r.id,r]));
    const destMap=new Map(dest.records.map(r=>[r.id,r]));
    const onlySource=[...sourceMap.keys()].filter(id=>!destMap.has(id));
    const onlyDestination=[...destMap.keys()].filter(id=>!sourceMap.has(id));
    const changed=[...sourceMap.keys()].filter(id=>destMap.has(id)&&!equal(sourceMap.get(id),destMap.get(id)));
    summary.cmsComparison={sourceRecordCount:source.records.length,destinationRecordCount:dest.records.length,
      sourceRevision:source.revision,destinationRevision:dest.revision,
      sourceOnlyRecordIds:onlySource,productionOnlyRecordIds:onlyDestination,
      changedRecordIds:changed,sourceActivity:source.activity?.length,destinationActivity:dest.activity?.length};
   }
  }
  const state=await saveIfMissing(path,{data:parsed,contentType:mime});
  summary.db[state]++;if(state==='conflict')summary.conflicts.push(path);
 }
});
summary.conflicts=summary.conflicts.map(x=>x.startsWith('enquiries/')?'enquiries/<redacted>':x).slice(0,30);
console.log('TRUTOOL_STORAGE_MIGRATION_SUMMARY '+JSON.stringify(summary));
if(apply&&(summary.archive.missing||summary.oldMediaResults.missing||summary.media.missing||summary.db.missing))throw Error('Migration left unresolved missing copies');
if(summary.conflicts.length)console.log('TRUTOOL_STORAGE_CONFLICTS_REQUIRE_RECONCILIATION');
