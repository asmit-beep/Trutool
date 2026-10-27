import '@/app/styles/article.css';
import { ResponsiveCover } from './responsive-cover';
import { authors, authorFor } from '@/lib/authors';
import { SITE, categories } from '@/lib/catalog';
import { cmsAuthorName, cmsSchema, publicTools } from '@/lib/cms-public';
import { cmsHeadings } from '@/lib/cms-markdown-structure';
import { getPublished } from '@/lib/cms-store';
import { cmsJsonLdMarkup } from '@/lib/cms-jsonld';
import { contentPath, guideAuthorHeading, type CmsContent } from '@/lib/cms-types';
import { coverFor, coverAlt } from '@/lib/covers';
import { serializeSchema } from '@/lib/structured-data';
import Link from 'next/link';
import { ArticleToc } from './article-toc';
import { AuthorProfile } from './author-profile';
import { CmsMarkdown } from './cms-markdown';

export async function CmsArticle({ content: c, preview = false }: { content: CmsContent; preview?: boolean }) {
  const author = authorFor({ authorSlug: c.authorSlug, category: c.category });
  const category = categories.find(x => x.slug === c.category);
  const related = (await publicTools()).filter(tool => c.toolSlugs.includes(tool.slug));
  const isGuide = c.kind === 'guide';
  const edited = c.updatedAt || c.publishedAt;
  const editedLabel = edited && !Number.isNaN(Date.parse(edited))
    ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(edited))
    : '';
  const readMinutes = Math.max(1, Math.ceil(c.body.trim().split(/\s+/).length / 220));
  const headings = cmsHeadings(c.body);
  const tocHeadings = headings.some(h => h.level === 2) ? headings.filter(h => h.level === 2) : headings;
  const authorHeading = guideAuthorHeading(c);
  const extraJsonLd = cmsJsonLdMarkup(c.jsonLd);
  const toc = [...tocHeadings.map(h => ({ id: h.id, label: h.label })), { id: 'cms-author-and-sources', label: authorHeading }];

  const articleBody = <>
    {c.kind === 'tool' && c.tool && <div className="cms-tool-facts">
      <h2>Who is it for?</h2><p>{c.tool.fit}</p>
      <h2>Key features</h2><ul>{c.tool.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
      <h2>Before you choose</h2><p>{c.tool.caution}</p>
      <h2>Pricing</h2><p>{c.tool.pricing}</p>
      <a className="button dark" href={c.tool.pricingUrl || c.tool.url} target="_blank" rel="noopener noreferrer">Check vendor pricing</a>
    </div>}
    <CmsMarkdown body={c.body} showImages={!isGuide}/>
    {related.length > 0 && <section>
      <h2>Tools mentioned</h2>
      <div className="cms-related-tools">{related.map(tool => <Link key={tool.slug} href={'/tools/' + tool.slug}><strong>{tool.name}</strong><p>{tool.summary}</p></Link>)}</div>
    </section>}
    {isGuide && <section id="cms-author-and-sources" className="cms-guide-author-section">
      <h2>{authorHeading}</h2>
      <AuthorProfile author={author}/>
      {c.sourceUrl?.trim() && <p>Original reference: <a href={c.sourceUrl.trim()} target="_blank" rel="noopener noreferrer">{c.sourceLabel?.trim() || c.sourceUrl.trim()}</a></p>}
      <p className="editor-note"><Link href="/editorial-policy">Read our editorial policy.</Link> This guide presents editorial evaluation criteria, not independently verified product-performance claims.</p>
      <Link className="text-link" href="/contact?topic=correction">Suggest a correction</Link>
    </section>}
    {!isGuide && c.sourceUrl && <section className="cms-sources"><h2>Source</h2>
      <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">{c.sourceLabel || 'Original source'}</a>
    </section>}
    {c.kind === 'author' && <section><h2>Published work</h2><div className="cms-related-tools">
      {(await getPublished()).filter(item => item.authorSlug === c.slug && item.kind !== 'author').map(item => <Link key={item.id} href={contentPath(item)}>{item.title}</Link>)}
    </div></section>}
  </>;

  return <main id="main" className={'shell cms-article' + (isGuide ? ' cms-guide article-page' : '')}>
    <div className="breadcrumb">
      <Link href="/">Home</Link><span>/</span>
      <Link href={c.kind === 'news' ? '/everything-ai' : contentPath(c).split('/').slice(0, 2).join('/')}>
        {c.kind === 'news' ? 'Everything AI' : isGuide ? 'Buying guides' : c.kind === 'answer' ? 'Community' : c.kind}
      </Link>
      {isGuide && category && <><span>/</span><Link href={'/categories/' + category.slug}>{category.short}</Link><span>/</span><span aria-current="page">{c.title}</span></>}
    </div>
    {preview && <div className="cms-preview-notice">Private preview · This draft is not public.</div>}
    {isGuide ? <>
      <header className="article-header tt-guide-header cms-guide-header">
        <div className="tt-article-hero">
          <div className="tt-article-hero-copy">
            <span className="eyebrow">THE TRUTOOL FIELD GUIDE</span>
            <h1>{c.title}</h1>
            <div className="article-meta">
              <AuthorProfile author={author} compact/>
              <div>{edited && <time dateTime={edited}>Updated {editedLabel}</time>}<span>Editorial buying guide · {readMinutes} minute read</span></div>
            </div>
            <div className="tldr">
              <span>TL;DR</span>
              <p>{c.description}</p>
              <a href={'#' + (tocHeadings[0]?.id || 'cms-author-and-sources')}>Jump to the guide ↓</a>
            </div>
          </div>
          <figure className="tt-article-hero-media">
            <ResponsiveCover sizes="(max-width: 760px) calc(100vw - 40px), 52vw" loading="eager" fetchPriority="high" src={c.image || coverFor(c.category)} alt={c.image ? c.imageAlt?.trim() || c.title + ' cover image' : coverAlt(c.category)}/>
          </figure>
        </div>
      </header>
      <div className="article-layout cms-guide-layout">
        <aside><ArticleToc items={toc}/></aside>
        <article className="article-content cms-guide-content">{articleBody}</article>
      </div>
    </> : <>
      <header className={'cms-article-heading' + (c.image ? ' tt-cms-hero' : '')}>
        <div className="tt-cms-hero-copy">
          <span className="eyebrow">{category?.name || 'TRUTOOL EDITORIAL'}</span>
          <h1>{c.title}</h1>
          <p>{c.description}</p>
          <div className="cms-article-byline">
            <Link href={'/authors/' + c.authorSlug}>By {cmsAuthorName(c)}</Link>
            {edited && <span>Updated {editedLabel}</span>}
          </div>
        </div>
        {c.image && <figure className="cms-cover tt-article-hero-media"><ResponsiveCover sizes="(max-width: 760px) calc(100vw - 40px), 52vw" loading="eager" fetchPriority="high" src={c.image} alt={c.imageAlt?.trim() || c.title + ' cover image'}/></figure>}
      </header>
      <div className="cms-article-columns">
        <article>{articleBody}</article>
        <aside>
          <span className="eyebrow">{c.kind === 'tool' ? 'OFFICIAL WEBSITE' : 'THE EDITORIAL TEAM'}</span>
          <h3>{c.kind === 'tool' ? c.title : authors.find(a => a.slug === c.authorSlug)?.name || cmsAuthorName(c)}</h3>
          <p>{c.kind === 'tool' ? c.tool?.fit : author.bio}</p>
          {c.kind === 'tool' && c.tool
            ? <a className="button dark" href={c.tool.url} target="_blank" rel="noopener noreferrer">Visit official site</a>
            : <Link className="text-link" href={'/authors/' + c.authorSlug}>View author profile</Link>}
          <hr/><h3>Make a clearer choice.</h3>
          <Link href="/diagnostic">Open the Decision Studio</Link>
          <Link href="/newsletter">Subscribe to TruTool</Link>
          <Link href="/editorial-policy">Our editorial policy</Link>
        </aside>
      </div>
    </>}
    {extraJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: extraJsonLd }}/>}
    {!preview && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeSchema(cmsSchema(c)) }}/>}
    <link rel="alternate" type="text/markdown" href={SITE + contentPath(c) + '.md'}/>
  </main>;
}
