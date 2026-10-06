import {DEMO_MODE} from '@/lib/demo';
import type {Metadata} from 'next';
import './globals.css';
import {Header,Footer} from '@/components/shell';
import {SITE} from '@/lib/catalog';
import {pageMetadata} from '@/lib/seo';
export const metadata:Metadata={...pageMetadata({title:'TruTool | Discover, Compare & Choose Software',description:'Discover tools for AI, productivity, design, marketing, development, and more. Compare workflows, explore practical buying guides, and choose with clearer evidence.',alternates:{canonical:SITE}}),metadataBase:new URL(SITE),title:{default:'TruTool | Discover, Compare & Choose Software',template:'%s | TruTool'},applicationName:'TruTool',icons:{icon:[{url:'/favicon.svg',type:'image/svg+xml'}],apple:'/apple-icon'},manifest:'/manifest.webmanifest',robots:{index:!DEMO_MODE,follow:true,googleBot:{index:!DEMO_MODE,follow:true,'max-image-preview':'large','max-snippet':-1}}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip" href="#main">Skip to content</a><Header/>{children}<Footer/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify([{'@context':'https://schema.org','@type':'Organization',name:'TruTool',url:SITE,logo:SITE+'/trutool-logo.png'},{'@context':'https://schema.org','@type':'WebSite',name:'TruTool',url:SITE,description:'Clearer choices. Better tools.'}]).replace(/</g,'\\u003c')}}/></body></html>}
