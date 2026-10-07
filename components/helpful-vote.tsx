'use client';
import {MotionSymbol} from './motion-symbol';
import {useEffect,useState} from 'react';
import {ThumbsUp,LoaderCircle} from 'lucide-react';
export type HelpfulState={count:number;voted:boolean};
export function useHelpfulCounts(slugs:string[]){
 const key=slugs.join(',');
 const [states,setStates]=useState<Record<string,HelpfulState>>({});
 useEffect(()=>{if(!key)return;const controller=new AbortController();fetch('/api/helpful?slugs='+encodeURIComponent(key),{signal:controller.signal,cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{if(data?.counts)setStates(previous=>({...previous,...data.counts}))}).catch(()=>{});return()=>controller.abort();},[key]);
 return states;
}
export function HelpfulCount({count}:{count:number}){return <span className="question-helpful"><ThumbsUp size={13} aria-hidden="true"/><span>{count} {count===1?'person':'people'} found this helpful</span></span>}
export function HelpfulVote({slug,initialCount}:{slug:string;initialCount:number}){
 const server=useHelpfulCounts([slug])[slug];
 const [saved,setSaved]=useState<HelpfulState|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const current=saved||server||{count:initialCount,voted:false};
 async function vote(){if(busy||current.voted)return;setBusy(true);setError('');try{const response=await fetch('/api/helpful',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug})}),data=await response.json();if(!response.ok)throw new Error(data.error||'Please try again.');setSaved({count:data.count,voted:true});}catch(e){setError(e instanceof Error?e.message:'We could not save your vote. Please try again.');}finally{setBusy(false);}}
 return <div className="answer-helpful"><div><span className="eyebrow">A LITTLE FEEDBACK GOES A LONG WAY</span><h2>Did this answer help?</h2><p>Let us know if it made your next step clearer.</p><HelpfulCount count={current.count}/></div><div className="answer-helpful-action"><button type="button" className={'button '+(current.voted?'helpful-selected':'dark')} aria-pressed={current.voted} disabled={busy||current.voted} onClick={vote}>{busy?<LoaderCircle size={17} className="vote-spinner"/>:current.voted?<MotionSymbol kind="sparkles" size={18}/> :<MotionSymbol kind="helpful" size={18}/>} {busy?'Saving…':current.voted?'Marked as helpful':'Mark as helpful'}</button><span role="status" aria-live="polite">{current.voted?'Thanks for helping the next reader.':error}</span></div></div>;
}
