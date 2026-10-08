import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {loadContent} from './load-content.mjs';
const {index,cleanup}=loadContent();
try{
 const previous=JSON.parse(fs.readFileSync('lib/content-history.json','utf8')),next={};let changed=0;
 const common=['lib/seo.ts','lib/structured-data.ts','app/layout.tsx'].map(p=>fs.readFileSync(p,'utf8')).join('\n');
 const timestamp=new Date().toISOString();
 for(const page of index.contentPages){
  const pieces=page.path.split('/').filter(Boolean),template=pieces.length>1?`app/${pieces[0]}/[slug]/page.tsx`:page.path?`app${page.path}/page.tsx`:'app/page.tsx';
  const hash=createHash('sha256').update(JSON.stringify(index.contentRevision(page))).update(common).update(fs.readFileSync(template,'utf8')).digest('hex').slice(0,32);
  next[page.path]={hash,modified:previous[page.path]?.hash===hash?previous[page.path].modified:timestamp};
  if(previous[page.path]?.hash!==hash)changed++;
 }
 const output=JSON.stringify(next,null,1)+'\n';
 if(output!==fs.readFileSync('lib/content-history.json','utf8'))fs.writeFileSync('lib/content-history.json',output);
 console.log(`Content history: ${index.contentPages.length} canonical pages; ${changed} content revisions. Unchanged pages retain their dates.`);
}finally{cleanup()}
