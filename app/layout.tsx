import {DEMO_MODE} from '@/lib/demo';
import type {Metadata} from 'next';
import './globals.css';
import './newsletter.css';
import {NewsletterCard} from '@/components/newsletter-card';
import {NewsletterPlacement} from '@/components/newsletter-placement';
import {Header,Footer} from '@/components/shell';
import {SITE} from '@/lib/catalog';
import {pageMetadata} from '@/lib/seo';
export const metadata:Metadata={...pageMetadata({title:'TruTool | Discover & Compare AI Tools and Software',description:'Discover AI tools and software for work. Compare features, pricing and alternatives, explore useful guides, and find the right tools with TruTool.',alternates:{canonical:SITE}}),metadataBase:new URL(SITE),verification:{google:'bYUhmcGcFiaJJlr4zaDvrQiwj1ns_Pw2h-pCVBxLLNo'},title:{default:'TruTool | Discover & Compare AI Tools and Software',template:'%s | TruTool'},applicationName:'TruTool',icons:{icon:[{url:'/favicon.svg?v=approved-20261007',type:'image/svg+xml'},{url:'/favicon.ico?v=approved-20261007',type:'image/x-icon',sizes:'16x16 32x32 48x48'}],apple:{url:'/apple-icon.png?v=approved-20261007',sizes:'180x180',type:'image/png'}},manifest:'/manifest.webmanifest',robots:{index:!DEMO_MODE,follow:true,googleBot:{index:!DEMO_MODE,follow:true,'max-image-preview':'large','max-snippet':-1}}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip" href="#main">Skip to content</a><Header/>{children}<NewsletterPlacement><NewsletterCard/></NewsletterPlacement><Footer/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify([{'@context':'https://schema.org','@type':'Organization',name:'TruTool',url:SITE,logo:SITE+'/identity/trutool-logo-light.svg'},{'@context':'https://schema.org','@type':'WebSite',name:'TruTool',url:SITE,description:'Clearer choices. Better tools.'}]).replace(/</g,'\\u003c')}}/></body></html>}
