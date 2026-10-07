import {Suspense} from 'react';
import Image from 'next/image';
import {MotionSymbol} from './motion-symbol';
import {MotionVisibility} from './motion-visibility';
import {NewsletterForm} from './newsletter-form';

export function NewsletterCard({standalone=false}:{standalone?:boolean}){
 return <section className={'newsletter-section'+(standalone?' newsletter-standalone':'')} aria-labelledby="newsletter-heading"><MotionVisibility selector=".newsletter-section"/><div className="shell"><div className="newsletter-card">
  <div className="newsletter-copy"><span className="newsletter-eyebrow"><MotionSymbol kind="mail" size={16}/>TRUTOOL DISPATCH</span><h2 id="newsletter-heading">Your next good find.<br/><span>Delivered.</span></h2><p>A useful edit of new tools, AI developments, and ideas that make choosing easier.</p><div className="newsletter-benefits"><span><MotionSymbol kind="sparkles" size={16}/>Fresh discoveries</span><span><MotionSymbol kind="compass" size={16}/>A clearer point of view</span></div></div>
  <div className="newsletter-art" aria-hidden="true"><span className="dispatch-orbit orbit-one"/><span className="dispatch-orbit orbit-two"/><div className="dispatch-letter"><Image src="/identity/trutool-icon-light.svg" alt="" width={32} height={32} unoptimized/><span>THE NEXT GOOD FIND</span><i/><i/><i/><div><span>AI</span><span>TOOLS</span><span>IDEAS</span></div></div><div className="dispatch-envelope"><span/><MotionSymbol kind="sparkles" size={22}/></div><span className="dispatch-dot dot-one"/><span className="dispatch-dot dot-two"/><span className="dispatch-star"><MotionSymbol kind="sparkles" size={24}/></span></div>
  <div className="newsletter-form-panel"><div className="newsletter-form-heading"><span className="newsletter-edition-label">A LITTLE SIGNAL FOR YOUR INBOX</span><span className="newsletter-free">Free to subscribe</span></div><Suspense fallback={<p className="newsletter-loading">Loading the subscription form…</p>}><NewsletterForm/></Suspense></div>
 </div></div></section>;
}
