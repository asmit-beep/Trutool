/** Only Google-owned export URLs are fetched; pasted URLs never become arbitrary server requests. */
export class DocumentImportError extends Error {
 constructor(message:string,public status=400){super(message);}
}
export function documentExportUrl(value:string){
 let url:URL;try{url=new URL(value.trim());}catch{throw new DocumentImportError('Paste a Google Docs document link.');}
 const match=url.pathname.match(/^\/document\/(?:u\/\d+\/)?d\/([A-Za-z0-9_-]{20,200})(?:\/|$)/);
 if(url.protocol!=='https:'||url.hostname!=='docs.google.com'||url.port||url.username||url.password||!match)
  throw new DocumentImportError('Use a Google Docs link such as https://docs.google.com/document/d/…/edit.');
 const target=new URL('https://docs.google.com/document/d/'+match[1]+'/export');target.searchParams.set('format','md');
 // A link to an individual document tab should import that tab.
 const tab=url.searchParams.get('tab');if(tab&&/^t\.[a-zA-Z0-9_-]{1,100}$/.test(tab))target.searchParams.set('tab',tab);
 return target;
}
export function normalizeDocumentMarkdown(body:string){
 const references=new Map<string,string>();let imagesOmitted=0;
 body=body.replace(/^ {0,3}\[([^\]]+)\]:\s*(?:<([^>]+)>|(\S+))(?:[^\n]*)$/gm,(_,name,angle,plain)=>{references.set(name.toLowerCase(),angle||plain);return '';});
 const imageText=(alt:string)=>{imagesOmitted++;return '[Image'+(alt?': '+alt:'')+' — upload this image in Studio]';};
 body=body.replace(/!\[([^\]]*)\]\[([^\]]*)\]/g,(_,alt,label)=>imageText(alt||label));
 body=body.replace(/!\[([^\]]*)\]\((?:<[^>]*>|[^)]*)\)/g,(_,alt)=>imageText(alt));
 body=body.replace(/\[([^\]]+)\]\[([^\]]*)\]/g,(original,label,key)=>{const href=references.get((key||label).toLowerCase());return href?'['+label+']('+href+')':original;});
 return {markdown:body.replace(/\n{3,}/g,'\n\n').trim(),imagesOmitted};
}
const accessMessage='This document is not readable. In Google Docs, set General access to “Anyone with the link” and Viewer, then try again. Downloading must also be allowed.';
export async function importDocument(value:string,fetcher:typeof fetch=fetch){
 let url=documentExportUrl(value);const signal=AbortSignal.timeout(15000);let response:Response|undefined;
 try{
  for(let redirects=0;redirects<=4;redirects++){
   response=await fetcher(url,{cache:'no-store',redirect:'manual',signal,headers:{Accept:'text/markdown, text/plain;q=0.9'}});
   if(![301,302,303,307,308].includes(response.status))break;
   const location=response.headers.get('location');if(!location)throw new DocumentImportError(accessMessage,422);
   const next=new URL(location,url);
   if(next.protocol!=='https:'||next.port||next.username||next.password||!(next.hostname==='docs.google.com'||next.hostname.endsWith('.googleusercontent.com')))
    throw new DocumentImportError(accessMessage,422);
   await response.body?.cancel();url=next;response=undefined;
  }
  if(!response||!response.ok)throw new DocumentImportError(accessMessage,422);
  const type=response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if(!['text/markdown','text/x-markdown','text/plain','application/octet-stream'].includes(type||''))throw new DocumentImportError(accessMessage,422);
  const maxBytes=10_000_000;
  if(Number(response.headers.get('content-length'))>maxBytes)throw new DocumentImportError('This document is too large. Import a shorter document (up to 10 MB including images).',413);
  const reader=response.body?.getReader();if(!reader)throw new DocumentImportError('This document is empty.',422);
  let bytes=0,body='';const decoder=new TextDecoder('utf-8',{fatal:true});
  try{for(;;){const {value,done}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>maxBytes){await reader.cancel();throw new DocumentImportError('This document is too large. Import a shorter document.',413);}body+=decoder.decode(value,{stream:true});}body+=decoder.decode();}finally{reader.releaseLock();}
  body=body.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').trim();
  const normalized=normalizeDocumentMarkdown(body);body=normalized.markdown;
  if(!body)throw new DocumentImportError('This document has no text to import.',422);
  if(body.length>160000)throw new DocumentImportError('This document exceeds the 160,000-character editor limit.',413);
  if(/^\s*(?:<!doctype html|<html|<head|<body)/i.test(body))throw new DocumentImportError(accessMessage,422);
  let filename='';const disposition=response.headers.get('content-disposition')||'';
  try{filename=decodeURIComponent(disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]||disposition.match(/filename="([^"\n]+)"/i)?.[1]||'').replace(/\.md$/i,'');}catch{}
  const title=(filename||body.match(/^# (.+)$/m)?.[1]?.replace(/[*_`]/g,'').trim()||'').slice(0,240);
  return {markdown:body,title,characters:body.length,words:body.split(/\s+/).length,imagesOmitted:normalized.imagesOmitted};
 }catch(error){if(error instanceof DocumentImportError)throw error;throw new DocumentImportError('The document could not be downloaded. Check the link and sharing settings, then try again.',502);}
}
