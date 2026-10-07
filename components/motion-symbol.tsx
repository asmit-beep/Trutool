import {Compass,Sparkles,Zap,Palette,Megaphone,Code2,MapPin,FileText,GraduationCap,MessageCircle,ScanLine,Layers,GitCompareArrows,Shuffle,BookOpen} from 'lucide-react';
const icons={compass:Compass,sparkles:Sparkles,bolt:Zap,design:Palette,marketing:Megaphone,code:Code2,location:MapPin,document:FileText,learn:GraduationCap,conversation:MessageCircle,scan:ScanLine,layers:Layers,compare:GitCompareArrows,shuffle:Shuffle,book:BookOpen};
export type MotionKind=keyof typeof icons|'fire';
export function MotionSymbol({kind,size=20}:{kind:MotionKind;size?:number}){
 const Icon=kind==='fire'?null:icons[kind];
 return <span className={'motion-symbol motion-'+kind} style={{width:size,height:size}} aria-hidden="true">{Icon?<span className="motion-glyph"><Icon size={size}/></span>:<><span className="motion-glyph flame-outer"><svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M13 1c2 5-2 6-1 10 1-2 3-3 4-5 1 3 5 6 5 10a9 9 0 0 1-18 0c0-4 3-7 6-10-1 5 1 5 2 7 1-5-1-7 2-12Z"/></svg></span><span className="flame-core"><svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c0 4-4 4-3 7a3 3 0 0 0 6 0c0-2-2-4-3-7Z"/></svg></span><span className="flame-ember"/></>}</span>;
}
export const categoryMotion:Record<string,MotionKind>={ai:'sparkles',productivity:'bolt',design:'design',marketing:'marketing','developer-tools':'code','local-listings':'location','rfp-software':'document',edtech:'learn'};
