import {categories,tools,type Tool} from './catalog';
import type {DirectoryTool} from './catalog-client';
import type {AIPopularitySignal} from './ai-signals';
import {discoveryMatches} from './tool-discovery';

const related=new Set(['claude-code','github-copilot','notebooklm','n8n','ollama','lovable','bolt','gamma','beautiful-ai','lindy','relevance-ai','bardeen','elicit','otter','fireflies','granola','mem','reclaim','motion','researchrabbit','zed']);
export const isAITool=(tool:Pick<Tool,'slug'|'category'|'ai'>)=>Boolean(tool.ai||tool.category==='ai'||tool.category.startsWith('ai-')||related.has(tool.slug));
export const aiTools=tools.filter(isAITool);
export const aiCategories=categories.filter(c=>c.slug==='ai'||c.slug.startsWith('ai-'));
export const aiStats={tools:aiTools.length,categories:aiCategories.length};
export type AIShelfTool=DirectoryTool&{useCase:string;launchedAt?:string;launchStatus?:string;externalUrl?:string};
const DAY=86400000;
const generic=new Set(['chatgpt','gemini','perplexity','claude','deepseek','grok','devin']);
const useCases:Record<string,string>={
 claude:'Write, analyze documents, and build with code.',perplexity:'Research a question with links to sources.',cursor:'Work on a codebase with AI in your editor.',notebooklm:'Ask questions grounded in your own sources.',gamma:'Turn an outline into a presentation.',
 undermind:'Find scientific papers beyond keyword matches.','napkin-ai':'Turn an explanation into a clear diagram.','wispr-flow':'Dictate naturally across your everyday apps.',granola:'Capture meeting notes without starting from scratch.',exa:'Give an agent search over live web content.','jev-ai':'Classify and route decisions with probabilities.'
};
export function compactAI(slugs:string[],directory:Tool[]=aiTools):AIShelfTool[]{
 const available=new Map(directory.filter(isAITool).map(t=>[t.slug,t]));
 return slugs.map(s=>available.get(s)).filter((t):t is Tool=>Boolean(t))
  .map(({slug,name,category,categoryLabel,summary,format,initial,launchedAt,launchStatus})=>({
   slug,name,category,categoryLabel:categoryLabel||category,summary,format,initial,useCase:useCases[slug]||summary,
   ...(launchedAt?{launchedAt,launchStatus}:{})
  }));
}
export function freshAITools(now=Date.now(),directory:Tool[]=aiTools){
 return directory.filter(t=>isAITool(t)&&!generic.has(t.slug)&&!t.name.toLowerCase().includes('chatgpt')&&t.launchedAt&&
  Date.parse(t.launchedAt)<=now&&Date.parse(t.launchedAt)>=now-30*DAY)
  .sort((a,b)=>b.launchedAt!.localeCompare(a.launchedAt!)).slice(0,15);
}
const editorialFallback=['claude-code','cursor','github-copilot','lovable','n8n','replit','notebooklm','runway','elevenlabs','suno','granola','ollama','gamma','midjourney','browser-use','open-webui'];

export function getAIShelves(now=Date.now(),discovered:AIShelfTool[]=[],signals:AIPopularitySignal[]=[],directory:Tool[]=aiTools){
 const available=directory.filter(isAITool);
 const known=new Map(available.map(t=>[t.slug,t]));
 const seen=new Set<string>();
 const sourceLaunches=discovered.filter(t=>t.externalUrl&&t.launchedAt&&
  Date.parse(t.launchedAt)<=now&&Date.parse(t.launchedAt)>=now-21*DAY)
  .sort((a,b)=>(b.launchedAt||'').localeCompare(a.launchedAt||''));
 const knownLaunches=compactAI(freshAITools(now,available).map(t=>t.slug),available);
 const newOnMarket=[...sourceLaunches,...knownLaunches].filter(t=>{
  if(!t.launchedAt||seen.has(t.slug)||Date.parse(t.launchedAt)>now)return false;
  seen.add(t.slug);return true;
 }).slice(0,6);
 // Not an invented "user count": these scores require named AI tools in
 // actual high-engagement, recent HN stories. Never claim measured traffic.
 const bySignal=signals.filter(s=>known.has(s.slug)&&!generic.has(s.slug)&&s.score>=20)
  .sort((a,b)=>b.score-a.score).map(s=>s.slug);
 const fallback=editorialFallback.filter(s=>known.has(s)&&!generic.has(s));
 const rotated=fallback.slice(Math.floor(now/(7*DAY))%fallback.length).concat(fallback.slice(0,Math.floor(now/(7*DAY))%fallback.length));
 const popularSlugs=[...new Set([...bySignal,...rotated])].slice(0,6);
 const popular=compactAI(popularSlugs,available);
 // Select niche tools by source verification and recently-added metadata;
 // rotate across days so the same hand-picked three are never pinned forever.
 const excluded=new Set([...popularSlugs,...newOnMarket.map(t=>t.slug)]);
 const specialists=available.filter(t=>discoveryMatches(t,'niche')&&!generic.has(t.slug)&&
  (t.sourceChecked||t.sourceStatus?.includes('consulted'))&&
  !excluded.has(t.slug));
 const day=Math.floor(now/DAY);
 const hash=(s:string)=>[...s].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7);
 specialists.sort((a,b)=>{
  const da=Date.parse(a.addedAt||'2000-01-01'),db=Date.parse(b.addedAt||'2000-01-01');
  const wa=Math.max(0,120-Math.floor((now-da)/DAY)),wb=Math.max(0,120-Math.floor((now-db)/DAY));
  return (wb-wa)*100+((hash(b.slug+Math.floor(day/2))%97)-(hash(a.slug+Math.floor(day/2))%97));
 });
 const diverse:string[]=[],usedCategories=new Set<string>();
 for(const t of specialists)if(!usedCategories.has(t.category)&&diverse.length<6){diverse.push(t.slug);usedCategories.add(t.category)}
 for(const t of specialists)if(diverse.length<6&&!diverse.includes(t.slug))diverse.push(t.slug);
 const under=compactAI(diverse,available);
 return [
  {id:'popular',label:'Popular picks',description:bySignal.length>=2?
   'Tools drawing attention in recent Hacker News discussions, followed by editorial options. Not a user-count ranking.':
   'Practical AI tools worth exploring while live discussion signals are limited. Not a usage or traffic ranking.',tools:popular},
  {id:'added',label:'Just added',description:sourceLaunches.length?
   'Recent AI product announcements from Product Hunt and Show HN. External discoveries are not yet vetted TruTool listings.':
   'Most recent dated AI releases in the directory. Fresh source announcements appear automatically when available.',tools:newOnMarket},
  {id:'specialist',label:'Under the radar',description:'Rotating, source-checked specialist tools for narrower workflows. Updated from the directory without fabricated popularity scores.',tools:under}
 ];
}
export const aiShelves=getAIShelves();
