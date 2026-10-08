import {PageStructuredData} from '@/components/page-structured-data';
import {pageMetadata} from '@/lib/seo';
import {categories,tools,SITE} from '@/lib/catalog';
import {categoryCounts} from '@/lib/catalog';
import {CategoryExplorer} from '@/components/category-explorer';
export const metadata=pageMetadata({title:'All Software Categories — AI, Design, Marketing & More',description:'Explore tools by task across AI, productivity, design, marketing, developer tools, finance, and more.',alternates:{canonical:SITE+'/categories'}});
export default function Page(){return <main id="main" className="shell"><PageStructuredData path="/categories"/><div className="page-intro"><span className="eyebrow">ONE DIRECTORY. MORE POSSIBILITIES.</span><h1>Start with your world.</h1><p>{tools.length} tools across {categories.length} categories. Find a familiar workflow—or discover a better way to do the work.</p></div><div className="page-body"><CategoryExplorer categories={categories.map(c=>({...c,count:categoryCounts[c.slug]}))}/></div></main>}
