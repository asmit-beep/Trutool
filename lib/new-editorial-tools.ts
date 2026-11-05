import type {Tool} from './catalog';

/** Reviewed from vendor submissions and public source evidence, 2 November 2026.
 * Editorial positions are not paid placements or performance rankings.
 */
export const newEditorialTools:Tool[]=[
  {
    slug:'ai-music-mastering',
    name:'AI Music Mastering',
    category:'audio-production',ai:true,
    summary:'Browser-based mastering for finished songs, including AI-generated tracks. Preview eight DSP sound profiles and adjust tone, EQ, and intensity before exporting.',
    fit:'Independent musicians, Suno or Udio users with an authorized audio file, and producers needing an accessible mastering preview before sharing a finished mix.',
    features:['Eight mastering profiles for different tonal and dynamic choices','Free original-versus-mastered listening previews','Intensity and EQ adjustments','WAV, MP3, FLAC and AIFF uploads','Paid 24-bit/16-bit WAV and 320 kbps MP3 downloads','Reference-track matching on membership'],
    caution:'Despite its name, the provider says mastering uses preset-based digital signal processing, not a trained AI model. It cannot fix a poor mix, rewrite songs or remove severe generation artifacts. Original and mastered previews are not loudness matched, so compare critically.',
    url:'https://aimusicmastering.app/',color:'#2b74d9',initial:'M',format:'Online audio mastering',
    pricing:'Free uploading, sound-profile experiments, intensity/EQ adjustments and A/B previews. The vendor lists membership at $9.90 USD/month for mastered downloads, reference matching and full history; verify current terms and cancellation before subscribing.',
    pricingUrl:'https://aimusicmastering.app/pricing/',
    keywords:'online audio mastering, music mastering, AI song mastering, Suno mastering, Udio mastering, WAV master, DSP mastering, audio loudness',
    sourceTitle:'AI Music Mastering — homepage, pricing, and about the DSP engine',
    sourceStatus:'Vendor documentation consulted',sourceChecked:'2026-11-02',sourceUrl:'https://aimusicmastering.app/',
    addedAt:'2026-11-02',updatedAt:'2026-11-02',
    profile:{
      overview:'AI Music Mastering provides a guided finishing step for a complete song. Upload a finished mono or stereo mix, compare eight tonal and dynamic mastering styles, adjust intensity or EQ and listen against the original. The browser handles the preset-based digital signal processing. Membership adds downloadable WAV or MP3 masters, reference-track matching and full saved-song history. The site specifically positions its workflow for songs created with generative-music services, but the mastering engine itself is DSP rather than a generative AI model.',
      useCases:['Compare a finished Suno, Mureka or authorized Udio export against a lightly compressed master.','Check whether a home-studio track benefits from warmer, brighter, more spatial or punchier mastering.','Prepare a downloadable WAV or MP3 from an already completed song with a paid membership.','Try reference-guided tonal and loudness matching while preserving the original mix for comparison.'],
      workflow:['Upload your authorized, finished WAV, MP3, FLAC or AIFF audio file; check that it meets the provider’s file and duration limits.','Try Universal, Natural or another of the eight mastering profiles and listen through quiet and dense song passages.','Adjust the intensity and EQ without assuming that louder automatically sounds better.','Compare the preview with your original in a level-matched player if possible.','If the result fits, review membership terms before exporting your preferred WAV or MP3 format and check the exported file.'],
      checks:['Upload limits are advertised as 200 MB and 10 minutes; supported files and device memory may still constrain browser processing.','The vendor says its DSP engine is not a trained AI mastering model; assess it as a processing and workflow product.','Original and mastered comparison audio currently plays at different loudness levels.','LUFS and true-peak report values may not remeasure later live Intensity/EQ changes.','Review privacy, cloud history, file retention, monthly renewal and whether you have rights to process the source song.'],
      notIdeal:'Not a substitute for mixing individual stems, fixing vocal balance or repairing clipping and other severe artifacts. Engineers requiring fully manual processing chains, certified loudness metering or studio-grade project delivery may prefer a digital audio workstation and specialist mastering tools.',
      faqs:[
        {question:'Does AI Music Mastering actually use AI to master tracks?',answer:'The vendor says the mastering process uses preset-based digital signal processing (DSP). AI refers primarily to the generated songs it targets, not a claim that a trained model masters the audio.'},
        {question:'Can I preview a master without paying?',answer:'Yes. The eight profiles, intensity/EQ adjustments, uploads and original-versus-mastered previews are free. Downloads and reference-track matching require membership.'},
        {question:'How much does AI Music Mastering cost?',answer:'The official pricing page lists a $9.90 USD monthly membership with recurring billing. Verify current terms before purchase.'},
        {question:'Can it export WAV and MP3?',answer:'Members can download 24-bit WAV, 16-bit WAV and 320 kbps MP3, according to the vendor’s published file specifications.'},
        {question:'Will mastering correct poor mixing or distorted AI-generated vocals?',answer:'No. The provider advises correcting serious balance, clipping or generation artifacts before mastering. A finished mix is the intended input.'}
      ]
    }
  },
  {
    slug:'book-cover-generator',
    name:'Book Cover Generator',
    category:'ai-image',ai:true,
    summary:'An AI book-cover concept studio for indie authors: enter a book title, author, genre and story summary, compare two creative directions and refine a cover.',
    fit:'Self-publishing fiction or nonfiction authors who want to explore genre-appropriate cover concepts and typography before preparing ebook or audiobook artwork.',
    features:['Book brief from title, author, genre and story summary','Two distinct proposed cover directions','Plain-language changes to composition and typography','Ebook or KDP front-cover output','Square audiobook artwork options','Free starting credits and one-time credit packs reported by the vendor'],
    caution:'The supplied and third-party descriptions concern cover concepts and front-cover exports, not a complete print-ready paperback wrap. Verify trim size, bleed, spine, font licensing and image rights before publishing. The official site could not be independently opened during this catalogue review.',
    url:'https://bookcovergenerator.net/',color:'#8945c2',initial:'B',format:'AI book cover design',
    pricing:'Reported freemium access with an initial credit allowance and optional one-time credit packs rather than a subscription. Exact current allowances, pack prices and commercial-use rights should be confirmed directly with the vendor.',
    keywords:'AI book cover generator, book cover AI, book cover design, KDP front cover, ebook cover creator, audiobook square cover, genre aware cover',
    sourceTitle:'Book Cover Generator — vendor-submitted product overview; secondary directory descriptions reviewed',
    sourceStatus:'Vendor-submitted details; official website could not be independently retrieved',sourceChecked:null,
    sourceUrl:'https://bookcovergenerator.net/',addedAt:'2026-11-02',updatedAt:'2026-11-02',
    profile:{
      overview:'Book Cover Generator is a story-first design concept tool for independent authors. Authors provide a title, author name, genre and short synopsis rather than a complicated design prompt. The product description says it proposes two different cover directions, allowing the author to compare visual genre signals before refining wording, typography and composition. Its intended exports include ebook/KDP front covers and square audiobook designs. Product details here are based on the submitted description and corroborating directory listings; the original provider site was unavailable during our verification attempt.',
      useCases:['Explore whether a thriller or romance cover communicates its genre at thumbnail size.','Compare two visual directions from the same book blurb before commissioning a final design.','Iterate on typography, title emphasis, palette or focal image using plain-language feedback.','Create a starting point for an ebook front cover or a square audiobook presentation.'],
      workflow:['Write a short creative brief with a working title, author name, genre, audience and plot summary.','Generate the two proposed visual directions and compare genre readability and title legibility at small size.','Choose a direction and request focused edits to placement, typography, imagery or colors.','Download an available ebook or square audiobook output and inspect dimensions, sharpness and text.','Before publication, confirm the file meets your distributor’s specifications and that you can use all visual elements commercially.'],
      checks:['Verify free-credit expiry, credits per generation and one-time pack prices on the vendor site.','Check exact download size, file type, resolution, watermark policy and commercial permissions.','KDP front covers are different from complete paperback wraparound covers with a back cover and spine.','Check generated imagery and typography for stock similarity, spelling errors and inconsistent letterforms.','Retain a licensed master design and consider a professional designer for complex series branding or print runs.'],
      notIdeal:'Not presented as a full design suite for exact print-spine measurements, multi-book art direction, fully editable source files or bespoke illustration. Authors requiring print-ready wraps or strict brand continuity may need separate layout/design tools.',
      faqs:[
        {question:'What is Book Cover Generator?',answer:'It is a tool for authors to generate and refine AI cover concepts from book details such as title, genre and a story synopsis.'},
        {question:'How many cover designs do you get?',answer:'The submitted product description says two distinct design directions are generated for comparison. Verify the current number and credit requirements with the provider.'},
        {question:'Can it make a KDP paperback cover?',answer:'It is described as supporting ebook/KDP front-cover artwork. A complete paperback wrap normally requires a back cover, spine and printer-specific measurements, which are not verified as supported.'},
        {question:'Is Book Cover Generator free?',answer:'The vendor describes a free credit allowance and one-time paid packs. Exact pricing was not independently verified from the official website.'},
        {question:'Can I export audiobook covers?',answer:'The submitted description includes square artwork suitable for audiobook-cover concepts. Verify dimensions and store requirements before distribution.'}
      ]
    }
  },
  {
    slug:'transly',
    name:'Transly',
    category:'ai-translation',ai:true,
    summary:'Transly is a mobile AI translator for live speech, face-to-face conversations, saved-video subtitles and translated messages using an iPhone keyboard.',
    fit:'Travelers, international students and teams who need mobile speech translation, bilingual subtitles or drafted translations across supported messaging apps.',
    features:['Live speech translation with bilingual subtitles','Two-way conversation interpretation modes','Local video playback with translated subtitles','iPhone translation keyboard for messages and email','Multiple language options and translated speech output','Free app download with optional in-app subscriptions'],
    caution:'Live voice, video and keyboard modes depend on device, app compatibility, network and purchased plan. Translations can misinterpret names, numbers or specialized terminology; review important communications with a qualified human. Do not confuse this Vector Lightyear product with similarly named unrelated translator apps.',
    url:'https://www.transly.app/',color:'#255acb',initial:'T',format:'Mobile AI translation',
    pricing:'Free to download with in-app purchases. Subscription options and prices vary by device, region and plan; review the current App Store listing and in-app terms before purchase.',
    pricingUrl:'https://apps.apple.com/in/app/transly-real-time-translate/id6743425444',
    keywords:'Transly, voice translator, live speech translation, bilingual subtitles, conversation translator, translation keyboard, translated video subtitles',
    sourceTitle:'Transly by Qingdao Vector Lightyear — official product website and Apple App Store listing',
    sourceStatus:'Vendor website and App Store listing consulted',sourceChecked:'2026-11-02',sourceUrl:'https://www.transly.app/',
    addedAt:'2026-11-02',updatedAt:'2026-11-02',
    profile:{
      overview:'Transly is a mobile translation application from Vector Lightyear that combines several communication workflows in one place. It can display original and translated speech during a lecture or live conversation, support a two-person exchange with each person speaking their own language, translate subtitles for a video saved on the device, and prepare translated message or email drafts through an iPhone keyboard. The vendor also advertises cross-app audio/subtitle scenarios. Feature availability varies across platforms, regions and releases.',
      useCases:['Follow part of a lecture, travel presentation or tour using live bilingual captions.','Use two-way translation for short face-to-face interactions such as directions or check-in.','Watch an authorized local video while reading translated subtitles.','Draft translated replies in messaging or email apps that support third-party keyboards.','Export supported subtitle text or SRT files when available for future reference.'],
      workflow:['Install Transly from the official app store listing for your device and review app permissions.','Choose the live speech, face-to-face conversation, saved-video or keyboard mode for your task.','Select source and target languages and check available speech/output modes.','For conversations, speak clearly and verify proper nouns, prices, dates and other critical details.','For keyboard drafts or subtitles, review the output before sharing, sending or relying on it.'],
      checks:['Confirm your device and platform support: iPhone keyboard features require third-party-keyboard compatibility.','Official iOS information lists a free download with multiple in-app subscription options; prices depend on region and period.','Video translation of a locally saved file still requires internet connectivity, according to the App Store listing.','Live captions and spoken translations are aids, not certified interpreting for medical, legal or emergency use.','Check microphone, keyboard Full Access, privacy policies, language availability and current data-handling practices.'],
      notIdeal:'Not a substitute for a certified interpreter or professional translation of regulated documents. Offline-only workflows, fully private on-device processing and platform-specific keyboard behavior should not be assumed without checking the exact mode and release.',
      faqs:[
        {question:'What is Transly?',answer:'Transly is a mobile AI translation app with live voice translation, two-way conversations, bilingual video subtitles and an iPhone translation keyboard.'},
        {question:'Does Transly support two-way conversations?',answer:'Yes. The vendor and official iOS listing describe a mode in which two people can take turns speaking different languages using one device.'},
        {question:'Can it translate videos?',answer:'The app supports subtitles for a saved local video. The App Store listing says the video translation still requires an internet connection.'},
        {question:'Is Transly free to use?',answer:'It is free to download with in-app purchases. Features, allowances and subscription prices should be checked in the app or official App Store listing.'},
        {question:'Does the keyboard work inside every app?',answer:'No. Translation keyboard access depends on whether the app or field allows third-party keyboards, and users should review the translated message before sending.'}
      ]
    }
  },
  {
    "slug": "flamingo-float-ai",
    "name": "Flamingo Float AI",
    "category": "ai-video",
    "ai": true,
    "summary": "Flamingo Float AI turns one consenting adult's photo into a short, vertical AI video of a pink flamingo float drifting toward a Dubai rooftop infinity-pool edge before a friend pushes it back. A fixed trend template avoids manual prompting.",
    "fit": "Adult social creators, short-form video makers and friends trying the specific 'Hey Bro, Thank You Bro' flamingo-float trend rather than a general-purpose text-to-video editor.",
    "features": [
      "Upload one clear adult portrait to produce a themed AI video",
      "Pre-designed Dubai rooftop pool and pink flamingo-float scene",
      "Automatic drift-toward-the-edge and friend-push-back sequence",
      "Reported 11-second output in vertical 9:16 MP4 format",
      "No written prompt or manual timeline editing required for the described template",
      "One-time credit packs rather than a required recurring subscription, according to the submission",
      "Output intended for short-form social video sharing"
    ],
    "caution": "This is a narrowly focused novelty template, not a full AI video editor. The vendor submitted the workflow, runtime and no-subscription claims, but direct verification of the official site was unavailable on 4 November 2026. Independent listings report 480p output; verify resolution, watermark, sound, credits charged per render, photo-retention terms and commercial use before purchasing. Upload only an adult's likeness with their informed permission and label synthetic footage appropriately.",
    "url": "https://flamingofloatai.com/",
    "color": "#e481b7",
    "initial": "F",
    "format": "Template-based photo-to-video AI",
    "pricing": "The vendor describes one-time credit packages starting at US$9.90 without a subscription. A third-party listing shows 100 credits for US$9.90, but the exact number of credits consumed by an 11-second render and the current checkout price have not been independently verified. Check total cost before generating.",
    "keywords": "Flamingo Float AI, flamingo float video, hey bro thank you bro, Dubai rooftop pool AI video, photo to video, AI video trend, 11 second 9:16 MP4, vertical short-form social clips, flamingo float generator, one-time AI video credits",
    "sourceTitle": "Vendor submission received 4 November 2026; AISO Tools product listing",
    "sourceStatus": "Vendor-submitted description; official website could not be independently verified",
    "sourceUrl": "https://aisotools.com/tool/flamingo-float-ai",
    "addedAt": "2026-11-04",
    "updatedAt": "2026-11-04",
    "profile": {
      "overview": "Flamingo Float AI is a narrowly focused image-to-video website built around the 'Hey Bro, Thank You Bro' flamingo-float trend. According to its team, the user uploads one clear photo of a consenting adult and the service places that person on a pink flamingo pool float in a Dubai-style rooftop infinity pool. In the preset sequence, the float drifts toward the edge and a friend pushes it back. The submitted description calls the result an approximately 11-second vertical MP4. The point is a ready-made social effect: there is no requirement to write a motion prompt, find stock footage, or assemble a timeline. It is not a flexible video-editing suite: buyers are choosing a specific aesthetic and motion sequence. Independent directory listings corroborate the single-photo, fixed-template, vertical-video premise; resolution, generation consistency, checkout economics and how long uploaded images are kept require direct confirmation. This is synthetic footage and should never be recreated as a real rooftop-pool stunt.",
      "useCases": [
        "Create a short fictional 'thank you bro' video using your own portrait for a social post or group chat.",
        "Make an opt-in clip featuring an adult friend as the person on the float, then review it together before sharing.",
        "Test a one-photo, preconfigured trend workflow without learning video prompts or editing timelines.",
        "Compare a purpose-built social template with general AI video tools when the desired scene is specifically a rooftop pool and pink flamingo float.",
        "Produce a vertical clip for short-form social content, subject to the platform's rules and the service's usage rights.",
        "Use the result as an AI-labelled comedic or novelty visual, not as evidence of an actual near-accident."
      ],
      "workflow": [
        "Visit the product website, review its current privacy, content, age and purchase terms, and confirm the effect available matches the vendor's description.",
        "Choose a clear photograph of yourself or another adult who has explicitly agreed to the image being processed and used in an AI video. Avoid unclear faces or multiple people in the source photo.",
        "Upload the photograph to the Flamingo Float effect. The provider describes a predefined rooftop-pool scene, so no custom motion prompt is needed.",
        "Review the displayed credit cost, resolution, watermark policy and whether unused credits expire before paying or confirming the render.",
        "Generate the clip. Watch the full output for likeness errors, distorted hands, scene continuity and whether the described rescue moment is actually present.",
        "Download the resulting vertical MP4, check audio and framing in your target social app, and use an AI/synthetic-content label when posting."
      ],
      "checks": [
        "Scope: the submitted offering is a single trend-specific template, not open-ended image-to-video generation or a timeline editor.",
        "Input rights: upload only your own portrait or another adult's photo with explicit permission; verify how the service stores and deletes source faces.",
        "Output: the team describes about 11 seconds, 9:16 orientation and MP4 delivery; independently retrieved directory pages also describe a 480p tier. Check actual file properties before buying.",
        "Pricing: one-time credits are reported from US$9.90; a third-party directory lists 100 credits at that price. Confirm credits required for this exact template and whether failed runs receive refunds.",
        "Controls: no prompting is said to be needed, but scene customisation, multiple subjects, aspect ratios, text overlays and soundtrack rights were not confirmed.",
        "Continuity: look for facial consistency throughout the drift, natural movement and convincing placement on the float; no independent generation benchmark was conducted.",
        "Safety: footage of a pool-edge rescue is fictional; do not attempt the stunt with a real person or inflatable at an elevated pool.",
        "Use rights: clarify reuse of music, audio, the template's style, generated likeness and commercial licensing before using it in ads.",
        "Availability: TruTool could not directly retrieve the official website during its November 4 check; verify the site and current terms independently."
      ],
      "notIdeal": "Not a fit for filmmakers who need camera control, multiple scenes, precise storyboards, editable timelines, horizontal 16:9 video, higher resolution or reliable brand-safe production. The service's ability to preserve likeness, remove watermarks, offer commercial-use rights or support custom scenes was not independently established. Avoid using the output to mislead viewers into thinking a real person nearly fell from a rooftop pool.",
      "faqs": [
        {
          "question": "What is Flamingo Float AI?",
          "answer": "It is a single-effect, photo-to-video tool described by its team as turning a consenting adult's portrait into a short, fictional rooftop-pool clip featuring a pink flamingo float and a friend pulling it back from the edge. The offer targets the 'Hey Bro, Thank You Bro' social trend."
        },
        {
          "question": "Do I need to write prompts or edit a video?",
          "answer": "The vendor submission says no. The effect is presented as a predefined scene, and users reportedly upload one photo and generate the clip. Full editing controls are not verified."
        },
        {
          "question": "How long is the clip and which format is used?",
          "answer": "The submitted specifications describe an approximately 11-second vertical 9:16 MP4. A secondary directory also describes 480p output; confirm the current downloadable file quality and audio before purchasing."
        },
        {
          "question": "Is Flamingo Float AI free?",
          "answer": "The team describes one-time paid credit packs starting at US$9.90 and no subscription. An independent listing gives 100 credits for that amount. TruTool could not independently confirm credits charged per completed video or a free trial."
        },
        {
          "question": "Can I upload a photo of someone else?",
          "answer": "Only when the person is an adult who has explicitly consented to the upload and to creation of synthetic video using their likeness. Review the site's privacy and deletion policy; do not upload strangers or public figures without authorization."
        },
        {
          "question": "Can I change the Dubai scene, video length or soundtrack?",
          "answer": "The supplied product description focuses on a fixed Dubai-style rooftop scene. Alternate locations, durations, sound controls, watermark removal and commercial soundtrack rights have not been verified."
        },
        {
          "question": "Is the resulting rooftop stunt real?",
          "answer": "No. It is presented as AI-generated fiction. Do not attempt to recreate the pool-edge sequence in real life; identify the clip as synthetic when posting it."
        },
        {
          "question": "Is Flamingo Float AI the same as a full video-generation platform?",
          "answer": "No. It is a purpose-built trend generator for a specific scene. For original scripts, character control, multiple shots, detailed visual prompting or broader editing, compare a general-purpose AI video platform."
        }
      ]
    }
  },
{
  "slug": "outstanding-tiny-desk-ai",
  "name": "Outstanding Tiny Desk AI",
  "category": "ai-video",
  "ai": true,
  "summary": "Outstanding Tiny Desk AI converts one to five authorized adult portraits into a roughly 19-second vertical desk-concert video. Assign a lead singer and optional band members, then download a 480p MP4 with prepared sound.",
  "fit": "Friends, creators and social-media users making a short, personalized mock concert from portraits without filming performances, recording vocals or writing video prompts.",
  "features": [
    "Five cast positions: lead singer, front microphone, two backing singers and saxophone player",
    "One required photo and up to four optional bandmate portraits",
    "About 19 seconds of 9:16, 480p MP4 with a prepared soundtrack",
    "Prepared concert scene with lead close-ups and saxophone solo",
    "Private result download for seven days",
    "One-time credit packs with no subscription"
  ],
  "caution": "This is an independent parody-style effect, not an NPR Tiny Desk product or a tool for original concert production. AI may change faces, hand details or cast positions. Use consenting adult photos, check permitted use of the supplied soundtrack and label synthetic content when posting.",
  "url": "https://outstanding-tiny-desk.net/",
  "color": "#2b5c90",
  "initial": "O",
  "format": "AI photo-to-concert video",
  "pricing": "The vendor lists one video for $9.90, three for $19.90 or five for $29.90, paid once. Each finished video uses 100 credits, supports 1–5 portrait roles at the same price and has no advertised free generation. Verify checkout terms before purchase.",
  "pricingUrl": "https://outstanding-tiny-desk.net/pricing",
  "keywords": "outstanding tiny desk AI, tiny desk meme generator, photo to concert video, AI band video, portrait to video with music, video template",
  "sourceTitle": "Outstanding Tiny Desk AI — homepage, FAQ and pricing",
  "sourceStatus": "Vendor pages consulted",
  "sourceUrl": "https://outstanding-tiny-desk.net/",
  "sourceChecked": "2026-11-05",
  "addedAt": "2026-11-05",
  "updatedAt": "2026-11-05",
  "profile": {
    "overview": "Outstanding Tiny Desk AI is a single-concept photo-to-video generator designed around a miniature desk-concert scene. Rather than asking for a written video prompt, it provides five preset performer slots. You must add a photo for the lead vocalist; the front microphone, left and right backing vocalists and saxophone role are optional. Unfilled roles keep reference performers, so you can make a one-person clip or cast a group of friends without paying per face. The vendor describes a roughly 19-second, 480p vertical MP4 with prepared audio, including lead close-ups and a saxophone passage. This is best assessed as a playful effect, not as a full music-video editor.",
    "useCases": [
      "Put yourself at the lead microphone and add friends as an imaginary desk-concert band.",
      "Make a group-chat joke or celebration clip from up to five consenting adult portraits.",
      "Create a short 9:16 social post based on a prebuilt performance template rather than filming.",
      "Test a simple person-to-performer effect before considering broader AI video suites."
    ],
    "workflow": [
      "Choose a clear, front-facing portrait of a consenting adult for the required lead-singer slot.",
      "Optionally upload separate portraits for front mic, backing singers and saxophone roles; match the role labels to the people you want.",
      "Check the effect sample, output specifications and one-time credit-pack price before signing in or paying.",
      "Purchase a pack and explicitly start the generation; paying for credits alone does not begin a video.",
      "Inspect face consistency and roles in the finished clip, then download the private MP4 before its seven-day retention window ends."
    ],
    "checks": [
      "Ask whether photos are authorized, everyone pictured is an adult and all participants consent to a synthetic performance.",
      "Compare the preview against the full 480p output; several people in one scene can cause identity drift.",
      "Remember that there is no free generation and that a confirmed failure returns credits rather than automatically refunding a card.",
      "Confirm the rights and platform rules that apply to the supplied soundtrack and any parody references.",
      "Download the file locally within seven days and check how input photos are retained or deleted."
    ],
    "notIdeal": "Not suited to general-purpose text-to-video, custom choreography, voice cloning, editing long music videos or producing a documentary recording of a real concert.",
    "faqs": [
      {
        "question": "Can Outstanding Tiny Desk AI work with one photo?",
        "answer": "Yes. Only the lead-singer portrait is mandatory; optional performer roles retain reference actors if left empty."
      },
      {
        "question": "How long and what format is the output?",
        "answer": "The vendor advertises roughly 19 seconds with sound in a 9:16, 480p MP4."
      },
      {
        "question": "Does the price increase for five people?",
        "answer": "No. The product lists the same 100-credit cost per video for one to five performer roles; a single video currently starts at $9.90."
      },
      {
        "question": "Is it free or subscription-based?",
        "answer": "The vendor advertises no free generation and sells one-time video packs rather than a recurring subscription."
      },
      {
        "question": "Is this an official NPR Tiny Desk generator?",
        "answer": "No. The site identifies itself as an independent AI video tool and disclaims affiliation with NPR and the referenced musicians."
      }
    ]
  }
},
{
  "slug": "genjutsu-lite",
  "name": "Genjutsu Lite",
  "category": "ai-video",
  "ai": true,
  "summary": "Genjutsu Lite is an independent photo-to-video template studio with three prepared scenes: a two-pet NEON dance, a full-body solo dance and a fictional car stunt. Its public examples list Seedance models, durations, sizes and audio.",
  "fit": "Creators who prefer selecting an illustrated video template and uploading authorized photos to writing prompts or editing an entire video timeline.",
  "features": [
    "NEON Duo Dance using two pet portraits",
    "Beat Drop Dance using one full-body adult portrait",
    "Roadster Ramp using a clear car photo",
    "Public before-and-after examples with output dimensions and audio notes",
    "One-time credits and private video history",
    "Seedance 2.0 and 2.5 models cited for the published examples"
  ],
  "caution": "Despite the name, this independent site is not affiliated with Higgsfield and does not offer its official Genjutsu models. Template outputs have different aspect ratios and sound behavior; the car-stunt sample becomes silent near the end. Custom reference-video uploads are not currently available.",
  "url": "https://genjutsulite.org/",
  "color": "#4e6c9f",
  "initial": "G",
  "format": "AI photo-to-video templates",
  "pricing": "The vendor lists 100 credits per completed template video, with one-time packs starting at $9.90 for 100 credits, $19.90 for 300 and $29.90 for 500. Viewing public examples is free; generating a private result requires purchased credits.",
  "pricingUrl": "https://genjutsulite.org/",
  "keywords": "Genjutsu Lite, AI photo to video, Seedance video templates, pet dance generator, beat drop dance, AI car stunt, AI video examples",
  "sourceTitle": "Genjutsu Lite — homepage, template specifications and About",
  "sourceStatus": "Vendor pages consulted",
  "sourceUrl": "https://genjutsulite.org/",
  "sourceChecked": "2026-11-05",
  "addedAt": "2026-11-05",
  "updatedAt": "2026-11-05",
  "profile": {
    "overview": "Genjutsu Lite packages several fixed video ideas into a photo-first studio. Its NEON Duo Dance demonstrates two pets sharing a dance; Beat Drop Dance animates a solo full-body person; and Roadster Ramp shows a fictional vehicle performing an impossible jump. The website displays source images beside generated examples, discloses the Seedance versions used and identifies differing lengths and resolutions. The results are not interchangeable: its 23-second pet dance is landscape, while the car stunt is portrait and can end without sound. The product should be evaluated as a small template library, not an unrestricted text-to-video service or a gateway to Higgsfield’s namesake model.",
    "useCases": [
      "Animate two pet portraits in a prepared dance for a playful social clip.",
      "Turn a well-framed full-body adult image into a short solo dance.",
      "Make a clearly fictional car-stunt visual from a car photo without physical filming.",
      "Watch actual example outputs and compare framing, motion and audio before spending credits."
    ],
    "workflow": [
      "Review the three examples and select a template with the intended subject, photo count and output shape.",
      "Choose authorized input images; use one pet per photo for the duo, full-body framing for the solo or the full vehicle for Roadster.",
      "Review the template’s sample duration and audio notes rather than assuming every clip is vertical or has continuous music.",
      "Sign in, purchase a one-time credit pack and start a generation; local drafts are not uploaded until you submit.",
      "Inspect the generated result, look for visual distortions, then download the private file within the listed retention period."
    ],
    "checks": [
      "Confirm the sample specifications for the particular template; advertised examples use different model versions and dimensions.",
      "The Roadster sample’s soundtrack fades near 10 seconds, leaving a silent ending.",
      "Custom reference-video upload is described as coming soon, not a currently supported feature.",
      "Authorized pets, consenting adults and lawful vehicle imagery should be used; do not portray an AI stunt as real.",
      "Compare how the vendor handles an unresolved generation versus a confirmed failure and when credits are returned."
    ],
    "notIdeal": "Not designed for general scene scripting, custom dance choreography, uploading an original reference clip, cinematic multi-shot editing or official Higgsfield Genjutsu access.",
    "faqs": [
      {
        "question": "Is Genjutsu Lite an official Higgsfield product?",
        "answer": "No. The website states that it is independent and uses Seedance 2.0 and 2.5 in its published examples, not official Higgsfield Genjutsu models."
      },
      {
        "question": "Which video templates are available?",
        "answer": "The site presents NEON Duo Dance, Beat Drop Dance and Roadster Ramp, each with different photo requirements."
      },
      {
        "question": "Does every generated video have the same aspect ratio?",
        "answer": "No. The documented samples include landscape dances and a portrait car stunt. Check the chosen template."
      },
      {
        "question": "How much is a generation?",
        "answer": "Each template uses 100 credits. The smallest listed one-time pack is $9.90 for 100 credits."
      },
      {
        "question": "Can I upload my own reference video?",
        "answer": "Not yet. The site marks custom reference-video uploads as coming soon."
      }
    ]
  }
},
{
  "slug": "bicep-heart-ai",
  "name": "Bicep Heart AI",
  "category": "ai-video",
  "ai": true,
  "summary": "Bicep Heart AI animates one consenting adult portrait into a seven-second vertical video showing the one-arm flex-and-heart gesture, with prepared music and a downloadable MP4.",
  "fit": "Short-form creators, friends and social media users who want one specific bicep-heart reaction or greeting without filming the gesture themselves.",
  "features": [
    "One adult portrait with face, waist and both arms visible",
    "Prepared bicep-heart motion; no written video prompt required",
    "About 7 seconds of vertical 480p MP4",
    "Music-included download and optional silent download",
    "One-time 1-, 3- and 5-video packs",
    "Private result history with seven-day downloads"
  ],
  "caution": "This is a narrowly defined motion template, not a full video editor. AI may distort fingers, elbows or facial identity. Use consenting adult portraits, inspect motion frame by frame and review music rights and synthetic-media labeling before posting.",
  "url": "https://bicepheartai.com/",
  "color": "#aa517b",
  "initial": "B",
  "format": "AI gesture video generator",
  "pricing": "One-time packs are advertised at $4.99 for one video, $9.99 for three and $14.99 for five; each video uses 100 credits. No recurring subscription is advertised. Confirm the current checkout and refunds policy.",
  "pricingUrl": "https://bicepheartai.com/pricing",
  "keywords": "bicep heart AI, bicep heart video generator, one arm heart pose, photo to video, AI gesture animation, 7 second social video",
  "sourceTitle": "Bicep Heart AI — homepage, specifications and pricing",
  "sourceStatus": "Vendor pages consulted",
  "sourceUrl": "https://bicepheartai.com/",
  "sourceChecked": "2026-11-05",
  "addedAt": "2026-11-05",
  "updatedAt": "2026-11-05",
  "profile": {
    "overview": "Bicep Heart AI is a photo-to-motion tool dedicated to the viral bicep-heart pose, in which one arm flexes and the opposite hand makes a small heart against the bicep. The user supplies one clear adult photo; the website provides the movement so no video prompt or camera performance is required. The vendor describes a seven-second vertical 480p MP4 with music, and offers a silent download of the completed frames. Its one-time purchase model is inexpensive for an isolated reaction clip, but the single-purpose effect cannot replace a more flexible animation or video-editing product.",
    "useCases": [
      "Animate a portrait as a playful message for a friend or partner.",
      "Make a short reaction clip formatted for social feeds or stories.",
      "Compare whether a fixed, low-cost video effect meets a need better than a full editor.",
      "Export the silent result and choose a different platform-licensed sound later."
    ],
    "workflow": [
      "Choose a photo of one consenting adult facing forward, with head, waist and both arms in view.",
      "Review the real generated sample and the seven-second movement sequence; avoid a face-only or tightly cropped image.",
      "Choose a one-, three- or five-video credit pack and complete sign-in and checkout.",
      "Start the generation yourself after paying; purchasing credits alone does not begin rendering.",
      "Inspect hands and the heart shape, download with or without music and save the result before the retention window closes."
    ],
    "checks": [
      "The image should show both arms; cropped elbows and obscured hands increase the risk of an unusable result.",
      "The prepared pose is a bicep heart, not an overhead heart made with both arms.",
      "The published result is roughly seven seconds and 480p, not a high-resolution custom animation.",
      "The site advertises one-time packs; a confirmed rendering failure returns reserved credits, not automatically a card refund.",
      "Check consent, platform labeling rules and whether you can legally reuse the included music."
    ],
    "notIdeal": "Not appropriate for arbitrary motion prompts, multi-person dances, long video projects, brand ads that require precise gesture continuity or professional character animation.",
    "faqs": [
      {
        "question": "What does Bicep Heart AI generate?",
        "answer": "It turns one adult portrait into a roughly seven-second vertical video of the one-arm bicep-heart gesture."
      },
      {
        "question": "Does it need a text prompt?",
        "answer": "No. The hand-and-arm movement is a prepared effect; the user selects a portrait."
      },
      {
        "question": "What is the starting price?",
        "answer": "The official pricing page lists a one-video pack for $4.99, with larger one-time packs also available."
      },
      {
        "question": "Can I download without music?",
        "answer": "Yes. The vendor advertises a silent download option for completed results without additional generation credits."
      },
      {
        "question": "What photo works best?",
        "answer": "A clear front-facing portrait showing the head, waist and both arms; the provider requires a consenting adult."
      }
    ]
  }
},
{
  "slug": "chipmunks-dance-ai",
  "name": "Chipmunks Dance AI",
  "category": "ai-video",
  "ai": true,
  "summary": "Chipmunks Dance AI puts one to three authorized adult portraits into a fixed three-person meme dance and delivers a 15-second, 480p vertical MP4 with reference audio.",
  "fit": "Friends, couples and small groups joining a social dance trend with still photos rather than recording choreography.",
  "features": [
    "One required middle dancer and optional left and right portraits",
    "Fixed three-person dance with unused roles retaining reference dancers",
    "15-second, 9:16, 480p MP4 including audio",
    "One-time credit packs with no subscription",
    "Private downloads available for seven days",
    "No watermark on the finished file, per the vendor"
  ],
  "caution": "This is an independent fan-oriented trend tool, not affiliated with the Alvin and the Chipmunks franchise. The reference music is included but is not a license to republish it commercially. Movement and likeness may vary, particularly when dancers cross; use consenting adult portraits.",
  "url": "https://chipmunksdance.org/",
  "color": "#986e49",
  "initial": "C",
  "format": "AI meme dance video",
  "pricing": "The vendor lists $9.90 for one video, $19.90 for three and $29.90 for six, as one-time packs. Each video takes 100 credits and supports one to three portraits at the same cost; there is no free generation advertised.",
  "pricingUrl": "https://chipmunksdance.org/",
  "keywords": "chipmunks dance AI, chipmunks dance meme, photo to dance video, AI trio dance, 15 second vertical MP4, AI social video",
  "sourceTitle": "Chipmunks Dance AI — homepage, pricing, privacy and About",
  "sourceStatus": "Vendor pages consulted",
  "sourceUrl": "https://chipmunksdance.org/",
  "sourceChecked": "2026-11-05",
  "addedAt": "2026-11-05",
  "updatedAt": "2026-11-05",
  "profile": {
    "overview": "Chipmunks Dance AI adapts a recognizable social dance routine to photos of one, two or three adults. Users assign individual portraits to the middle, left or right dancer; the middle portrait is required, and empty side positions retain the reference performers. The vendor advertises a fixed 15-second vertical MP4 at 480p with reference audio, rather than a fully configurable dance. A single video costs the same whether one or three identities are personalized. The site says the downloaded file has no watermark and is kept privately for a limited period. Its strongest fit is a lightweight meme clip, not a custom character or choreography workflow.",
    "useCases": [
      "Put three friends into one fixed dance scene without coordinating a real shoot.",
      "Create a social joke with only one or two portraits while keeping the default remaining performers.",
      "Make a 9:16, 15-second clip for a short-video platform using a preset trend.",
      "Experiment with a photo-to-video effect before spending time on more advanced video tools."
    ],
    "workflow": [
      "Select a clear portrait of a consenting adult for the required middle dancer.",
      "Optionally add separate left and right portraits; do not place multiple faces into one slot.",
      "Preview the sample and confirm the 15-second, 480p result and the terms for reference audio.",
      "Purchase a one-time video pack and explicitly start generation using an authorized account.",
      "Review face identity and transitions, then download the MP4 within seven days and follow the destination platform’s music and AI-label rules."
    ],
    "checks": [
      "The vendor accepts one adult per portrait slot and does not support automatically splitting a group photo.",
      "Faces and clothing can shift as dancers overlap or change positions.",
      "The reference soundtrack is included, but the tool does not grant rights to the underlying music.",
      "Videos remain downloadable for seven days; input photos have separate processing and retention terms.",
      "This is an independently operated fan tool, not an official franchise or artist product."
    ],
    "notIdeal": "Not for original multi-scene choreography, adding child photos, generating characters from the cartoon franchise, selecting arbitrary soundtracks or ensuring exact likeness.",
    "faqs": [
      {
        "question": "Do I need three photos?",
        "answer": "No. The middle dancer is required; the left and right slots are optional and retain the reference performers when unused."
      },
      {
        "question": "How long is the result?",
        "answer": "The vendor advertises a fixed 15-second vertical 480p MP4 with sound."
      },
      {
        "question": "Is Chipmunks Dance AI free?",
        "answer": "No. The site lists a $9.90 one-video pack and says there is no free generation credit."
      },
      {
        "question": "Is the finished video watermarked?",
        "answer": "The vendor says the downloaded MP4 has no watermark."
      },
      {
        "question": "Does it grant rights to the original music?",
        "answer": "No. Reference audio is included, but publication and music clearance remain the user’s responsibility."
      }
    ]
  }
},
{
  "slug": "neon-dance-ai",
  "name": "NEON Dance AI",
  "category": "ai-video",
  "ai": true,
  "summary": "NEON Dance AI turns two adult portraits or two pet photos into a prepared NEON-inspired duo-dance video. The submitted site advertises about 23 seconds of landscape 480p MP4 with music.",
  "fit": "Adults and pet owners creating a two-person or two-pet dance clip around a fixed routine rather than editing choreography from scratch.",
  "features": [
    "Separate photo slots for two adults or two pets",
    "Prepared two-dancer routine without prompt writing",
    "About 23-second landscape 16:9 MP4 in the 480p tier",
    "Music included with the downloaded video",
    "One-time credit packs, starting at one video",
    "Private completed-video download window of seven days"
  ],
  "caution": "For the exact submitted domain neondanceai.org, the published output is landscape 16:9, not vertical. The site disclaims affiliation with A2O LITE, and people and pets cannot be mixed in one clip. Be cautious about soundtrack rights, synthetic-media labels and distorted likeness during turns.",
  "url": "https://neondanceai.org/",
  "color": "#9265c2",
  "initial": "N",
  "format": "AI duo-dance video",
  "pricing": "The submitted vendor’s site advertises $9.90 for 100 credits (one video), $19.90 for 300 credits and $29.90 for 500 credits, paid once with no automatic renewal. Each finished NEON dance uses 100 credits.",
  "pricingUrl": "https://neondanceai.org/",
  "keywords": "NEON Dance AI, A2O LITE dance AI, photo to duo dance, pet dance AI, two photo dance generator, 23 second AI dance, landscape MP4",
  "sourceTitle": "NEON Dance AI (neondanceai.org) — homepage and Terms",
  "sourceStatus": "Vendor pages consulted",
  "sourceUrl": "https://neondanceai.org/",
  "sourceChecked": "2026-11-05",
  "addedAt": "2026-11-05",
  "updatedAt": "2026-11-05",
  "profile": {
    "overview": "NEON Dance AI is a specialized photo-to-video generator built around a prepared two-dancer routine associated with the NEON trend. Users choose separate portraits for the main dancer and partner, either two adults or two pets, then pay for a fixed video effect instead of entering a text prompt. The exact domain in this listing, neondanceai.org, specifies an approximately 23-second, 480p MP4 in 16:9 landscape with the prepared music. This matters because similarly named NEON tools advertise different resolutions and clip formats; their specifications should not be merged. Vendor examples show the concept, but identity and motion fidelity may vary across inputs.",
    "useCases": [
      "Put two consenting friends into a prepared dance routine for a personal clip.",
      "Create a synchronized pet-dance joke from two separate pet portraits.",
      "Preview a set choreography and soundtrack before deciding whether to buy a video.",
      "Use a finished landscape clip where 16:9 framing is acceptable or crop it later with caution."
    ],
    "workflow": [
      "Select either two adult portraits or two pet photos; mixed human-and-pet pairs are not supported by this template.",
      "Upload one clear subject per slot and check which will be the main dancer and dance partner.",
      "Review the landscape 16:9 sample, music and expected 480p quality before purchase.",
      "Buy a one-time 100-credit-or-larger pack and start the generation after checkout.",
      "Watch the full clip for face, paw, outfit and movement changes; download the private MP4 within seven days."
    ],
    "checks": [
      "Do not call this tool a 9:16 vertical generator; the site says the NEON output is 16:9 landscape.",
      "The service requires either two adults or two pets, not an adult-and-pet mix.",
      "Reference music is part of the output but does not automatically provide publishing rights.",
      "The site is an independent project rather than an official A2O LITE product.",
      "Check identity shifts, photo retention and the difference between credits released on failure and payment refunds."
    ],
    "notIdeal": "Not for vertical-native exports, multi-person groups larger than two, mixed human-and-pet duos, full video editing, arbitrary choreography or official music-video licensing.",
    "faqs": [
      {
        "question": "Is the output vertical or landscape?",
        "answer": "The exact submitted domain neondanceai.org states that the output is roughly 23 seconds, 480p MP4 in 16:9 landscape."
      },
      {
        "question": "Can I use pet photos?",
        "answer": "Yes. The site supports two pet portraits, or separately two adult portraits; the two types cannot be mixed in one video."
      },
      {
        "question": "Is there a free generation?",
        "answer": "The site advertises paid one-time packs starting at $9.90 for one video."
      },
      {
        "question": "Does it include music?",
        "answer": "Yes. The vendor describes a prepared music track included in the downloaded MP4."
      },
      {
        "question": "Is it officially affiliated with A2O LITE?",
        "answer": "No. The website identifies its NEON dance project as independent and not endorsed by the artist."
      }
    ]
  }
},
{
  "slug": "edform",
  "name": "Edform",
  "category": "edtech",
  "ai": true,
  "summary": "Edform is an all-in-one teaching platform for interactive quizzes, PDF worksheets, lessons, classroom games, assessments and AI-assisted teaching materials, with automatic grading and classroom integrations.",
  "fit": "K–12 and ESL/EFL teachers, tutors and schools looking to create materials, deliver class activities and review student performance in one browser-based workspace.",
  "features": [
    "Auto-graded quizzes and interactive PDF worksheets",
    "Live, team and arcade classroom games",
    "Lessons, video activities and classroom screen utilities",
    "Over 100 AI educator tools for lesson plans, quizzes and rubrics",
    "Assignments, gradebooks and per-question reporting",
    "Google Classroom, Microsoft Teams, ClassLink and LTI 1.3 LMS integrations",
    "Student join codes without mandatory email accounts"
  ],
  "caution": "Although the Basic plan advertises all core teaching features, it includes only five AI points each month; high-volume AI drafting may require Pro. Teachers must review AI-generated materials, student data policies and school or district agreements. Some integrations depend on LMS configuration.",
  "url": "https://edform.com/",
  "color": "#3767bd",
  "initial": "E",
  "format": "Teaching and assessment platform",
  "pricing": "The official site describes a free Basic plan with all core classroom features and five monthly AI points. Pro provides 300 AI points per teacher each month; schools can buy reassignable seats. Check the current plan prices, point allowances and school contract terms with Edform.",
  "pricingUrl": "https://edform.com/pricing",
  "keywords": "Edform, EdTech, online quiz maker, interactive worksheets, PDF worksheet maker, classroom games, AI lesson plans, teacher assessment, auto grading, LTI learning platform",
  "sourceTitle": "Edform — homepage, features, integrations and AI help",
  "sourceStatus": "Vendor pages consulted",
  "sourceUrl": "https://edform.com/",
  "sourceChecked": "2026-11-05",
  "addedAt": "2026-11-05",
  "updatedAt": "2026-11-05",
  "profile": {
    "overview": "Edform combines content creation, classroom delivery and assessment in one browser-based teacher platform. Educators can turn PDFs into interactive worksheets, build automatically graded quizzes, teach with live games and lessons, assign homework and review performance at a student or question level. The product also offers a library of prepared activities and many AI-assisted drafting tools for lesson plans, quizzes, rubrics, exit tickets and family communication. Students can join activities with codes rather than supplying email addresses. The platform connects with Google Classroom, Microsoft Teams, ClassLink and LMSs through LTI 1.3. Its broad free feature set is notable, but AI credits are limited on the Basic tier, so frequent content generation requires a different cost calculation from basic classroom use.",
    "useCases": [
      "Convert an existing PDF worksheet into an online activity with answer fields and automatic grading.",
      "Run a short live review game, poll or quiz from questions already in a teacher’s library.",
      "Create draft lesson plans, quizzes or rubrics with AI, then edit them for curriculum fit.",
      "Assign homework through Google Classroom or Microsoft Teams and review student-level results.",
      "Embed graded Edform activities in a supported learning-management system through LTI 1.3."
    ],
    "workflow": [
      "Create a teacher account and choose a quiz, worksheet, lesson, game or AI-assisted material to build.",
      "Import an existing PDF or write questions, instructions and answer keys; inspect auto-grading rules and accommodations.",
      "Use an AI drafting action when useful, but revise content for the age group, curriculum and school standards.",
      "Assign the activity with a class link or join code, or connect a classroom or LMS integration.",
      "Review reports by student and question, follow up on misconceptions and adjust the next lesson."
    ],
    "checks": [
      "Basic is described as free with five AI points per month; Pro offers 300, and point-heavy workflows should be budgeted separately.",
      "Review grading on partial credit, open answers, translated material and unusual student responses.",
      "For minors, confirm data processing, student privacy, parental consent and local school or district compliance policies.",
      "Test Google Classroom, Teams or LTI 1.3 access and whether grades return to the destination LMS.",
      "Check accessibility, language support, device compatibility and teacher review of all AI-generated content."
    ],
    "notIdeal": "Not a replacement for a full district student-information system, specialized high-stakes exam proctoring, or unsupervised AI instruction. Organizations needing custom curricula, district procurement or strict data residency should confirm compliance before deployment.",
    "faqs": [
      {
        "question": "What can teachers make in Edform?",
        "answer": "Interactive quizzes, PDF worksheets, lessons, video activities, classroom games and AI-assisted teaching materials, with grading and reports."
      },
      {
        "question": "Is Edform free for teachers?",
        "answer": "The vendor says Basic is free and includes the core platform features. It provides five AI points each month; higher AI allowances require paid access."
      },
      {
        "question": "Do students need their own email account?",
        "answer": "No. Edform supports joining with an activity code, and teachers can use student login options that do not require email."
      },
      {
        "question": "Does Edform work with Google Classroom or Microsoft Teams?",
        "answer": "Yes. Its integrations page documents classroom import and assignment workflows for both, plus ClassLink and LTI 1.3 LMS connections."
      },
      {
        "question": "Can Edform grade student work automatically?",
        "answer": "The platform advertises automatic grading for appropriate question and worksheet types. Teachers should review complex and open-ended responses."
      }
    ]
  }
},
];
