import {DEMO_MODE} from './demo';
import type {Metadata} from 'next';
import {SITE} from './catalog';
import {markdownPath} from './content-index';

/**
 * Search engines truncate snippets by rendered pixel width, not a strict character limit.
 * Keep descriptions readable and concise without cutting inside a word.
 */
export function conciseMetaDescription(input:string,max=158):string{
 const clean=input.replace(/\s+/g,' ').trim();
 if(clean.length<=max)return clean;
 const front=clean.slice(0,max);
 const completeSentence=[...front.matchAll(/[.!?](?=\s|$)/g)].map(m=>m.index!+1).filter(i=>i>=80).at(-1);
 if(completeSentence!==undefined)return front.slice(0,completeSentence).trim();
 const wordEnd=front.lastIndexOf(' ');
 return front.slice(0,wordEnd>85?wordEnd:max-1).replace(/[,;:–—\s]+$/,'')+'…';
}
export function toolMetaDescription(tool:{slug:string;name:string;summary:string;fit:string}):string{
 // Preserve the reviewed, accurate description for this product.
 if(tool.slug==='ai-bulin-47')return 'Create a 15-second vertical AI dance video from one portrait with AI Bulin 47. Explore soundtrack options, MP4 exports, key features and limitations.';
 const summary=tool.summary.trim().replace(/\s+/g,' ');
 const fit=tool.fit.trim().replace(/\s+/g,' ');
 // Always identify the vendor in the snippet. Several vendor records share
 // category-level summaries, so a description without a name can be identical.
 // Do not invent new feature claims or stuff unrelated search keywords.
 const named=tool.name+': '+summary;
 const usefulFit=/^(people and teams evaluating|teams evaluating|individuals and teams evaluating)/i.test(fit)?'':fit;
 const whole=named+(usefulFit?' '+usefulFit:'');
 if(whole.length>=100&&whole.length<=158)return whole;
 return conciseMetaDescription(named+' Examine recorded capabilities, sources, limitations and alternatives on TruTool.');
}
export function categoryMetaDescription(category:{slug:string;name:string;description:string}):string{
 const special:Record<string,string>={
  'ai-video':'Compare AI video generators for text-to-video, image animation and avatars. Explore motion quality, editing tools, pricing and alternatives on TruTool.',
  'ai-image':'Compare AI image generators and editors for design, product visuals and marketing. Explore image quality, editing tools, pricing and alternatives on TruTool.',
  'rfp-software':'Compare RFP and proposal software for response drafting, content governance and security questionnaires. Explore features, pricing and alternatives on TruTool.'
 };
 if(special[category.slug])return special[category.slug];
 const suffix=/\b(tools|software|platforms|apps|services|assistants|generators|agents|solutions)\b$/i.test(category.name)?'':' tools';
 const intro='Compare '+category.name+suffix+' on TruTool. ';
 const explanation=category.description.trim().replace(/\s+/g,' ');
 return conciseMetaDescription(intro+explanation+' Explore features, pricing and alternatives.');
}

export function pageMetadata(input:Metadata):Metadata{
 const canonical=String(input.alternates?.canonical||SITE),path=new URL(canonical,SITE).pathname+new URL(canonical,SITE).search;
 const title=typeof input.title==='string'?input.title:'Discover, compare & choose better tools';
 const description=conciseMetaDescription(String(input.description||'Explore useful tools, practical buying guides, and clear comparisons on TruTool.'));
 const image={url:SITE+'/api/og?path='+encodeURIComponent(path)+'&v=launch-20261008',width:1200,height:630,alt:title+' — TruTool'};
 return {...input,...(DEMO_MODE?{robots:{index:false,follow:true}}:{}),description,alternates:{...input.alternates,canonical,types:{'application/rss+xml':SITE+'/rss.xml','application/atom+xml':SITE+'/atom.xml','application/feed+json':SITE+'/feed.json','text/markdown':SITE+markdownPath(new URL(canonical,SITE).pathname==='/'?'':new URL(canonical,SITE).pathname),...input.alternates?.types}},openGraph:{...input.openGraph,title,description:conciseMetaDescription(String(input.openGraph?.description||description)),siteName:'TruTool',url:canonical,type:input.openGraph&&'type' in input.openGraph?input.openGraph.type:'website',images:input.openGraph?.images||[image]},twitter:{card:'summary_large_image',title,description:conciseMetaDescription(String(input.twitter?.description||description)),images:input.twitter?.images||[image.url]}};
}
