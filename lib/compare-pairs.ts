/**
 * Indexable /compare allowlist. Single source of truth for sitemap inclusion,
 * self-canonical path order, query 301s, and Alternatives path links.
 * Order is the 3 Nov 2026 CSV order. The first 7 are the original curated pairs,
 * in the display order the comparison hub already uses.
 */
export const pairs: [string, string][] = [
 [
  'chatgpt',
  'claude'
 ],
 [
  'notion',
  'obsidian'
 ],
 [
  'figma',
  'canva'
 ],
 [
  'synup',
  'yext'
 ],
 [
  'inventive-ai',
  'loopio'
 ],
 [
  'slack',
  'microsoft-teams'
 ],
 [
  'staragile',
  'simplilearn'
 ],
 [
  'docling',
  'paddleocr'
 ],
 [
  'dbeaver',
  'visual-studio-code'
 ],
 [
  'gitea',
  'linear'
 ],
 [
  'gitea',
  'plane'
 ],
 [
  'pangolin',
  'zoraxy'
 ],
 [
  'continue',
  'kilo-code'
 ],
 [
  'nginx-proxy-manager',
  'pangolin'
 ],
 [
  'clipspeedai',
  'happysrt'
 ],
 [
  'gitea',
  'openproject'
 ],
 [
  'docling',
  'xberg'
 ],
 [
  'comfyui',
  'pytorch'
 ],
 [
  'open-webui',
  'typingmind'
 ],
 [
  'mlflow',
  'ray-serve'
 ],
 [
  'modal',
  'ray-serve'
 ],
 [
  'digimindmap',
  'para'
 ],
 [
  'hermes-agent',
  'openfang'
 ],
 [
  'litellm',
  'pytorch'
 ],
 [
  'chatbox-ai',
  'typingmind'
 ],
 [
  'jan',
  'msty'
 ],
 [
  'claude',
  'rundiffusion'
 ],
 [
  'tabby',
  'twinny'
 ],
 [
  'jan',
  'chatbox-ai'
 ],
 [
  'rocket-new',
  'unpkg-ai'
 ],
 [
  'eraser',
  'linearity-curve'
 ],
 [
  'flow-ai-video',
  'happysrt'
 ],
 [
  'based-ai',
  'hailuo-ai'
 ],
 [
  'jan',
  'tencent-yuanbao'
 ],
 [
  'calagopus',
  'scribble-rs'
 ],
 [
  'ai-for-developers',
  'appdeploy'
 ],
 [
  'generative-ai-for-beginners',
  'harbor'
 ],
 [
  'bruno',
  'github'
 ],
 [
  'ai-transcription-by-riverside',
  'based-ai'
 ],
 [
  'hugging-face-transformers',
  'pytorch'
 ],
 [
  'based-ai',
  'wisecut'
 ],
 [
  'modal',
  'vllm'
 ],
 [
  'jan',
  'librechat'
 ],
 [
  'smallpdf',
  'adobe-acrobat'
 ],
 [
  'pytorch',
  'vllm'
 ],
 [
  'generative-ai-for-beginners',
  'se-visible-visible-seranking-com'
 ],
 [
  'microsoft-agent-framework',
  'semantic-kernel'
 ],
 [
  'huly',
  'linear'
 ],
 [
  'civitai',
  'seaart-ai'
 ],
 [
  'ai-transcription-by-riverside',
  'happysrt'
 ]
];

export const ALTERNATIVES_COMPARE_LINK_LIMIT = 5;

export function allowlistedComparePath(left: string, right: string): string | undefined {
  const hit = pairs.find(([a, b]) => (a === left && b === right) || (a === right && b === left));
  return hit ? '/compare/' + hit[0] + '-vs-' + hit[1] : undefined;
}

/** Sorted two-tool queries that match an allowlisted pair redirect to its canonical path. */
export function allowlistedCompareRedirect(toolsParam: string | null | undefined): string | undefined {
  if (!toolsParam) return;
  const slugs = [...new Set(toolsParam.split(',').map(s => s.trim()).filter(Boolean))];
  if (slugs.length !== 2) return;
  return allowlistedComparePath(slugs[0], slugs[1]);
}

export function isAllowlistedCompareSlug(slug: string): boolean {
  const parts = slug.split('-vs-');
  if (parts.length !== 2 || parts[0] === parts[1]) return false;
  return Boolean(allowlistedComparePath(parts[0], parts[1]));
}

export function allowlistedComparePartners(slug: string): string[] {
  const partners: string[] = [];
  for (const [a, b] of pairs) {
    if (a === slug) partners.push(b);
    else if (b === slug) partners.push(a);
  }
  return partners;
}

export function compareRobots(slug: string) {
  const index = isAllowlistedCompareSlug(slug);
  const rule = {index, follow: true as const};
  return {...rule, googleBot: {...rule, 'max-image-preview': 'large' as const, 'max-snippet': -1}};
}
