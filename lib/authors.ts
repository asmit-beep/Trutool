export const authors=[
 {slug:'yash',name:'Yash',initial:'Y',focus:'Marketing & business tools',bio:'Clearer questions for marketing, local visibility, and customer workflows. Explore practical buying guides that start with the work your team needs to do.',topics:['Local visibility','Marketing','CRM & sales'],categories:['local-listings','marketing','seo','crm'],color:'#d6ef82'},
 {slug:'snehil',name:'Snehil',initial:'S',focus:'AI & automation',bio:'Making sense of AI assistants, coding tools, automation, and proposal workflows. Start with useful capabilities, source visibility, and a practical pilot.',topics:['AI assistants','Automation','RFP & proposals'],categories:['ai','ai-coding','automation','rfp-software'],color:'#dcd3fb'},
 {slug:'sandeep',name:'Sandeep',initial:'S',focus:'Productivity & learning',bio:'Better systems for everyday work, shared knowledge, and professional learning. These guides focus on adoption, team habits, and the questions to ask before committing.',topics:['Productivity','Project management','Learning'],categories:['productivity','project-management','edtech'],color:'#c8e9e9'},
 {slug:'asmit',name:'Asmit',initial:'A',focus:'Design & creative workflows',bio:'Exploring tools for visual ideas, no-code building, and collaboration. Compare the workflow, the handoff, and the finished result before choosing your next creative tool.',topics:['Design','Creative AI','No-code'],categories:['design','ai-image','no-code','communication'],color:'#f9d8bd'},
] as const;
export type Author=typeof authors[number];
export function getAuthor(slug:string):Author|undefined{return authors.find(a=>a.slug===slug)}
// Category ownership is stable when articles are added or reordered. Explicit credits take precedence.
export function authorFor(item:{category:string;authorSlug?:string}):Author{
 const explicit=item.authorSlug?getAuthor(item.authorSlug):undefined;if(explicit)return explicit;
 const direct=authors.find(a=>(a.categories as readonly string[]).includes(item.category));if(direct)return direct;
 if(/design|image|video|creative|animation|audio|music|presentation|website|no-code|communication/.test(item.category))return authors[3];
 if(/^ai|agent|coding|developer|automation|data|api|security|hosting/.test(item.category))return authors[1];
 if(/marketing|seo|sales|crm|commerce|social|advert|review|listing|analytics|finance/.test(item.category))return authors[0];
 return authors[2];
}
