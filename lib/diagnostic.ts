import {tools, categories, guides, type Tool} from './catalog';

export type DiagnosticBrief={category:string;workflow:string;scale:string;style:string};
export type FitWeights={workflow:number;scale:number;style:number};
export const defaultWeights:FitWeights={workflow:5,scale:3,style:3};
const coreWorkflows:Record<string,Array<[string,string,string]>>={
 ai:[['writing','Write and revise with an assistant','Drafts, edits, and a human review process.'],['research','Research with traceable sources','Search, sources, and evidence you can inspect.'],['analysis','Work through documents and data','A repeatable task with your own test inputs.']],
 productivity:[['notes','Keep useful knowledge organised','Notes, search, and reusable context.'],['tasks','Plan and complete work','Tasks, priorities, and a repeatable routine.'],['focus','Reduce distraction and friction','Shortcuts, focused work, and time spent.']],
 design:[['collaboration','Design with a team','Shared files, feedback, and handoffs.'],['graphics','Create polished visual assets','Graphics, templates, and finished exports.'],['prototype','Test an interface or idea','A prototype you can share and evaluate.']],
 marketing:[['campaigns','Plan and publish campaigns','Content, channels, and consistent delivery.'],['email','Build email and audience workflows','Contacts, consent, campaigns, and follow-ups.'],['insight','Improve targeting and measurement','Research, attribution questions, and reporting.']],
 'local-listings':[['distribution','Keep location data in sync','Listings, updates, and location information.'],['audit','Find and fix local visibility gaps','Citation audits, local rankings, and reporting.'],['reputation','Connect listings and reviews','A joined-up local presence and reputation workflow.']],
 'rfp-software':[['drafting','Draft answers from company knowledge','Start with source material, then review every response.'],['library','Build a reusable response library','Organise answers, owners, and review cycles.'],['documents','Create proposals and final documents','Templates, collaboration, and buyer-ready exports.']],
 'communication':[['chat','Coordinate everyday work','Persistent conversations and shared team context.'],['meetings','Make live meetings work better','Internal meetings and external conversations.'],['async','Replace some meetings with recordings','Walkthroughs and updates people can watch later.'],['community','Build an ongoing community','Shared spaces for text, voice, and discussion.']],
 'edtech':[['live','Learn with structured live training','Compare schedules, trainers, and support.'],['self','Learn a specific skill at my own pace','Compare syllabuses and instructor quality.'],['credential','Evaluate an institution-backed pathway','Compare assessments, issuing bodies, and entry requirements.']]
};
export const workflows:Record<string,Array<[string,string,string]>>=Object.fromEntries(categories.map(c=>[c.slug,coreWorkflows[c.slug]||[['focused','Improve one specific task','Test one repeatable job with a real input.'],['connected','Connect the workflow','Evaluate handoffs, integrations, and ownership.'],['controlled','Build a dependable team process','Compare permissions, review steps, and exports.']]]));
export const scales:Array<[string,string,string]>=[['small','Just me or a small team','A focused evaluation, with few people involved.'],['team','A team working together','Shared workflows, handoffs, and ownership.'],['large','Several teams or locations','Governance, rollout, and consistent processes.']];
export const styles:Array<[string,string,string]>=[['lean','Keep the evaluation lightweight','Start with a focused workflow and a small pilot.'],['balanced','Build a repeatable process','Prioritise coordination and consistent ownership.'],['governance','Make controls a priority','Test permissions, review steps, and rollout requirements.']];
type Tags={workflows:string[];scales:string[];styles:string[]};
const tags:Record<string,Tags>={
 consensus:{workflows:['research'],scales:['small','team'],styles:['lean','balanced']},
 elicit:{workflows:['research'],scales:['small','team'],styles:['lean','balanced']},
 scite:{workflows:['research'],scales:['small','team'],styles:['lean','balanced']},
 chatgpt:{workflows:['writing','analysis'],scales:['small','team'],styles:['lean','balanced']},
 claude:{workflows:['writing','analysis'],scales:['small','team'],styles:['lean','balanced']},
 perplexity:{workflows:['research'],scales:['small','team'],styles:['lean','balanced']},
 deepseek:{workflows:['writing','analysis'],scales:['small','team'],styles:['lean']},
 gemini:{workflows:['writing','research','analysis'],scales:['small','team'],styles:['balanced']},
 mistral:{workflows:['writing','analysis'],scales:['team'],styles:['balanced','governance']},
 notion:{workflows:['notes','tasks'],scales:['small','team'],styles:['balanced']},
 obsidian:{workflows:['notes'],scales:['small'],styles:['lean','balanced']},
 todoist:{workflows:['tasks'],scales:['small','team'],styles:['lean','balanced']},
 ticktick:{workflows:['tasks','focus'],scales:['small'],styles:['lean']},
 evernote:{workflows:['notes'],scales:['small','team'],styles:['lean','balanced']},
 raycast:{workflows:['focus'],scales:['small'],styles:['lean']},
 figma:{workflows:['collaboration','prototype'],scales:['team','large'],styles:['balanced']},
 canva:{workflows:['graphics','collaboration'],scales:['small','team'],styles:['lean','balanced']},
 sketch:{workflows:['prototype','collaboration'],scales:['small','team'],styles:['balanced']},
 penpot:{workflows:['prototype','collaboration'],scales:['team'],styles:['balanced']},
 'adobe-photoshop':{workflows:['graphics'],scales:['small','team'],styles:['balanced']},
 'adobe-illustrator':{workflows:['graphics'],scales:['small','team'],styles:['balanced']},
 buffer:{workflows:['campaigns'],scales:['small','team'],styles:['lean','balanced']},
 hootsuite:{workflows:['campaigns','insight'],scales:['team','large'],styles:['balanced']},
 mailchimp:{workflows:['email','campaigns'],scales:['small','team'],styles:['lean','balanced']},
 brevo:{workflows:['email'],scales:['small','team'],styles:['lean','balanced']},
 klaviyo:{workflows:['email','insight'],scales:['team'],styles:['balanced']},
 activecampaign:{workflows:['email'],scales:['small','team'],styles:['balanced']},
 synup:{workflows:['distribution','reputation'],scales:['team','large'],styles:['balanced']},
 yext:{workflows:['distribution'],scales:['large'],styles:['governance','balanced']},
 uberall:{workflows:['distribution','reputation'],scales:['large'],styles:['balanced','governance']},
 brightlocal:{workflows:['audit'],scales:['small','team'],styles:['lean','balanced']},
 birdeye:{workflows:['reputation','distribution'],scales:['large','team'],styles:['balanced','governance']},
 'semrush-local':{workflows:['audit','distribution'],scales:['small','team'],styles:['lean','balanced']},
 'inventive-ai':{workflows:['drafting','library'],scales:['team','large'],styles:['balanced','governance']},
 loopio:{workflows:['library','drafting'],scales:['team','large'],styles:['balanced','governance']},
 responsive:{workflows:['library','drafting'],scales:['large','team'],styles:['governance','balanced']},
 sifthub:{workflows:['drafting','library'],scales:['team'],styles:['balanced']},
 'autorfp-ai':{workflows:['drafting'],scales:['small','team'],styles:['lean','balanced']},
 qorusdocs:{workflows:['documents','drafting'],scales:['team','large'],styles:['balanced','governance']},
 slack:{workflows:['chat'],scales:['small','team','large'],styles:['lean','balanced']},
 'microsoft-teams':{workflows:['chat','meetings'],scales:['team','large'],styles:['balanced','governance']},
 zoom:{workflows:['meetings'],scales:['small','team','large'],styles:['lean','balanced']},
 'google-meet':{workflows:['meetings'],scales:['small','team'],styles:['lean','balanced']},
 discord:{workflows:['community','chat'],scales:['small','team'],styles:['lean']},
 loom:{workflows:['async'],scales:['small','team'],styles:['lean','balanced']},
 staragile:{workflows:['live'],scales:['small','team'],styles:['balanced']},
 simplilearn:{workflows:['live','credential'],scales:['small','team'],styles:['balanced']},
 coursera:{workflows:['self','credential'],scales:['small','team'],styles:['lean','balanced']},
 udemy:{workflows:['self'],scales:['small','team'],styles:['lean']},
 upgrad:{workflows:['live','credential'],scales:['small','team'],styles:['balanced']},
 edx:{workflows:['self','credential'],scales:['small','team'],styles:['lean','balanced']}
};
export function validateBrief(a:Partial<DiagnosticBrief>):DiagnosticBrief|undefined{
 if(!categories.some(c=>c.slug===a.category)||!workflows[a.category!]?.some(w=>w[0]===a.workflow)||!scales.some(s=>s[0]===a.scale)||!styles.some(s=>s[0]===a.style))return;
 return a as DiagnosticBrief;
}
export function briefLabels(a:DiagnosticBrief){
 return {category:categories.find(c=>c.slug===a.category)!.short,workflow:workflows[a.category].find(w=>w[0]===a.workflow)![1],scale:scales.find(s=>s[0]===a.scale)![1],style:styles.find(s=>s[0]===a.style)![1]};
}
export function matchTools(a:DiagnosticBrief,weights:FitWeights){
 return tools.filter(t=>t.category===a.category).map(tool=>{
  const t=tags[tool.slug];
  if(!t)return {tool,tagged:false,signals:{workflow:false,scale:false,style:false},points:0};
  const signals={workflow:t.workflows.includes(a.workflow),scale:t.scales.includes(a.scale),style:t.styles.includes(a.style)};
  return {tool,tagged:true,signals,points:(signals.workflow?weights.workflow:0)+(signals.scale?weights.scale:0)+(signals.style?weights.style:0)};
 }).sort((a,b)=>b.points-a.points||a.tool.name.localeCompare(b.tool.name));
}
export function pilotPlan(a:DiagnosticBrief){
 const categoryTasks:Record<string,string[]>={
  'local-listings':['List priority publishers and confirm who owns each business profile.','Test one real location change, holiday hours, and a duplicate listing.','Record update time, unresolved exceptions, and ongoing work your team must do.','Request a written breakdown of location fees, onboarding, and cancellation access.'],
  'rfp-software':['Choose one real questionnaire and a controlled set of current source documents.','Include an outdated or conflicting source and inspect citations and reviewer corrections.','Track reviewer time, unsupported statements, and the quality of the final export.','Confirm source permissions, content ownership, and the exact package in the quote.'],
  communication:['Map one recurring conversation, meeting, or recorded update to test.','Invite an external collaborator and then verify access can be removed.','Compare time spent coordinating work, searching for context, and resolving handoffs.','Confirm retention, export, administration, and any meeting or recording limits.'],
  edtech:['Choose a specific course, learning goal, and current syllabus for each option.','Review a sample lesson or live-session format and the work needed for assessments.','Compare trainer or institution credentials, projects, feedback, and support.','Request total fees, exam inclusion, credential issuer, and cancellation terms in writing.']
 };
 const t=categoryTasks[a.category]||['Define one real task, a successful result, and the current time needed to finish it.','Give each shortlisted tool the same inputs; test a normal case and a difficult exception.','Record quality, manual corrections, integration effort, and the time to complete the task.','Confirm access controls, export options, full plan costs, and cancellation terms in writing.'];
 return [
  {label:'Define the test',timing:'Days 1–3',tasks:[t[0],a.scale==='large'?'Choose one team or location first; name a rollout owner and a permissions reviewer.':'Name one pilot owner and capture the current workflow before changing it.']},
  {label:'Run the same pilot',timing:'Days 4–10',tasks:[t[1],t[2]]},
  {label:'Make the decision',timing:'Days 11–14',tasks:[t[3],a.style==='governance'?'Document access boundaries, approval steps, and unresolved control requirements.':'Record the remaining manual work and decide whether the change is worth adopting.']}
 ];
}
export const guideFor=(category:string)=>guides.find(g=>g.category===category)||guides.find(g=>g.slug==='choosing-a-software-stack')!;
export function timeScenario(items:number,before:number,after:number,people:number,weeks:number){
 const values=[items,before,after,people,weeks];
 if(values.some(v=>!Number.isFinite(v)||v<0))return {weekly:0,annual:0};
 const weekly=items*(before-after)*people/60;
 return {weekly,annual:weekly*weeks};
}
export function planText(a:DiagnosticBrief,weights:FitWeights,selected:Tool[],scenario:Pick<TimeInputs,'items'|'before'|'after'|'people'|'weeks'>&Partial<TimeInputs>,checked:string[]=[],scores:PilotScores={}){
 const label=briefLabels(a),matches=matchTools(a,weights),total=weights.workflow+weights.scale+weights.style;
 const lines=['# My TruTool decision plan','','## The brief','- Category: '+label.category,'- Workflow: '+label.workflow,'- Scale: '+label.scale,'- Approach: '+label.style,'','## Shortlist'];
 for(const m of matches.slice(0,3))lines.push('- '+m.tool.name+' — '+m.points+'/'+total+' fit points; '+m.tool.url,'  Check: '+m.tool.caution);
 lines.push('','Points use TruTool editorial tags, not review ratings or verified feature coverage. Confirm vendor details before committing.','');
 if(selected.length)lines.push('Selected for comparison: '+selected.map(t=>t.name).join(', '),'');
 lines.push('## My 14-day pilot');
 for(const [i,p] of pilotPlan(a).entries()){lines.push('','### '+p.timing+' · '+p.label);for(const [j,task] of p.tasks.entries())lines.push('- ['+(checked.includes(i+'-'+j)?'x':' ')+'] '+task);}
 const time=timeScenario(scenario.items,scenario.before,scenario.after,scenario.people,scenario.weeks);
 lines.push('','## Time scenario','Inputs: '+scenario.items+' items per person/week; '+scenario.before+' minutes before; '+scenario.after+' minutes after; '+scenario.people+' people; '+scenario.weeks+' working weeks.','Weekly change: '+time.weekly.toFixed(1)+' hours. Annual change: '+time.annual.toFixed(1)+' hours.','This is a scenario from my inputs, not measured savings or a product forecast.','','## Evaluation guide','https://trutool-directory.vercel.app/guides/'+guideFor(a.category).slug);
 const capacity=capacityScenario(validateScenario(scenario));
 lines.push('','## Capacity & cost scenario','Adoption: '+validateScenario(scenario).adoption+'%. Weekly capacity change: '+capacity.weekly.toFixed(1)+' hours.','Annual capacity value: '+capacity.value.toFixed(2)+' currency units. First-year net value: '+capacity.net.toFixed(2)+' currency units.','Setup payback: '+(capacity.payback===null?'No positive recurring value':capacity.payback.toFixed(1)+' months')+'.','Value uses your hourly, monthly, and setup costs in a single currency; it is not guaranteed cash savings.','','## My pilot scorecard');
 for(const tool of selected){const row=scores[tool.slug]||{},score=pilotScore(row);lines.push('- '+tool.name+': '+pilotCriteria.map(c=>c.label+' '+(row[c.id]??'not tested')).join('; ')+'; weighted result '+(score===null?'incomplete':score.toFixed(1)+'/5'));}
 return lines.join('\n');
}

export type TimeInputs={items:number;before:number;after:number;people:number;weeks:number;adoption:number;rate:number;subscription:number;setup:number};
export const defaultScenario:TimeInputs={items:10,before:20,after:20,people:1,weeks:46,adoption:100,rate:0,subscription:0,setup:0};
export function validateScenario(input:Partial<Record<keyof TimeInputs,unknown>>):TimeInputs{
 const result={...defaultScenario};
 for(const key of Object.keys(result) as Array<keyof TimeInputs>){const raw=input[key],n=Number(raw),max=key==='weeks'?52:key==='adoption'?100:10000;if(raw!==undefined&&raw!==null&&raw!==''&&Number.isFinite(n)&&n>=0&&n<=max)result[key]=n;}
 return result;
}
export function capacityScenario(input:TimeInputs){
 const s=validateScenario(input),time=timeScenario(s.items,s.before,s.after,s.people,s.weeks);
 const weekly=time.weekly*s.adoption/100,annual=weekly*s.weeks,value=annual*s.rate,cost=s.subscription*12;
 const ongoing=value-cost,net=ongoing-s.setup;
 return {weekly,annual,value,cost,ongoing,net,payback:ongoing>0?s.setup/(ongoing/12):null,change:s.before>0?(s.before-s.after)/s.before*100:null};
}
export const pilotCriteria=[{id:'quality',label:'Output quality',weight:4},{id:'ease',label:'Ease of use',weight:2},{id:'integration',label:'Workflow fit',weight:2},{id:'value',label:'Value for cost',weight:2}] as const;
export type PilotScores=Record<string,Partial<Record<(typeof pilotCriteria)[number]['id'],number>>>;
export function pilotScore(scores:PilotScores[string]){return pilotCriteria.every(c=>Number.isInteger(scores[c.id])&&scores[c.id]!>=1&&scores[c.id]!<=5)?pilotCriteria.reduce((sum,c)=>sum+scores[c.id]!*c.weight,0)/pilotCriteria.reduce((sum,c)=>sum+c.weight,0):null;}
export function validatePilotScores(input:unknown,allowed:string[]):PilotScores{
 if(!input||typeof input!=='object'||Array.isArray(input))return {};
 const result:PilotScores={};
 for(const slug of allowed){const raw=(input as Record<string,unknown>)[slug];if(!raw||typeof raw!=='object'||Array.isArray(raw))continue;const row:PilotScores[string]={};for(const c of pilotCriteria){const n=(raw as Record<string,unknown>)[c.id];if(typeof n==='number'&&Number.isInteger(n)&&n>=1&&n<=5)row[c.id]=n;}if(Object.keys(row).length)result[slug]=row;}
 return result;
}
