import {VisibilityDiagnostic} from '@/components/visibility-diagnostic';
import {SITE} from '@/lib/catalog';
import {validateBrief,defaultWeights,type FitWeights} from '@/lib/diagnostic';
export const metadata={title:'Software Fit Diagnostic & Decision Planner',description:'Build a personalised software shortlist, adjust fit priorities, compare tools, plan a 14-day pilot, and calculate a time-saving scenario.',alternates:{canonical:SITE+'/diagnostic'}};
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const p=await searchParams;
 const text=(key:string)=>typeof p[key]==='string'?p[key] as string:undefined;
 const initialBrief=validateBrief({category:text('category'),workflow:text('workflow'),scale:text('scale'),style:text('style')});
 const weight=(key:string,fallback:number)=>{const n=Number(text(key));return Number.isInteger(n)&&n>=1&&n<=5?n:fallback;};
 const initialWeights:FitWeights={workflow:weight('ww',defaultWeights.workflow),scale:weight('ws',defaultWeights.scale),style:weight('wa',defaultWeights.style)};
 return <main id="main" className="shell diagnostic-page"><div className="page-intro"><span className="eyebrow">THE TRUTOOL DECISION STUDIO</span><h1>Turn “which tool?”<br/>into a testable plan.</h1><p>A personalised shortlist, adjustable fit priorities, a 14-day pilot, and a time worksheet. Four choices to start. No email required.</p></div><div className="page-body"><VisibilityDiagnostic key={JSON.stringify([initialBrief,initialWeights])} initialBrief={initialBrief} initialWeights={initialWeights}/></div></main>;
}
