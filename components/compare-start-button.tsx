'use client';

import {useRouter} from 'next/navigation';

/** A user-triggered comparison preselection; do not expose a crawlable
 * parameter URL for every directory product. */
export function CompareStartButton({slug}:{slug:string}){
 const router=useRouter();
 return <button type="button" className="button dark" onClick={()=>router.push('/compare?tools='+encodeURIComponent(slug))}>Add to comparison</button>;
}
