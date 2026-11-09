import 'server-only';
import {SITE} from './catalog';
import {rfpAlternativePages} from './rfp-alternatives';
import {readCachedStore} from './cms-store';
import {contentPath,effectivePublished,safeHref,type CmsStore} from './cms-types';
export const defaultFeaturedAlternatives=['loopio','responsive'];
export const maxFeaturedAlternatives=12;
export type FeaturedAlternative={slug:string;title:string;description:string;image:string;imageAlt:string;path:string;source:'editorial'|'cms'};
export function availableFeaturedAlternatives(store:CmsStore):FeaturedAlternative[]{
 const builtins=Object.values(rfpAlternativePages).map(c=>({
  slug:c.slug,title:c.title,description:c.description,
  image:'/covers/'+c.slug+'-alternatives.svg',imageAlt:c.target+' alternatives editorial illustration',
  path:'/alternatives/'+c.slug,source:'editorial' as const
 }));
 const map=new Map<string,FeaturedAlternative>(builtins.map(c=>[c.slug,c]));
 for(const row of store.records){
  const item=effectivePublished(row);
  if(item?.kind!=='alternatives'||row.hidden||map.has(item.slug))continue;
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug))continue;
  const path=contentPath(item),cover=safeHref(item.image);
  map.set(item.slug,{slug:item.slug,path,title:item.title,description:item.description,
   image:cover||SITE+'/api/og?path='+encodeURIComponent(path),
   imageAlt:item.imageAlt||item.title+' comparison cover',source:'cms'});
 }
 return [...map.values()];
}
export function selectedFeaturedAlternatives(store:CmsStore):FeaturedAlternative[]{
 const map=new Map(availableFeaturedAlternatives(store).map(v=>[v.slug,v]));
 return (store.featuredAlternativeSlugs??defaultFeaturedAlternatives).slice(0,maxFeaturedAlternatives).map(slug=>map.get(slug)).filter((x):x is FeaturedAlternative=>Boolean(x));
}
export async function featuredAlternatives(){return selectedFeaturedAlternatives((await readCachedStore()).store);}
