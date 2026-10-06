export type RatingData={count:number;average:number|null};
export function RatingSummary({rating,compact=false}:{rating:RatingData;compact?:boolean}){
 const text=rating.average===null?'Not yet rated':rating.average.toFixed(1)+' / 5';
 return <span className={'community-rating'+(compact?' compact':'')} aria-label={text+' · '+rating.count+' '+(rating.count===1?'published review':'published reviews')}><span className="rating-stars" aria-hidden="true"><span>☆☆☆☆☆</span>{rating.average!==null&&<span className="rating-stars-filled" style={{width:rating.average/5*100+'%'}}>★★★★★</span>}</span><span><strong>{text}</strong>{!compact&&<small>{rating.count} {rating.count===1?'published review':'published reviews'}</small>}</span></span>;
}
