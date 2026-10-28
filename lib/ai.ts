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

// Fixed editorial shelves, not scheduled discoveries or daily rotations.
// Manual additions to the CMS directory can be shown after explicit publish.
export function getAIShelves(_now=Date.now(),_discovered:AIShelfTool[]=[],_signals:AIPopularitySignal[]=[],directory:Tool[]=aiTools){
 const available=directory.filter(isAITool);
 const recentlyAdded=available.filter(t=>!generic.has(t.slug)&&!t.name.toLowerCase().includes('chatgpt'))
  .sort((a,b)=>(b.addedAt||b.launchedAt||'').localeCompare(a.addedAt||a.launchedAt||'')||a.slug.localeCompare(b.slug)).slice(0,6);
 const added=compactAI(recentlyAdded.map(t=>t.slug),available);
 const popularSlugs=editorialFallback.filter(slug=>available.some(t=>t.slug===slug)&&!generic.has(slug)).slice(0,6);
 const popular=compactAI(popularSlugs,available);
 const excluded=new Set([...popularSlugs,...recentlyAdded.map(t=>t.slug)]);
 const specialists=available.filter(t=>discoveryMatches(t,'niche')&&!generic.has(t.slug)&&
  (t.sourceChecked||t.sourceStatus?.includes('consulted'))&&!excluded.has(t.slug))
  .sort((a,b)=>(b.addedAt||'').localeCompare(a.addedAt||'')||a.slug.localeCompare(b.slug));
 const chosen:string[]=[],categories=new Set<string>();
 for(const t of specialists)if(!categories.has(t.category)&&chosen.length<6){chosen.push(t.slug);categories.add(t.category)}
 for(const t of specialists)if(chosen.length<6&&!chosen.includes(t.slug))chosen.push(t.slug);
 return [
  {id:'popular',label:'Popular picks',description:'Editor-selected practical AI tools. Not a live usage or traffic ranking.',tools:popular},
  {id:'added',label:'Just added',description:'Most recently added AI directory profiles. This selection changes only when listings are manually published.',tools:added},
  {id:'specialist',label:'Under the radar',description:'Source-checked specialist tools selected by the editors. No scheduled rotation.',tools:compactAI(chosen,available)}
 ];
}
export const aiShelves=getAIShelves();
