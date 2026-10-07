import {tools} from '@/lib/catalog';
import {defaultWeights,planText,validateBrief,validateScenario,validatePilotScores} from '@/lib/diagnostic';

export function GET(request:Request){
 const p=new URL(request.url).searchParams;
 const brief=validateBrief({category:p.get('category')||'',workflow:p.get('workflow')||'',scale:p.get('scale')||'',style:p.get('style')||''});
 if(!brief)return Response.json({error:'Complete your diagnostic before downloading a plan.'},{status:400});
 const weight=(key:string,fallback:number)=>{const n=Number(p.get(key));return Number.isInteger(n)&&n>=1&&n<=5?n:fallback;};
 const weights={workflow:weight('ww',defaultWeights.workflow),scale:weight('ws',defaultWeights.scale),style:weight('wa',defaultWeights.style)};
 const scenario=validateScenario(Object.fromEntries(['items','before','after','people','weeks','adoption','rate','subscription','setup'].map(key=>[key,p.get(key)])));
 const selected=(p.get('selected')||'').split(',').slice(0,3);
 const chosen=tools.filter(t=>t.category===brief.category&&selected.includes(t.slug));
 const checked=(p.get('checked')||'').split(',').filter(id=>/^[0-2]-[0-1]$/.test(id));
 let scores={};try{scores=validatePilotScores(JSON.parse(p.get('scores')||'{}'),chosen.map(t=>t.slug));}catch{}
 return new Response(planText(brief,weights,chosen,scenario,checked,scores),{headers:{'Content-Type':'text/markdown; charset=utf-8','Content-Disposition':'attachment; filename="trutool-decision-plan.md"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
