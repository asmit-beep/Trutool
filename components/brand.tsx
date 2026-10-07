import Image from 'next/image';
import Link from '@/components/site-link';

const logo='/identity/trutool-logo-light.svg';

export function FooterBrand(){return <Link href="/" className="footer-signature" aria-label="TruTool home"><span className="footer-logo-art"><Image src={logo} alt="TruTool" width={1129} height={323} unoptimized/><span className="footer-logo-sheen" aria-hidden="true"/></span></Link>}
export function Brand(){return <Link href="/" className="brand" aria-label="TruTool home"><span className="brand-image"><Image src={logo} alt="TruTool" width={1129} height={323} unoptimized/></span></Link>}
