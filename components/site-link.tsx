import type {AnchorHTMLAttributes} from 'react';
import NextLink from 'next/link';
export default function SiteLink({href,...props}:AnchorHTMLAttributes<HTMLAnchorElement>&{href:string}){
 if(href.startsWith('/')&&!href.startsWith('//'))return <NextLink href={href} prefetch={['/tools','/compare','/guides','/alternatives'].includes(href)} {...props}/>;
 return <a href={href} {...props}/>;
}
