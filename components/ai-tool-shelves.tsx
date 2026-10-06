'use client';
import {useState} from 'react';
import {ArrowUpRight,ArrowRight,Sparkles} from 'lucide-react';
import Link from './site-link';
import {Monogram} from './tool-card';
import type {DirectoryTool} from '@/lib/catalog-client';
export function AIToolShelves({shelves}:{shelves:{id:string;label:string;description:string;tools:DirectoryTool[]}[]}){
 const [active,setActive]=useState(shelves[0].id);const shelf=shelves.find(s=>s.id===active)!;
 return <div className="ai-shelves"><div className="ai-shelf-heading"><div className="ai-shelf-tabs" role="group" aria-label="AI tool collections">{shelves.map(s=><button key={s.id} aria-pressed={active===s.id} onClick={()=>setActive(s.id)}><Sparkles size={14}/>{s.label}</button>)}</div><Link className="ai-inline-link" href="/everything-ai#ai-directory">Find your AI <ArrowRight size={17}/></Link></div><p className="ai-shelf-description" aria-live="polite">{shelf.description}</p><div className="ai-tools-constellation">{shelf.tools.map(t=><Link className="ai-mini-tool" href={'/tools/'+t.slug} key={t.slug}><div className="ai-mini-top"><Monogram tool={t}/><ArrowUpRight size={17}/></div><span className="ai-tool-category">{t.categoryLabel}</span><h3>{t.name}</h3><p>{t.summary}</p><span className="ai-tool-explore">Meet the tool <ArrowRight size={14}/></span></Link>)}</div></div>
}
