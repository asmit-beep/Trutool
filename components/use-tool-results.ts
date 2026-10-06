'use client';
import {useEffect,useState} from 'react';
import type {ToolResults} from '@/lib/catalog-client';
const cache=new Map<string,{data:ToolResults;at:number}>();
export function resultsUrl(query:string,category:string,sort:string,page:number,limit:number,scope=''){return '/api/tools?'+new URLSearchParams({q:query.trim().slice(0,160),category,sort,page:String(page),limit:String(limit),...(scope?{scope}:{})}).toString()}
export async function fetchToolResults(url:string,signal:AbortSignal):Promise<ToolResults>{
 const hit=cache.get(url);if(hit&&Date.now()-hit.at<30000)return hit.data;
 const response=await fetch(url,{signal});if(!response.ok)throw new Error('Search is unavailable. Please try again.');
 const data:ToolResults=await response.json();if(signal.aborted)throw new DOMException('Aborted','AbortError');
 if(cache.size>=40)cache.delete(cache.keys().next().value!);cache.set(url,{data,at:Date.now()});return data;
}
export function useToolResults(initial:ToolResults,query:string,category:string,sort='relevance',page=1,limit=24,scope=''){
 const [state,setState]=useState({data:initial,url:resultsUrl(initial.query,initial.category,initial.sort,initial.page,initial.limit,initial.scope),error:''});
 const [retry,setRetry]=useState(0),url=resultsUrl(query,category,sort,page,limit,scope);
 useEffect(()=>{
  if(state.url===url)return;
  const controller=new AbortController();
  const timer=setTimeout(()=>{void fetchToolResults(url,controller.signal).then(data=>{if(!controller.signal.aborted)setState({data,url,error:''})}).catch(error=>{if(!controller.signal.aborted)setState(previous=>({...previous,url,error:error instanceof Error?error.message:'Please try again.'}))})},150);
  return()=>{clearTimeout(timer);controller.abort()};
 },[url,retry,state.url]);
 return {data:state.data,busy:state.url!==url,error:state.url===url?state.error:'',retry:()=>{setState(s=>({...s,url:''}));setRetry(n=>n+1)}};
}
