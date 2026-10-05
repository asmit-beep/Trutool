import type {Metadata} from 'next';
import './globals.css';
import {Header,Footer} from '@/components/shell';
import {SITE} from '@/lib/catalog';
export const metadata:Metadata={metadataBase:new URL(SITE),title:{default:'TruTool | Discover, Compare & Choose Software',template:'%s | TruTool'},description:'Explore software and learning platforms for local marketing, RFP responses, team communication, and professional training. Compare fit, features, and trade-offs.',icons:{icon:'/favicon.svg'},openGraph:{siteName:'TruTool',type:'website',title:'TruTool | Clearer choices. Better tools.',description:'Find software and learning platforms that fit the way you work.'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip" href="#main">Skip to content</a><Header/>{children}<Footer/></body></html>}
