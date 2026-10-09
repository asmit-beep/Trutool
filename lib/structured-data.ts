import {absolute,getContentPage,contentAuthor,modifiedFor,relatedTools,type ContentPage} from './content-index';
import {brandAssets} from './brand-assets';
import {categoryOf} from './catalog';
import {coverFor} from './covers';

const organization={'@type':'Organization','@id':absolute('/#organization'),name:'TruTool',url:absolute('/'),logo:{'@type':'ImageObject',url:absolute('/identity/trutool-logo-light.svg')}};
export function siteStructuredData(){return {'@context':'https://schema.org','@graph':[organization,{'@type':'WebSite','@id':absolute('/#website'),name:'TruTool',url:absolute('/'),inLanguage:'en',publisher:{'@id':organization['@id']},description:'Clearer choices. Better tools.'}]}}
const labels:Record<string,string>={tools:'Tools',alternatives:'Alternatives',compare:'Comparisons',guides:'Buying guides',categories:'Categories',community:'Community',authors:'Editorial team',services:'Services'};
export function pageStructuredData(path:string,override?:ContentPage){
 const page=override||getContentPage(path);if(!page)return;
 const url=absolute(page.path||'/'),id=url+(page.kind==='guide'||page.kind==='answer'?'#article':'#webpage'),author=contentAuthor(page),modified=modifiedFor(page);
 const type=page.kind==='guide'||page.kind==='answer'?'Article':page.kind==='author'?'ProfilePage':page.path==='/about'?'AboutPage':page.path==='/contact'?'ContactPage':['collection','alternatives','service'].includes(page.kind)?'CollectionPage':'WebPage';
 const node:Record<string,unknown>={'@type':type,'@id':id,url,name:page.title,description:page.description,inLanguage:'en',isPartOf:{'@id':absolute('/#website')},publisher:{'@id':organization['@id']},...(modified?{dateModified:modified}:{})};
 const graph:Record<string,unknown>[]=[node];
 if(author){const authorId=absolute('/authors/'+author.slug)+'#person';graph.push({'@type':'Person','@id':authorId,name:author.name,url:absolute('/authors/'+author.slug),description:author.bio,knowsAbout:[...author.topics]});if(type==='Article')node.author={'@id':authorId};if(page.kind==='author')node.mainEntity={'@id':authorId}}
 if(type==='Article')Object.assign(node,{headline:page.title,datePublished:page.publishedAt,dateModified:page.updatedAt||page.publishedAt,mainEntityOfPage:{'@type':'WebPage','@id':url+'#webpage',url},citation:(page.guide?relatedTools(page).slice(0,6):relatedTools(page)).map(t=>t.url),image:page.guide?absolute(coverFor(page.guide.category)):{'@type':'ImageObject',url:absolute('/api/og?path='+encodeURIComponent(page.path)+'&v=launch-20261008'),width:1200,height:630}});
 if(page.tool&&page.kind==='tool'){
  const t=page.tool,entityId=url+'#tool',entity:Record<string,unknown>={'@type':/software/i.test(t.format)?'SoftwareApplication':'Organization','@id':entityId,name:t.name,description:t.summary,url:t.url,sameAs:t.url,...(brandAssets[t.slug]?{image:absolute(brandAssets[t.slug])}:{})};
  if(/software/i.test(t.format))Object.assign(entity,{applicationCategory:categoryOf(t.category).name,featureList:t.features});
  node.mainEntity={'@id':entityId};node.author=author?{'@id':absolute('/authors/'+author.slug)+'#person'}:undefined;graph.push(entity);
 }
 if(page.kind==='comparison')node.about=page.pair?.map(t=>({'@type':'Thing',name:t.name,url:absolute('/tools/'+t.slug)}));
 // Editorial answers are Articles, not user-generated QAPages. Ratings and unverified prices are never synthesized.
 if(page.kind==='answer')node.about=page.answer?.toolSlugs.map(slug=>({'@id':absolute('/tools/'+slug)+'#tool'}));
 if(page.kind==='alternatives'){
  const options=relatedTools(page),listId=url+'#alternatives';node.mainEntity={'@id':listId};
  graph.push({'@type':'ItemList','@id':listId,name:page.title,numberOfItems:options.length,itemListOrder:'https://schema.org/ItemListUnordered',itemListElement:options.map((t,i)=>({'@type':'ListItem',position:i+1,name:t.name,url:absolute('/tools/'+t.slug)}))});
 }
 if(page.category)node.about={'@type':'Thing',name:page.category.name,description:page.category.description};
 const segments=page.path.split('/').filter(Boolean),crumbs=[{name:'Home',url:absolute('/')}];
 if(segments.length>1)crumbs.push({name:labels[segments[0]]||segments[0],url:absolute('/'+segments[0])});
 if(segments.length)crumbs.push({name:breadcrumbName(page),url});
 if(segments.length){const crumbId=url+'#breadcrumb';node.breadcrumb={'@id':crumbId};graph.push({'@type':'BreadcrumbList','@id':crumbId,itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,item:c.url}))})}
 return {'@context':'https://schema.org','@graph':graph};
}
function breadcrumbName(page:ContentPage){return page.kind==='tool'?page.tool!.name:page.kind==='alternatives'?page.tool!.name+' alternatives':page.kind==='author'?page.author!.name:page.title}
export function serializeSchema(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c')}
