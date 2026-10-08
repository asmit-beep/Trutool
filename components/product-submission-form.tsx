'use client';

import {useState} from 'react';
import Link from '@/components/site-link';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';

export function ProductSubmissionForm({categories}:{categories:{slug:string;short:string}[]}){
 const [status,setStatus]=useState<'idle'|'sending'|'success'|'error'>('idle');
 const [error,setError]=useState('');
 const [reference,setReference]=useState('');

 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  const form=event.currentTarget;
  const data=new FormData(form);
  setStatus('sending');setError('');
  try{
   const response=await fetch('/api/contact',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name:data.get('name'),email:data.get('email'),topic:'suggestion',message:data.get('message'),website:data.get('website'),product:{name:data.get('productName'),url:data.get('productUrl'),category:data.get('productCategory')}})
   });
   const result=await response.json() as {error?:string;id?:string};
   if(!response.ok||!result.id)throw new Error(result.error||'We could not save your product. Please try again.');
   setReference(result.id.slice(0,8));setStatus('success');form.reset();
  }catch(e){setError(e instanceof Error?e.message:'We could not save your product. Please try again.');setStatus('error');}
 }

 if(status==='success')return <div className="contact-confirmation" role="status"><span className="eyebrow">SUBMISSION RECEIVED</span><h2>Your product is ready for review.</h2><p>Your submission has been saved to the TruTool editorial inbox. Reference: {reference}. We’ll review its fit for the directory before publishing a listing.</p><Button className="button dark" onClick={()=>setStatus('idle')}>Submit another product</Button><Link className="text-link" href="/tools">Explore the directory</Link></div>;

 return <form className="contact-form" onSubmit={submit} aria-label="Submit your product">
  <div className="form-row">
   <div><label htmlFor="product-name">Product name</label><Input id="product-name" name="productName" required minLength={2} maxLength={100} placeholder="Your product’s name"/></div>
   <div><label htmlFor="product-url">Official website</label><Input id="product-url" name="productUrl" type="url" required maxLength={2048} placeholder="https://yourproduct.com"/></div>
  </div>
  <div><label htmlFor="product-category">Category</label><select className="product-category-select" id="product-category" name="productCategory" required defaultValue=""><option value="" disabled>Choose the closest fit</option>{categories.map(c=><option key={c.slug} value={c.slug}>{c.short}</option>)}<option value="other">Another category</option></select></div>
  <div><label htmlFor="product-description">What does your product help people do?</label><Textarea id="product-description" name="message" required minLength={20} maxLength={4000} rows={5} placeholder="Describe the product, who it’s for, and the work it helps them do."/></div>
  <div className="form-row">
   <div><label htmlFor="product-contact-name">Your name</label><Input id="product-contact-name" name="name" autoComplete="name" required minLength={2} maxLength={100}/></div>
   <div><label htmlFor="product-email">Email address</label><Input id="product-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@company.com"/></div>
  </div>
  <div className="form-honeypot" aria-hidden="true"><label htmlFor="product-verification">Leave this empty</label><input id="product-verification" name="website" tabIndex={-1} autoComplete="off"/></div>
  <p className="form-note">We use your details to review this submission and contact you about it. See our <Link href="/privacy">privacy policy</Link>. Submitting a product does not guarantee a listing.</p>
  {status==='error'&&<p className="form-error" role="alert">{error}</p>}
  <Button className="button dark" type="submit" disabled={status==='sending'}>{status==='sending'?'Submitting your product…':'Submit for review'}</Button>
 </form>;
}
