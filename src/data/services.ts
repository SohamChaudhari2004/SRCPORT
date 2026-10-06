/**
 * Services offered, served at services.sohamchaudhari.in (see src/proxy.ts).
 * The page, its Markdown version, its JSON-LD and llms.txt all read from here.
 */
import { site } from "./profile";
import { seo } from "./seo";

export const servicesUrl = "https://services.sohamchaudhari.in";

export interface Service {
  id: "agents" | "rag" | "mcp" | "voice" | "vision" | "mvp" | "evals";
  title: string;
  pitch: string;
  /** What the client gets. */
  deliverables: string[];
  /** Work on the portfolio that shows this in practice. */
  proof?: { label: string; href: string }[];
}

export const servicesPage = {
  title: `AI Engineering Services by ${site.name}`,
  description: `Hire ${site.name}, an AI Engineer in ${site.location}, to build AI agents, RAG search, MCP servers, voice AI, computer vision and AI MVPs. Remote, worldwide.`,
  eyebrow: "Services · AI engineering",
  headline: "AI that works outside the demo",
  lead: "I design and build AI features and products end to end: LLM agents, retrieval, voice and vision, with the evaluation, cost control and deployment that make them hold up in production.",
  pricing: "Every project is quoted after a short first call, as a fixed price for an agreed scope.",
};

export const services: Service[] = [
  {
    id: "agents",
    title: "AI agents and automation",
    pitch: "LLM agents that call your tools and APIs to answer questions and finish tasks, from a single assistant to multi-step LangGraph workflows.",
    deliverables: ["Tool-calling agent wired to your systems", "Conversation memory and guardrails", "Logging, retries and cost limits", "API or chat interface"],
    proof: [
      { label: "Stock AI", href: `${seo.url}/projects/stock-ai` },
      { label: "AI Agents", href: "https://github.com/SohamChaudhari2004/AI-Agents" },
    ],
  },
  {
    id: "rag",
    title: "RAG and AI search",
    pitch: "Chat with your documents, knowledge base or video library, with answers grounded in your data and linked back to the source.",
    deliverables: ["Ingestion and chunking pipeline", "Vector or hybrid search", "Cited answers", "Retrieval quality evaluation"],
    proof: [{ label: "MOSAIC", href: `${seo.url}/projects/mosaic` }],
  },
  {
    id: "mcp",
    title: "MCP servers and LLM integrations",
    pitch: "Make your product usable from Claude, ChatGPT, Cursor and other AI assistants with a Model Context Protocol server, or add LLM features to an existing app.",
    deliverables: ["MCP server over stdio or Streamable HTTP", "Typed tools over your API", "Auth and rate limiting", "Docs for agent developers"],
    proof: [
      { label: "Stock AI MCP", href: "https://github.com/SohamChaudhari2004/YfinanceMCP" },
      { label: "This site's MCP server", href: `${seo.url}/developers` },
    ],
  },
  {
    id: "voice",
    title: "Voice AI",
    pitch: "Voice assistants and phone or in-app agents that listen, understand and respond naturally, with the latency tuning that voice needs.",
    deliverables: ["Speech-to-text and text-to-speech pipeline", "LLM conversation logic", "Latency optimisation", "Call or app integration"],
  },
  {
    id: "vision",
    title: "Computer vision",
    pitch: "Detection, classification and image or video enhancement, on a server or running privately in the browser and on device.",
    deliverables: ["Model selection or training", "ONNX export and optimisation", "In-browser or API inference", "Accuracy and speed benchmarks"],
    proof: [
      { label: "Face Detection", href: `${seo.url}/face-detection` },
      { label: "MNIST CNN", href: `${seo.url}/mnist-cnn` },
      { label: "VISION AI", href: `${seo.url}/projects/vision-ai` },
    ],
  },
  {
    id: "mvp",
    title: "AI MVPs and prototypes",
    pitch: "Turn an AI idea into a working product you can put in front of users or investors: backend, frontend and deployment.",
    deliverables: ["FastAPI backend", "Next.js or React frontend", "Deployed and documented", "Handover of all code"],
    proof: [{ label: "Live demos", href: `${seo.url}/playground` }],
  },
  {
    id: "evals",
    title: "LLM evaluation and cost optimisation",
    pitch: "Measure whether your AI feature is actually good, then make it cheaper and faster without making it worse.",
    deliverables: ["Evaluation set and scoring", "Prompt and model comparison", "Caching and routing", "Cost and latency report"],
  },
];

export const process = [
  { title: "Call", body: "A short call to understand the problem, your data and what success looks like." },
  { title: "Proposal", body: "A written scope with deliverables, milestones and a fixed price." },
  { title: "Build", body: "Weekly iterations with a working demo you can try at every step." },
  { title: "Handover", body: "Code, documentation and deployment in your accounts, plus a walkthrough." },
];

export const engagements = [
  { title: "Project", body: "A fixed scope and price, for a new AI feature, agent, integration or MVP." },
  { title: "Ongoing", body: "A monthly block of time for iterating on and maintaining AI features you already run." },
  { title: "Advisory", body: "Architecture review, model and vendor choice, or a second opinion on an AI plan." },
];

export const faqs = [
  {
    q: "Do you work with teams outside India?",
    a: `Yes. I work remotely with teams anywhere, from ${site.location} (${site.timeZoneLabel}), and overlap with European and US hours where needed.`,
  },
  {
    q: "Which models and tools do you use?",
    a: "Whatever fits the job: hosted models such as Claude, GPT, Gemini and Groq-hosted open models, or self-hosted open-source models when data has to stay private. LangGraph and LangChain for agents, FastAPI for backends, ONNX for on-device inference.",
  },
  {
    q: "Who owns the code?",
    a: "You do. Everything is delivered in your repositories and accounts, with documentation so your team can run and extend it.",
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
  title: "Have an AI project in mind?",
  body: "Tell me what you are building and where AI should fit. I reply to every enquiry.",
  mailto: `mailto:${site.email}?subject=${encodeURIComponent("Project enquiry")}`,
};
