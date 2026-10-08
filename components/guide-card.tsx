import {authorFor} from '@/lib/authors';
import {ratingFor} from '@/lib/reviews';
import {RatingSummary} from './rating-summary';
import Image from 'next/image';
import {MotionSymbol} from './motion-symbol';
import Link from '@/components/site-link';
import {categoryOf,guides} from '@/lib/catalog';
import {coverFor,coverAlt} from '@/lib/covers';
export {coverFor,coverAlt} from '@/lib/covers';
export function GuideCard({guide:g}:{guide:typeof guides[number]}){return <Link className="guide-card" href={'/guides/'+g.slug}><div className="guide-art"><Image src={coverFor(g.category)} alt={coverAlt(g.category)} width={800} height={500} sizes="(max-width: 520px) calc(100vw - 40px), (max-width: 900px) 46vw, (max-width: 1399px) 30vw, 23vw"/></div><div className="guide-card-copy"><span className="eyebrow">{categoryOf(g.category).short}</span><h3>{g.title}</h3><span className="read-label">By {authorFor(g).name} · Buying checklist</span><RatingSummary rating={ratingFor('guide',g.slug)} compact/><span className="guide-read">Read the guide <MotionSymbol kind="arrow" size={17}/></span></div></Link>}
