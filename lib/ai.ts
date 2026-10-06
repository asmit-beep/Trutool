import {categories,tools,type Tool} from './catalog';
const related=new Set(['lovable','bolt','gamma','beautiful-ai','lindy','relevance-ai','bardeen','elicit','otter','fireflies','mem','reclaim','motion','researchrabbit','zed']);
export const isAITool=(tool:Pick<Tool,'slug'|'category'|'ai'>)=>Boolean(tool.ai||tool.category==='ai'||tool.category.startsWith('ai-')||related.has(tool.slug));
export const aiTools=tools.filter(isAITool);
export const aiCategories=categories.filter(c=>c.slug==='ai'||c.slug.startsWith('ai-'));
export const aiStats={tools:aiTools.length,categories:aiCategories.length};
export function compactAI(slugs:string[]){return slugs.map(slug=>aiTools.find(t=>t.slug===slug)).filter((t):t is Tool=>Boolean(t)).map(({slug,name,category,categoryLabel,summary,format,initial})=>({slug,name,category,categoryLabel:categoryLabel!,summary,format,initial}));}
export const aiShelves=[
 {id:'popular',label:'Familiar favourites',description:'Widely known starting points across the AI landscape.',tools:compactAI(['chatgpt','claude','grok','perplexity','cursor','midjourney'])},
 {id:'added',label:'Just added',description:'Fresh listings in the TruTool catalogue—not release-date rankings.',tools:compactAI(['jev-ai','grok-bot','chatgpt-dots','manus','genspark','devin'])},
 {id:'specialist',label:'Under the radar',description:'Specialist tools for a more specific kind of work.',tools:compactAI(['undermind','pydantic-ai','pipecat','steel','exa','napkin-ai'])}
];
