import { authenticated,privateResponse,sameOrigin } from '@/lib/admin-auth';
import { DocumentImportError,importDocument } from '@/lib/document-import';
export const dynamic='force-dynamic';
export const maxDuration=30;
export async function POST(request:Request){
 if(!await authenticated())return privateResponse({error:'Please sign in.'},401);
 if(!sameOrigin(request))return privateResponse({error:'Invalid origin.'},403);
 try{
  const raw=await request.text();if(raw.length>5000)return privateResponse({error:'The document link is too long.'},413);
  let input;try{input=JSON.parse(raw);}catch{return privateResponse({error:'Paste a valid document link.'},400);}
  if(typeof input?.url!=='string'||input.url.length>2000)return privateResponse({error:'Paste a valid document link.'},400);
  return privateResponse(await importDocument(input.url));
 }catch(error){return privateResponse({error:error instanceof DocumentImportError?error.message:'The document could not be imported.'},error instanceof DocumentImportError?error.status:502);}
}
