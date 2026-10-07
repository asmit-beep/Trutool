import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'trutool-catalog-'));
try{
 fs.writeFileSync(path.join(tmp,'package.json'),'{"type":"commonjs"}');
 for(const file of ['catalog','guides','search','diagnostic','catalog-results','tool-discovery','discovery-options','authors','ai','ai-news','demo','demo-reviews','reviews','pricing','community-answers'])fs.writeFileSync(path.join(tmp,file+'.js'),ts.transpileModule(fs.readFileSync('lib/'+file+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
 fs.copyFileSync('lib/expanded-catalog.json',path.join(tmp,'expanded-catalog.json'));
 for(const name of ['ai-catalog.json','catalog-additions.json','ai-news.json','ai-discussions.json'])fs.copyFileSync('lib/'+name,path.join(tmp,name));
 fs.copyFileSync('lib/core-source-dates.json',path.join(tmp,'core-source-dates.json'));
 fs.copyFileSync('lib/community-reviews.json',path.join(tmp,'community-reviews.json'));
 const require=createRequire(import.meta.url),{tools,categories,guides}=require(path.join(tmp,'catalog.js')),{searchTools}=require(path.join(tmp,'search.js')),{workflows,validateBrief,pilotPlan,guideFor,matchTools,defaultWeights}=require(path.join(tmp,'diagnostic.js'));
 assert.ok(tools.length>1000);assert.ok(categories.length>40);assert.equal(new Set(tools.map(t=>t.slug)).size,tools.length);assert.equal(new Set(categories.map(c=>c.slug)).size,categories.length);
 for(const t of tools){assert.ok(categories.some(c=>c.slug===t.category),t.slug);assert.match(new URL(t.url).protocol,/https?:/);assert.ok(t.summary&&t.fit&&t.caution&&t.features.length,t.slug);assert.equal(searchTools(t.name)[0]?.slug,t.slug,'Name search: '+t.name)}
 for(const c of categories){assert.ok(tools.some(t=>t.category===c.slug),c.slug);const brief={category:c.slug,workflow:workflows[c.slug][0][0],scale:'team',style:'balanced'};assert.ok(validateBrief(brief));assert.equal(pilotPlan(brief).length,3);assert.ok(guideFor(c.slug));assert.ok(matchTools(brief,defaultWeights).length)}
 for(const [q,expected] of [['chagpt','chatgpt'],['remove image backgrounds','remove-bg'],['AI research assistants','perplexity'],['RFP response software','inventive-ai'],['meeting notes','otter'],['password manager','1password'],['create presentations','gamma'],['no-code app builders','bubble']]){const result=searchTools(q).slice(0,20);console.log(q,':',result.slice(0,6).map(t=>t.name).join(', '));assert.ok(result.some(t=>t.slug===expected),'Task search: '+q+' should include '+expected)}
 const relevanceCases = [
  ['remove image backgrounds',['remove-bg'],['ai-image']],
  ['how do I remove backgrounds from photos',['remove-bg'],['ai-image']],
  ['image background remover',['remove-bg'],['ai-image']],
  ['meeting notes',['otter','fireflies'],['meeting-notes']],
  ['meeting note',['otter'],['meeting-notes']],
  ['password manager',['1password','bitwarden'],['passwords']],
  ['keyword research',['ahrefs','semrush','mangools'],['seo']],
  ['search research',['ahrefs','semrush'],['seo']],
  ['backlinks',['ahrefs'],['seo']],
  ['cloud storage',['google-drive','dropbox'],['cloud-storage']],
  ['file sharing',['google-drive'],['cloud-storage']],
  ['customer relationship management',['hubspot','zoho-crm'],['crm','marketing']],
  ['CRM',['zoho-crm'],['crm','marketing']],
  ['Google Business Profile',['synup','yext'],['local-listings']],
  ['google my business',['synup'],['local-listings']],
  ['GBP',['synup'],['local-listings']],
  ['local listings management',['synup','yext'],['local-listings']],
  ['RFP response software',['inventive-ai','loopio'],['rfp-software']],
  ['request for proposal',['inventive-ai'],['rfp-software']],
  ['no-code app builders',['bubble','lovable'],['no-code']],
  ['build apps without coding',['bubble'],['no-code']],
  ['AI image generator',['midjourney','ideogram'],['ai-image','ai-video','ai-chatbots','ai-model-platforms']],
  ['video editing',['capcut','davinci-resolve'],['video-editing','ai-video']],
  ['text to speech',['speechify','elevenlabs','revid-ai'],['ai-audio','ai-voice-agents','ai-video']],
  ['speech to text',['assemblyai','deepgram'],['ai-audio','meeting-notes','audio-production','video-editing','ai-productivity']],
  ['logo maker',['canva','adobe-illustrator'],['design','ai-image','ai-design']],
  ['email marketing',['mailchimp','brevo'],['email-marketing','marketing']],
  ['AI chatbot',['chatgpt','claude','deepseek'],['ai','ai-chatbots','ai-agent-builders','ai-sales-support']],
  ['AI research assistants',['perplexity','elicit'],['ai','ai-writing','ai-search-research','ai-chatbots','ai-coworkers']],
  ['ChatGPT alternatives',['claude','deepseek'],['ai','ai-chatbots']],
  ['Notion alternatives',['obsidian','evernote'],['productivity']],
  ['write marketing content',['jasper','writesonic'],['ai-writing']],
  ['learn coding',['codecademy'],['edtech']],
  ['podcast recording',['riverside'],['video-editing','audio-production']],
 ];
 for(const [query,expected,allowed] of relevanceCases){
  const results=searchTools(query);
  for(const slug of expected)assert.ok(results.some(t=>t.slug===slug),'Relevant result: '+query+' -> '+slug);
  assert.ok(results.every(t=>allowed.includes(t.category)),'Unrelated category: '+query+' -> '+results.filter(t=>!allowed.includes(t.category)).map(t=>t.name));
 }
 for(const query of ['bicycle repair','AI bicycle repair','meeting notes zzzxqv','password manager elephant','best tools','zzzxqv','!!!','quantum banana telescope'])assert.equal(searchTools(query).length,0,'No fallback results for '+query);
 for(const [query,slug] of [['chagpt','chatgpt'],['microsoft tems','microsoft-teams'],['perplexty','perplexity'],['MíDJoUrNeY','midjourney'],['remove.bg','remove-bg'],['Microsoft T','microsoft-teams'],['chatgp','chatgpt']])assert.equal(searchTools(query)[0]?.slug,slug,'Brand matching: '+query);
 assert.ok(!searchTools('AI').some(t=>t.slug==='airtable'),'AI is not a substring of Airtable');
 assert.ok(!searchTools('HR').some(t=>t.slug==='google-chrome'),'HR is not a substring of Chrome');
 assert.ok(!searchTools('password manager').some(t=>t.slug==='auth0'),'Identity providers are not password managers');
 assert.ok(!searchTools('text to speech').some(t=>['assemblyai','krisp'].includes(t.slug)),'Transcription and noise reduction are not speech synthesis');
 assert.ok(!searchTools('Notion alternatives').some(t=>['alfred','raycast','notion'].includes(t.slug)),'Alternatives fit the original task and exclude the original brand');
 assert.equal(searchTools('meeting notes','seo').length,0,'Category filter must not broaden search');
 assert.deepEqual(searchTools('meeting notes','','az').map(t=>t.name),searchTools('meeting notes','','az').map(t=>t.name).sort((a,b)=>a.localeCompare(b)));
 const searchStart=performance.now();for(let i=0;i<200;i++)searchTools(relevanceCases[i%relevanceCases.length][0]);
 assert.ok(performance.now()-searchStart<1000,'Cached searches stay responsive');
 assert.ok(!fs.readFileSync('app/page.tsx','utf8').includes('className="hero-stats"'),'Requested hero count strip removed');
 console.log('PASS: 60+ search relevance, typo, synonym, no-match, filter and performance checks; unrelated results excluded.');
 fs.symlinkSync(path.resolve('node_modules'),path.join(tmp,'node_modules'),'dir');
 const reviewSource=fs.readFileSync('app/api/reviews/route.ts','utf8').replace("@/lib/catalog","./catalog");
 fs.writeFileSync(path.join(tmp,'review-route.js'),ts.transpileModule(reviewSource,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
 const {POST}=require(path.join(tmp,'review-route.js'));
 const {demoReviews,demoGuideReviews}=require(path.join(tmp,'demo-reviews.js'));
 assert.ok(demoReviews.length>=50);assert.equal(new Set(demoReviews.map(r=>r.slug)).size,demoReviews.length);
 for(const r of [...demoReviews,...demoGuideReviews]){assert.ok(r.demo&&r.rating>=4&&r.rating<5&&r.message.length>20&&r.name.length>2);assert.ok(r.kind==='tool'?tools.some(t=>t.slug===r.slug):guides.some(g=>g.slug===r.slug))}
 const {ratingFor,reviewsFor}=require(path.join(tmp,'reviews.js'));for(const t of tools){const score=ratingFor('tool',t.slug).average;assert.ok(score===null||(score>=1&&score<=5));assert.equal(ratingFor('tool',t.slug).count,reviewsFor('tool',t.slug).length)}
 console.log('PASS: presentation reviews use unique tool references, bounded ratings, and a removable data source.');
 const approvedPath=path.join(tmp,'community-reviews.json'),approvedBackup=fs.readFileSync(approvedPath,'utf8');
 fs.writeFileSync(approvedPath,JSON.stringify([{id:'test-one',kind:'tool',slug:'chatgpt',name:'Validation fixture',rating:4,message:'Isolated validation fixture; never published.',publishedAt:'2026-10-06'},{id:'test-two',kind:'tool',slug:'chatgpt',name:'Validation fixture',rating:5,message:'Isolated validation fixture; never published.',publishedAt:'2026-10-06'}]));
 const launchCheck=spawnSync(process.execPath,['-e',`const a=require('node:assert/strict'),r=require(${JSON.stringify(path.join(tmp,'reviews.js'))});a.deepEqual(r.ratingFor('tool','chatgpt'),{count:2,average:4.5});a.equal(r.ratingFor('tool','claude').average,null);a.equal(r.displayReviews.length,2);`],{env:{...process.env,NEXT_PUBLIC_DEMO_MODE:'false'},encoding:'utf8'});
 fs.writeFileSync(approvedPath,approvedBackup);assert.equal(launchCheck.status,0,launchCheck.stderr);
 console.log('PASS: organic-launch mode removes placeholders and computes approved review averages correctly.');

 const {communityAnswers,getCommunityAnswer}=require(path.join(tmp,'community-answers.js'));
 assert.ok(communityAnswers.length>=90);assert.equal(new Set(communityAnswers.map(a=>a.slug)).size,communityAnswers.length);
 for(const a of communityAnswers){assert.ok(categories.some(c=>c.slug===a.category),a.slug);assert.ok(a.answer.length>100&&a.steps.length>=3&&a.checks.length>=3,a.slug);assert.ok(a.toolSlugs.length>=2,a.slug);for(const slug of a.toolSlugs)assert.ok(tools.some(t=>t.slug===slug),a.slug+' references '+slug);assert.ok(a.helpful>=0&&a.helpful<=70);assert.equal(getCommunityAnswer(a.slug),a);}
 console.log('PASS: every community question has a complete answer, valid tools, practical steps and bounded helpful counts.');
 const launchAnswers=spawnSync(process.execPath,['-e',`const a=require('node:assert/strict'),r=require(${JSON.stringify(path.join(tmp,'community-answers.js'))});a.ok(r.communityAnswers.every(x=>x.helpful===0));`],{env:{...process.env,NEXT_PUBLIC_DEMO_MODE:'false'},encoding:'utf8'});assert.equal(launchAnswers.status,0,launchAnswers.stderr);
 fs.writeFileSync(path.join(tmp,'helpful-blob.js'),`exports.records=new Map();exports.list=async({prefix,cursor})=>({blobs:[...exports.records.keys()].filter(p=>p.startsWith(prefix)).map(pathname=>({pathname})),hasMore:false});exports.put=async(pathname,body,options)=>{if(options.access!=='private')throw Error('private storage required');exports.records.set(pathname,body);};`);
 const helpfulSource=fs.readFileSync('app/api/helpful/route.ts','utf8').replace('@/lib/community-answers','./community-answers').replace('@vercel/blob','./helpful-blob');
 fs.writeFileSync(path.join(tmp,'helpful-route.js'),ts.transpileModule(helpfulSource,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
 const helpful=require(path.join(tmp,'helpful-route.js')),voteStore=require(path.join(tmp,'helpful-blob.js')),helpfulUrl='https://trutool-directory.vercel.app/api/helpful',firstAnswer=communityAnswers[0];
 const priorToken=process.env.BLOB_READ_WRITE_TOKEN;process.env.BLOB_READ_WRITE_TOKEN='isolated-validation-key';
 const voteRequest=(slug,cookie='')=>new Request(helpfulUrl,{method:'POST',headers:{Origin:'https://trutool-directory.vercel.app',Cookie:cookie},body:JSON.stringify({slug})});
 assert.equal((await helpful.POST(new Request(helpfulUrl,{method:'POST',headers:{Origin:'https://other.example'},body:'{}'}))).status,403);
 assert.equal((await helpful.POST(voteRequest('not-an-answer'))).status,400);assert.equal(voteStore.records.size,0);
 const vote=await helpful.POST(voteRequest(firstAnswer.slug));assert.equal(vote.status,200);assert.equal((await vote.json()).count,firstAnswer.helpful+1);
 const cookie=vote.headers.get('Set-Cookie').split(';')[0];assert.match(vote.headers.get('Set-Cookie'),/HttpOnly/);assert.match(vote.headers.get('Set-Cookie'),/Secure/);
 const repeat=await Promise.all([helpful.POST(voteRequest(firstAnswer.slug,cookie)),helpful.POST(voteRequest(firstAnswer.slug,cookie))]);for(const r of repeat)assert.equal((await r.json()).count,firstAnswer.helpful+1);assert.equal(voteStore.records.size,1);
 const refreshed=await helpful.GET(new Request(helpfulUrl+'?slugs='+firstAnswer.slug,{headers:{Cookie:cookie}}));assert.deepEqual((await refreshed.json()).counts[firstAnswer.slug],{count:firstAnswer.helpful+1,voted:true});
 const another=await helpful.POST(voteRequest(firstAnswer.slug));assert.equal((await another.json()).count,firstAnswer.helpful+2);assert.equal(voteStore.records.size,2);
 const otherSlug=communityAnswers[1].slug;await helpful.POST(voteRequest(otherSlug,cookie));assert.equal(voteStore.records.size,3);
 delete process.env.BLOB_READ_WRITE_TOKEN;assert.equal((await helpful.POST(voteRequest(otherSlug,cookie))).status,503);
 if(priorToken===undefined)delete process.env.BLOB_READ_WRITE_TOKEN;else process.env.BLOB_READ_WRITE_TOKEN=priorToken;
 console.log('PASS: helpful votes persist once per browser/answer, concurrent duplicate clicks do not inflate totals, reload preserves state, and invalid submissions cannot write.');
 const communitySource=fs.readFileSync('app/api/community/route.ts','utf8').replace('@/lib/catalog','./catalog').replace('@/lib/community-answers','./community-answers').replace('@vercel/blob','./helpful-blob');
 fs.writeFileSync(path.join(tmp,'community-route.js'),ts.transpileModule(communitySource,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
 const community=require(path.join(tmp,'community-route.js')),communityUrl='https://trutool-directory.vercel.app/api/community';
 const communityRequest=(body,origin='https://trutool-directory.vercel.app')=>new Request(communityUrl,{method:'POST',headers:{Origin:origin},body:JSON.stringify(body)});
 const example={kind:'question',name:'Isolated fixture',email:'',category:'ai',question:'Which tool fits a small team?',message:'',consent:true,website:''};
 const before=voteStore.records.size;process.env.BLOB_READ_WRITE_TOKEN='isolated-community-validation-key';
 assert.equal((await community.POST(communityRequest(example,'https://other.example'))).status,403);
 assert.equal((await community.POST(communityRequest({...example,consent:false}))).status,400);
 assert.equal((await community.POST(communityRequest({...example,question:'Short'}))).status,400);
 assert.equal((await community.POST(communityRequest({...example,email:'invalid'}))).status,400);
 assert.equal((await community.POST(communityRequest({...example,category:'missing'}))).status,400);
 assert.equal((await community.POST(communityRequest({...example,website:'spam'}))).status,400);
 assert.equal(voteStore.records.size,before);
 const posted=await community.POST(communityRequest(example));assert.equal(posted.status,200);assert.ok((await posted.json()).id);
 let stored=[...voteStore.records.entries()].filter(([key])=>key.startsWith('community-submissions/')).map(([,body])=>JSON.parse(body));assert.equal(stored.length,1);assert.equal(stored[0].status,'pending');assert.equal(stored[0].question,example.question);assert.ok(!('email' in stored[0]));assert.ok(!('ip' in stored[0]));
 const perspective={...example,kind:'perspective',question:undefined,answerSlug:firstAnswer.slug,message:'This is an isolated validation of context and privacy.'};assert.equal((await community.POST(communityRequest({...perspective,answerSlug:'missing'}))).status,400);assert.equal((await community.POST(communityRequest(perspective))).status,200);
 stored=[...voteStore.records.entries()].filter(([key])=>key.startsWith('community-submissions/')).map(([,body])=>JSON.parse(body));assert.equal(stored.find(x=>x.kind==='perspective').answerSlug,firstAnswer.slug);
 for(let i=0;i<3;i++)assert.equal((await community.POST(communityRequest(example))).status,200);assert.equal((await community.POST(communityRequest(example))).status,429);
 if(priorToken===undefined)delete process.env.BLOB_READ_WRITE_TOKEN;else process.env.BLOB_READ_WRITE_TOKEN=priorToken;
 const answerPage=fs.readFileSync('app/community/[slug]/page.tsx','utf8');assert.ok(!answerPage.includes('answer-cover')&&!answerPage.includes('next/image'));assert.ok(answerPage.includes('/community?answer='));assert.ok(!answerPage.includes('/contact?message='));
 console.log('PASS: community questions and perspectives save privately for review, optional email works, context survives, invalid/spam submissions cannot write, and submissions are limited.');
 const reviewUrl='https://trutool-directory.vercel.app/api/reviews';
 const invalidOrigin=await POST(new Request(reviewUrl,{method:'POST',headers:{Origin:'https://example.com'},body:'{}'}));assert.equal(invalidOrigin.status,403);
 const invalidRating=await POST(new Request(reviewUrl,{method:'POST',headers:{Origin:'https://trutool-directory.vercel.app'},body:JSON.stringify({slug:'chatgpt',rating:8,consent:true,name:'QA check',email:'qa@example.com',message:'Validation check; no review should be stored.'})}));assert.equal(invalidRating.status,400);
 const missingConsent=await POST(new Request(reviewUrl,{method:'POST',headers:{Origin:'https://trutool-directory.vercel.app'},body:JSON.stringify({slug:'chatgpt',rating:3,name:'QA check',email:'qa@example.com',message:'Validation check; no review should be stored.'})}));assert.equal(missingConsent.status,400);
 console.log('PASS: review endpoint rejects foreign origins, invalid ratings, and missing consent without writing data.');
 const assets=JSON.parse(fs.readFileSync('lib/catalog-brand-assets.json','utf8'));for(const src of Object.values(assets))assert.ok(fs.existsSync('public'+src),src);
 assert.equal(new Set(guides.map(g=>g.slug)).size,guides.length);
 for(const g of guides){assert.ok(categories.some(c=>c.slug===g.category),g.slug);for(const field of ['publishedAt','updatedAt'])if(g[field])assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(g[field])&&!Number.isNaN(Date.parse(g[field])),g.slug+' '+field)}
 const {pairs,catalogueTotals,categoryCounts}=require(path.join(tmp,'catalog.js'));
 for(const [a,b] of pairs)assert.ok(a!==b&&tools.some(t=>t.slug===a)&&tools.some(t=>t.slug===b),'Comparison: '+a+' vs '+b);
 assert.equal(catalogueTotals.tools,tools.length);assert.equal(catalogueTotals.categories,categories.length);assert.equal(catalogueTotals.guides,guides.length);
 for(const c of categories)assert.equal(categoryCounts[c.slug],tools.filter(t=>t.category===c.slug).length);
 const {toolResults}=require(path.join(tmp,'catalog-results.js'));
 const first=toolResults(),second=toolResults('','','relevance',2);
 assert.equal(first.total,tools.length);assert.equal(first.items.length,24);assert.equal(second.page,2);assert.ok(!first.items.some(t=>second.items.some(x=>x.slug===t.slug)));
 assert.ok(first.items.every(t=>t.categoryLabel&&!('fit' in t)&&!('features' in t)),'Compact search responses');
 assert.equal(toolResults('','','',Infinity,Infinity).limit,24);assert.equal(toolResults('','','',999999).page,first.pages);
 assert.equal(toolResults('','nonexistent-category').total,0);assert.ok(toolResults('chagpt','','',1,6).items.some(t=>t.slug==='chatgpt'));
 const aiCatalogue=JSON.parse(fs.readFileSync('lib/ai-catalog.json','utf8'));
 const {aiTools,aiCategories,aiStats,isAITool,freshAITools,getAIShelves}=require(path.join(tmp,'ai.js'));
 assert.ok(aiCatalogue.tools.length>100);assert.ok(aiCategories.length>=19);
 assert.equal(aiStats.tools,aiTools.length);assert.equal(aiStats.categories,aiCategories.length);
 assert.ok(aiCatalogue.tools.every(t=>t.ai&&t.sourceChecked&&t.addedAt&&t.sourceStatus==='Vendor source consulted'));
 const aiFirst=toolResults('','','relevance',1,50,'ai');assert.equal(aiFirst.total,aiTools.length);assert.equal(aiFirst.scope,'ai');assert.ok(aiFirst.items.every(t=>isAITool(tools.find(x=>x.slug===t.slug))));
 assert.equal(toolResults('Synup','','relevance',1,24,'ai').total,0);
 for(const [query,slug] of [['Jev AI','jev-ai'],['Grok Bot','grok-bot'],['AI coworker','grok-bot'],['AI agent frameworks','crewai'],['AI browser agents','browser-use'],['voice agents','vapi'],['AI chatbot','kimi']])assert.ok(toolResults(query,'','relevance',1,50,'ai').items.some(t=>t.slug===slug),query+' -> '+slug);
 assert.ok(!searchTools('AI chatbot').some(t=>['grok-bot','bland-ai','retell-ai'].includes(t.slug)),'Always-on coworkers and phone agents are not text chatbots');
 assert.equal(toolResults('password manager','','relevance',1,24,'ai').total,0);
 const {parseOfficialFeed,mergeAINews,officialFeeds,articleCover,safeNewsImage,parseHNDiscussions,AI_REFRESH_SECONDS}=require(path.join(tmp,'ai-news.js'));
 const newsNow=Date.parse('2026-10-06T12:00:00Z');
 const xml='<rss><channel><item><title><![CDATA[New AI agents &amp; tools]]></title><link>https://openai.com/index/check</link><pubDate>Mon, 05 Oct 2026 12:00:00 GMT</pubDate><description><![CDATA[<p>Agent update</p>]]></description></item><item><title>AI outside source</title><link>https://example.com/ai</link><pubDate>Mon, 05 Oct 2026 12:00:00 GMT</pubDate></item><item><title>AI future story</title><link>https://openai.com/future</link><pubDate>Wed, 05 Oct 2027 12:00:00 GMT</pubDate></item><item><title>Cooking tips</title><link>https://openai.com/cooking</link><pubDate>Mon, 05 Oct 2026 12:00:00 GMT</pubDate></item></channel></rss>';
 const parsedNews=parseOfficialFeed(xml,officialFeeds[0],newsNow);assert.equal(parsedNews.length,1);assert.equal(parsedNews[0].title,'New AI agents & tools');assert.equal(parsedNews[0].summary,'Agent update');
 assert.equal(parseOfficialFeed('<feed><entry><title>AI model update</title><link href="https://huggingface.co/blog/check"/><updated>2026-10-05T10:00:00Z</updated></entry></feed>',officialFeeds[1],newsNow).length,1);
 assert.equal(parseOfficialFeed('x'.repeat(2_000_001),officialFeeds[0],newsNow).length,0);
 const mergedNews=mergeAINews([...parsedNews,...parsedNews],newsNow);assert.equal(mergedNews.filter(n=>n.url===parsedNews[0].url).length,1);assert.ok(mergeAINews([],newsNow).length>=4);assert.ok(mergedNews.some(n=>n.url===parsedNews[0].url));
 assert.ok(mergedNews.every(n=>n.url.startsWith('https://')&&n.publishedAt));
 assert.equal(AI_REFRESH_SECONDS,48*3600);assert.ok(officialFeeds.length>=8);
 const flooded=Array.from({length:30},(_,i)=>({...parsedNews[0],id:'flood-'+i,url:'https://openai.com/flood/'+i,publishedAt:'2026-10-06'}));
 const diverse=mergeAINews(flooded,newsNow);assert.ok(new Set(diverse.map(n=>n.publisher)).size>=8);assert.ok(diverse.filter(n=>n.publisher==='OpenAI').length<=2);assert.ok(diverse.some(n=>n.publisher==='Anthropic'));assert.ok(diverse.some(n=>n.id==='jev-launch'));
 const originalCover='https://cdn-uploads.huggingface.co/production/uploads/cover.png';
 assert.equal(articleCover('<meta content="'+originalCover+'" property="og:image">'),originalCover);
 assert.equal(articleCover('<meta property="og:image" content="http://127.0.0.1/private">'),undefined);
 assert.equal(safeNewsImage('https://cdn.sanity.io@127.0.0.1/private'),undefined);assert.equal(safeNewsImage('https://random.example/cover.jpg'),undefined);
 assert.equal(parseOfficialFeed(xml.replace('Agent update','&lt;p&gt;Agent &#117;pdate&lt;/p&gt;'),officialFeeds[0],newsNow)[0].summary,'Agent update');
 assert.ok(mergeAINews([],newsNow).filter(n=>n.image).every(n=>safeNewsImage(n.image)&&n.imageSource===n.url));
 const hn={hits:[{title:'New AI model',objectID:'123',created_at:'2026-10-05',num_comments:8},{title:'Airline routes',objectID:'124',created_at:'2026-10-05',num_comments:8},{title:'AI future',objectID:'125',created_at:'2027-10-05',num_comments:8},{title:'AI model',objectID:'../../secret',created_at:'2026-10-05',num_comments:8}]};
 assert.equal(parseHNDiscussions(hn,newsNow).length,1);assert.equal(parseHNDiscussions(hn,newsNow)[0].url,'https://news.ycombinator.com/item?id=123');
 const shelves=getAIShelves(newsNow);assert.equal(shelves.length,3);assert.ok(shelves.every(s=>s.tools.length===6));assert.ok(!shelves[1].tools.some(t=>t.slug==='devin'));assert.ok(shelves[1].tools.every(t=>t.launchedAt&&t.launchStatus));assert.equal(freshAITools(Date.parse('2027-01-01')).length,0);
 assert.ok(shelves[2].tools.some(t=>t.slug==='wispr-flow'));assert.ok(shelves[0].tools.some(t=>t.slug==='notebooklm'));
 console.log('PASS: '+aiCatalogue.tools.length+' added AI profiles, scoped search, source diversity, original article covers, 48-hour caching, discussion relevance, launch freshness, and feed fallback.');
 // Simulate publication in an isolated catalogue: never add QA content to the site.
 const fixture=JSON.parse(fs.readFileSync(path.join(tmp,'expanded-catalog.json'),'utf8'));
 fixture.categories.push({...fixture.categories[0],slug:'qa-fixture-category',name:'QA Fixture category'});
 fixture.tools.push({...fixture.tools[0],slug:'qa-catalogue-fixture',name:'QA Catalogue Fixture',category:'qa-fixture-category'});
 fs.writeFileSync(path.join(tmp,'expanded-catalog.json'),JSON.stringify(fixture));
 fs.appendFileSync(path.join(tmp,'guides.js'),"\nexports.additionalGuides.push({...exports.additionalGuides[0],slug:'qa-guide-fixture',category:'qa-fixture-category',publishedAt:'2026-10-06'});\n");
 for(const file of ['catalog.js','ai.js','expanded-catalog.json','guides.js','search.js','catalog-results.js'])delete require.cache[path.join(tmp,file)];
 const fresh=require(path.join(tmp,'catalog.js')),results=require(path.join(tmp,'catalog-results.js'));
 assert.equal(fresh.catalogueTotals.tools,tools.length+1);assert.equal(fresh.catalogueTotals.categories,categories.length+1);assert.equal(fresh.catalogueTotals.guides,guides.length+1);assert.equal(fresh.categoryCounts['qa-fixture-category'],1);
 assert.equal(fresh.latestGuides[0].slug,'qa-guide-fixture');assert.equal(results.toolResults('QA Catalogue Fixture').items[0].slug,'qa-catalogue-fixture');assert.ok(results.categoryOptions.some(c=>c.slug==='qa-fixture-category'));
 // The exact sitemap generator must include every newly published entity.
 const sitemapSource=fs.readFileSync('app/sitemap.ts','utf8').replaceAll('@/lib/','./');
 for(const [file,source] of [['services',fs.readFileSync('lib/services.ts','utf8')],['sitemap',sitemapSource]])fs.writeFileSync(path.join(tmp,file+'.js'),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
 const entries=require(path.join(tmp,'sitemap.js')).default();for(const a of communityAnswers)assert.ok(entries.some(e=>e.url.endsWith('/community/'+a.slug))); for(const suffix of ['/everything-ai','/tools/qa-catalogue-fixture','/alternatives/qa-catalogue-fixture','/categories/qa-fixture-category','/guides/qa-guide-fixture'])assert.ok(entries.some(e=>e.url.endsWith(suffix)),suffix);
 assert.equal(new Set(entries.map(e=>e.url)).size,entries.length);
 const {authors,authorFor,getAuthor}=require(path.join(tmp,'authors.js'));
 assert.deepEqual(authors.map(a=>a.slug),['yash','snehil','sandeep','asmit']);
 for(const author of authors){assert.ok(guides.some(g=>authorFor(g).slug===author.slug));assert.equal(getAuthor(author.slug).name,author.name)}
 assert.ok(guides.every(g=>getAuthor(authorFor(g).slug)));
 assert.equal(authorFor({category:'ai',authorSlug:'asmit'}).slug,'asmit');assert.equal(getAuthor('missing'),undefined);
 const lensResults=require(path.join(tmp,'catalog-results.js')).toolResults;
 const {discoveryMatches}=require(path.join(tmp,'tool-discovery.js'));
 for(const lens of ['popular','useful','niche']){
  const out=lensResults('','','relevance',1,50,'',lens);assert.ok(out.total>10);assert.ok(out.items.every(t=>discoveryMatches(t,lens)));assert.equal(out.discovery,lens);
  const aiOut=lensResults('','','relevance',1,50,'ai',lens);assert.ok(aiOut.items.every(t=>isAITool(tools.find(x=>x.slug===t.slug))&&discoveryMatches(t,lens)));
  const base=new Set(searchTools('meeting notes').map(t=>t.slug));assert.ok(lensResults('meeting notes','','relevance',1,50,'',lens).items.every(t=>base.has(t.slug)));
  assert.equal(lensResults('quantum banana telescope','','relevance',1,50,'',lens).total,0);
 }
 assert.equal(lensResults('chagpt','','relevance',1,24,'','popular').items[0].slug,'chatgpt');
 assert.ok(lensResults('password manager','','relevance',1,50,'','popular').items.some(t=>t.slug==='bitwarden'));
 assert.ok(lensResults('Jev AI','','relevance',1,24,'ai','niche').items.some(t=>t.slug==='jev-ai'));
 assert.equal(lensResults('','design','relevance',1,50,'','niche').items.every(t=>t.category==='design'),true);
 assert.equal(lensResults('','','invalid',1,24,'','invalid').discovery,'all');
 assert.equal(lensResults('','','relevance',99999,24,'','niche').page,lensResults('','','relevance',1,24,'','niche').pages);
 const newest=lensResults('','','newest',1,50).items.map(t=>{const source=tools.find(x=>x.slug===t.slug);return source.addedAt||source.launchedAt||''});assert.deepEqual(newest,[...newest].sort((a,b)=>b.localeCompare(a)));
 console.log('PASS: four balanced authors; discovery filters preserve relevance, category, AI scope and pagination; newest sorting and invalid options verified.');
 console.log('PASS: publishing a tool/category/guide updates totals, menus, search, newest guides and sitemap; pagination and compact API data verified.');
 console.log(`PASS: ${tools.length} unique tools, ${categories.length} populated categories, ${guides.length} guides, ${Object.keys(assets).length} local catalogue brand assets; exact-name/task searches and all diagnostic paths.`);
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
