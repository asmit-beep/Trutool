import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadContent} from './load-content.mjs';

// Directory-only audit: live CMS pages are assessed separately. Never fabricate
// vendor-specific copy or generate claims merely to increase word count.
const {index,cleanup}=loadContent();
try {
 const tools=index.contentPages.filter(p=>p.kind==='tool').map(p=>p.tool).filter(Boolean);
 const normalizedUrl=value=>{
  try {const url=new URL(value);return (url.origin+url.pathname.replace(/\/$/,'')).toLowerCase();}
  catch {return '';}
 };
 const groups=(list,key)=>{
  const map=new Map();
  for(const item of list){
   const value=key(item)?.trim().toLowerCase();
   if(!value)continue;
   const rows=map.get(value)||[];
   rows.push(item.slug);
   map.set(value,rows);
  }
  return [...map].filter(([,rows])=>rows.length>1).map(([value,slugs])=>({value,slugs})).sort((a,b)=>b.slugs.length-a.slugs.length||a.value.localeCompare(b.value));
 };
 const words=value=>(value||'').trim().split(/\s+/).filter(Boolean).length;
 const detail=tool=>[tool.summary,tool.fit,...(tool.features||[]),tool.caution].filter(Boolean).join(' ');
 const genericFit=tool=>/^(people and teams evaluating|teams evaluating|individuals and teams evaluating)\b/i.test(tool.fit||'');
 const titleDuplicates=groups(tools,t=>t.name);
 const vendorDuplicates=groups(tools,t=>normalizedUrl(t.url||''));
 const summaryDuplicates=groups(tools,t=>t.summary||'');
 const generic=tools.filter(genericFit);
 const sparse=tools.filter(t=>words(detail(t))<40);
 const report={
  scope:'Source-controlled product records. Published CMS overlays and Google index status require separate audits.',
  totalBuiltInTools:tools.length,
  exactVendorDuplicates:vendorDuplicates,
  exactProductNameDuplicates:titleDuplicates,
  repeatedSummaries:summaryDuplicates,
  genericFitCount:generic.length,
  under40SourceWords:sparse.length,
  editorialProfiles:tools.filter(t=>t.profile).length,
  priorityReviewSlugs:[...new Set([...vendorDuplicates.flatMap(x=>x.slugs),...titleDuplicates.flatMap(x=>x.slugs),...sparse.map(t=>t.slug),...generic.map(t=>t.slug)])],
  notes:[
   'Duplicate vendor identities and thin product fields are editorial review signals, not evidence of Google penalties.',
   'Do not insert unsourced facts, synthetic ratings, or fabricated use cases to inflate text.',
   'Verify each candidate from official vendor documentation, distinguish products sharing a company, then update original data.',
  ],
 };
 if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
 else {
  console.log('TruTool content audit: '+report.totalBuiltInTools+' source-controlled profiles, '+vendorDuplicates.length+' duplicate vendor URL groups, '+titleDuplicates.length+' duplicated name groups, '+generic.length+' generic fits, '+sparse.length+' under 40 words of source fields.');
  console.log('Editorial review queue: '+report.priorityReviewSlugs.length+' distinct slugs.');
 }
 if(process.argv.includes('--strict')){
  assert.equal(titleDuplicates.length,0,'Product profiles have unresolved identical titles; disambiguate or consolidate verified identical vendors.');
  assert.equal(vendorDuplicates.length,0,'Product profiles have unresolved identical vendor URLs; consolidate verified identical products.');
 }
 const csvArg=process.argv.find(a=>a.startsWith('--csv='));
 if(csvArg){
  const out=csvArg.slice(6),quote=value=>'"'+String(value??'').replaceAll('"','""')+'"';
  const rows=tools.map(t=>({
   slug:t.slug,name:t.name,category:t.category,vendor:t.url,
   source_words:words(detail(t)),generic_fit:genericFit(t)?'yes':'no',
   repeated_summary:summaryDuplicates.some(g=>g.slugs.includes(t.slug))?'yes':'no',
   editorial_profile:t.profile?'yes':'no',
  }));
  const headings=Object.keys(rows[0]);
  fs.writeFileSync(out,[headings.map(quote).join(','),...rows.map(row=>headings.map(k=>quote(row[k])).join(','))].join('\n')+'\n');
  console.log('Wrote quality review CSV: '+out);
 }
}finally{cleanup();}
