'use client';
import { useEffect,useRef,useState } from 'react';
import { AlertCircle,Download,Link2,LoaderCircle } from 'lucide-react';
type Props={body:string;disabled:boolean;onImport:(markdown:string,mode:'append'|'replace',title:string)=>void};
export function AdminDocumentImport({body,disabled,onImport}:Props){
 const [url,setUrl]=useState(''),[mode,setMode]=useState<'append'|'replace'>('append'),[pending,setPending]=useState(false),[error,setError]=useState(''),[status,setStatus]=useState('');
 const controller=useRef<AbortController|null>(null),latest=useRef({body,onImport});
 useEffect(()=>{latest.current={body,onImport};},[body,onImport]);
 useEffect(()=>()=>controller.current?.abort(),[]);
 async function importLink(){
  if(!url.trim()||pending||disabled)return;
  setPending(true);setError('');setStatus('');const abort=new AbortController();controller.current=abort;
  try{
   const response=await fetch('/api/admin/import-document',{method:'POST',credentials:'same-origin',signal:abort.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({url})});
   const result=await response.json();if(!response.ok)throw new Error(result.error||'The document could not be imported.');
   if(abort.signal.aborted)return;
   if(mode==='replace'&&latest.current.body.trim()&&!window.confirm('Replace the current Markdown with this document? Choose Cancel to keep your text.'))return;
   if((mode==='append'?latest.current.body.length+result.markdown.length+2:result.markdown.length)>160000)throw new Error('The combined text exceeds the editor limit. Choose Replace or shorten your draft.');
   latest.current.onImport(result.markdown,mode,result.title);setStatus(`Imported ${result.words.toLocaleString()} words into your draft. ${result.imagesOmitted?` ${result.imagesOmitted} image placeholder(s) added; upload those images separately.`:''} Review the preview before publishing.`);
  }catch(e){if(!abort.signal.aborted)setError((e as Error).message);}finally{if(!abort.signal.aborted)setPending(false);}
 }
 return <section className="studio-document-import" aria-label="Import a Google document">
  <div className="studio-import-heading"><span><Link2 size={17}/>Import from Google Docs</span><small>Link → Markdown → draft</small></div>
  <label htmlFor="studio-doc-link">Document link</label>
  <div className="studio-import-controls"><input id="studio-doc-link" type="url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://docs.google.com/document/d/…/edit" disabled={pending||disabled} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();importLink();}}}/><select aria-label="How to import the document" value={mode} disabled={pending||disabled} onChange={e=>setMode(e.target.value as 'append'|'replace')}><option value="append">Append to draft</option><option value="replace">Replace Markdown</option></select><button type="button" className="studio-btn studio-dark" disabled={!url.trim()||pending||disabled} onClick={importLink}>{pending?<LoaderCircle className="studio-spin" size={16}/>:<Download size={16}/>} {pending?'Importing…':'Import document'}</button></div>
  <p>Paste a link or drop it into the link field. Share as “Anyone with the link · Viewer.” Headings, lists, links, and tables are imported as Markdown. Upload images separately in Media.</p>
  {error&&<div className="studio-import-error" role="alert"><AlertCircle size={16}/>{error}</div>}{status&&<div className="studio-import-status" role="status">{status}</div>}
 </section>;
}
