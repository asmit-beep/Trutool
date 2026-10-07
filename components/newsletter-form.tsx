'use client';
import {useId,useState,type FormEvent} from 'react';
import {usePathname,useSearchParams} from 'next/navigation';
import Link from './site-link';
import {MotionSymbol} from './motion-symbol';
import {newsletterTopics,type NewsletterTopic} from '@/lib/newsletter';

export function NewsletterForm(){
 const pathname=usePathname(),params=useSearchParams(),unsubscribe=pathname==='/newsletter'?params.get('unsubscribe'):null;
 return <NewsletterFormContent key={unsubscribe||pathname} pathname={pathname} unsubscribe={unsubscribe}/>;
}

function NewsletterFormContent({pathname,unsubscribe}:{pathname:string;unsubscribe:string|null}){
 const id=useId();
 const [topics,setTopics]=useState<NewsletterTopic[]>(newsletterTopics.map(t=>t.id)),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState<{already?:boolean;manageUrl?:string;unsubscribed?:boolean}|null>(null);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy||result)return;setBusy(true);setError('');
  const fields=new FormData(event.currentTarget);
  try{const response=await fetch('/api/newsletter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(unsubscribe?{action:'unsubscribe',token:unsubscribe}:{email:fields.get('email'),consent:fields.get('consent')==='on',website:fields.get('website'),topics,source:pathname})});const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.error||'Please try again.');setResult(data);}catch(err){setError(err instanceof Error?err.message:'We could not save your request. Please try again.');}finally{setBusy(false);}
 }
 if(result)return <div className="newsletter-success" role="status"><span className="newsletter-success-icon"><MotionSymbol kind="sparkles" size={28}/></span><h3>{result.unsubscribed?'You’re unsubscribed.':result.already?'You’re already on the list.':'You’re on the list.'}</h3><p>{result.unsubscribed?'Your email has been removed from future newsletter editions.':result.already?'Your existing subscription is saved. Keep exploring while we prepare the next edition.':'Your preferences are saved. Watch your inbox for new tools, AI developments, and useful guides.'}</p><div><Link className="button lime" href="/tools">Explore tools <MotionSymbol kind="arrow" size={17}/></Link>{result.manageUrl&&<Link className="newsletter-manage" href={result.manageUrl}>Unsubscribe</Link>}</div></div>;
 if(unsubscribe)return <form className="newsletter-form" onSubmit={submit}><h3>Your inbox. Your choice.</h3><p>Confirm below to stop receiving the TruTool newsletter.</p><button className="button lime newsletter-submit" disabled={busy}>{busy?'Updating…':'Unsubscribe'}<MotionSymbol kind="mail" size={18}/></button><p className="newsletter-form-error" role="alert">{error}</p></form>;
 return <form className="newsletter-form" onSubmit={submit}>
  <label className="newsletter-email-label" htmlFor={id+'-email'}>Your email address</label>
  <div className="newsletter-email-row"><span aria-hidden="true"><MotionSymbol kind="mail" size={20}/></span><input id={id+'-email'} name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required disabled={busy} aria-describedby={id+'-error'}/><button className="newsletter-submit button lime" disabled={busy} type="submit"><span>{busy?'Saving…':'Subscribe'}</span><MotionSymbol kind="arrow" size={19}/></button></div>
  <fieldset className="newsletter-topics" disabled={busy}><legend>Make it your kind of dispatch</legend><div>{newsletterTopics.map(topic=><label key={topic.id} className={topics.includes(topic.id)?'selected':''}><input type="checkbox" checked={topics.includes(topic.id)} onChange={e=>setTopics(current=>e.target.checked?[...current,topic.id]:current.filter(t=>t!==topic.id))}/><span>{topic.label}</span></label>)}</div></fieldset>
  <label className="newsletter-consent"><input name="consent" type="checkbox" required disabled={busy}/><span>Send me the TruTool newsletter. I can unsubscribe at any time. <Link href="/privacy">Privacy policy</Link></span></label>
  <div className="newsletter-honeypot" aria-hidden="true"><label htmlFor={id+'-website'}>Leave this field empty</label><input id={id+'-website'} name="website" tabIndex={-1} autoComplete="off"/></div>
  <p id={id+'-error'} className="newsletter-form-error" role="alert">{error}</p>
 </form>;
}
