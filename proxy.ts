import { allowlistedCompareRedirect } from '@/lib/compare-pairs';
import { NextRequest, NextResponse } from 'next/server';

// Clean ChatGPT referral labels from tracking parameters only.
// Never inspect page content or change legitimate guide/tool URLs.
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  // Respect a publisher-requested removal. A 410 removes the old profile and
  // related pages even if a stale CMS overlay or past social link still exists.
  // No new brand profile, offsite link, schema, or redirect is served here.
  const removed = url.pathname.replace(/\/$/,'').toLowerCase();
  if (
    ['/tools/hedra','/alternatives/hedra','/tools/hedra.md','/alternatives/hedra.md'].includes(removed)
    || /^\/compare\/(?:hedra-vs-[a-z0-9-]+|[a-z0-9-]+-vs-hedra)(?:\.md)?$/.test(removed)
  ) {
    return new NextResponse(null, {
      status: 410,
      headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60', 'X-Robots-Tag': 'noindex, nofollow' },
    });
  }
  if (url.pathname === '/compare' || url.pathname === '/compare/') {
    const destination = allowlistedCompareRedirect(url.searchParams.get('tools'));
    if (destination) {
      const target = new URL(destination, request.url);
      target.search = '';
      return NextResponse.redirect(target, 301);
    }
  }
  let changed = false;

  for (const [key, value] of [...url.searchParams.entries()]) {
    const isTrackingParameter = /^(utm_[a-z0-9_-]+|ref|referrer|ref_src|source|via|from|origin|campaign|campaign_source)$/i.test(key)
      || /^chatgpt(?:[_-].*)?$/i.test(key);

    if (isTrackingParameter && (/chatgpt/i.test(key) || /chatgpt/i.test(value))) {
      url.searchParams.delete(key, value);
      changed = true;
    }
  }

  // Canonical category pages already carry the slug in their path.
  // Normalize old directory links rather than exposing /categories/x?category=x.
  const categoryPath=url.pathname.match(/^\/categories\/([a-z0-9-]+)\/?$/);
  const selected=url.searchParams.get('category');
  if(categoryPath&&selected===categoryPath[1]){url.searchParams.delete('category');changed=true}
  if((url.pathname==='/tools'||url.pathname==='/everything-ai')&&selected&&/^[a-z0-9-]{2,80}$/.test(selected)){
    url.pathname='/categories/'+selected;
    url.searchParams.delete('category');
    changed=true;
  }
  if(url.pathname==='/tools'||url.pathname==='/everything-ai'||categoryPath){
    for(const [key,value] of [['page','1'],['sort','relevance'],['discovery','all'],['q','']]){
      if(url.searchParams.get(key)===value){url.searchParams.delete(key);changed=true}
    }
  }
  return changed ? NextResponse.redirect(url, 308) : NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/|_next/|admin/|favicon.ico|robots.txt|sitemap.xml).*)'],
};
