import type { Tool } from './catalog';

const genericFeature=/^(core product workflow|features|general capabilities|main features|basic features)$/i;
const genericAudience=/^(people and teams evaluating|teams evaluating|individuals and teams evaluating)/i;
const tokens=(value:string)=>new Set((value.toLowerCase().match(/[a-z0-9]{4,}/g)||[])
  .filter(token=>!['software','tools','features','workflow','workflows','platform','platforms','product','business','teams','users'].includes(token)));

/** Compare recorded statements, not unverifiable claims about actual feature parity. */
export function meaningfulFeatures(tool:Tool):string[]{
 return (tool.features||[]).map(s=>s.trim()).filter(s=>s&&!genericFeature.test(s)).slice(0,8);
}
export function audienceIsGeneric(tool:Tool):boolean{
 return !tool.fit?.trim()||genericAudience.test(tool.fit.trim());
}
export function vendorSource(tool:Tool):{href:string;label:string}|null {
 const source=tool.sourceUrl||tool.url;
 try {
  const url=new URL(source);
  if(url.protocol!=='https:'&&url.protocol!=='http:')return null;
  const rawLabel=tool.sourceTitle?.replace(/\s+/g,' ').trim()||'';
  const label=rawLabel.length>=10&&rawLabel.length<=115?rawLabel:tool.name+' official documentation';
  return {href:url.toString(),label};
 }catch{return null;}
}
export function recordedCapabilityComparison(target:Tool,peer:Tool){
 const base=meaningfulFeatures(target);
 const candidate=meaningfulFeatures(peer);
 const targetWords=base.map(tokens);
 const similarity=(a:Set<string>,b:Set<string>)=>[...a].filter(x=>b.has(x)).length;
 const overlap=candidate.filter(f=>targetWords.some(w=>similarity(w,tokens(f))>0));
 const differentlyListed=candidate.filter(f=>!targetWords.some(w=>similarity(w,tokens(f))>0));
 return {
  overlapping:overlap.slice(0,2),
  differentlyListed:differentlyListed.slice(0,2),
  documented:base.length>0&&candidate.length>0,
 };
}
