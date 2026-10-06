import {tools,guides,getTool} from './catalog';
import type {PublishedReview} from './reviews';
const names=['Avery Morgan','Maya Chen','Theo Ellis','Nina Patel','Lucas Reed','Sofia Brooks','Ethan Cole','Isla Hayes','Noah Kim','Amara James','Owen Clarke','Lena Shah','Felix Turner','Zara Quinn','Leo Garcia','Aria Bennett','Finn Walker','Eva Ross','Miles Foster','Dalia Wells','Jude Parker','Iris Lane','Adam Green','Mila Hart','Toby Hughes','Layla Grant','Kai Dawson','Freya Stone','Sam Rivera','Rhea Kapoor','Eli West','Ruby Shaw','Luca Miles','Alina Ford','Ben Cooper','Tara Blake','Jay Carter','Hana Lewis','Oscar Cruz','Priya Evans','Alex Woods','Leah Singh','Max Doyle','Sara Bell','Ryan Hale','Anya Reid','Cole Martin','Meera Dean','Nico Adams','Elena Wright','Ravi Fox','Chloe Gray','Ian Scott','Aisha Moore','Dan Bennett','Julia Park','Remy Taylor','Sana White','Louis King','Sienna Young'];
const slugs=['chatgpt','claude','deepseek','perplexity','cursor','lovable','notion','obsidian','figma','canva','slack','microsoft-teams','zoom','google-meet','discord','loom','linear','asana','trello','clickup','monday','todoist','airtable','miro','zapier','make','n8n','webflow','framer','bubble','wordpress','shopify','hubspot','salesforce','mailchimp','kit','buffer','hootsuite','semrush','ahrefs','surfer','grammarly','quillbot','otter','fireflies','descript','capcut','runway','midjourney','ideogram','elevenlabs','synthesia','gamma','prezi','synup','yext','inventive-ai','loopio','coursera','udemy'];
const messages=[
'The blank page is much less intimidating now. I use it for a rough outline, then rewrite the final version in our own voice.',
'Worked well for turning a long brief into a manageable first draft. I still read every line before sending it to a client.',
'A useful second opinion when I am stuck on a technical problem. Providing a small, clear example makes a big difference.',
'I liked having sources to follow instead of just an answer. Checking the original pages is still part of my workflow.',
'The nicest part was keeping the code and the explanation in the same place. Bigger changes still need a careful review.',
'We had a clickable concept to discuss before spending time on a full build. That made the first feedback session much more productive.',
'Our project notes finally have a home. It took a little time to agree on templates, but that effort was worth it for our small team.',
'I prefer keeping notes connected instead of filing everything into folders. Starting with a simple setup helped me avoid overcomplicating it.',
'Fewer screenshots in chat, more feedback on the actual design. Our handoff was easier once everyone used the same file.',
'I could make a set of social graphics without starting each one from scratch. The templates helped, and we adjusted them to match our brand.',
'We separated urgent conversations from project updates and it became much easier to keep up. A few channel rules were essential.',
'Convenient for a team already using the same office tools. Guest access was the main thing we checked during our pilot.',
'We tried it for a small client workshop. Setting up the meeting was simple; a rehearsal helped us catch the audio issues early.',
'Quick meetings are easy to arrange. I would still recommend checking external guest access before a larger event.',
'Good for an ongoing group conversation. We spent some time on permissions so that newcomers could find the right channels.',
'We replaced a few status meetings with short walkthroughs. Keeping each recording focused was the real improvement.',
'It helped us keep the next piece of work visible. We kept the project structure simple rather than adding lots of process.',
'The project owner and the next action are clearer now. The first week was mostly about cleaning up the tasks we already had.',
'The board is easy to understand at a glance. We use a small number of columns so that it stays useful instead of becoming a second inbox.',
'Having documents and tasks together suited our pilot. There are lots of options, so I would decide on a few conventions first.',
'The shared view made weekly planning less scattered. We tested the permissions and reporting before inviting the whole team.',
'I mostly wanted a simple place for my next actions. It works best for me when I review the list each morning.',
'We turned a spreadsheet into a more structured workflow. Getting the field names and ownership right mattered more than the visual changes.',
'Our remote planning session felt less fragmented. We prepared the board beforehand so people could spend time on the ideas.',
'A small automation removed an annoying handoff from our process. We tested the failure cases before letting it run unattended.',
'The visual workflow helped me understand each step. I kept a test copy of the scenario while checking the edge cases.',
'Useful when we needed more control over an automation. It is worth giving one person responsibility for monitoring and maintenance.',
'We could update the site without asking a developer for every change. The content structure took some thought at the start.',
'Great for getting a polished concept in front of stakeholders. We checked the mobile layouts rather than relying only on the desktop preview.',
'We used it to test a workflow idea with a small group. Defining the data structure early made the build much easier to adjust.',
'Our publishing routine is more consistent with a clear set of templates. Keeping plugins to a minimum made the setup easier to maintain.',
'The product catalogue was straightforward to organise. We tested checkout, taxes, and order emails before calling the store ready.',
'Having contacts and follow-up tasks together gave us a clearer view. Cleaning the existing data was the biggest part of the move.',
'The pilot helped us see which fields we actually needed. We would recommend agreeing on ownership before customising everything.',
'The first campaign was easy to assemble. We spent more time checking the audience and the message than choosing a template.',
'Our newsletter workflow became simpler once the segments were organised. I would start with one clear welcome sequence.',
'It is easier to plan a week of posts in one sitting. We still review each preview before it goes out.',
'Helpful for coordinating a few social accounts. We made account permissions and the approval process part of the initial setup.',
'The research gave us several useful directions to investigate. We treated the numbers as estimates and checked the pages ourselves.',
'A good starting point for looking at search opportunities. The most useful part was turning the research into a small, realistic action list.',
'The writing brief was easier to discuss with our editor. We used the suggestions as prompts rather than a formula to follow blindly.',
'It catches awkward wording that I miss on a first pass. I still keep the final tone and specialist terminology under human review.',
'Useful for exploring a different phrasing when a sentence feels stuck. The final version still needs to sound like the writer.',
'We could focus on the conversation and review the notes afterwards. I always check names, numbers, and action owners.',
'The meeting recap gave us a useful starting point. Consent and access were important parts of our trial.',
'Editing spoken content felt less fiddly for our short videos. We still listened to the finished export before sharing it.',
'Good for quickly assembling a short clip. We checked subtitles and aspect ratios on the actual devices our audience uses.',
'We explored a few visual directions before committing to production. The results still needed selection and editing to fit the brief.',
'A helpful way to discuss a visual concept. Clear prompts and a reference mood board made the iterations more useful.',
'We tried several creative directions for a small campaign. The final assets went through the same brand review as our other designs.',
'The voice draft helped us check pacing before recording the final piece. We paid attention to pronunciations and usage permissions.',
'It was useful for prototyping a short training video. We checked the script and the presentation style with the people who would watch it.',
'Turning our notes into a presentation draft was a good time saver. We simplified the slides and verified the details before the meeting.',
'A useful starting point for a visual story. The structure improved after we replaced the generic examples with our own material.',
'We wanted a clearer process for keeping location information current. Our pilot focused on a few locations and the update workflow.',
'The evaluation helped us ask better questions about location data and ownership. We checked the directories that matter most to our business.',
'We tested it against a real questionnaire rather than a prepared demo. The useful part was seeing where the draft needed a subject expert.',
'Our trial focused on organising the answer library and review process. Naming content owners made the workflow much clearer.',
'I liked being able to fit the lessons around my week. Checking the syllabus and project requirements first helped me choose the right course.',
'I found a course that matched the skill I wanted to practice. Previewing the lessons and checking the instructor style was helpful.'
];
const aliases:Record<string,string>={monday:'monday-com',kit:'convertkit'};
const chosen=slugs.map(s=>getTool(s)||getTool(aliases[s]));const used=new Set(chosen.filter(Boolean).map(t=>t!.slug));
for(let i=0;i<chosen.length;i++)if(!chosen[i]){const next=tools.find(t=>!used.has(t.slug))!;chosen[i]=next;used.add(next.slug)}
export const demoReviews:PublishedReview[]=chosen.map((t,i)=>({id:'demo-tool-'+i,kind:'tool',slug:t!.slug,name:names[i],rating:Number((4.2+(i%8)*.1).toFixed(1)),message:messages[i],publishedAt:'2026-10-06',demo:true}));
export const demoGuideReviews:PublishedReview[]=guides.map((g,i)=>({id:'demo-guide-'+i,kind:'guide',slug:g.slug,name:names[(i+22)%names.length],rating:Number((4.4+(i%6)*.1).toFixed(1)),message:['The checklist helped us turn a vague search into a few concrete requirements. I liked having questions to take into the demo.','A useful starting point for our shortlist. The advice about testing the same task across tools was especially helpful.','I came in looking for a quick answer and left with a better pilot plan. The pricing questions gave us a clearer discussion with the vendor.','Easy to scan and practical enough to use in our next team meeting. I would like to see more examples for small teams.'][i%4],publishedAt:'2026-10-06',demo:true}));
export function previewRating(slug:string){let sum=0;for(const char of slug)sum+=char.charCodeAt(0);return Number((4.2+(sum%8)*.1).toFixed(1))}

export function exampleReviewFor(slug:string):PublishedReview|null{const tool=getTool(slug);if(!tool)return null;const index=tools.findIndex(t=>t.slug===slug);return {id:"demo-extra-"+slug,kind:"tool",slug,name:names[index%names.length],rating:previewRating(slug),message:"We tested "+tool.name+" on a small piece of our normal work before expanding the rollout. Having a clear owner and a repeatable checklist made the evaluation easier. I would recommend checking the plan limits and trying an export before committing.",publishedAt:"2026-10-06",demo:true}}
