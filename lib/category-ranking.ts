import type {Tool} from './catalog';
import {inCategory} from './category-crosslist';
// Editorial positions indicate category fit and source completeness; not popularity, hands-on testing, or customer ratings.
export const editorialPriority:Record<string,string[]> = {"ai-coding":["github-copilot","cursor","claude-code","windsurf","cline","aider","continue","augment-code","coderabbit","devin"],"ai-image":["adobe-firefly","midjourney","ideogram","flux","leonardo-ai","krea","stable-diffusion","bing-image-creator","clipdrop","remove-bg"],"ai-video":["runway","kling-ai","google-veo","pika","luma-dream-machine","heygen","synthesia","invideo-ai"],"ai-audio":["elevenlabs","adobe-podcast","suno","udio","murf","aiva","speechify","descript","krisp"],"ai-translation":["deepl","smartcat","phrase","lokalise","crowdin","weglot","unbabel","transifex","xtm-cloud","google-cloud-translation"],"ai-education":["magicschool","brisk-teaching","khanmigo","diffit","eduaide","schoolai","curipod","questionwell","gradescope"],"marketing":["hubspot","activecampaign","klaviyo","braze","mailchimp","semrush","ahrefs","hootsuite","sprout-social"],"pdf-documents":["adobe-acrobat","smallpdf","foxit","ilovepdf","pdfgear","sejda","pdf24","nitro","pdf-expert"],"ai":["claude","gemini","perplexity","deepseek","grok","glean","elicit","consensus"],"seo":["semrush","ahrefs","screaming-frog","moz-pro","surfer-seo"],"local-listings":["synup","yext","uberall","brightlocal","birdeye","semrush-local"],"rfp-software":["inventive-ai","loopio","responsive","sifthub","autorfp-ai","qorusdocs"],"communication":["slack","microsoft-teams","zoom","google-meet","discord","loom"],"edtech":["coursera","edx","udemy","simplilearn","upgrad","staragile"],"project-management":["asana","monday","clickup","linear","jira","trello"],"design":["figma","canva","adobe-photoshop","adobe-illustrator","sketch"],"web-design":["webflow","framer","wordpress","wix","squarespace"],"productivity":["notion","obsidian","evernote","todoist","clickup","trello"],"email-marketing":["mailchimp","klaviyo","brevo","activecampaign"],"social-media":["buffer","hootsuite","sprout-social","later"],"crm":["salesforce","hubspot","zoho-crm","pipedrive"],"customer-support":["zendesk","intercom","freshdesk","helpscout"],"analytics":["google-analytics","mixpanel","amplitude","posthog"],"developer-tools":["github","gitlab","visual-studio-code","postman","docker"],"cloud":["aws","microsoft-azure","google-cloud-platform","cloudflare"],"databases":["postgresql","supabase","mongodb","firebase"],"devops":["github-actions","gitlab-ci","jenkins","terraform"],"cybersecurity":["crowdstrike","cloudflare","sentinelone","snyk"],"passwords":["1password","bitwarden","dashlane","keeper"],"no-code":["bubble","lovable","bolt","retool","softr"],"forms":["typeform","tally","google-forms","jotform"],"meeting-notes":["otter","fireflies","fathom","granola"],"knowledge":["notion","confluence","guru","obsidian"],"cloud-storage":["google-drive","dropbox","onedrive","box"],"scheduling":["calendly","cal-com","reclaim"],"time-tracking":["toggl-track","clockify","harvest"],"finance":["quickbooks","xero","freshbooks"],"accounting":["quickbooks","xero","freshbooks","zoho-books"],"payments":["stripe","paypal","square","adyen"],"ecommerce":["shopify","woocommerce","bigcommerce"],"hr":["bamboohr","workday","rippling","gusto"],"recruiting":["greenhouse","lever","ashby","workable"],"legal":["clio","harvey","spellbook","ironclad"],"research":["perplexity","elicit","consensus","notebooklm"],"video-editing":["adobe-premiere-pro","davinci-resolve","capcut","descript"],"audio-production":["audacity","adobe-audition","descript","riverside"],"presentations":["gamma","beautiful-ai","canva","google-slides"],"surveys":["typeform","surveymonkey","qualtrics","tally"],"monitoring":["datadog","grafana","new-relic","sentry"],"business-intelligence":["power-bi","tableau","looker","metabase"],"content-management":["wordpress","contentful","sanity","strapi"],"spreadsheets":["google-sheets","microsoft-excel","airtable"],"community":["discord","circle","discourse","slack"],"events":["eventbrite","cvent"],"localisation":["phrase","lokalise","crowdin","weglot"],"ai-agents":["langchain","crewai","relevance-ai","lindy"],"ai-coworkers":["lindy","relevance-ai","manus"],"ai-chatbots":["claude","gemini","perplexity","deepseek","kimi"],"ai-browser-agents":["browser-use","skyvern","browserbase"],"ai-agent-frameworks":["langchain","crewai","autogen","llamaindex"],"ai-agent-builders":["relevance-ai","n8n","zapier","lindy"],"ai-model-platforms":["hugging-face","replicate","fal-ai","openrouter"],"ai-search-research":["perplexity","elicit","consensus","exa"],"ai-data-analysis":["julius-ai","notebooklm","hex"],"ai-sales-support":["intercom","sierra","zendesk"],"ai-voice-agents":["vapi","retell-ai","bland-ai","elevenlabs"],"ai-design":["canva","figma","gamma","napkin-ai"],"ai-productivity":["notion-ai","granola","reclaim","motion"],"ai-evaluation":["langsmith","arize","braintrust","langfuse"],"ai-memory":["mem0","zep","langmem","letta"],"ai-medical":["heidi-health","nabla","freed-ai"],"ai-legal":["harvey","legora","spellbook","cocounsel"],"ai-security":["lakera","prompt-security","protect-ai"],"ai-3d":["meshy","tripo-ai","luma-ai"],"ai-finance":["ramp","brex","vic-ai"],"healthcare":["athenahealth","epic","drchrono"],"logistics":["shipbob","shipstation","onfleet"],"personal-finance":["ynab","monarch-money","rocket-money"],"bookmarking":["raindrop-io","pocket","readwise"]};
function quality(t:Tool){
 const features=Math.min(5,t.features.filter(f=>f.trim().length>=6).length);
 const vendorChecked=Boolean(t.sourceChecked)&&t.sourceStatus!=='Confirm directly with vendor';
 const sourceUrl=Boolean(t.sourceUrl)&&t.url===t.sourceUrl;
 return (vendorChecked?15:0)+(sourceUrl?3:0)+features*3+Math.min(200,t.summary.length)/28+Math.min(140,t.fit.length)/45-(/^(ai|best|free|top)\b/i.test(t.name)?3:0);
}
export function rankedCategoryTools(category:string,all:Tool[]):Tool[]{
 const known=new Map((editorialPriority[category]||[]).map((slug,i)=>[slug,i]));
 const compare=(a:Tool,b:Tool)=>{
  const pa=known.get(a.slug),pb=known.get(b.slug);
  return pa!==undefined||pb!==undefined?(pa??9999)-(pb??9999):quality(b)-quality(a)||a.name.localeCompare(b.name,'en',{sensitivity:'base'});
 };
 const eligible=all.filter(t=>inCategory(t,category));
 const regular=eligible.filter(t=>!t.profile).sort(compare);
 const submissions=eligible.filter(t=>Boolean(t.profile)).sort((a,b)=>{if(category==='ai-video'){if(a.slug==='ai-bulin-47')return -1;if(b.slug==='ai-bulin-47')return 1;}return a.name.localeCompare(b.name,'en',{sensitivity:'base'});});
 // New, free submissions enter around position ten; paid placements will be clearly labelled separately.
 const result=submissions.length?[...regular.slice(0,9),...submissions,...regular.slice(9)]:regular;
 // Explicitly requested, non-sponsored editorial positions. Place the
 // verified profiles at exactly #15 in their primary category, without hiding
 // any other listings or changing sorting for searches/newest/A-Z views.
 const fifteenth:{[key:string]:string}={'ai-model-platforms':'aireiter','ai-design':'hausdraft','ai-image':'book-cover-generator','audio-production':'ai-music-mastering','ai-translation':'transly'};
 const selected=fifteenth[category],item=selected?result.find(t=>t.slug===selected):undefined;
 const fifteenthApplied=item
  ? [...result.filter(t=>t.slug!==selected).slice(0,14),item,...result.filter(t=>t.slug!==selected).slice(14)]
  : result;
 // A separately requested non-sponsored editorial inclusion at #20; keep
 // the established #15 placements untouched and retain normal other sorts.
 const twentieth:{[key:string]:string}={'ai-video':'flamingo-float-ai'};
 const selected20=twentieth[category],item20=selected20?fifteenthApplied.find(t=>t.slug===selected20):undefined;
 const other20=item20?fifteenthApplied.filter(t=>t.slug!==selected20):fifteenthApplied;
 const previousPlacements=item20
  ? [...other20.slice(0,19),item20,...other20.slice(19)]
  : fifteenthApplied;
 // Explicit editorial positions for independently researched November submissions.
 // Keep Flamingo Float AI at #20 in AI video; do not change search/newest/A-Z sorting.
 const newPlacements:Record<string,Record<number,string>>={
  'ai-video':{16:'outstanding-tiny-desk-ai',17:'genjutsu-lite',18:'bicep-heart-ai',19:'chipmunks-dance-ai',20:'flamingo-float-ai',21:'neon-dance-ai'},
  'edtech':{18:'edform'}
 };
 const desired=newPlacements[category];
 if(!desired)return previousPlacements;
 const bySlug=new Map(previousPlacements.map(t=>[t.slug,t]));
 const pinned=new Map<number,Tool>();
 for(const [position,slug] of Object.entries(desired)){
  const tool=bySlug.get(slug);
  if(tool)pinned.set(Number(position),tool);
 }
 const pinnedSlugs=new Set([...pinned.values()].map(t=>t.slug));
 const rest=previousPlacements.filter(t=>!pinnedSlugs.has(t.slug));
 const ranked:Tool[]=[];
 for(let position=1;position<=previousPlacements.length;position++){
  const fixed=pinned.get(position);
  ranked.push(fixed||rest.shift()!);
 }
 return ranked;
}
