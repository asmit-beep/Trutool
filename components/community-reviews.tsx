'use client';
import {useDeferredValue,useMemo,useState} from 'react';
import {BookOpen,Search} from 'lucide-react';
import Link from './site-link';
import {Monogram} from './tool-card';
import {RatingSummary} from './rating-summary';
import type {PublishedReview} from '@/lib/reviews';
type CommunityReview=PublishedReview&{title:string;href:string;tool?:{slug:string;name:string;initial:string}};
export function CommunityReviews({reviews}:{reviews:CommunityReview[]}){
 const [query,setQuery]=useState(''),[kind,setKind]=useState(''),[page,setPage]=useState(1),deferred=useDeferredValue(query);
 const filtered=useMemo(()=>reviews.filter(r=>(!kind||r.kind===kind)&&(r.title+' '+r.name+' '+r.message).toLowerCase().includes(deferred.trim().toLowerCase())),[reviews,deferred,kind]);
 const pages=Math.max(1,Math.ceil(filtered.length/12)),current=Math.min(page,pages);
 return <div className="community-reviews-list"><div className="community-search"><label><Search size={19}/><span className="sr-only">Search community reviews</span><input placeholder="Search a tool, a guide, or an experience…" value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}}/></label><select aria-label="Review type" value={kind} onChange={e=>{setKind(e.target.value);setPage(1)}}><option value="">All reviews</option><option value="tool">Tools</option><option value="guide">Buying guides</option></select></div><p className="review-result-count" aria-live="polite">{filtered.length} {filtered.length===1?'review':'reviews'}</p><div className="community-review-grid">{filtered.slice((current-1)*12,current*12).map(r=><article className="community-reader-card" key={r.id}><Link className="reader-review-brand" href={r.href}>{r.tool?<Monogram tool={r.tool}/>:<span className="review-guide-icon"><BookOpen size={19}/></span>}<strong>{r.title}</strong></Link><RatingSummary rating={{average:r.rating,count:1}} compact/><p>{r.message}</p><div className="reader-review-person"><span aria-hidden="true">{r.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</span><div><strong>{r.name}</strong><small>{r.kind==='guide'?'Guide reader':'Tool user'}</small></div></div></article>)}</div>{!filtered.length&&<div className="empty-state"><h3>No matching reviews.</h3><p>Try a tool name or a broader workflow.</p></div>}{pages>1&&<nav className="directory-pagination" aria-label="Community review pages"><button className="chip" disabled={current===1} onClick={()=>setPage(current-1)}>Previous</button><span>Page {current} of {pages}</span><button className="chip" disabled={current===pages} onClick={()=>setPage(current+1)}>Next</button></nav>}</div>;
}
