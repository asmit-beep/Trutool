import Image from 'next/image';
import Link from '@/components/site-link';
export function Brand(){return <Link href="/" className="brand" aria-label="TruTool home"><span className="brand-image"><Image src="/trutool-logo.png" alt="TruTool" width={658} height={277} sizes="230px"/></span></Link>}
