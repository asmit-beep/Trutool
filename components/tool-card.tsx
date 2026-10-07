import {MotionSymbol} from './motion-symbol';
import {brandAssets} from '@/lib/brand-assets';
import {ToolLogo} from './tool-logo';
import Link from '@/components/site-link';
import type { Tool } from '@/lib/catalog';
export function Monogram({tool}:{tool:Pick<Tool,'slug'|'name'|'initial'>}){return <span className="tool-icon" aria-hidden="true"><ToolLogo key={tool.slug} src={brandAssets[tool.slug]||'/api/logo?slug='+tool.slug} name={tool.name} initial={tool.initial}/></span>}
export function ToolCard({tool}:{tool:Pick<Tool,'slug'|'name'|'initial'|'summary'|'category'|'format'|'categoryLabel'>}){return <Link className="tool-card" href={'/tools/'+tool.slug}><div className="card-top"><Monogram tool={tool}/><span className="card-type">{tool.format}</span></div><h3>{tool.name}</h3><p>{tool.summary}</p><div className="card-bottom"><span>{tool.categoryLabel||tool.category}</span><span className="card-open">View profile <MotionSymbol kind="arrow" size={14}/></span></div></Link>}
