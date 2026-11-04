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
];
