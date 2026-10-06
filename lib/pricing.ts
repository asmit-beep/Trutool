import type {Tool} from './catalog';

// Official pricing destinations checked on 6 October 2026. No prices are inferred.
const pricingPages:Record<string,string>={
 'inventive-ai':'https://www.inventive.ai/inventive-ai-pricing',
 synup:'https://synup.com/pricing',
 chatgpt:'https://chatgpt.com/pricing/',claude:'https://claude.com/pricing',
 notion:'https://www.notion.com/pricing',slack:'https://slack.com/pricing',
 linear:'https://linear.app/pricing',figma:'https://www.figma.com/pricing/',
 canva:'https://www.canva.com/pricing/',cursor:'https://cursor.com/pricing',
 lovable:'https://lovable.dev/pricing',obsidian:'https://obsidian.md/pricing',
 loopio:'https://loopio.com/pricing/',responsive:'https://www.responsive.io/pricing',
 brightlocal:'https://www.brightlocal.com/pricing/',asana:'https://asana.com/pricing',
 zapier:'https://zapier.com/pricing',webflow:'https://webflow.com/pricing',miro:'https://miro.com/pricing/'
};
export function pricingFor(tool:Pick<Tool,'slug'|'url'|'pricingUrl'>){
 const url=tool.pricingUrl||pricingPages[tool.slug];
 return {url:url||tool.url,label:url?'Official pricing ↗':'Ask the vendor about pricing ↗',direct:Boolean(url)};
}
