import { cmsAuthorName } from '@/lib/cms-public';
import { getPublished } from '@/lib/cms-store';
import { contentPath,type CmsKind } from '@/lib/cms-types';
import Link from 'next/link';
export async function CmsList({kind,author,heading,limit}:{kind?:CmsKind;author?:string;heading?:string;limit?:number}){const items=(await getPublished()).filter(c=>(!kind||c.kind===kind)&&(!author||c.authorSlug===author)).sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||'')).slice(0,limit);if(!items.length)return null;return <section className="cms-index-section">{heading&&<h2>{heading}</h2>}<div className="cms-editorial-grid">{items.map(c=><Link className="cms-editorial-card" key={c.id} href={contentPath(c)}><span className="eyebrow">{c.kind==='news'?'AI NEWS':c.kind.toUpperCase()}</span><h3>{c.title}</h3><p>{c.description}</p><small>By {cmsAuthorName(c)}</small></Link>)}</div></section>;}
