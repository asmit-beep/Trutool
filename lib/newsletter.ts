export const newsletterTopics=[{id:'ai',label:'Everything AI'},{id:'tools',label:'New & useful tools'},{id:'guides',label:'Smarter buying guides'}] as const;
export type NewsletterTopic=typeof newsletterTopics[number]['id'];
export function validateSubscription(value:unknown){
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const x=value as Record<string,unknown>,email=typeof x.email==='string'?x.email.trim().toLowerCase():'';
 if(x.website||x.consent!==true||email.length>254||!/^[^\s@<>]+@[^\s@]+\.[^\s@]+$/.test(email)||/[<>\r\n]/.test(email))return null;
 if(!Array.isArray(x.topics)||!x.topics.length||x.topics.length>newsletterTopics.length||x.topics.some(t=>!newsletterTopics.some(option=>option.id===t)))return null;
 const source=typeof x.source==='string'&&/^\/[a-z0-9\-/]*$/.test(x.source)&&x.source.length<=180?x.source:'/newsletter';
 return {email,topics:[...new Set(x.topics)] as NewsletterTopic[],source};
}
