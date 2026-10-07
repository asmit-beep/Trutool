import Link from './site-link';
import type {CSSProperties} from 'react';
import type {Author} from '@/lib/authors';
export function AuthorProfile({author,compact=false}:{author:Author;compact?:boolean}){return <div className={'author-profile '+(compact?'compact':'')}><span className="avatar author-avatar" style={{'--author-color':author.color} as CSSProperties} aria-hidden="true">{author.initial}</span><div><Link href={'/authors/'+author.slug}><strong>{author.name}</strong></Link><span>{author.focus}</span>{!compact&&<p>{author.bio}</p>}</div></div>}
