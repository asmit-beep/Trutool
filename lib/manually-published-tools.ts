import type {Tool} from './catalog';

/**
 * Editor-reviewed product submissions, fact-checked against official product
 * pages on 29 October 2026. Positions are editorial placement only, not
 * measured adoption, ratings, or paid promotion.
 */
export const manuallyPublishedTools:Tool[]=[
 {
  slug:'aireiter',
  name:'AIReiter',
  category:'ai-model-platforms',
  summary:'AIReiter is a unified AI API platform for accessing image, video, and language models through one API key, usage dashboard, and billing account.',
  fit:'Developers, startups, and product teams building image generators, video workflows, or LLM features that need to work with more than one model family.',
  features:[
   'One API key for image, video, and language model access',
   'Asynchronous image and video generation jobs',
   'OpenAI-compatible endpoints for language model workloads',
   'Job-status checks and result retrieval',
   'Model-level usage tracking and credit-based billing',
   'API documentation with HTTP, Node.js, and Python examples'
  ],
  caution:'AIReiter provides an additional API intermediary, not the original model provider. Before production, compare its model-specific prices, uptime, output handling, data retention, rate limits, and support against direct provider APIs. Models and availability can change.',
  url:'https://aireiter.com/',
  color:'#2869e9',initial:'A',format:'Multi-model AI API',
  pricing:'Pay-as-you-go, with no fixed subscription tiers advertised on the official pricing page. Each image, video, or language model has its own usage or credit rate; verify the model and resolution you intend to call.',
  pricingUrl:'https://aireiter.com/pricing',
  keywords:'AI API, unified model API, image generation API, video generation API, text model API, OpenAI-compatible API, AI API aggregator',
  sourceTitle:'AIReiter — one AI API for image, video, and text generation; official model pricing',
  sourceStatus:'Vendor documentation consulted',
  sourceUrl:'https://aireiter.com/',sourceChecked:'2026-10-29',
  addedAt:'2026-10-29',updatedAt:'2026-10-29',ai:true,
  profile:{
   overview:'AIReiter is a developer-facing aggregation layer rather than a single AI generator. A product can call image-generation, video-generation and language models from one integration, submit media jobs asynchronously, and see usage across models in one place. Its main benefit is reducing the need to maintain a separate integration and billing relationship for every supported model. The trade-off is an extra provider in the request and data path, so evaluation should include reliability and operational controls, not just model variety.',
   useCases:[
    'A SaaS product that offers multiple AI image models and lets users choose between generation quality, resolution, and price.',
    'Creative automation that submits longer-running video jobs, polls their status, and collects the finished asset.',
    'A team prototyping chat, summarization, extraction, or agent features using compatible language-model APIs.',
    'An internal application that needs consolidated usage reporting across different AI models.'
   ],
   workflow:[
    'Create an AIReiter account and obtain an API key. Review the documentation and available model catalog.',
    'Select a model based on the required output format, input constraints, resolution, and current price.',
    'Submit a test request. For image or video work, save the job identifier and handle pending, failed, and completed states.',
    'Retrieve the final output, inspect quality and latency, and record the credits or usage consumed.',
    'Before deployment, test error handling, rate limits, data-processing policies, and fallback behavior under real load.'
   ],
   checks:[
    'Confirm your exact model versions, formats, resolution limits, and whether advertised models are currently enabled for your account.',
    'Compare effective per-request charges for the same test workload; pricing varies significantly by model and output.',
    'Ask where uploaded prompts, images, and generated media are processed or stored and what retention rules apply.',
    'Test webhook or polling patterns, idempotency, failure recovery, and service limits for long-running jobs.',
    'Review operational support, uptime commitments, provider dependency, and migration effort if you later use direct APIs.'
   ],
   notIdeal:'If you need one model with strict enterprise procurement, a direct provider contract, guaranteed region-specific processing, or highly specific throughput commitments, compare the original model provider and other enterprise API gateways first.',
   faqs:[
    {question:'What is AIReiter?',answer:'AIReiter is a unified API platform for developers that connects image, video, and language models under one API key and billing workflow. It is not itself a single foundation model.'},
    {question:'Does AIReiter support both image and video generation?',answer:'Yes. The official website describes image-generation requests and asynchronous video jobs, alongside language-model endpoints. Availability and supported parameters differ by model.'},
    {question:'Is AIReiter a free AI API?',answer:'The official pricing page describes pay-as-you-go model pricing rather than a single free subscription. Check the account and current rate for the model you intend to use before assuming free usage.'},
    {question:'Can I connect AIReiter to an OpenAI-compatible application?',answer:'The vendor documents OpenAI-compatible endpoints for text and language-model workflows. Verify the specific endpoint, authentication method, and model parameters your application needs.'},
    {question:'What should I test before using it in production?',answer:'Run identical requests on the intended models, calculate total usage cost, inspect latency and failure behavior, and verify privacy, retention, support, and rate limits with the vendor.'}
   ]
  }
 },
 {
  slug:'hausdraft',
  name:'HausDraft',
  category:'ai-image',
  summary:'HausDraft turns photos of real rooms, home exteriors, and yards into AI-generated design concepts while aiming to preserve the original space and camera angle.',
  fit:'Homeowners, renters, interior designers, real estate agents, and contractors who want to visualize finishes, furnishings, paint, or landscaping on photos of an actual space.',
  features:[
   'Photo-based room and interior redesign',
   'Multiple styles including Japandi, Scandinavian, modern, and coastal',
   'Kitchen, bathroom, exterior, and landscape visualizations',
   'Architecture-aware prompts that preserve room layout',
   'Style variations, mood boards, and shareable concepts',
   'Credit-based renders with optional higher-detail models'
  ],
  caution:'These are AI-generated visual concepts, not measured floor plans, accurate material samples, or construction-ready designs. Check furniture scale, structural feasibility, fixtures, paint colors, and the actual cost of changes before buying or renovating.',
  url:'https://hausdraft.com/',
  color:'#8a9fba',initial:'H',format:'AI home design',
  pricing:'Free starting redesign credits. Lite is listed at $9.99/month, Starter at $29/month, and Pro at $69/month. Plans have different credit pools, exports, and batch options; confirm current allowances on the pricing page.',
  pricingUrl:'https://hausdraft.com/pricing',
  keywords:'AI interior design, room redesign AI, AI home design, photo room redesign, AI room visualizer, virtual staging, exterior design AI, landscape visualization',
  sourceTitle:'HausDraft — AI home design from a photo; AI interior design studio; official pricing',
  sourceStatus:'Vendor documentation consulted',
  sourceUrl:'https://hausdraft.com/',sourceChecked:'2026-10-29',
  addedAt:'2026-10-29',updatedAt:'2026-10-29',ai:true,
  profile:{
   overview:'HausDraft is a home-design visualization product that starts with a photo of the room or space you actually have. Instead of generating an unrelated showroom, the product is designed to keep walls, windows, and overall perspective recognizable while changing decor, furniture, finishes, or landscaping. This makes it useful for exploring a renovation direction before committing money, though outputs still need human judgment for physical feasibility.',
   useCases:[
    'Compare Scandinavian, Japandi, modern, farmhouse, or other interiors on the same living-room or bedroom photo.',
    'Preview different cabinet, countertop, backsplash, and color concepts before a kitchen update.',
    'Explore paint, siding, patio, or garden directions for a home exterior or yard.',
    'Produce visual starting points for discussions with an interior designer, contractor, or household member.',
    'Create furnishing concepts for a listing or a vacant room, while clearly labeling visuals as virtual staging where needed.'
   ],
   workflow:[
    'Upload a clear, well-lit photo of the room, facade, or outdoor space you want to redesign.',
    'Choose a relevant studio and a design style or color direction. Add a short instruction about the result you want.',
    'Select an available image model and the number or quality of variations, checking the displayed credit cost.',
    'Generate an idea, compare it with the original photo, and try another style or prompt if the result misses your goal.',
    'Save or share a concept, then validate dimensions, materials, installation, and practical constraints separately.'
   ],
   checks:[
    'Test with a real photo containing difficult corners, clutter, windows, and furniture to see what geometry is preserved.',
    'Check whether designs are inspiration only or allow reliable material matching and consistent results across several rooms.',
    'Confirm credit costs for the image model, resolution, variants, full-size exports, and paid-plan watermark removal.',
    'Ask how uploaded home photos are stored and whether you can remove project images and account data.',
    'For real estate use, verify listing and disclosure requirements for AI-generated or virtually staged images.'
   ],
   notIdeal:'HausDraft is not a substitute for measured CAD plans, structural engineering, contractor estimates, verified furniture fit, or professional renovation approvals. If you need dimension-accurate models or detailed construction drawings, use dedicated planning software.',
   faqs:[
    {question:'What is HausDraft used for?',answer:'HausDraft visualizes home design ideas on uploaded photos. It covers indoor rooms and, according to its site, exterior paint and yard or landscape concepts as well.'},
    {question:'Does HausDraft keep the original room layout?',answer:'The vendor says its redesigns aim to preserve walls, windows, doors, and camera perspective. Treat this as a design objective and verify the result for each photo rather than assuming geometric accuracy.'},
    {question:'Can I try HausDraft for free?',answer:'Yes. HausDraft advertises free starting redesign credits, with paid Lite, Starter, and Pro plans for additional capacity and options.'},
    {question:'Can HausDraft redesign kitchens and outdoor spaces?',answer:'Its official website lists kitchens, bathrooms, home exteriors, paint colors, and landscaping alongside interior room redesigns.'},
    {question:'Are the generated designs suitable for renovation plans?',answer:'They are useful as visual references and mood boards. Confirm real-world sizes, safety, materials, scope, and costs with a qualified professional before construction.'}
   ]
  }
 }
];
