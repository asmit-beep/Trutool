import Image from 'next/image';
import Link from '@/components/site-link';
export function FooterBrand(){return <Link href="/" className="footer-signature" aria-label="TruTool home"><span className="footer-orbit" aria-hidden="true"><span>T</span></span><span className="footer-wordmark">TruTool</span><span className="footer-signature-caption">A CLEARER POINT OF VIEW</span></Link>}
export function Brand(){return <Link href="/" className="brand" aria-label="TruTool home"><span className="brand-image"><Image src="/trutool-logo.png" alt="TruTool" width={658} height={277} sizes="230px"/></span></Link>}
