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
  }
];