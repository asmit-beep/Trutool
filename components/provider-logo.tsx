import {ToolLogo} from './tool-logo';
export function ProviderLogo({name,url}:{name:string;url:string}){return <span className="tool-icon provider-logo" aria-hidden="true"><ToolLogo src={'/api/logo?provider='+encodeURIComponent(new URL(url).hostname)} name={name} initial={name.slice(0,2)}/></span>}
