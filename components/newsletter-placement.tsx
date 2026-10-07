'use client';
import {usePathname} from 'next/navigation';
export function NewsletterPlacement({children}:{children:React.ReactNode}){
 const path=usePathname();
 if(['/newsletter','/privacy','/terms','/cookies','/contact','/list-your-product'].some(p=>path===p)||path.startsWith('/api/'))return null;
 return children;
}
