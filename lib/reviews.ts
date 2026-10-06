import approved from './community-reviews.json';
import {DEMO_MODE} from './demo';
import {demoReviews,demoGuideReviews,previewRating,exampleReviewFor} from './demo-reviews';
export type ReviewKind='tool'|'guide';
export type PublishedReview={id:string;kind:ReviewKind;slug:string;name:string;rating:number;message:string;publishedAt:string;demo?:boolean};
export const publishedReviews=approved as PublishedReview[];
export const displayReviews=DEMO_MODE?[...publishedReviews,...demoReviews,...demoGuideReviews]:publishedReviews;
export function reviewsFor(kind:ReviewKind,slug:string){const matching=displayReviews.filter(r=>r.kind===kind&&r.slug===slug);if(matching.length||!DEMO_MODE||kind!=='tool')return matching;const preview=exampleReviewFor(slug);return preview?[preview]:[]}
export function ratingFor(kind:ReviewKind,slug:string){
 const real=publishedReviews.filter(r=>r.kind===kind&&r.slug===slug),reviews=real.length?real:reviewsFor(kind,slug),count=reviews.length;
 return {count,average:count?Math.round(reviews.reduce((sum,r)=>sum+r.rating,0)/count*10)/10:DEMO_MODE?previewRating(slug):null};
}
