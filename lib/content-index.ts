import {SITE,tools,categories,guides,pairs,getTool,categoryOf,type Tool,type Guide} from './catalog';
import {authors,authorFor,type Author} from './authors';
import {communityAnswers,type CommunityAnswer} from './community-answers';
import {serviceCategories} from './services';
import history from './content-history.json';

export type PageKind='page'|'collection'|'tool'|'alternatives'|'comparison'|'guide'|'answer'|'author'|'service';
export type ContentPage={body?:string;cms?:import("./cms-types").CmsContent;path:string;title:string;description:string;kind:PageKind;tool?:Tool;category?:typeof categories[number];guide?:Guide;answer?:CommunityAnswer;author?:Author;pair?:Tool[];service?:typeof serviceCategories[number];publishedAt?:string;updatedAt?:string};
const staticPages:ContentPage[]=[
 ['','TruTool | Discover & Compare AI Tools and Software','Discover AI tools and software for work. Compare features, pricing and alternatives, explore useful guides, and find the right tools with TruTool.','page'],
 ['/tools','Browse Software & Learning Platforms',`Search ${tools.length} tools across ${categories.length} categories, including AI, design, productivity, marketing, and development.`,'collection'],
 ['/categories','Explore All Tool Categories','Find tools around the work you need to do, from AI and productivity to design, marketing, and specialist software.','collection'],
 ['/compare','Compare Tools Side by Side','Compare tools by use case, capabilities, limitations, pricing sources, and the workflow you need.','collection'],
 ['/alternatives','Find Software Alternatives','Find same-category alternatives and compare tools by workflow, fit, pricing, and trade-offs.','collection'],
 ['/guides','Software Buying Guides','Practical buying checklists and evaluation questions to help you choose the right tools.','collection'],
 ['/everything-ai','Everything AI — Agents, Chatbots, Coworkers & News','Explore AI tools, agents, coworkers, chatbots, coding tools, and news from linked sources.','collection'],
 ['/community','TruTool Community','Practical questions, editorial answers, and perspectives on choosing and using tools.','collection'],
 ['/authors','Meet the TruTool Editorial Team','Buying guides and practical software perspectives from Yash, Snehil, Sandeep, and Asmit.','collection'],
 ['/services','Explore Business Services','Explore providers across marketing, design, engineering, security, and other business services.','collection'],
 ['/about','About TruTool — Clearer Choices, Better Tools','Meet the people behind TruTool and explore our approach to software discovery and comparison.','page'],
 ['/editorial-policy','TruTool Editorial Policy','How TruTool researches tool profiles, comparisons, and buying guides.','page'],
 ['/methodology','How we research and compare tools','A consistent framework for profiles, comparisons, alternatives, and buying guides.','page'],
 ['/sources','Sources & Brand Credits','Understand TruTool’s vendor sources and brand artwork credits.','page'],
 ['/contact','Contact TruTool','Start a conversation, suggest a tool, or send a supported correction to the TruTool editorial team.','page'],
 ['/list-your-product','List Your Product on TruTool','Submit your product and official website for editorial review.','page'],
 ['/diagnostic','TruTool Decision Studio','Build a shortlist and a practical pilot plan around your workflow and requirements.','page'],
 ['/newsletter','The TruTool Newsletter','Subscribe to tool discoveries, practical guides, and AI updates.','page'],
 ['/privacy','Privacy Policy','How TruTool handles information and privacy.','page'],
 ['/terms','Terms of Use','Terms for using TruTool and its directory.','page'],
 ['/cookies','Cookie Policy','Information about cookies and storage on TruTool.','page'],
].map(([path,title,description,kind])=>({path,title,description,kind:kind as PageKind}));
export const contentPages:ContentPage[]=[...staticPages,
 ...authors.map(author=>({path:'/authors/'+author.slug,title:author.name+' — TruTool Editorial Team',description:author.bio,kind:'author' as const,author})),
 ...serviceCategories.map(service=>({path:'/services/'+service.slug,title:service.name,description:service.description,kind:'service' as const,service})),
 ...tools.flatMap(tool=>[
  {path:'/tools/'+tool.slug,title:tool.name+' — Features, Fit, Reviews & Alternatives',description:tool.summary+' '+tool.fit,kind:'tool' as const,tool,updatedAt:tool.updatedAt,publishedAt:tool.addedAt},
  {path:'/alternatives/'+tool.slug,title:tool.name+' Alternatives — Options to Compare',description:'Explore '+categoryOf(tool.category).name.toLowerCase()+' alternatives to '+tool.name+' by fit, capabilities, and trade-offs.',kind:'alternatives' as const,tool},
 ]),
 ...categories.map(category=>({path:'/categories/'+category.slug,title:category.name+' — Tools & Comparisons',description:category.answer,kind:'collection' as const,category})),
 ...guides.map(guide=>({path:'/guides/'+guide.slug,title:guide.title,description:guide.intro,kind:'guide' as const,guide,publishedAt:guide.publishedAt||'2026-10-05',updatedAt:guide.updatedAt||guide.publishedAt||'2026-10-05'})),
 ...communityAnswers.map(answer=>({path:'/community/'+answer.slug,title:answer.question,description:answer.answer,kind:'answer' as const,answer,publishedAt:answer.publishedAt,updatedAt:answer.publishedAt})),
 ...pairs.map(([a,b])=>comparisonPage(a+'-vs-'+b)!).filter(Boolean),
];
const pageMap=new Map(contentPages.map(p=>[p.path,p]));
export function comparisonPage(slug:string):ContentPage|undefined{
 const names=slug.split('-vs-');if(names.length!==2||names[0]===names[1])return;
 const pair=names.map(getTool);if(!pair.every((t):t is Tool=>Boolean(t)))return;
 return {path:'/compare/'+slug,title:pair[0].name+' vs '+pair[1].name+' — Fit & Features',description:'Compare '+pair[0].name+' and '+pair[1].name+' by use case, features, limitations, and evaluation questions.',kind:'comparison',pair};
}
export function comparisonCanonicalPath(slug:string):string|undefined{
 const page=comparisonPage(slug);if(!page?.pair)return;
 const names=page.pair.map(t=>t.slug),existing=pairs.find(([a,b])=>names.includes(a)&&names.includes(b));
 return '/compare/'+(existing||names.sort()).join('-vs-');
}
export function getContentPage(path:string){const normalized=path==='/'?'':path.replace(/\/$/,'');return pageMap.get(normalized)||(normalized.startsWith('/compare/')?comparisonPage(normalized.slice(9)):undefined)}
export const absolute=(path:string)=>SITE.replace(/\/$/,'')+path;
export const markdownPath=(path:string)=>path?path+'.md':'/index.md';
export function modifiedFor(page:ContentPage):string|undefined{
 const tracked=(history as Record<string,{hash:string;modified:string}>)[page.path]?.modified;
 return [tracked,page.updatedAt,page.publishedAt].filter((d):d is string=>Boolean(d)&&Number.isFinite(Date.parse(d!))).sort().at(-1);
}
export function contentAuthor(page:ContentPage){return page.author||(page.guide?authorFor(page.guide):page.answer?authorFor(page.answer):page.tool?authorFor(page.tool):page.pair?authorFor(page.pair[0]):undefined)}
export function relatedTools(page:ContentPage):Tool[]{
 if(page.pair)return page.pair;
 if(page.answer)return page.answer.toolSlugs.map(getTool).filter((t):t is Tool=>Boolean(t));
 const category=page.tool?.category||page.guide?.category||page.category?.slug;
 return category?tools.filter(t=>t.category===category&&t.slug!==page.tool?.slug):[];
}
// This data is fingerprinted at build time; dates never change just because a crawler requests a file.
export function contentRevision(page:ContentPage){
 const related=relatedTools(page);
 const stableAnswer=(answer:CommunityAnswer)=>({slug:answer.slug,category:answer.category,question:answer.question,answer:answer.answer,toolSlugs:answer.toolSlugs,steps:answer.steps,checks:answer.checks,pitfall:answer.pitfall,publishedAt:answer.publishedAt});
 return {page:{...page,...(page.answer?{answer:stableAnswer(page.answer)}:{})},author:contentAuthor(page),related:page.kind==='guide'?related.slice(0,6):page.kind==='collection'&&page.category?related.map(t=>({slug:t.slug,name:t.name,summary:t.summary})):related,
  ...(page.kind==='author'?{guides:guides.filter(g=>authorFor(g).slug===page.author?.slug),answers:communityAnswers.filter(a=>authorFor(a).slug===page.author?.slug).map(stableAnswer)}:{}),
  ...(page.kind==='collection'&&!page.category||page.path===''?{tools:tools.map(t=>({slug:t.slug,name:t.name,category:t.category,summary:t.summary})),categories,guides,answers:communityAnswers.map(stableAnswer),pairs}:{}),
 };
}
