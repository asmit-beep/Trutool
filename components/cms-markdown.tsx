/* eslint-disable @next/next/no-img-element -- Editorial images use dynamic /media and HTTPS URLs. */
import { safeHref } from '@/lib/cms-types';
import { cmsHeadings, cmsImageDimensions, cmsListMarker, cmsStandaloneImage } from '@/lib/cms-markdown-structure';
import React from 'react';

function CmsBodyImage({ alt, src, hint, block = false }: { alt: string; src: string; hint?: string; block?: boolean }) {
  const href = safeHref(src);
  if (!href) return null;
  const size = cmsImageDimensions(hint);
  const img = <img src={href} alt={alt} width={size.width} height={size.height} loading="lazy" decoding="async"/>;
  return block ? <figure className="cms-figure">{img}</figure> : img;
}

// Guide pages hide private /media images. A file shipped in public/images
// is a real figure and still renders.
function publicGuideImage(src: string) {
  const href = safeHref(src);
  return Boolean(href && href.startsWith('/images/'));
}

// Relative paths and trutool.co URLs are internal links and stay in the same tab.
function isInternalUrl(href: string) {
  if (href.startsWith('/')) return true;
  try {
    const host = new URL(href).hostname.toLowerCase();
    return host === 'trutool.co' || host === 'www.trutool.co';
  } catch { return false; }
}

// Markdown-safe inline formatting; links are parsed before emphasis so
// [**Name**](url) becomes an accessible link with bold text, not literal stars.
// Images are parsed before links so ![alt](url) is an image, not "!" plus a link.
function inline(value: string, showImages = true): React.ReactNode[] {
  const pattern = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)(?:\{([^}]*)\})?|\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)|\*\*([^*]+)\*\*|__([^_]+)__|\x60([^\x60]+)\x60|(?<!\*)\*([^*\n]+)\*(?!\*)/g;
  const result: React.ReactNode[] = [];
  let cursor = 0, n = 0;
  for (const match of value.matchAll(pattern)) {
    const index = match.index;
    if (index > cursor) result.push(value.slice(cursor, index));
    if (match[0].startsWith('![')) {
      if (!showImages && !publicGuideImage(match[2] ?? '')) { cursor = index + match[0].length; continue; }
      const image = <CmsBodyImage key={n++} alt={match[1] ?? ''} src={match[2] ?? ''} hint={[match[3], match[4]].filter(Boolean).join(' ')}/>;
      if (image) result.push(image);
    } else if (match[5] !== undefined) {
      const url = safeHref(match[6]);
      result.push(url ? <a key={n++} href={url} {...(url.startsWith('https:') && !isInternalUrl(url) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{inline(match[5], showImages)}</a> : match[0]);
    } else if (match[7] !== undefined || match[8] !== undefined) {
      result.push(<strong key={n++}>{inline(match[7] ?? match[8], showImages)}</strong>);
    } else if (match[9] !== undefined) {
      result.push(<code key={n++}>{match[9]}</code>);
    } else if (match[10] !== undefined) {
      result.push(<em key={n++}>{inline(match[10], showImages)}</em>);
    }
    cursor = index + match[0].length;
  }
  if (cursor < value.length) result.push(value.slice(cursor));
  return result;
}

const headingLine = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/;
const fence = /^\s{0,3}(?:\x60{3}|~{3})/;
const tableDivider = /^\s*\|?\s*:?-{3,}:?\s*\|/;
const tableCells = (value: string) => value.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
const startsBlock = (value: string) => Boolean(headingLine.test(value) || fence.test(value) ||
  cmsListMarker(value) || cmsStandaloneImage(value) || /^\s{0,3}>/.test(value) || /^\s*\|/.test(value) || /^\s{0,3}(?:-{3,}|\*{3,})\s*$/.test(value));

export function CmsMarkdown({ body, showImages = true }: { body: string; showImages?: boolean }) {
  const lines = body.replace(/\r\n?/g, '\n').split('\n');
  const headings = new Map(cmsHeadings(body).map(heading => [heading.line, heading.id]));
  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i], line = raw.trim();
    if (!line) continue;

    if (fence.test(raw)) {
      const code: string[] = [], opening = i;
      for (i++; i < lines.length && !fence.test(lines[i]); i++) code.push(lines[i]);
      nodes.push(<pre key={opening}><code>{code.join('\n')}</code></pre>);
      continue;
    }

    const heading = raw.match(headingLine);
    if (heading) {
      const depth = heading[1].length;
      const Heading = depth <= 2 ? 'h2' : depth === 3 ? 'h3' : 'h4';
      nodes.push(<Heading key={i} id={headings.get(i)}>{inline(heading[2], showImages)}</Heading>);
      continue;
    }

    const image = cmsStandaloneImage(raw);
    if (image) {
      if (showImages || publicGuideImage(image.src)) nodes.push(<CmsBodyImage key={i} alt={image.alt} src={image.src} hint={image.hint} block/>);
      continue;
    }

    if (/^\s*\|/.test(raw) && tableDivider.test(lines[i + 1] || '')) {
      const first = i, columns = tableCells(raw), rows: string[][] = [];
      i += 2;
      for (; i < lines.length && /^\s*\|/.test(lines[i]); i++) rows.push(tableCells(lines[i]));
      i--;
      nodes.push(<div className="cms-table-wrap" key={first}><table>
        <thead><tr>{columns.map((cell, j) => <th key={j}>{inline(cell, showImages)}</th>)}</tr></thead>
        <tbody>{rows.map((row, j) => <tr key={j}>{row.map((cell, k) => <td key={k}>{inline(cell, showImages)}</td>)}</tr>)}</tbody>
      </table></div>);
      continue;
    }

    const firstItem = cmsListMarker(raw);
    if (firstItem) {
      const opening = i, type = firstItem.type, items: string[] = [];
      const firstNumber = firstItem.start || 1;
      while (i < lines.length) {
        const item = cmsListMarker(lines[i]);
        if (item && item.type === type) {
          items.push(item.text);
          i++;
          continue;
        }
        // Google Docs often separates list items by blank lines.
        if (!lines[i].trim() && cmsListMarker(lines[i + 1] || '')?.type === type) {
          i++;
          continue;
        }
        break;
      }
      i--;
      const content = items.map((entry, j) => <li key={j}>{inline(entry, showImages)}</li>);
      nodes.push(type === 'ol'
        ? <ol key={opening} start={firstNumber}>{content}</ol>
        : <ul key={opening}>{content}</ul>);
      continue;
    }

    if (/^\s{0,3}>/.test(raw)) {
      const first = i, parts: string[] = [];
      for (; i < lines.length && /^\s{0,3}>/.test(lines[i]); i++) parts.push(lines[i].replace(/^\s{0,3}>\s?/, ''));
      i--;
      nodes.push(<blockquote key={first}>{inline(parts.join(' '), showImages)}</blockquote>);
      continue;
    }

    if (/^\s{0,3}(?:-{3,}|\*{3,})\s*$/.test(raw)) {
      nodes.push(<hr key={i}/>);
      continue;
    }

    const first = i, paragraph = [raw.trim()];
    while (i + 1 < lines.length && lines[i + 1].trim() && !startsBlock(lines[i + 1])) paragraph.push(lines[++i].trim());
    const paragraphContent = inline(paragraph.join(' '), showImages);
    // Image-only paragraphs should disappear completely, without empty whitespace.
    if (paragraphContent.some(node => typeof node !== 'string' || node.trim().length > 0))
      nodes.push(<p key={first}>{paragraphContent}</p>);
  }

  return <div className="cms-prose">{nodes}</div>;
}
