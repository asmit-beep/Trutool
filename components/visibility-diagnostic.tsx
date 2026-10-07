'use client';

import {TimeWorksheet} from './time-worksheet';
import {PilotScorecard} from './pilot-scorecard';
import {MotionSymbol} from './motion-symbol';
import {pricingFor} from '@/lib/pricing';
import {useState,useMemo} from 'react';
import Link from '@/components/site-link';
import {RadioGroup,RadioGroupItem} from '@/components/ui/radio-group';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Progress} from '@/components/ui/progress';
import {Monogram} from '@/components/tool-card';
import {categories,SITE} from '@/lib/catalog';
import {workflows,scales,styles,validateBrief,briefLabels,matchTools,pilotPlan,guideFor,planText,defaultWeights,defaultScenario,validateScenario,type TimeInputs,type PilotScores,type DiagnosticBrief,type FitWeights} from '@/lib/diagnostic';

const alphabeticalCategories=[...categories].sort((a,b)=>a.short.localeCompare(b.short));
const questionNames=['The work','The workflow','Your scale','Your approach'];
const titles=['What are you choosing a tool for?','What should the tool help you do first?','Who will use this workflow?','How do you want to approach the decision?'];
const keys:Array<keyof DiagnosticBrief>=['category','workflow','scale','style'];

export function VisibilityDiagnostic({initialBrief,initialWeights,initialCategory,initialScenario,initialSelected=[],initialChecked=[],initialScores={}}:{initialBrief?:DiagnosticBrief;initialWeights?:FitWeights;initialCategory?:string;initialScenario?:TimeInputs;initialSelected?:string[];initialChecked?:string[];initialScores?:PilotScores}){
 const [step,setStep]=useState(initialBrief?4:0);
 const [answers,setAnswers]=useState<Partial<DiagnosticBrief>>(initialBrief||(initialCategory?{category:initialCategory}:{}));
 const [weights,setWeights]=useState<FitWeights>(initialWeights||defaultWeights);
 const [tab,setTab]=useState<'shortlist'|'plan'|'time'>('shortlist');
 const [selected,setSelected]=useState<string[]>(initialSelected);
 const [checked,setChecked]=useState<string[]>(initialChecked);
 const [notice,setNotice]=useState('');
 const [scenario,setScenario]=useState(initialScenario||defaultScenario);
 const [categoryQuery,setCategoryQuery]=useState('');
 const [scores,setScores]=useState<PilotScores>(initialScores);
 const brief=useMemo(()=>validateBrief(answers),[answers]);
 const matches=useMemo(()=>brief?matchTools(brief,weights).slice(0,6):[],[brief,weights]);
 const done=step===4&&brief;

 function startOver(){setStep(0);setAnswers({});setWeights(defaultWeights);setSelected([]);setChecked([]);setTab('shortlist');setNotice('');setScenario(defaultScenario);setScores({});setCategoryQuery('');}
 async function copy(text:string,message:string){try{await navigator.clipboard.writeText(text);setNotice(message);}catch{setNotice('Copy is unavailable in this browser. Use Download plan to keep a copy.');}}

 if(!done){
  const categoryTerms=categoryQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const options=step===0?alphabeticalCategories.filter(c=>categoryTerms.every(term=>[c.short,c.name,c.description].join(' ').toLowerCase().split(/[^a-z0-9]+/).some(word=>word.startsWith(term)))).map(c=>[c.slug,c.short,c.description]):step===1?workflows[answers.category||'local-listings']:step===2?scales:styles;
  const current=keys[step];
  return <section className="fit-builder">
   <aside className="fit-rail"><span className="eyebrow">YOUR DECISION BRIEF</span><h2>Less guesswork.<br/>A better shortlist.</h2><p>Four choices. Real directory profiles. A plan you can test.</p><ol>{questionNames.map((name,i)=><li key={name} className={i===step?'current':i<step?'complete':''}><span>{String(i+1).padStart(2,'0')}</span><div>{name}<small>{i<step?'Complete':i===step?'In progress':'Up next'}</small></div></li>)}</ol><div className="fit-rail-note">No sign-up.<br/>No sponsored fit scores.</div></aside>
   <div className="fit-question"><div className="diagnostic-progress"><span>Step {step+1} of 4</span><span>{Math.round(step/4*100)}% complete</span></div><Progress value={step/4*100} aria-label="Diagnostic progress"/><h2 id="diagnostic-question">{titles[step]}</h2><p className="fit-question-help">{step===1?'Pick your main job. The shortlist follows this workflow.':step===3?'You can fine-tune the priorities in your results.':'Choose the closest fit. You can edit your brief later.'}</p><>{step===0&&<div className="fit-category-search"><label htmlFor="diagnostic-category-search">Find your category · A–Z</label><input id="diagnostic-category-search" type="search" placeholder="Try AI, design, or marketing…" value={categoryQuery} onChange={e=>setCategoryQuery(e.target.value)}/><span>{options.length} categories</span></div>}{options.length===0&&<p role="status">No category matches. Try a broader task or clear the search.</p>}</><RadioGroup value={answers[current]||''} onValueChange={value=>setAnswers(a=>current==='category'&&value!==a.category?{...a,category:value,workflow:undefined}:{...a,[current]:value})} aria-labelledby="diagnostic-question" className={'fit-options '+(step===0?'category-options':'')}>{options.map(([value,label,description])=><label className={'fit-option '+(answers[current]===value?'selected':'')} key={value}><RadioGroupItem value={value}/><span><strong>{label}</strong><small>{description}</small></span></label>)}</RadioGroup><div className="diagnostic-actions"><Button variant="outline" disabled={step===0} onClick={()=>setStep(s=>s-1)}>Back</Button><Button className="button dark" disabled={!answers[current]} onClick={()=>{setStep(s=>s+1);setCategoryQuery('')}}>{step===3?'Build my decision plan':'Continue'}</Button></div><p className="form-note">Your answers stay in this page. Save a plan or copy its link to return to it.</p></div>
  </section>;
 }

 const hasTags=matches.some(m=>m.tagged);
 const label=briefLabels(brief);
 const total=weights.workflow+weights.scale+weights.style;
 const phases=pilotPlan(brief);
 const chosen=matchTools(brief,weights).filter(m=>selected.includes(m.tool.slug)).map(m=>m.tool);
 const text=planText(brief,weights,chosen,scenario,checked,scores);
 const params=new URLSearchParams({...brief,ww:String(weights.workflow),ws:String(weights.scale),wa:String(weights.style)});
 for(const [key,value] of Object.entries(scenario))params.set(key,String(value));
 params.set('selected',selected.join(','));params.set('checked',checked.join(','));params.set('scores',JSON.stringify(scores));
 const shareUrl=SITE+'/diagnostic?'+params.toString();
 const conversationMessage='My TruTool decision brief:\n'+label.category+' · '+label.workflow+'\n'+label.scale+' · '+label.style+'\n\nShortlist: '+(chosen.length?chosen:matches.slice(0,3).map(m=>m.tool)).map(t=>t.name).join(', ')+'\n\nI would like to discuss the evaluation requirements and next steps.';
 const conversationUrl='/contact?plan='+encodeURIComponent(conversationMessage);


 function download(){const exportParams=new URLSearchParams(params);for(const [key,value] of Object.entries(scenario))exportParams.set(key,String(value));exportParams.set('selected',selected.join(','));exportParams.set('checked',checked.join(','));const a=document.createElement('a');a.href='/api/decision-plan?'+exportParams.toString();a.download='trutool-decision-plan.md';document.body.appendChild(a);a.click();a.remove();setNotice('Your plan download has started.');}
 function updateScenario(key:keyof TimeInputs,value:string){const n=Number(value);setScenario(s=>validateScenario({...s,[key]:Math.min(key==='weeks'?52:key==='adoption'?100:10000,Math.max(0,Number.isFinite(n)?n:0))}));}

 return <section className="fit-results">
  <div className="fit-result-banner"><div><span className="eyebrow">YOUR DECISION WORKSPACE</span><h2>A shortlist you can work with.</h2><p>{label.category} · {label.workflow}</p><div className="fit-brief-chips"><span>{label.scale}</span><span>{label.style}</span></div></div><div className="fit-save-actions"><Button variant="outline" onClick={download}>Download plan</Button><Button variant="outline" onClick={()=>copy(shareUrl,'Workspace link copied. Your brief, sliders, selections, checklist, and pilot scores are included.')}>Copy workspace link</Button><Button variant="ghost" onClick={()=>{setStep(0);setSelected([]);setChecked([]);setScores({})}}>Edit my brief</Button></div></div>
  <p className="fit-notice" role="status">{notice||'Your workspace is ready. Adjust priorities, test the shortlist, and save your plan.'}</p>
  <nav className="fit-tabs" aria-label="Decision workspace views">{([['shortlist','Your shortlist'],['plan','14-day pilot'],['time','Time worksheet']] as const).map(([id,name])=><button key={id} type="button" aria-pressed={tab===id} onClick={()=>setTab(id)}><MotionSymbol kind={id==='shortlist'?'compass':id==='plan'?'document':'bolt'} size={18}/>{name}</button>)}</nav>
  {tab==='shortlist'&&<div className="fit-shortlist-layout"><aside className="fit-priorities"><span className="eyebrow">MAKE IT YOURS</span><h3>What matters most?</h3><p>{hasTags?'Move a priority to see the order change.':'This category has an unscored starting shortlist. Use the pilot to collect your own evidence.'}</p>{([['workflow','Workflow fit'],['scale','Team & scale fit'],['style','Evaluation approach']] as const).map(([key,name])=><label key={key} className="fit-weight"><span>{name}<strong>{weights[key]}/5</strong></span><input type="range" disabled={!hasTags} min={1} max={5} value={weights[key]} onChange={e=>setWeights(w=>({...w,[key]:Number(e.target.value)}))} aria-label={name}/></label>)}<details><summary>How fit points work</summary><p>Each matching editorial tag earns the weight you assign to it. A tool can earn up to {total} points. These tags suggest options to test; they don’t verify feature coverage or replace a pilot.</p></details><Link className="text-link" href={'/guides/'+guideFor(brief.category).slug}>Open the evaluation guide</Link></aside><div className="fit-candidates"><div className="fit-list-heading"><h3>Your evaluation shortlist.</h3><span>Choose 2–3 to compare</span></div>{matches.map((m,i)=><article className="fit-tool" key={m.tool.slug}><div className="fit-tool-top"><div><span className="fit-rank">{String(i+1).padStart(2,'0')}</span><Monogram tool={m.tool}/></div><span className="fit-points">{m.tagged?<><strong>{m.points}</strong> / {total} fit points</>:<span>Category option</span>}</span></div><h3>{m.tool.name}</h3><p>{m.tool.fit}</p><div className="fit-signals">{m.signals.workflow&&<span>Workflow match</span>}{m.signals.scale&&<span>Scale match</span>}{m.signals.style&&<span>Approach match</span>}{!Object.values(m.signals).some(Boolean)&&<span>Broader category option</span>}</div><div className="fit-caution"><strong>Check in the pilot</strong><p>{m.tool.caution}</p></div><div className="fit-tool-pricing"><a className="text-link" href={pricingFor(m.tool).url} target="_blank" rel="noopener noreferrer">{pricingFor(m.tool).label}</a></div><div className="fit-tool-actions"><Link className="text-link" href={'/tools/'+m.tool.slug}>View profile</Link><label><Checkbox checked={selected.includes(m.tool.slug)} disabled={selected.length===3&&!selected.includes(m.tool.slug)} onCheckedChange={value=>setSelected(s=>value?[...s,m.tool.slug]:s.filter(x=>x!==m.tool.slug))} aria-label={'Compare '+m.tool.name}/>Compare</label></div></article>)}</div></div>}
  {tab==='plan'&&<div className="fit-pilot"><div className="fit-pilot-heading"><div><span className="eyebrow">TEST BEFORE YOU COMMIT</span><h3>Your 14-day pilot</h3><p>Suggested pacing; adjust it to your team. Compare each option on the same work.</p></div><span>{checked.length} / 6 complete</span></div>{phases.map((phase,i)=><article className="fit-phase" key={phase.label}><div><span>{phase.timing}</span><h3>{phase.label}</h3></div><div>{phase.tasks.map((task,j)=>{const id=i+'-'+j;return <label key={id} className={checked.includes(id)?'checked':''}><Checkbox checked={checked.includes(id)} onCheckedChange={value=>setChecked(s=>value?[...s,id]:s.filter(x=>x!==id))} aria-label={task}/><span>{task}</span></label>})}</div></article>)}<Link className="text-link" href={'/guides/'+guideFor(brief.category).slug}>Read your category’s evaluation checklist</Link><PilotScorecard tools={chosen} scores={scores} onChange={setScores}/></div>}
  {tab==='time'&&<TimeWorksheet scenario={scenario} onChange={updateScenario}/>}
  {selected.length>0&&<div className="fit-compare-bar"><div><strong>{selected.length} selected</strong><span>{chosen.map(t=>t.name).join(' · ')}</span></div>{selected.length>=2?<Link className="button dark" href={'/compare?tools='+selected.join(',')}>Compare selected tools</Link>:<span>Choose one more to open a comparison.</span>}<Button variant="ghost" onClick={()=>setSelected([])}>Clear</Button></div>}
  <div className="conversation-card"><div><span className="eyebrow">MAKE THE NEXT MOVE CLEARER</span><h2>You have a plan.<br/><span>Let’s make it practical.</span></h2><p>Bring your shortlist, questions, and pilot requirements into a conversation. Your brief will be added to the form.</p></div><div className="conversation-card-actions"><Link className="button lime" href={conversationUrl}>Start a conversation</Link><Button variant="outline" onClick={()=>copy(text,'Decision plan copied.')}>Copy my plan</Button><button className="conversation-reset" type="button" onClick={startOver}>Start a new diagnostic</button></div></div>
 </section>;
}
