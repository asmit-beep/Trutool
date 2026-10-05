'use client';
import Image from 'next/image';
import {useState} from 'react';
export function ToolLogo({src,name,initial}:{src:string;name:string;initial:string}){const [failed,setFailed]=useState(false);return failed?<span className="logo-fallback" title={name}>{initial.slice(0,2)}</span>:<Image src={src} unoptimized={src.endsWith('.svg')||src.startsWith('/api/')} sizes="64px" alt="" width={64} height={64} onError={()=>setFailed(true)}/>}
