import { SITE } from '@/lib/catalog';
import { cmsSchema,publicPages,publicTools } from '@/lib/cms-public';
import { pageStructuredData,serializeSchema } from '@/lib/structured-data';
export async function PageStructuredData({path}:{path:string}){
 const pages=await publicPages(),page=pages.find(p=>p.path===path);
 const data=page?.cms?cmsSchema(page.cms):pageStructuredData(path,page,page?.kind==='alternatives'?await publicTools():undefined);
 if(!data)return null;
 const kind:Record<string,string>={'/guides':'guide','/tools':'tool','/community':'answer','/compare':'comparison','/alternatives':'alternatives','/services':'service','/authors':'author'};
 if(kind[path]){
  const contents=pages.filter(p=>p.kind===kind[path]&&(path!=='/guides'||p.cms?.kind!=='news'));
  const graph=(data as {'@graph':Record<string,unknown>[]})['@graph'];
  graph.push({'@type':'ItemList','@id':SITE+path+'#contents',numberOfItems:contents.length,itemListElement:contents.slice(0,100).map((p,i)=>({'@type':'ListItem',position:i+1,name:p.title,url:SITE+p.path}))});
 }
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeSchema(data)}}/>;
}
