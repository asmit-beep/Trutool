import { CmsArticle } from '@/components/cms-article';
import { RfpAlternativesArticle } from '@/components/rfp-alternatives-article';
import { rfpAlternativePages } from '@/lib/rfp-alternatives';
import { PageStructuredData } from '@/components/page-structured-data';
import Link from '@/components/site-link';
import { categoryOf,SITE,tools } from '@/lib/catalog';
import { ALTERNATIVES_COMPARE_LINK_LIMIT,allowlistedComparePartners,allowlistedComparePath } from '@/lib/compare-pairs';
import { cmsMetadata,isHidden,publicContent,publicTools } from '@/lib/cms-public';
import { alternativesDescription, alternativeEvaluationQuestions, alternativeShortlist } from '@/lib/alternative-shortlist';
import {audienceIsGeneric, meaningfulFeatures, recordedCapabilityComparison, vendorSource} from '@/lib/recorded-research';
import { pageMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { alternativesNotes } from '@/lib/content-index';
import './alternatives.css';

const isRfpArticle=(slug:string):slug is 'loopio'|'responsive'=>slug==='loopio'||slug==='responsive';
export const revalidate=false;
export function generateStaticParams(){return tools.map(t=>({slug:t.slug}))}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const cmsPath='/alternatives/'+slug;
  if(isRfpArticle(slug)){
    const article=rfpAlternativePages[slug];
    return pageMetadata({title:article.title,description:article.description,keywords:article.queryVariants.concat(['RFP software','AI RFP response software','proposal management software','security questionnaire automation']),publisher:'TruTool',robots:{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1}},alternates:{canonical:SITE+cmsPath},authors:[{name:'Snehil',url:SITE+'/authors/snehil'}],openGraph:{title:article.title,description:article.description,type:'article',url:SITE+cmsPath,siteName:'TruTool',publishedTime:'2026-10-22T00:00:00Z',modifiedTime:'2026-10-22T00:00:00Z'}});
  }
  const cms=await publicContent(cmsPath);
  if(await isHidden(cmsPath))notFound();
  if(cms)return cmsMetadata(cms);
  const t=(await publicTools()).find(tool=>tool.slug===slug);
  if(!t)return {title:'Not found'};
  const category=categoryOf(t.category);
  return pageMetadata({
    title:t.name+' Alternatives — Compare '+(category?.name||'Similar Tools'),
    description:alternativesDescription(t,category?.name||t.category),
    alternates:{canonical:SITE+cmsPath},
  });
}

export default async function Page({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  if(isRfpArticle(slug))return <RfpAlternativesArticle slug={slug}/>;
  const cmsPath='/alternatives/'+slug;
  const cms=await publicContent(cmsPath);
  if(await isHidden(cmsPath))notFound();
  if(cms)return <CmsArticle content={cms}/>;

  const inventory=await publicTools();
  const t=inventory.find(tool=>tool.slug===slug);
  if(!t)notFound();
  const c=categoryOf(t.category);
  const categoryName=c?.name||t.category.replace(/-/g,' ');
  const shortlist=alternativeShortlist(t,inventory);
  const questions=alternativeEvaluationQuestions(t);
  const baseFeatures=meaningfulFeatures(t),targetSource=vendorSource(t);
  const research=shortlist.map(peer=>({peer,comparison:recordedCapabilityComparison(t,peer),source:vendorSource(peer)}));
  const note=alternativesNotes[t.slug];
  const included=new Set(shortlist.map(item=>item.slug));
  const bySlug=new Map(inventory.map(item=>[item.slug,item]));
  const curatedPairs=allowlistedComparePartners(t.slug)
    .slice(0,ALTERNATIVES_COMPARE_LINK_LIMIT)
    .filter(candidate=>!included.has(candidate))
    .flatMap(candidate=>{const match=bySlug.get(candidate);return match?[match]:[]});

  return <main id="main" className="shell alternatives-detail">
    <PageStructuredData path={cmsPath}/>
    <div className="breadcrumb alt-breadcrumb"><Link href="/alternatives">Alternatives</Link><span>/</span><Link href={'/categories/'+t.category}>{categoryName}</Link><span>/</span><span>{t.name}</span></div>

    <header className="alt-hero">
      <div className="alt-heading">
        <span className="eyebrow">RESEARCH A REPLACEMENT / {categoryName.toUpperCase()}</span>
        <h1>{t.name} alternatives</h1>
        <p>Looking beyond {t.name}? Its listed focus is {t.summary} Compare candidates against what your team actually needs, not a generic ranking.</p>
        <div className="alt-hero-links">
          <Link className="button lime" href={'/tools/'+t.slug}>Review {t.name} profile</Link>
          <Link className="text-link" href={'/categories/'+t.category}>Explore {categoryName.toLowerCase()}</Link>
        </div>
      </div>
      <aside className="alt-reference">
        <span className="alt-overline">THE STARTING POINT</span>
        <h2>{t.name}</h2>
        <dl>
          <div><dt>Described audience</dt><dd>{audienceIsGeneric(t)?'Not verified in the available source record.':t.fit}</dd></div>
          <div><dt>Listed capabilities</dt><dd>{baseFeatures.length?baseFeatures.slice(0,3).join(' · '):'No verified feature-level list is available in this record.'}</dd></div>
          <div><dt>Check before changing</dt><dd>{t.caution||'Verify price, migration, and cancellation terms.'}</dd></div>
        </dl>
      </aside>
    </header>

    <section className="alt-shortlist-section" aria-labelledby="alternatives-shortlist">
      <div className="alt-section-heading">
        <div>
          <span className="eyebrow">COMPARABLE CATEGORY OPTIONS</span>
          <h2 id="alternatives-shortlist">A focused shortlist for {t.name}</h2>
          <p>Selected by category, recorded capabilities, and audience overlap. This is an unranked research list, not a hands-on performance verdict.</p>
        </div>
        <span className="alt-count">{shortlist.length} {shortlist.length===1?'option':'options'}</span>
      </div>
      {shortlist.length>0?
        <ol className="alt-option-grid">{shortlist.map((x,i)=>{
          const comparePath=allowlistedComparePath(t.slug,x.slug)||'/compare?tools='+encodeURIComponent(t.slug+','+x.slug);
          return <li key={x.slug} className="alt-option">
            <div className="alt-option-top"><span>OPTION {String(i+1).padStart(2,'0')}</span><span>{x.format}</span></div>
            <h3>{x.name}</h3>
            <p className="alt-option-summary">{x.summary}</p>
            <div className="alt-option-specific">
              <strong>Best suited to explore if</strong>
              <p>{audienceIsGeneric(x)?'Vendor audience fit not established in the available catalogue data.':x.fit}</p>
            </div>
            <div className="alt-option-specific">
              <strong>Capabilities to inspect</strong>
              <p>{meaningfulFeatures(x).length?meaningfulFeatures(x).slice(0,3).join(' · '):'A product-specific feature list has not been established. Check vendor documentation.'}</p>
            </div>
            <div className="alt-option-links">
              <Link href={'/tools/'+x.slug}>Read profile</Link>
              <Link href={comparePath}>Compare with {t.name}</Link>
            </div>
          </li>;
        })}</ol>:
        <div className="alt-empty"><h3>No directly comparable category profiles yet</h3><p>We do not invent alternatives when the directory lacks sufficiently relevant products. Explore the <Link href={'/categories/'+t.category}>{categoryName} category</Link> or review {t.name} against your workflow first.</p></div>}
    </section>

    {research.length>0&&<section className="alt-research-section" aria-labelledby="alternatives-research">
      <span className="eyebrow">WHAT THE RECORDS ACTUALLY SHOW</span>
      <h2 id="alternatives-research">How candidates compare with {t.name}'s recorded capabilities</h2>
      <p>This table compares the specific capability labels documented in TruTool profiles. An empty overlap is a gap in our recorded evidence, <strong>not proof</strong> that a vendor lacks the capability. Validate every difference with the source.</p>
      <div className="alt-research-scroll" role="region" aria-label={'Recorded capability comparison for '+t.name} tabIndex={0}>
       <table className="alt-research-table">
        <thead><tr><th scope="col">Candidate</th><th scope="col">Similar recorded capabilities</th><th scope="col">Other listed capabilities to test</th><th scope="col">Verification source</th></tr></thead>
        <tbody>{research.map(({peer,comparison,source})=><tr key={peer.slug}>
         <th scope="row"><Link href={'/tools/'+peer.slug}>{peer.name}</Link></th>
         <td>{comparison.overlapping.length?comparison.overlapping.join(' · '):'No direct feature-label match recorded'}</td>
         <td>{comparison.differentlyListed.length?comparison.differentlyListed.join(' · '):'No additional feature labels recorded'}</td>
         <td>{source?<a href={source.href} target="_blank" rel="noopener noreferrer">Vendor documentation</a>:'Source not recorded'}</td>
        </tr>)}</tbody>
       </table>
      </div>
      {targetSource&&<p className="alt-research-baseline">The starting point is the <a href={targetSource.href} target="_blank" rel="noopener noreferrer">{t.name} vendor source</a>. Feature-label overlap is informational only, not an independent performance score.</p>}
    </section>}

    <section className="alt-decision-section" aria-labelledby="alternatives-evaluate">
      <div>
        <span className="eyebrow">A BETTER WAY TO SWITCH</span>
        <h2 id="alternatives-evaluate">Questions to test before replacing {t.name}</h2>
        <p>Use the actual {t.name} workflow as your test case. Record outputs and trade-offs for each shortlisted product.</p>
      </div>
      <ol>{questions.map((question,i)=><li key={question}><span>{String(i+1).padStart(2,'0')}</span><p>{question}</p></li>)}</ol>
      <p className="alt-decision-caveat"><strong>Additional check:</strong> {t.caution||'Confirm current pricing, onboarding work, permissions and cancellation terms directly with the vendor.'}</p>
    </section>

    <section className="answer-block">
      <h2>What matters for {categoryName.toLowerCase()}?</h2>
      <p>{c?.answer||'Compare the products against a real task, and verify permissions, pricing, migration effort and support directly with each vendor.'}</p>
      <p className="alt-editor-note">Catalogue descriptions and vendor-linked profiles are research starting points, not independently tested product performance or verified current prices.</p>
    </section>

    {curatedPairs.length>0&&<section className="alt-curated-section">
      <h2>More documented comparisons involving {t.name}</h2>
      <p>These are editorially selected comparisons; the products may address different workflows.</p>
      <div>{curatedPairs.map(x=><Link key={x.slug} className="text-link" href={allowlistedComparePath(t.slug,x.slug)!}>{t.name} vs {x.name}</Link>)}</div>
    </section>}
    {note&&<p className="alt-note">{note.before}<Link className="text-link" href={note.href}>{note.linkText}</Link>{note.after}</p>}
    <div className="alt-back-link"><Link className="text-link" href={'/tools/'+t.slug}>Return to the {t.name} profile</Link></div>
  </main>;
}
