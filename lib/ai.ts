import {categories,tools,type Tool} from './catalog';
import type {DirectoryTool} from './catalog-client';
const related=new Set(['lovable','bolt','gamma','beautiful-ai','lindy','relevance-ai','bardeen','elicit','otter','fireflies','granola','mem','reclaim','motion','researchrabbit','zed']);
export const isAITool=(tool:Pick<Tool,'slug'|'category'|'ai'>)=>Boolean(tool.ai||tool.category==='ai'||tool.category.startsWith('ai-')||related.has(tool.slug));
export const aiTools=tools.filter(isAITool);
export const aiCategories=categories.filter(c=>c.slug==='ai'||c.slug.startsWith('ai-'));
export const aiStats={tools:aiTools.length,categories:aiCategories.length};
export type AIShelfTool=DirectoryTool&{useCase:string;launchedAt?:string;launchStatus?:string};
const useCases:Record<string,string>={
 chatgpt:'Think, draft, and work through complex tasks.',claude:'Write, analyze documents, and build with code.',perplexity:'Research a question with links to sources.',cursor:'Work on a codebase with AI in your editor.',notebooklm:'Ask questions grounded in your own sources.',gamma:'Turn an outline into a presentation.',
 undermind:'Find scientific papers beyond keyword matches.','napkin-ai':'Turn an explanation into a clear diagram.','wispr-flow':'Dictate naturally across your everyday apps.',granola:'Capture meeting notes without starting from scratch.',exa:'Give an agent search over live web content.','jev-ai':'Classify and route decisions with probabilities.',
 'reflection-beam':'Explore a new coding and reasoning model.','meta-muse':'Delegate personal projects across connected apps.','claude-sonnet-5-5':'Try a new model for coding and knowledge work.','falcon-ocr-arabic':'Extract Arabic text and tables from scans.','chatgpt-dots':'Keep an agent working on ongoing tasks.'
};
export function compactAI(slugs:string[]):AIShelfTool[]{return slugs.map(slug=>aiTools.find(t=>t.slug===slug)).filter((t):t is Tool=>Boolean(t)).map(({slug,name,category,categoryLabel,summary,format,initial,launchedAt,launchStatus})=>({slug,name,category,categoryLabel:categoryLabel!,summary,format,initial,useCase:useCases[slug]||summary,...(launchedAt?{launchedAt,launchStatus}:{})}));}
export function freshAITools(now=Date.now()){return aiTools.filter(t=>t.launchedAt&&Date.parse(t.launchedAt)<=now&&Date.parse(t.launchedAt)>=now-45*86400000).sort((a,b)=>b.launchedAt!.localeCompare(a.launchedAt!)).slice(0,6)}
export function getAIShelves(now=Date.now()){return [
 {id:'popular',label:'Familiar favourites',description:'Popular starting points, with a practical job for each.',tools:compactAI(['chatgpt','claude','perplexity','cursor','notebooklm','gamma'])},
 {id:'added',label:'Just added',description:'Recent launches and releases. Dates link back to their official announcements.',tools:compactAI(freshAITools(now).map(t=>t.slug))},
 {id:'specialist',label:'Under the radar',description:'Small discoveries. Useful outcomes. From research to meetings and everyday writing.',tools:compactAI(['undermind','napkin-ai','wispr-flow','granola','exa','jev-ai'])}
]}
export const aiShelves=getAIShelves();
