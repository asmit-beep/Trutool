import {PageStructuredData} from '@/components/page-structured-data';
import {pageMetadata} from '@/lib/seo';
import Link from '@/components/site-link';
import {categories,SITE} from '@/lib/catalog';
import {ProductSubmissionForm} from '@/components/product-submission-form';

export const metadata=pageMetadata({title:'List Your Product on TruTool',description:'Submit your software or learning platform for editorial review and consideration in the TruTool directory.',alternates:{canonical:SITE+'/list-your-product'}});

export default function Page(){return <main id="main" className="shell"><PageStructuredData path="/list-your-product"/><div className="page-intro"><span className="eyebrow">JOIN THE DIRECTORY</span><h1>Help the right people find your product.</h1><p>Share your software or learning platform with TruTool. Tell us who it’s for and what it helps them do.</p></div><div className="contact-layout page-body"><ProductSubmissionForm categories={categories.map(({slug,short})=>({slug,short}))}/><aside className="contact-aside"><section><h2>What to include</h2><p>An official website, a clear product description, and a contact we can reach with questions. Describe real workflows and capabilities rather than broad claims.</p></section><section><h2>What happens next</h2><p>We review each submission for category fit and information we can verify. Listings follow our <Link href="/methodology">methodology</Link> and <Link href="/editorial-policy">editorial policy</Link>.</p></section><section><h2>Already in the directory?</h2><p>Send a correction or update through our contact form, with the profile URL and the official source for the change.</p><Link className="text-link" href="/contact#corrections">Report an update</Link></section></aside></div></main>}
