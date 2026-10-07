import type {CSSProperties} from 'react';
import {ArrowUpRight} from 'lucide-react';
import Link from '@/components/site-link';
import {authors,authorFor} from '@/lib/authors';
import {guides} from '@/lib/catalog';
export function AuthorCards(){return <div className="team-grid">{authors.map(author=><Link href={'/authors/'+author.slug} key={author.slug} className="team-card" style={{'--author-color':author.color} as CSSProperties}><div className="team-card-top"><span className="team-avatar" aria-hidden="true">{author.initial}</span><ArrowUpRight size={23} aria-hidden="true"/></div><span className="team-focus">{author.focus}</span><h3>{author.name}</h3><p>{author.bio}</p><div className="team-topics">{author.topics.map(topic=><span key={topic}>{topic}</span>)}</div><div className="team-card-bottom"><span>{guides.filter(g=>authorFor(g).slug===author.slug).length} buying guides</span><strong>Meet {author.name} <span aria-hidden="true">↗</span></strong></div></Link>)}</div>}
