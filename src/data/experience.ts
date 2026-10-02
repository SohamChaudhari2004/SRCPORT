/**
 * Work history, newest first. Source: resume + LinkedIn.
 */
/** A product shipped inside a role, shown as a card under that role. */
export interface RoleProject {
  name: string;
  /** Short tag above the name, e.g. "Earn". */
  tag: string;
  /** Optional status badge, e.g. "In progress". */
  status?: string;
  summary: string;
  points: string[];
  stack: string[];
}

export interface Experience {
  role: string;
  company: string;
  companyUrl?: string;
  location: string;
  /** Years only, e.g. "2026" or "2025 - 2026". */
  period: string;
  current?: boolean;
  summary: string;
  highlights: string[];
  stack: string[];
  /** Optional product cards rendered under the role. */
  projects?: RoleProject[];
}

export const experience: Experience[] = [
  {
    role: "AI Engineer",
    company: "FLIP",
    companyUrl: "https://paybyflip.com",
    location: "Remote",
    period: "2026 - Present",
    current: true,
    summary:
      "Building the AI layer of a fintech platform that helps people get more out of their credit cards: find the right offer, earn the most on every purchase, and redeem points for real value.",
    highlights: [
      "Built a multi-agent AI assistant that answers plain-language questions about credit card and bank offers.",
      "Added a voice agent on top of it for hands-free, spoken conversations about offers.",
      "Developed a rewards engine that recommends the highest-earning card for any purchase.",
      "Building a points redemption experience that finds the best-value way to use points across 50+ cards.",
    ],
    stack: ["Agentic AI", "LLMs", "Voice AI", "Recommendations", "Fintech"],
    projects: [
      {
        name: "Offer Search Agent",
        tag: "AI chatbot",
        summary:
          "Ask \"any offers on Myntra?\" and get the relevant card and bank offers back, ranked for you.",
        points: [
          "Understands natural-language questions about brands, categories, banks and cards.",
          "Finds, filters and ranks the offers that actually apply to the user.",
          "Remembers the conversation, so follow-up questions just work.",
        ],
        stack: ["Agentic AI", "LLMs", "Conversational AI"],
      },
      {
        name: "Voice Agent",
        tag: "Voice",
        summary: "The offer assistant, hands free. Ask out loud, hear the best offer back.",
        points: [
          "Full spoken loop: the user talks, the agent reasons, and it answers in a natural voice.",
          "Built for quick, on-the-go questions while shopping.",
        ],
        stack: ["Voice AI", "Speech-to-text", "Text-to-speech"],
      },
      {
        name: "Rewards Calculator",
        tag: "Earn",
        summary: "Tells you which card earns the most on a purchase before you pay.",
        points: [
          "Enter a brand and an amount; the system works out what kind of spend it is.",
          "Compares the rewards every card would earn on it.",
          "Recommends the highest-earning card, with the reward value.",
        ],
        stack: ["Recommendations", "Rewards logic"],
      },
      {
        name: "Points Redemption",
        tag: "Redeem",
        status: "In progress",
        summary: "Finds the best way to spend accumulated points across 50+ cards.",
        points: [
          "Pick a card and a points balance to see every option: airline and hotel partners, cash and products.",
          "Each option shows points needed, value, expiry and transfer time.",
          "Example: turning card points into airline miles for a flight booking.",
        ],
        stack: ["Optimisation", "Product UX"],
      },
    ],
  },
  {
    role: "AI Developer Intern",
    company: "UNLAWC",
    location: "Mumbai",
    period: "2025 - 2026",
    summary: "Legal-tech AI agents for document analysis and legal workflows.",
    highlights: [
      "Shipped end-to-end legal AI agents that cut manual review effort by about 50%.",
      "Architected RAG pipelines on Mistral, LangChain and Pinecone with reranking and self-correction, lifting retrieval accuracy by 60%.",
      "Raised contextual accuracy by 31% through structured outputs and evaluation-driven prompt iteration.",
      "Reduced inference cost by about 80% with optimised retrieval and model routing.",
    ],
    stack: ["Mistral", "LangChain", "Pinecone", "RAG", "Evals"],
    projects: [
      {
        name: "Legal AI Agents",
        tag: "Agents",
        summary: "End-to-end agents for legal document analysis and review workflows.",
        points: [
          "Took over the repetitive parts of document review, cutting manual effort by about 50%.",
          "Structured outputs and evaluation-driven prompt iteration raised contextual accuracy by 31%.",
        ],
        stack: ["Mistral", "LangChain", "Structured outputs", "Evals"],
      },
      {
        name: "Legal RAG Pipeline",
        tag: "RAG",
        summary: "Retrieval over legal documents that stays accurate and cheap at scale.",
        points: [
          "Mistral, LangChain and Pinecone with reranking and a self-correction step.",
          "Lifted retrieval accuracy by 60%.",
          "Optimised retrieval and model routing cut inference cost by about 80%.",
        ],
        stack: ["Pinecone", "Reranking", "Model routing"],
      },
    ],
  },
  {
    role: "SDE Intern",
    company: "SR Counselling India",
    location: "Mumbai",
    period: "2024 - 2025",
    summary: "ML recommendations and the backend that serves them.",
    highlights: [
      "Built a production recommendation engine handling 10K+ daily interactions at 95% accuracy, lifting engagement by 35%.",
      "Built 15+ REST APIs on Node.js and Express serving 5K+ concurrent requests.",
      "Designed an AI-powered visa training system that cut training costs by about 90%.",
      "Shipped React admin dashboards with 60% faster page loads.",
    ],
    stack: ["Python", "Node.js", "Express", "React", "Flutter"],
    projects: [
      {
        name: "Recommendation Engine",
        tag: "ML",
        summary: "Production ML recommendations for the counselling platform.",
        points: [
          "Handles 10K+ daily interactions at 95% accuracy.",
          "Lifted user engagement by 35%.",
        ],
        stack: ["Python", "ML"],
      },
      {
        name: "AI Visa Training System",
        tag: "AI",
        summary: "AI-powered visa training that replaced most of the manual effort.",
        points: ["Cut training costs by about 90%."],
        stack: ["Python", "AI"],
      },
      {
        name: "Platform APIs & Dashboards",
        tag: "Backend",
        summary: "The services and admin tools behind the platform.",
        points: [
          "15+ REST APIs on Node.js and Express serving 5K+ concurrent requests.",
          "React admin dashboards with 60% faster page loads.",
        ],
        stack: ["Node.js", "Express", "React"],
      },
    ],
  },
];

export const education = {
  degree: "B.E. Computer Engineering",
  school: "Vivekanand Education Society's Institute of Technology, Mumbai",
  period: "2022 - 2026",
  grade: "CGPA 8.39 / 10",
};

export interface Certification {
  name: string;
  issuer: string;
  /** Credential link. Leave empty to render the name without a link. */
  url?: string;
}

export const certifications: Certification[] = [
  { name: "Oracle Cloud Infrastructure 2025 AI Foundations Associate", issuer: "Oracle" },
  { name: "Fundamentals of Deep Learning", issuer: "NVIDIA" },
  { name: "GenAI Job Simulation", issuer: "BCG" },
  { name: "API Bootcamp", issuer: "Postman" },
];
