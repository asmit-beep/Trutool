
'use client';
import {useState} from 'react';
import Link from '@/components/site-link';
import {Checkbox} from '@/components/ui/checkbox';
import {tools,categories} from '@/lib/catalog';
import {Monogram} from './tool-card';
export function ComparePicker(){
 const [selected,setSelected]=useState<string[]>([]),[category,setCategory]=useState('local-listings');
 const toggle=(slug:string,checked:boolean)=>setSelected(s=>checked?s.includes(slug)?s:s.length<3?[...s,slug]:s:s.filter(x=>x!==slug));
 return <section aria-label="Build your comparison"><div className="compare-instructions"><span>1. Choose a category</span><span>2. Select 2–3 tools</span><span>3. Open your comparison</span></div><div className="chips">{categories.map(c=><button type="button" key={c.slug} aria-pressed={category===c.slug} className={'chip '+(category===c.slug?'active':'')} onClick={()=>{setCategory(c.slug);setSelected([])}}>{c.short}</button>)}</div><div className="select-list">{tools.filter(t=>t.category===category).map(t=><label className={'select-item '+(selected.includes(t.slug)?'is-selected':'')} key={t.slug}><Monogram tool={t}/><span>{t.name}</span><Checkbox aria-label={'Select '+t.name} checked={selected.includes(t.slug)} disabled={selected.length===3&&!selected.includes(t.slug)} onCheckedChange={v=>toggle(t.slug,v===true)}/></label>)}</div><div className="compare-builder-actions"><div aria-live="polite"><strong>{selected.length} of 3 selected</strong><p>{selected.length===0?'Select at least two tools above.':selected.length===1?'Choose one more tool to compare.':selected.map(s=>tools.find(t=>t.slug===s)!.name).join(' · ')}</p></div><div>{selected.length>=2?<Link className="button dark" href={'/compare?tools='+selected.join(',')}>Compare {selected.length} platforms</Link>:<button type="button" disabled className="button dark">Compare platforms</button>}{selected.length>0&&<button type="button" className="chip" onClick={()=>setSelected([])}>Clear selection</button>}</div></div></section>
}
