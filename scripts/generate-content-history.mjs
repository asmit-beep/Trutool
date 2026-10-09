import fs from 'node:fs';
import {createHash} from 'node:crypto';
import ts from 'typescript';
import {loadContent} from './load-content.mjs';
const {index,cleanup}=loadContent();
try{
 const previous=JSON.parse(fs.readFileSync('lib/content-history.json','utf8')),next={};let changed=0;
 const textCache=new Map();
 const visibleText=(file)=>{if(textCache.has(file))return textCache.get(file);const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),text=[];const visit=node=>{if(ts.isJsxText(node)&&node.text.trim())text.push(node.text.replace(/\s+/g,' ').trim());ts.forEachChild(node,visit);};visit(source);textCache.set(file,text);return text;};
 const timestamp=new Date().toISOString();
 for(const page of index.contentPages){
  const pieces=page.path.split('/').filter(Boolean),template=pieces.length>1?`app/${pieces[0]}/[slug]/page.tsx`:page.path?`app${page.path}/page.tsx`:'app/page.tsx';
  const hash=createHash('sha256').update(JSON.stringify(index.contentRevision(page))).update(JSON.stringify(visibleText(template))).digest('hex').slice(0,32);
  const prior=previous[page.path],same=prior?.fingerprintVersion!==2||prior?.hash===hash;
  next[page.path]={hash,fingerprintVersion:2,modified:prior&&same?prior.modified:timestamp};
  if(!prior||prior.fingerprintVersion===2&&prior.hash!==hash)changed++;
 }
 const output=JSON.stringify(next,null,1)+'\n';
 if(output!==fs.readFileSync('lib/content-history.json','utf8'))fs.writeFileSync('lib/content-history.json',output);
 console.log(`Content history: ${index.contentPages.length} canonical pages; ${changed} content revisions. Unchanged pages retain their dates.`);
}finally{cleanup()}
