'use client';
import {useState} from 'react';
import {ArrowUpRight,ArrowRight,Sparkles,Compass,Zap} from 'lucide-react';
import Link from './site-link';
import {Monogram} from './tool-card';
import type {AIShelfTool} from '@/lib/ai';
const icons={popular:Sparkles,added:Zap,specialist:Compass};
export function AIToolShelves({shelves}:{shelves:{id:string;label:string;description:string;tools:AIShelfTool[]}[]}){
 const [active,setActive]=useState(shelves[0].id);const shelf=shelves.find(s=>s.id===active)||shelves[0];
 return <div className="ai-shelves"><div className="ai-shelf-heading"><div className="ai-shelf-tabs" role="group" aria-label="AI tool collections">{shelves.map(s=>{const Icon=icons[s.id as keyof typeof icons]||Sparkles;return <button key={s.id} aria-pressed={active===s.id} aria-controls="ai-collection-tools" onClick={()=>setActive(s.id)}><Icon size={14}/>{s.label}</button>})}</div><Link className="ai-inline-link" href="/everything-ai#ai-directory">Explore the directory <ArrowRight size={15}/></Link></div><p className="ai-shelf-description" aria-live="polite">{shelf.description}</p><div className="ai-tools-constellation" id="ai-collection-tools">{shelf.tools.map(t=><Link className="ai-mini-tool" href={'/tools/'+t.slug} key={t.slug}><div className="ai-mini-top"><Monogram tool={t}/>{shelf.id==='added'&&t.launchedAt?<time className="ai-launch-date" dateTime={t.launchedAt}>{new Date(t.launchedAt+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'})}</time>:<ArrowUpRight size={16}/>}</div><h3>{t.name}</h3><p>{t.useCase}</p><span className="ai-tool-explore">{shelf.id==='added'?t.launchStatus:t.categoryLabel}<ArrowRight size={13}/></span></Link>)}</div>{shelf.tools.length===0&&<p className="ai-empty-collection">New launches will appear here as they’re added. Explore the directory for tools you can use today.</p>}</div>
}
