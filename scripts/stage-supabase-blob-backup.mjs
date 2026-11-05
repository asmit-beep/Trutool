/**
 * Copy-only, non-destructive TruTool storage backup.
 *
 * Usage:
 *   node scripts/stage-supabase-blob-backup.mjs          # read-only preflight
 *   node scripts/stage-supabase-blob-backup.mjs --copy   # immutable backup copy
 *
 * Prerequisites: SUPABASE_URL, SUPABASE_SECRET_KEY,
 * BLOB_READ_WRITE_TOKEN and BLOB_STORE_ID in the private environment.
 *
 * This tool NEVER changes the website's storage backend, production records,
 * existing Vercel Blob objects, passwords, schema, or the Supabase project.
 * It does not publish CMS data or delete anything. A separate reviewed
 * restore/cutover plan is required after the entire backup is verified.
 *
 * A Supabase HTTP 402 causes a clean failure during preflight, before writes.
 */
import {createHash, randomUUID} from 'node:crypto';
import {get as blobGet, put as blobPut} from '@vercel/blob';

const source='ztuxluvdnmbaushajshm';
const targetStore='store_y0YTE2z6DwXso4Zx';
const base=process.env.SUPABASE_URL;
const secret=process.env.SUPABASE_SECRET_KEY;
const copy=process.argv.includes('--copy');

function assert(value,message){if(!value)throw new Error(message)}
function sha(buffer){return createHash('sha256').update(buffer).digest('hex')}
function bytes(value){return Buffer.isBuffer(value)?value:Buffer.from(value,'utf8')}

async function request(endpoint){
 const response=await fetch(base+endpoint,{
   cache:'no-store',
   headers:{apikey:secret,Authorization:'Bearer '+secret},
 });
 if(!response.ok)throw new Error('Supabase read unavailable: HTTP '+response.status+'. No storage changed.');
 return response;
}

async function fetchRows(){
 const all=[];
 for(let offset=0;;offset+=100){
   const params=new URLSearchParams({
     select:'path,payload,etag,created_at,updated_at',
     order:'path.asc',limit:'100',offset:String(offset),
   });
   const rows=await (await request('/rest/v1/trutool_objects?'+params)).json();
   assert(Array.isArray(rows),'Invalid Supabase inventory.');
   all.push(...rows);
   if(rows.length<100)break;
   assert(offset<100000,'Unexpectedly large inventory; aborting.');
 }
 return all;
}

async function preflight(){
 assert(base==='https://'+source+'.supabase.co','Source project differs from approved TruTool project.');
 assert(typeof secret==='string'&&secret.length>20,'Source key is unavailable.');
 if(copy){
   assert(process.env.BLOB_READ_WRITE_TOKEN,'Vercel Blob credentials unavailable.');
   assert(process.env.BLOB_STORE_ID===targetStore,'Destination Blob store differs from TruTool.');
 }
 const rows=await fetchRows();
 const unique=new Set();
 const files=[];
 for(const row of rows){
   assert(row&&typeof row.path==='string'&&typeof row.payload==='object'&&row.payload,
     'Invalid source row.');
   assert(/^(cms\/|newsletter\/|enquiries\/|community-submissions\/)/.test(row.path),
     'Unexpected path outside TruTool private storage.');
   assert(!unique.has(row.path),'Duplicate source path: '+row.path);
   unique.add(row.path);
   const media=row.payload.media===true;
   let body;
   if(media){
     assert(/^cms\/media\/[a-f0-9-]{36}\.webp$/.test(row.path),'Unexpected media path.');
     const encoded=row.path.split('/').map(encodeURIComponent).join('/');
     body=Buffer.from(await (await request('/storage/v1/object/authenticated/trutool-media/'+encoded)).arrayBuffer());
     assert(body.length>0&&body.length<5_000_000,'Media file missing or invalid.');
   }else{
     assert(Object.hasOwn(row.payload,'data'),'Missing source JSON content.');
     body=bytes(JSON.stringify(row.payload.data));
   }
   files.push({path:row.path,body,media,sha256:sha(body),size:body.length,
     sourceEtag:row.etag,createdAt:row.created_at,updatedAt:row.updated_at});
 }
 const cms=rows.find(row=>row.path==='cms/content-v1.json');
 assert(cms&&cms.payload?.data?.version===1&&Array.isArray(cms.payload?.data?.records),
   'CMS document is absent or invalid.');
 const mediaCount=files.filter(x=>x.media).length;
 assert(mediaCount>0,'CMS media could not be inventoried.');
 return {files,mediaCount,cmsRevision:cms.payload.data.revision,cmsRecords:cms.payload.data.records.length};
}

async function stage(){
 const {files,mediaCount,cmsRevision,cmsRecords}=await preflight();
 console.log(JSON.stringify({mode:copy?'immutable-backup':'preflight-only',sourceProject:source,
   destinationStore:targetStore,totalObjects:files.length,mediaFiles:mediaCount,
   cmsRevision,cmsRecords,totalBytes:files.reduce((sum,f)=>sum+f.size,0)}));
 if(!copy){console.log('No files were written. Rerun with --copy after reviewing preflight.');return;}
 const run=new Date().toISOString().replace(/[:.]/g,'-')+'-'+randomUUID();
 const prefix='migration-snapshots/'+run+'/';
 const manifest={
   version:1,sourceProject:source,destinationStore:targetStore,run,
   createdAt:new Date().toISOString(),cmsRevision,cmsRecords,mediaCount,
   count:files.length,entries:[],
 };
 for(const file of files){
   // Deliberately not cms/* at root: existing production Blob data remains untouched.
   const pathname=prefix+'objects/'+file.path;
   await blobPut(pathname,file.body,{access:'private',addRandomSuffix:false,allowOverwrite:false,
     contentType:file.media?'image/webp':'application/json'});
   const saved=await blobGet(pathname,{access:'private',useCache:false});
   assert(saved?.statusCode===200,'Backup verification failed for '+file.path);
   const persisted=Buffer.from(await new Response(saved.stream).arrayBuffer());
   assert(sha(persisted)===file.sha256&&persisted.length===file.size,
     'Backup hash verification failed for '+file.path);
   manifest.entries.push({sourcePath:file.path,backupPath:pathname,sha256:file.sha256,
     bytes:file.size,media:file.media,sourceEtag:file.sourceEtag,
     createdAt:file.createdAt,updatedAt:file.updatedAt});
 }
 // The manifest is committed last: its presence certifies a fully verified copy.
 const manifestPath=prefix+'verified-manifest.json';
 const saved=await blobPut(manifestPath,JSON.stringify(manifest),{
   access:'private',contentType:'application/json',addRandomSuffix:false,allowOverwrite:false,
 });
 console.log(JSON.stringify({status:'VERIFIED_COPY_ONLY',manifestPath,count:manifest.entries.length,
   url:saved?.url?'private-object-created':undefined,
   note:'Supabase preserved. Production backend unchanged. No cutover performed.'}));
}

stage().catch(error=>{console.error('Backup not complete:',error instanceof Error?error.message:'Unknown error');process.exitCode=1});
