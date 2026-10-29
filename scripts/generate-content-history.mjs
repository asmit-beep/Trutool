import fs from 'node:fs';
import {createHash} from 'node:crypto';
import ts from 'typescript';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {loadContent} from './load-content.mjs';
export function contentHistory(index,previous,timestamp){
 const next={},changed=[];
 const textCache=new Map();
 const visibleText=(file)=>{if(textCache.has(file))return textCache.get(file);const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),text=[];const visit=node=>{if(ts.isJsxText(node)&&node.text.trim())text.push(node.text.replace(/\s+/g,' ').trim());ts.forEachChild(node,visit);};visit(source);textCache.set(file,text);return text;};
 for(const page of index.contentPages){
  const pieces=page.path.split('/').filter(Boolean),template=pieces.length>1?`app/${pieces[0]}/[slug]/page.tsx`:page.path?`app${page.path}/page.tsx`:'app/page.tsx';
  const hash=createHash('sha256').update(JSON.stringify(index.contentRevision(page))).update(JSON.stringify(visibleText(template))).digest('hex').slice(0,32);
  const prior=previous[page.path],same=prior?.fingerprintVersion!==2||prior?.hash===hash;
  next[page.path]={hash,fingerprintVersion:2,modified:prior&&same?prior.modified:timestamp};
  if(!prior||prior.fingerprintVersion===2&&prior.hash!==hash)changed.push(page.path||'/');
 }
 return {next,changed};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),write=args.includes('--write'),dateIndex=args.indexOf('--date');
 const date=dateIndex>=0?args[dateIndex+1]:new Date().toISOString();
 if(!date||!Number.isFinite(Date.parse(date))||Date.parse(date)>Date.now()||dateIndex>=0&&!write)throw new Error('Use --write --date with a valid, non-future content revision timestamp.');
 const timestamp=new Date(date).toISOString(),{index,cleanup}=loadContent();
 try{
  const file='lib/content-history.json',before=fs.readFileSync(file,'utf8');
  const {next,changed}=contentHistory(index,JSON.parse(before),write?timestamp:'2026-10-29T08:45:00.000Z'),output=JSON.stringify(next,null,1)+'\n';
  if(output!==before){
   if(!write){for(let i=0;i<changed.length;i+=10){const group=changed.slice(i,i+10);console.log('TRUTOOL_HISTORY_PATCH_PART='+JSON.stringify(Object.fromEntries(group.map(p=>[p,next[p]]))));}throw new Error(`Content history is out of date (${changed.length} revisions: ${changed.slice(0,5).join(', ')}). Run pnpm content:history and commit lib/content-history.json with the content change. Builds never rewrite dates.`);}
   fs.writeFileSync(file,output);
  }
  console.log(`Content history: ${index.contentPages.length} canonical pages; ${changed.length} content revisions. ${write?'History updated; commit it with the content change.':'Committed history verified without modification.'}`);
 }finally{cleanup()}
}
