/**
 * Search, social and structured-data settings. Edit here; layout, sitemap,
 * robots, the OG image and the JSON-LD all read from this file.
 */
import { site } from "./profile";

export const seo = {
  /** Production origin, no trailing slash. */
  url: "https://sohamchaudhari.in",
  siteName: "Soham Chaudhari",
  locale: "en_IN",

  /** ~55 chars: name + role + niche, the query people actually type. */
  title: "Soham Chaudhari | AI Engineer, Agentic AI & LLM Systems",
  /** Suffix for any future sub-page titles: "Page | Soham Chaudhari". */
  titleTemplate: "%s | Soham Chaudhari",
  /** ~155 chars, written for the snippet, not for keywords. */
  description:
    "Soham Chaudhari is an AI Engineer in Mumbai building agentic AI, LLM, RAG and voice AI systems for fintech at FLIP. Projects, experience and contact.",
  ogDescription: "AI Engineer at FLIP. Agentic AI, LLM orchestration, RAG, voice and vision systems, from notebook to product.",
  ogImageAlt: "Soham Chaudhari, AI Engineer",

  keywords: [
    "Soham Chaudhari",
    "AI Engineer",
    "AI Engineer Mumbai",
    "AI Engineer India",
    "Agentic AI",
    "LLM Engineer",
    "Generative AI",
    "RAG",
    "LangGraph",
    "Multi-agent systems",
    "Voice AI",
    "Computer vision",
    "Fintech AI",
    "Machine learning engineer",
  ],

  twitterHandle: "@sohamrchaudhari",

  /** Topics for the Person schema (entity understanding in Google and AI search). */
  knowsAbout: [
    "Artificial intelligence",
    "Agentic AI",
    "Large language models",
    "Retrieval-augmented generation",
    "Multi-agent systems",
    "LangGraph",
    "LangChain",
    "Voice AI",
    "Computer vision",
    "Machine learning",
    "Deep learning",
    "Fintech",
    "Python",
    "FastAPI",
  ],

  /** Profiles that are you: feeds Person.sameAs so Google ties them to this site. */
  sameAs: [
    site.linkedin,
    "https://github.com/SohamChaudhari2004",
    site.x,
    site.medium,
    site.pypi,
  ],

  alumni: { name: "Vivekanand Education Society's Institute of Technology (VESIT)", url: "https://vesit.ves.ac.in" },

  /**
   * Search-console ownership tokens. Paste the content value only, or leave
   * empty and verify through DNS instead (recommended with Cloudflare).
   */
  verification: {
    google: "",
    bing: "",
  },
};
