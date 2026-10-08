import {DEMO_MODE} from './demo';
import type {Metadata} from 'next';
import {SITE} from './catalog';
export function pageMetadata(input:Metadata):Metadata{
 const canonical=String(input.alternates?.canonical||SITE),path=new URL(canonical,SITE).pathname+new URL(canonical,SITE).search;
 const title=typeof input.title==='string'?input.title:'Discover, compare & choose better tools';
 const description=input.description||'Explore useful tools, practical buying guides, and clear comparisons on TruTool.';
 const image={url:SITE+'/api/og?path='+encodeURIComponent(path)+'&v=launch-20261008',width:1200,height:630,alt:title+' — TruTool'};
 return {...input,...(DEMO_MODE?{robots:{index:false,follow:true}}:{}),description,alternates:{...input.alternates,canonical},openGraph:{...input.openGraph,title,description,siteName:'TruTool',url:canonical,type:input.openGraph&&'type' in input.openGraph?input.openGraph.type:'website',images:[image]},twitter:{card:'summary_large_image',title,description,images:[image.url]}};
}
