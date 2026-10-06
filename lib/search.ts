import {tools, categories, type Tool} from './catalog';

export const discoveryQueries = ['AI research assistants', 'Meeting notes', 'Remove image backgrounds', 'Project management', 'No-code app builders', 'SEO tools', 'Local listings management', 'RFP response software'];
const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

// Equivalent concepts only. Broad associations caused unrelated results.
const concepts = [
 'image images photo photos picture pictures photography',
 'video videos', 'audio sound sounds', 'note notes notetaking notetaker',
 'application applications', 'workflow workflows', 'website websites', 'voice voiceover voiceovers', 'meeting meetings', 'presentation presentations slide slides deck decks',
 'write writes writing written writer writers', 'code codes coding programming programmer programmers',
 'create creates creating creation generate generates generating generation generator generative maker makers build builds building builder builders develop development',
 'edit edits editing editor editors', 'remove removes removing remover removers removal erase eraser',
 'background backgrounds', 'assistant assistants assistance', 'chat chatbot chatbots conversational bot bots',
 'transcription transcript transcripts transcribe transcribing',
 'manage manages managing management manager managers',
 'automate automates automated automating automation',
 'integrate integrates integration integrations connect connects connected',
 'schedule schedules scheduling', 'calendar calendars', 'appointment appointments booking bookings',
 'task tasks todo todos', 'document documents docs documentation', 'knowledge wiki wikis',
 'email emails mail mailing newsletter newsletters', 'customer customers', 'support helpdesk', 'form forms',
 'invoice invoices invoicing', 'accounting bookkeeping', 'payment payments', 'password passwords', 'database databases',
 'translate translation translating localisation localization multilingual',
 'learn learning education training course courses',
 'recruit recruiting recruitment hire hiring applicant applicants candidate candidates',
 'analytic analytics metric metrics statistic statistics', 'report reports reporting', 'security cybersecurity',
 'design designs designing designer designers', 'graphic graphics', 'keyword keywords', 'backlink backlinks',
 'rank ranks ranking rankings', 'listing listings', 'location locations', 'proposal proposals',
 'questionnaire questionnaires', 'review reviews', 'survey surveys', 'contract contracts', 'signature signatures esign signing',
 'crm', 'rfp rfps', 'rfi rfis', 'ddq ddqs', 'hr', 'seo',
 'optimize optimization optimise optimisation', 'organize organised organizing organisation organization',
];
const equivalent = new Map<string, string>();
for (const group of concepts) {
 const words = group.split(' ');
 for (const word of words) equivalent.set(word, words[0]);
}
const canonical = (word: string) => equivalent.get(word) || (word.length > 4 && word.endsWith('ies') ? word.slice(0, -3) + 'y' : word.length > 3 && /[^sui]s$/.test(word) ? word.slice(0, -1) : word);

// Vocabulary is scoped to its own category, not shared across broad aliases.
// Generic buyer-fit descriptions are intentionally excluded from the index.
const categoryTasks: Record<string, string> = {
 ai: 'ai artificial intelligence assistant llm',
 'ai-agents':'ai agent autonomous automation task',
 'ai-coworkers':'ai agent coworker teammate assistant work',
 'ai-chatbots':'ai chatbot chat conversational assistant llm',
 'ai-browser-agents':'ai browser agent web automation',
 'ai-agent-frameworks':'ai agent framework sdk developer code orchestration',
 'ai-agent-builders':'ai agent builder workflow automation',
 'ai-model-platforms':'ai model inference api infrastructure llm',
 'ai-search-research':'ai research search evidence paper academic',
 'ai-data-analysis':'ai data analysis document extraction',
 'ai-sales-support':'ai sales customer support agent',
 'ai-voice-agents':'ai voice agent speech audio conversation',
 'ai-design':'ai design visual diagram logo interface',
 'ai-productivity':'ai productivity email dictation work',
 'ai-image': 'ai image design', 'ai-video': 'ai video', 'ai-audio': 'ai audio',
 'ai-writing': 'ai writing content', 'ai-coding': 'ai code',
 automation: 'automation integration workflow agent', productivity: 'productivity personal work',
 'project-management': 'project management task planning', design: 'design creative',
 'web-design': 'website web design builder', marketing: 'marketing campaign',
 seo: 'seo search visibility',
 'social-media': 'social media management publishing', 'email-marketing': 'email marketing campaign',
 crm: 'crm customer relationship management contact pipeline', sales: 'sales prospecting outreach lead',
 'customer-support': 'customer support helpdesk ticket service', analytics: 'analytics product tracking measurement',
 'developer-tools': 'developer code api git', cloud: 'cloud hosting infrastructure server',
 databases: 'database sql data', devops: 'devops deployment infrastructure',
 cybersecurity: 'security protection threat', passwords: 'identity',
 'no-code': 'nocode lowcode app application builder', forms: 'form data collection',
 'meeting-notes': 'meeting note', knowledge: 'knowledge document wiki',
 'cloud-storage': 'cloud storage file sharing', scheduling: 'schedule calendar appointment booking',
 'time-tracking': 'time tracking resource planning', finance: 'finance budget expense spend',
 accounting: 'accounting invoice tax', payments: 'payment billing checkout subscription',
 ecommerce: 'ecommerce shop store storefront', hr: 'hr human resources employee workforce payroll',
 recruiting: 'recruit applicant hiring', legal: 'legal compliance contract signature', research: 'research science academic',
 'local-listings': 'local listing location maps googlebusinessprofile reputation',
 'rfp-software': 'rfp proposal response rfi ddq questionnaire tender bid',
 edtech: 'edtech learning education training course certificate certification',
 'video-editing': 'video edit production', 'audio-production': 'audio music production recording',
 presentations: 'presentation create storytelling', surveys: 'survey feedback research',
 monitoring: 'monitoring observability uptime', email: 'email inbox',
 'business-intelligence': 'business intelligence analytics dashboard reporting',
 'content-management': 'content management cms publishing', spreadsheets: 'spreadsheet work database',
 '3d-gaming': '3d game gaming design animation', community: 'community membership forum',
 events: 'event webinar ticket', 'pdf-documents': 'pdf document',
 'customer-feedback': 'customer feedback roadmap', 'website-testing': 'website testing qa test browser',
 localisation: 'translate language', communication: 'communication chat messaging meeting',
};
function phrases(value: string) {
 return normalize(value)
  .replace(/\b(?:no code|no coding|without code|without coding|nocode)\b/g, 'nocode')
  .replace(/\blow code\b/g, 'lowcode')
  .replace(/\b(?:app|apps) (?:builder|builders|building|development)\b/g, 'application builder')
  .replace(/\b(?:build|create|develop|make|generate) (?:an? )?apps?\b/g, 'create application')
  .replace(/\bartificial intelligence\b/g, 'ai')
  .replace(/\bsearch engine (?:optimization|optimisation)\b/g, 'seo')
  .replace(/\b(?:google business profile|google my business|gbp|gmb)\b/g, 'googlebusinessprofile')
  .replace(/\bcustomer relationships?(?: management)?\b/g, 'crm')
  .replace(/\bhuman resources\b/g, 'hr')
  .replace(/\be commerce\b/g, 'ecommerce')
  .replace(/\b(?:cloud storage|file storage|file sharing)\b/g, 'filestorage')
  .replace(/\bto do\b/g, 'todo')
  .replace(/\b(?:text to speech|text to voice|speech generation|voice generation|voiceovers?|speech synthesis)\b/g, 'speechsynthesis')
  .replace(/\b(?:speech to text|speech recognition)\b/g, 'transcription')
  .replace(/\b(?:keyword research|search research)\b/g, 'searchresearch')
  .replace(/\b(?:logo maker|logo generator|create logos?|make logos?|design logos?)\b/g, 'graphic design')
  .replace(/\b(?:request for proposal|request for proposals)\b/g, 'rfp');
}
const tokens = (value: string) => phrases(value).split(' ').filter(Boolean).map(canonical);
const alternativeNoise = new Set('ai assistant create tool software work team people platform application product content integrate'.split(' '));
const stop = new Set('a an the for of to with in on by from and or as at best top software tool tools app apps platform platforms service services help need needs want me my our find compare alternative alternatives how can could would should i we you do does it is are that which what please looking get used use using give show recommend recommendation recommendations suitable solution solutions'.split(' '));
const categoryIndex = new Map(categories.map(c => [c.slug, new Set(tokens(categoryTasks[c.slug] || c.name + ' ' + c.short))]));
const index = tools.map(tool => {
 const name = normalize(tool.name), slug = normalize(tool.slug);
 const content = phrases([tool.summary, ...tool.features, tool.keywords || ''].join(' '));
 const contentTokens = new Set(tokens(content));
 if (/linked sources|source grounded|research/.test(content)) contentTokens.add('research');
 if (tool.category === 'ai' && /ai assistant|chat|conversational/.test(content)) contentTokens.add('chat');
 const nameTokens = new Set(tokens(name + ' ' + slug));
 const categoryTokens = categoryIndex.get(tool.category) || new Set<string>();
 return {tool, name, compact: name.replace(/ /g, ''), slugCompact: slug.replace(/ /g, ''), content, contentTokens, nameTokens, categoryTokens};
});
const knownTerms = new Set(index.flatMap(entry => [...entry.nameTokens, ...entry.contentTokens, ...entry.categoryTokens]));
function distance(a: string, b: string, maximum: number) {
 if (Math.abs(a.length - b.length) > maximum) return maximum + 1;
 let row = Array.from({length: b.length + 1}, (_, i) => i);
 for (let i = 1; i <= a.length; i++) {
  const next = [i];
  for (let j = 1; j <= b.length; j++) next[j] = Math.min(next[j - 1] + 1, row[j] + 1, row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  row = next;
 }
 return row[b.length];
}
const resultCache = new Map<string, Tool[]>();
export function searchTools(query: string, category = '', sort = 'relevance'): Tool[] {
 const q = normalize(query.slice(0, 160)), key = JSON.stringify([q, category, sort, Boolean(query.trim())]);
 const cached = resultCache.get(key);
 if (cached) return cached;
 const terms = [...new Set(tokens(q).filter(word => !stop.has(word)))];
 const compact = q.replace(/ /g, '');
 const eligible = index.filter(entry => !category || entry.tool.category === category);
 const exact = eligible.filter(entry => entry.compact === compact || entry.slugCompact === compact);
 const alternativeQuery = /\balternatives?\b/.test(q);
 const namedAlternative = alternativeQuery ? index.find(entry => (' ' + q + ' ').includes(' ' + entry.name + ' ') || (' ' + q + ' ').includes(' ' + normalize(entry.tool.slug) + ' ')) : undefined;
 const alternativeTerms = namedAlternative ? terms.filter(term => !namedAlternative.nameTokens.has(term)) : [];
 const scored: {tool: Tool; score: number}[] = [];
 for (const entry of eligible) {
  if (!q) {if (!query.trim()) scored.push({tool: entry.tool, score: 1}); continue;}
  if (exact.length) {if (exact.includes(entry)) scored.push({tool: entry.tool, score: 1000}); continue;}
  if (namedAlternative) {
   if (entry.tool.category === namedAlternative.tool.category && entry.tool.slug !== namedAlternative.tool.slug && alternativeTerms.every(term => entry.contentTokens.has(term) || entry.categoryTokens.has(term))) {
    const overlap = [...entry.contentTokens].filter(term => namedAlternative.contentTokens.has(term) && !alternativeNoise.has(term) && !stop.has(term));
    if (overlap.length) scored.push({tool: entry.tool, score: 100 + overlap.length * 15});
   }
   continue;
  }
  if (!terms.length) continue;
  if (/\bchat ?bots?\b/.test(q) && ['ai-coworkers','ai-voice-agents'].includes(entry.tool.category)) continue;
  let score = 0, matches = 0;
  for (const term of terms) {
   if (entry.nameTokens.has(term)) {score += 40; matches++;}
   else if (entry.contentTokens.has(term)) {score += 16; matches++;}
   else if (entry.categoryTokens.has(term)) {score += 8; matches++;}
  }
  // Every meaningful concept must match. Never admit unrelated partial hits.
  if (matches === terms.length) {
   if (entry.name.startsWith(q) || entry.compact.startsWith(compact)) score += 100;
   if (entry.content.includes(phrases(q))) score += 30;
   scored.push({tool: entry.tool, score});
   continue;
  }
  // Autocomplete matches brand prefixes, not arbitrary word substrings.
  if ((!knownTerms.has(terms[terms.length - 1]) || terms.length > 1) && compact.length >= 2 && (entry.compact.startsWith(compact) || entry.slugCompact.startsWith(compact))) scored.push({tool: entry.tool, score: 90});
 }
 // Brand typo correction only when no literal/task matches exist.
 if (!scored.length && terms.length >= 1 && terms.length <= 3 && compact.length >= 5 && terms.some(term => !knownTerms.has(term))) {
  const maximum = compact.length >= 7 ? 2 : 1;
  for (const entry of eligible) {
   const edit = Math.min(distance(compact, entry.compact, maximum), distance(compact, entry.slugCompact, maximum));
   if (edit <= maximum) scored.push({tool: entry.tool, score: 70 - edit * 10});
  }
 }
 scored.sort((a, b) => sort === 'az' ? a.tool.name.localeCompare(b.tool.name) : b.score - a.score || a.tool.name.localeCompare(b.tool.name));
 const results = scored.map(entry => entry.tool);
 if (resultCache.size >= 96) resultCache.delete(resultCache.keys().next().value!);
 resultCache.set(key, results);
 return results;
}
export {categoryCounts} from './catalog';
