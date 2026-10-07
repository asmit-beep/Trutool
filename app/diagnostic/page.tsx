import {pageMetadata} from '@/lib/seo';
import {VisibilityDiagnostic} from '@/components/visibility-diagnostic';
import {SITE,categories} from '@/lib/catalog';
import {validateBrief,validateScenario,validatePilotScores,matchTools,defaultWeights,type FitWeights} from '@/lib/diagnostic';
export const metadata=pageMetadata({title:'Software Fit Diagnostic & Decision Planner',description:'Build a personalised software shortlist, adjust fit priorities, compare tools, plan a 14-day pilot, and calculate a time-saving scenario.',alternates:{canonical:SITE+'/diagnostic'}});
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const p=await searchParams;
 const text=(key:string)=>typeof p[key]==='string'?p[key] as string:undefined;
 const initialBrief=validateBrief({category:text('category'),workflow:text('workflow'),scale:text('scale'),style:text('style')});
 const weight=(key:string,fallback:number)=>{const n=Number(text(key));return Number.isInteger(n)&&n>=1&&n<=5?n:fallback;};
 const initialWeights:FitWeights={workflow:weight('ww',defaultWeights.workflow),scale:weight('ws',defaultWeights.scale),style:weight('wa',defaultWeights.style)};
 return <main id="main" className="shell diagnostic-page"><div className="page-intro"><span className="eyebrow">THE TRUTOOL DECISION STUDIO</span><h1>Turn “which tool?”<br/>into a testable plan.</h1><p>A personalised shortlist, a hands-on pilot scorecard, and an interactive capacity and cost worksheet. Four choices to start. No email required.</p></div><div className="page-body"><VisibilityDiagnostic key={JSON.stringify(p)} initialBrief={initialBrief} initialWeights={initialWeights} initialScenario={validateScenario(Object.fromEntries(['items','before','after','people','weeks','adoption','rate','subscription','setup'].map(key=>[key,text(key)])))} initialSelected={(text('selected')||'').split(',').filter(slug=>initialBrief&&matchTools(initialBrief,initialWeights).some(m=>m.tool.slug===slug)).slice(0,3)} initialChecked={(text('checked')||'').split(',').filter(id=>/^[0-2]-[0-1]$/.test(id))} initialScores={(()=>{try{return validatePilotScores(JSON.parse(text('scores')||'{}'),initialBrief?matchTools(initialBrief,initialWeights).map(m=>m.tool.slug):[])}catch{return {}}})()} initialCategory={categories.some(c=>c.slug===text('category'))?text('category'):undefined}/></div></main>;
}
