import {Sparkles} from 'lucide-react';
import {MotionVisibility} from './motion-visibility';

export function HeroSignal(){
 return <span className="hero-signal" data-motion="idle">
  <MotionVisibility selector=".hero-signal"/>
  <span className="signal-symbol" aria-hidden="true">
   <span className="signal-noise"><i/><i/><i/><i/><i/></span>
   <span className="signal-star"><Sparkles size={16}/></span>
   <span className="signal-wave"><i/><i/><i/><i/></span>
  </span>
  <span className="signal-copy"><span className="signal-quiet">Less noise.</span><strong>More signal.</strong></span>
  <span className="signal-border" aria-hidden="true"/>
 </span>;
}
