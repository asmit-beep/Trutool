'use client';
import {useEffect} from 'react';
// Keep the looping strip asleep when it is not on screen or the tab is hidden.
export function MotionVisibility({selector=".community-section"}:{selector?:string}){useEffect(()=>{
 const section=document.querySelector<HTMLElement>(selector);if(!section)return;
 let visible=false;
 const update=()=>{section.dataset.motion=visible&&!document.hidden?'active':'idle'};
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update()},{rootMargin:'100px'});
 observer.observe(section);document.addEventListener('visibilitychange',update);update();
 return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update);delete section.dataset.motion};
 },[selector]);return null}
