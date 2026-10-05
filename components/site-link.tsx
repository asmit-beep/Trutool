import type {AnchorHTMLAttributes} from 'react';
// Keep directory navigation as ordinary links so every route and query is
// handled by the server, including when access control gates the site.
export default function SiteLink({href,...props}:AnchorHTMLAttributes<HTMLAnchorElement>&{href:string}){return <a href={href} {...props}/>}
