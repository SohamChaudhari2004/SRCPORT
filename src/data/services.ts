/**
 * Freelance solutions, served at services.sohamchaudhari.in (see src/proxy.ts).
 * The pages, their Markdown versions, JSON-LD, sitemap, llms.txt and the MCP
 * get_services tool all read from here. To add a demo video to a solution, put
 * the files in public/assets/solutions/ and set `video` on that solution.
 */
import { site } from "./profile";

export const servicesUrl = "https://services.sohamchaudhari.in";

export type SolutionCategory = "AI assistants" | "Business systems" | "Automation" | "Websites & products" | "Vision & media";

export const categories: SolutionCategory[] = ["AI assistants", "Business systems", "Automation", "Websites & products", "Vision & media"];

/** Icon names map to lucide icons in src/components/services/icons.ts. */
export type SolutionIcon =
  | "bot" | "crm" | "erp" | "doc" | "phone" | "whatsapp" | "knowledge" | "marketing" | "insights"
  | "shop" | "booking" | "vision" | "video" | "workflow" | "website" | "mvp" | "dashboard" | "hiring";

export interface Solution {
  slug: string;
  title: string;
  category: SolutionCategory;
  icon: SolutionIcon;
  /** The business outcome, one line. */
  tagline: string;
  /** The problem it solves, in the client's words. */
  problem: string;
  /** What gets built. */
  features: string[];
  /** What changes for the business. Qualitative: no promised numbers. */
  impact: string[];
  /** Who it suits. */
  industries: string[];
  /** Optional demo video in /public. */
  video?: { src: string; poster: string };
}

const solutionList: Omit<Solution, "video">[] = [
  {
    slug: "ai-chatbot",
    title: "AI Chatbots & Support Agents",
    category: "AI assistants",
    icon: "bot",
    tagline: "Answer every customer question instantly, day or night.",
    problem: "Customers wait hours for replies to the same questions, and your team spends the day answering them instead of doing real work.",
    features: [
      "Chatbot for your website, WhatsApp or app, trained on your FAQs, policies and products",
      "Answers in your customers' language and in your brand's tone",
      "Hands the conversation to a person when it should",
      "Captures leads and creates support tickets automatically",
      "Dashboard of what customers ask most",
    ],
    impact: ["Instant replies around the clock", "Fewer repetitive tickets for your team", "More enquiries turned into leads"],
    industries: ["E-commerce", "Education", "Healthcare", "Real estate", "SaaS"],
  },
  {
    slug: "ai-crm",
    title: "AI-Powered CRM",
    category: "Business systems",
    icon: "crm",
    tagline: "Never lose a lead again. Let AI qualify, prioritise and follow up.",
    problem: "Leads arrive from forms, calls, WhatsApp and ads, live in spreadsheets, and slip through the cracks before anyone follows up.",
    features: [
      "One place for every lead and customer, from every channel",
      "AI lead scoring that tells your team who to call first",
      "Automatic follow-up emails and WhatsApp messages",
      "Call and meeting summaries with next steps",
      "Pipeline and sales reports in plain language",
    ],
    impact: ["Faster responses to new leads", "Sales time spent on the most promising deals", "Clear view of the pipeline at any moment"],
    industries: ["Real estate", "Agencies", "Education", "B2B services", "Financial services"],
  },
  {
    slug: "erp",
    title: "ERP & Operations Systems",
    category: "Business systems",
    icon: "erp",
    tagline: "Run inventory, orders, billing and staff from one system built around how you work.",
    problem: "Operations are spread across spreadsheets, notebooks and disconnected apps, so nobody has the full picture and mistakes are expensive.",
    features: [
      "Inventory, purchasing, orders and invoicing in one system",
      "Role-based access for owners, managers and staff",
      "AI demand forecasts and low-stock alerts",
      "Automatic reports for daily, weekly and monthly reviews",
      "Connects to your accounting, payment and shipping tools",
    ],
    impact: ["One source of truth for the whole business", "Less manual data entry and fewer errors", "Decisions based on live numbers"],
    industries: ["Manufacturing", "Retail", "Distribution", "Restaurants", "Wholesale"],
  },
  {
    slug: "voice-agent",
    title: "AI Voice Agents",
    category: "AI assistants",
    icon: "phone",
    tagline: "A receptionist that answers every call, books appointments and qualifies leads.",
    problem: "Missed calls are missed customers, and hiring staff to answer phones all day is costly.",
    features: [
      "Answers inbound calls with a natural-sounding voice",
      "Books, reschedules and confirms appointments",
      "Qualifies callers and passes hot leads to your team",
      "Outbound reminder and follow-up calls",
      "Call recordings, transcripts and summaries",
    ],
    impact: ["No more missed calls", "Staff freed from routine phone work", "Every call logged and searchable"],
    industries: ["Clinics", "Salons", "Real estate", "Home services", "Hospitality"],
  },
  {
    slug: "whatsapp-automation",
    title: "WhatsApp Business Automation",
    category: "Automation",
    icon: "whatsapp",
    tagline: "Sell, book and support customers where they already are.",
    problem: "Your customers message you on WhatsApp, but orders, bookings and questions are handled one chat at a time by hand.",
    features: [
      "Product catalogues, orders and payments inside WhatsApp",
      "Appointment booking and reminders",
      "AI replies to common questions",
      "Broadcasts and follow-ups to opted-in customers",
      "Every chat synced to your CRM",
    ],
    impact: ["Faster replies on your busiest channel", "Orders and bookings without back-and-forth", "Repeat customers through timely follow-ups"],
    industries: ["Retail", "Restaurants", "Clinics", "Education", "Local businesses"],
  },
  {
    slug: "document-automation",
    title: "Document & Invoice Processing",
    category: "Automation",
    icon: "doc",
    tagline: "Turn invoices, forms and contracts into clean data automatically.",
    problem: "Your team retypes data from PDFs, scans and emails into other systems, which is slow, boring and error-prone.",
    features: [
      "Reads invoices, receipts, IDs, forms and contracts",
      "Extracts the fields you need and checks them",
      "Sends the data straight to your accounting software, ERP or sheets",
      "Flags anything unusual for a person to review",
      "Search across all your documents in plain language",
    ],
    impact: ["Hours of data entry removed", "Fewer costly typing mistakes", "Documents processed the moment they arrive"],
    industries: ["Finance & accounting", "Logistics", "Insurance", "Legal", "Healthcare"],
  },
  {
    slug: "knowledge-assistant",
    title: "Internal Knowledge Assistant",
    category: "AI assistants",
    icon: "knowledge",
    tagline: "Give your team instant answers from your own documents and SOPs.",
    problem: "Know-how lives in scattered documents and in a few people's heads, so new hires are slow and the same questions are asked again and again.",
    features: [
      "Private AI assistant over your documents, wikis, SOPs and policies",
      "Answers with links back to the exact source",
      "Access controls so people only see what they should",
      "Works in Slack, Teams or a web app",
      "Keeps itself up to date as documents change",
    ],
    impact: ["Faster onboarding for new staff", "Experts interrupted less", "Consistent answers across the team"],
    industries: ["Professional services", "Manufacturing", "Healthcare", "Education", "Fintech"],
  },
  {
    slug: "ai-insights",
    title: "AI Business Insights & Dashboards",
    category: "Business systems",
    icon: "insights",
    tagline: "Ask your business data questions in plain English and get answers in seconds.",
    problem: "Your data sits in several tools, and getting a simple report means waiting on someone with spreadsheet or SQL skills.",
    features: [
      "Live dashboards across sales, operations and finance",
      "Ask questions like “Which products sold best last month?”",
      "Automatic weekly summaries of what changed and why",
      "Alerts when a number moves unexpectedly",
      "Connects to your existing databases and tools",
    ],
    impact: ["Answers without waiting for reports", "Problems spotted earlier", "Everyone working from the same numbers"],
    industries: ["E-commerce", "Retail", "SaaS", "Logistics", "Hospitality"],
  },
  {
    slug: "marketing-engine",
    title: "AI Marketing & Content Engine",
    category: "Automation",
    icon: "marketing",
    tagline: "Create on-brand posts, emails and ads in minutes instead of days.",
    problem: "Marketing needs a steady stream of fresh content, and small teams can't keep up.",
    features: [
      "Generates social posts, emails, product descriptions and ad copy in your brand voice",
      "Turns one blog, video or webinar into many posts",
      "Content calendar with scheduling",
      "Personalised email campaigns by customer segment",
      "Approval step before anything goes live",
    ],
    impact: ["More content with the same team", "Consistent brand voice everywhere", "Campaigns launched faster"],
    industries: ["D2C brands", "Agencies", "Real estate", "Education", "Creators"],
  },
  {
    slug: "workflow-automation",
    title: "Custom Workflow Automation",
    category: "Automation",
    icon: "workflow",
    tagline: "Connect your tools and let repetitive work run itself.",
    problem: "People copy information between apps, chase approvals and send the same emails every day.",
    features: [
      "Automations across email, sheets, CRM, accounting and chat tools",
      "AI that reads, sorts and routes incoming emails and requests",
      "Approval flows with reminders",
      "Scheduled reports sent automatically",
      "Monitoring so nothing fails silently",
    ],
    impact: ["Hours of busywork removed every week", "Fewer dropped balls", "Processes that run the same way every time"],
    industries: ["Agencies", "Operations teams", "Finance", "HR", "Small businesses"],
  },
  {
    slug: "ai-recruitment",
    title: "AI Recruitment & HR Tools",
    category: "Business systems",
    icon: "hiring",
    tagline: "Shortlist the right candidates faster and onboard them smoothly.",
    problem: "Hiring means reading hundreds of CVs and repeating the same onboarding steps for every new joiner.",
    features: [
      "CV screening against your job requirements, with reasons",
      "Candidate pipeline with interview scheduling",
      "AI-drafted job descriptions and interview questions",
      "Onboarding checklists and an HR assistant for policy questions",
      "Fair, consistent criteria for every applicant",
    ],
    impact: ["Faster time to shortlist", "Recruiters focused on the best candidates", "Smoother first weeks for new hires"],
    industries: ["Staffing agencies", "Startups", "IT services", "Retail chains", "Healthcare"],
  },
  {
    slug: "immersive-website",
    title: "Immersive Websites",
    category: "Websites & products",
    icon: "website",
    tagline: "A website people remember: 3D, motion and interaction that sells your brand.",
    problem: "Your website looks like every competitor's, and visitors leave before they understand what makes you different.",
    features: [
      "Custom design with scroll-driven storytelling and motion",
      "Interactive 3D product views and scenes",
      "Fast loading on phones, with accessible fallbacks",
      "Built to rank on Google and to be read by AI assistants",
      "Easy for your team to update",
    ],
    impact: ["A brand that stands out", "Visitors who stay and explore", "More enquiries from the same traffic"],
    industries: ["Luxury & lifestyle", "Real estate", "Architecture", "Product launches", "Agencies"],
  },
  {
    slug: "saas-mvp",
    title: "SaaS & Product MVPs",
    category: "Websites & products",
    icon: "mvp",
    tagline: "Go from idea to a launched product customers can pay for.",
    problem: "You have a product idea and need it built properly, quickly, without hiring a full team.",
    features: [
      "Product scoping to find the smallest version worth launching",
      "Web app with sign-up, payments and admin panel",
      "AI features where they make the product better",
      "Deployed, monitored and ready for real users",
      "Clean code your future team can build on",
    ],
    impact: ["A product in users' hands quickly", "Real feedback before big spending", "A foundation that scales"],
    industries: ["Founders", "Startups", "Agencies", "Corporate innovation teams"],
  },
  {
    slug: "booking-platform",
    title: "Booking & Appointment Platforms",
    category: "Websites & products",
    icon: "booking",
    tagline: "Let customers book and pay online while you focus on the work.",
    problem: "Bookings come in by phone and chat, leading to double bookings, no-shows and lost revenue.",
    features: [
      "Online booking with live availability",
      "Payments and deposits at the time of booking",
      "Automatic reminders by SMS, email or WhatsApp",
      "Staff calendars and schedules",
      "Customer history and repeat booking",
    ],
    impact: ["Fewer no-shows", "Bookings taken around the clock", "Less time on the phone"],
    industries: ["Clinics", "Salons & spas", "Fitness studios", "Coaching", "Rentals"],
  },
  {
    slug: "ai-ecommerce",
    title: "AI-Powered E-commerce",
    category: "Websites & products",
    icon: "shop",
    tagline: "A store that helps every shopper find what they want, and buy more.",
    problem: "Shoppers can't find the right product, abandon carts, and see the same generic recommendations as everyone else.",
    features: [
      "Smart search that understands what shoppers mean",
      "Personalised product recommendations",
      "Shopping assistant chat",
      "Automated product descriptions and photos clean-up",
      "Abandoned cart recovery by email and WhatsApp",
    ],
    impact: ["Shoppers find products faster", "Higher average order value", "More recovered carts"],
    industries: ["D2C brands", "Fashion", "Electronics", "Grocery", "Marketplaces"],
  },
  {
    slug: "admin-dashboard",
    title: "Custom Portals & Admin Panels",
    category: "Websites & products",
    icon: "dashboard",
    tagline: "Give customers, partners and staff their own portal for what they need.",
    problem: "Customers and partners email you for updates and documents, and staff juggle tools that don't fit your process.",
    features: [
      "Customer or partner portal with logins",
      "Order, project or case tracking",
      "Document sharing and e-signatures",
      "Admin panel tailored to your workflow",
      "Notifications and audit history",
    ],
    impact: ["Fewer status-update emails", "A more professional customer experience", "Staff tools that match how you work"],
    industries: ["B2B services", "Logistics", "Construction", "Education", "Financial services"],
  },
  {
    slug: "vision-ai",
    title: "Computer Vision for Business",
    category: "Vision & media",
    icon: "vision",
    tagline: "Let cameras count, inspect and monitor so your team doesn't have to.",
    problem: "Quality checks, stock counts and site monitoring depend on people watching, which is slow, tiring and inconsistent.",
    features: [
      "Visual quality inspection on production lines",
      "People and vehicle counting for stores and sites",
      "Shelf and stock monitoring",
      "Safety checks such as helmets and restricted zones",
      "Runs on your existing cameras, privately where needed",
    ],
    impact: ["Consistent checks without fatigue", "Problems caught as they happen", "Data from places you couldn't measure before"],
    industries: ["Manufacturing", "Retail", "Warehousing", "Construction", "Agriculture"],
  },
  {
    slug: "video-ai",
    title: "AI Video & Media Tools",
    category: "Vision & media",
    icon: "video",
    tagline: "Turn long videos into searchable libraries, highlights and short clips.",
    problem: "Hours of recordings, lectures or footage sit unused because finding the right moment takes forever.",
    features: [
      "Search inside videos by describing a moment",
      "Automatic highlights and short clips for social media",
      "Captions, summaries and chapters",
      "Ask questions about any video",
      "Upscaling and clean-up of low-quality footage",
    ],
    impact: ["Content that is easy to find and reuse", "More social content from existing footage", "Hours of editing saved"],
    industries: ["Media & creators", "Education", "Events", "Corporate training", "Sports"],
  },
];

/** Every solution has a looping motion graphic (HyperFrames source in motion/solutions-motion). */
export const solutions: Solution[] = solutionList.map((s) => ({
  ...s,
  video: { src: `/assets/solutions/${s.slug}.mp4`, poster: `/assets/solutions/${s.slug}.webp` },
}));

export const servicesPage = {
  title: `Freelance AI & Software Solutions by ${site.name}`,
  description: `AI chatbots, AI-powered CRM, ERP systems, voice agents, automation and immersive websites, built for your business by ${site.name}. Remote, worldwide.`,
  eyebrow: "Freelance · AI & software solutions",
  headline: "Software that works for your business",
  lead: "We build AI-powered products and systems that take repetitive work off your team, keep customers happy and help your business grow. You tell us the problem; we design, build and launch the solution.",
  pricing: "Every project is quoted after a short first call, as a fixed price for an agreed scope.",
};

export const valueProps = [
  { title: "Built around your business", body: "Designed for your workflows, your customers and your data, not squeezed into a template." },
  { title: "Launch early, improve weekly", body: "You see a working version early and it gets better every week, based on real use." },
  { title: "You own everything", body: "Code, data and accounts are yours. No lock-in, no surprises." },
  { title: "Support after launch", body: "We stay on to fix, improve and add features as your business grows." },
];

export const industries = [
  "Retail & e-commerce",
  "Healthcare & clinics",
  "Real estate",
  "Education",
  "Finance",
  "Manufacturing",
  "Logistics",
  "Hospitality",
  "Agencies",
  "Startups",
];

export const process = [
  { title: "Discovery call", body: "We talk about your business, the problem and what success looks like." },
  { title: "Proposal", body: "A clear plan with what will be built, milestones and a fixed price." },
  { title: "Build", body: "Weekly progress with a working version you can try at every step." },
  { title: "Launch & support", body: "We go live, train your team and keep improving it together." },
];

export const engagements = [
  { title: "Project", body: "A fixed scope and price, for a new system, product or automation." },
  { title: "Ongoing", body: "A monthly plan for support, improvements and new features." },
  { title: "Consulting", body: "Advice on where AI can help your business and what to build first." },
];

export const faqs = [
  {
    q: "Do I need to be technical?",
    a: "No. Describe the problem in your own words. We handle the technical side and explain decisions in plain language.",
  },
  {
    q: "Can it work with the tools I already use?",
    a: "Usually, yes. Most solutions connect to your existing CRM, accounting, payment, messaging and spreadsheet tools instead of replacing them.",
  },
  {
    q: "How long does a project take?",
    a: "It depends on the size. A chatbot or automation is far quicker than a full CRM or ERP. You get a timeline with milestones in the proposal.",
  },
  {
    q: "Do you work with businesses outside India?",
    a: `Yes. We work remotely with clients anywhere, from ${site.location} (${site.timeZoneLabel}).`,
  },
  {
    q: "Who owns the code and data?",
    a: "You do. Everything is delivered in your accounts, with documentation.",
  },
  {
    q: "Can you sign an NDA?",
    a: "Yes, before we discuss anything confidential.",
  },
  {
    q: "How much does it cost?",
    a: servicesPage.pricing,
  },
];

export const servicesCta = {
  title: "Let's build something that moves your business",
  body: "Tell us about your business and what is slowing it down. We reply to every enquiry.",
  mailto: `mailto:${site.email}?subject=${encodeURIComponent("Project enquiry")}`,
};

export const mailtoFor = (s: Solution) => `mailto:${site.email}?subject=${encodeURIComponent(`Enquiry: ${s.title}`)}`;

export const solutionUrl = (s: Solution) => `${servicesUrl}/${s.slug}`;
