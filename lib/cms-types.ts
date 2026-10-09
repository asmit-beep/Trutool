export const contentTypes = [
 {id:'guide',label:'Guides',singular:'Guide',prefix:'/guides',hint:'Buying guides, tutorials, and practical articles.'},
 {id:'tool',label:'Tools',singular:'Tool',prefix:'/tools',hint:'Product profiles, official links, features, and pricing.'},
 {id:'comparison',label:'Comparisons',singular:'Comparison',prefix:'/compare',hint:'Editorial comparisons of two or more products.'},
 {id:'alternatives',label:'Alternatives',singular:'Alternatives page',prefix:'/alternatives',hint:'Sourced alternative shortlists and buyer-fit guidance.'},
 {id:'answer',label:'Community answers',singular:'Answer',prefix:'/community',hint:'Questions, answers, and practical checklists.'},
 {id:'news',label:'AI news',singular:'News story',prefix:'/news',hint:'Sourced updates for Everything AI and the news feed.'},
 {id:'service',label:'Services',singular:'Service',prefix:'/services',hint:'Provider directories and service selection advice.'},
 {id:'author',label:'Authors',singular:'Author profile',prefix:'/authors',hint:'Author bios, focus areas, and profile pages.'},
] as const;
export type CmsKind=typeof contentTypes[number]['id'];
export type CmsContent={id:string;kind:CmsKind;slug:string;title:string;description:string;body:string;category:string;authorSlug:string;authorName?:string;metaTitle:string;metaDescription:string;image:string;imageAlt:string;sourceUrl:string;sourceLabel:string;tags:string;toolSlugs:string[];tool?:{url:string;fit:string;features:string[];caution:string;pricing:string;pricingUrl:string;ai:boolean;format:string};publishedAt?:string;updatedAt?:string};
export type CmsRecord={id:string;draft:CmsContent;published?:CmsContent;scheduled?:CmsContent;hidden?:boolean;revision:number;updatedAt:string;history:{at:string;content:CmsContent}[]};
export type CmsStore={version:1;revision:number;records:CmsRecord[];activity:{at:string;title:string;action:string}[]};
export const contentPath=(c:Pick<CmsContent,'kind'|'slug'>)=>contentTypes.find(t=>t.id===c.kind)!.prefix+'/'+c.slug;
export const newContent=(kind:CmsKind='guide'):CmsContent=>({id:'',kind,slug:'',title:'',description:'',body:'',category:'ai',authorSlug:'yash',metaTitle:'',metaDescription:'',image:'',imageAlt:'',sourceUrl:'',sourceLabel:'',tags:'',toolSlugs:[],...(kind==='tool'?{tool:{url:'',fit:'',features:[],caution:'',pricing:'Check current vendor pricing',pricingUrl:'',ai:false,format:'Software'}}:{})});
export function safeHref(value:string){if(/^\/(?!\/)[a-zA-Z0-9/_.?#=&%+\-]*$/.test(value))return value;try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}}
export function publishIssues(c:CmsContent){const issues:string[]=[];if(c.title.trim().length<4)issues.push('Add a clear title.');if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.slug)||c.slug.length>120)issues.push('Use a lowercase URL slug with hyphens.');if(c.description.trim().length<30)issues.push('Add an answer-first summary of at least 30 characters.');if(c.kind!=='tool'&&c.body.trim().length<80)issues.push('Add the main content before publishing.');if(c.image&&!c.imageAlt.trim())issues.push('Add descriptive image alt text.');if(c.kind==='news'&&!safeHref(c.sourceUrl))issues.push('Add the original news source.');if(c.kind==='tool'){if(!safeHref(c.tool?.url||''))issues.push('Add the official product website.');if(!c.tool?.features.length)issues.push('Add at least one feature.');if(!c.tool?.fit.trim())issues.push('Describe who the tool fits.');if(!c.tool?.caution.trim())issues.push('Add a limitation or a point to verify.');}return issues;}
