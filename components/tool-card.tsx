import {brandAssets} from '@/lib/brand-assets';
import Link from '@/components/site-link';
import { Tool,categoryOf } from '@/lib/catalog';
export function Monogram({tool}:{tool:Tool}){return <span className="tool-icon" aria-hidden="true"><img src={brandAssets[tool.slug]} alt="" width={64} height={64} loading="lazy"/></span>}
export function ToolCard({tool}:{tool:Tool}){return <Link className="tool-card" href={'/tools/'+tool.slug}><div className="card-top"><Monogram tool={tool}/><span className="card-type">{tool.format}</span></div><h3>{tool.name}</h3><p>{tool.summary}</p><div className="card-bottom"><span>{categoryOf(tool.category).short}</span><span className="card-open">View profile</span></div>{tool.relationship&&tool.relationship==='Commercial relationship'&&<span className="relationship">Commercial relationship</span>}</Link>}
