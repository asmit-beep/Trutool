'use client';
import {useState} from 'react';
export function ToolLogo({src,name,initial}:{src:string;name:string;initial:string}){const [failed,setFailed]=useState(false);return failed?<span className="logo-fallback" title={name}>{initial.slice(0,2)}</span>:<img src={src} alt="" width={64} height={64} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>}
