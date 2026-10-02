/**
 * All on-page copy, section by section. Edit text here; components only lay it out.
 * `accent` words are rendered in the italic serif accent colour.
 */

export const hero = {
  tagline: {
    before: "I build",
    strong: "agentic systems",
    after: ", retrieval pipelines and multimodal vision, and take them from notebook to product.",
  },
  ctaWork: "See the work",
  ctaHello: "Say hello",
  nowLabel: "Now",
  focusLabel: "Focus",
  /** AI tags on the "Now" card. */
  focus: ["Agentic AI", "LLM Orchestration", "RAG", "Voice AI", "Fintech AI"],
};

export const about = {
  index: "01",
  title: { plain: "Ab", accent: "out" },
  bio: [
    "AI Engineer with applied experience Building production AI Systems across fintech, legal-tech and consumer platforms.",
    "I care about the unglamorous parts too: evals, latency, cost. ",
  ],
  photoCaption: "Mumbai, India",
  factsTitle: "At a glance",
  resumeCta: "Resume",
  sourceCta: "GitHub",
};

export const work = {
  index: "02",
  title: { plain: "Selected", accent: "work" },
  lead: { count: "systems that", words: ["see", "read", "act"] },
  scrollHint: "to pan",
  archiveMore: "more",
  archiveCta: "Explore the rest",
};

export const archive = {
  index: "03",
  title: { plain: "Ex", accent: "plore" },
  meta: "index of experiments",
  labels: { "ai-ml": "AI / ML", "web-dev": "Web", All: "All" } as Record<string, string>,
  /** Tab order: last one is "All". */
  order: ["ai-ml", "web-dev", "All"],
  collapsedCount: 6,
  showAll: "Show all",
  showLess: "Show less",
  hoverHint: "Hover to preview · click to open repo",
  tapHint: "Tap a row to open the repo",
};

export const experienceCopy = {
  index: "04",
  title: { plain: "Experi", accent: "ence" },
  lead: "Where I've shipped.",
  current: "Current",
  builtHere: "What I built here",
  hideBuilt: "Hide what I built",
  education: "Education",
  certifications: "Certifications",
};

export const stack = {
  index: "05",
  title: { plain: "The", accent: "stack" },
  lead: "A forward pass through my toolkit.",
  body: "Languages feed the network, frameworks do the heavy lifting in the hidden layers, and what I care about sits at the output as the objective.",
  objective: "Objective function",
};

export const achievementsCopy = {
  index: "06",
  title: { plain: "Achieve", accent: "ments" },
  meta: "hackathons",
  lead: { before: "Tested against", after: "+ builders under a clock." },
};

export const socialsCopy = {
  index: "07",
  title: { plain: "Else", accent: "where" },
  lead: { plain: "Find me on the", accent: "network." },
  body: "Always happy to talk agents, retrieval and vision. Pick whichever channel suits you.",
  writeCta: "Write to me",
  copyCta: "Copy address",
  blurbs: {
    email: "Roles, projects, collaborations. The fastest way to reach me.",
    linkedin: "Experience, recommendations and the career timeline.",
    github: "Every repo on this page, and the experiments that didn't make it.",
    x: "Build logs, papers I'm reading, half-formed ideas.",
    medium: "Long-form write-ups on agents, RAG and vision.",
  },
};

export const contactCopy = {
  index: "08",
  title: { plain: "Terminal", accent: "." },
  headline: { plain: "Let's build something", accent: "intelligent." },
  body: "Start a conversation, grab the resume, or prompt the terminal. Agents, RAG, vision, or all three at once.",
  cta: "Start a conversation",
  resume: "Resume",
};

export const modalCopy = {
  kicker: "Direct line",
  headline: { plain: "Let's build something", accent: "intelligent." },
  body: "A role, a project or a half-formed idea. Send it here and it lands straight in my inbox.",
  formLabel: "New message",
  mobileTitle: "Let's talk",
  name: { label: "Your name", placeholder: "Ada Doe", error: "Tell me who's writing." },
  email: { label: "Your email", placeholder: "ada@company.com", error: "That email doesn't look right." },
  message: {
    label: "Message",
    placeholder: "What are you building, and where could I help?",
    error: "A sentence or two, at least.",
    max: 1000,
  },
  submit: "Send message",
  sending: "Sending",
  hint: "",
  sentTitle: { plain: "Message", accent: "sent." },
  sentBody: "Thanks for writing. I'll get back to you at the address you left.",
  another: "Write another",
  failTitle: "Couldn't send that.",
  failBody: "The mail service didn't respond. Copy the message and email it directly to",
  limitTitle: "That's enough for now.",
  limitBody: "You've hit the limit of 5 messages an hour. Try again later, or email me directly at",
  copyMessage: "Copy message",
  retry: "Try again",
};

export const footer = {
  index: "Index",
  elsewhere: "Elsewhere",
  builtWith: "Built with",
  builtWithList: "Next.js · GSAP · Three.js · React Three Fiber · Lenis · Motion · Tailwind",
  talk: "Let's talk",
  top: "Top",
  signoff: "made in latent space",
};

export const terminalCopy = {
  manifesto:
    "I build software that can see, read and reason: multi-agent systems on LangGraph, retrieval pipelines you can talk to, and vision models that understand video. Then I ship them.",
  whoamiLine: "agentic systems · retrieval pipelines · multimodal vision",
};
