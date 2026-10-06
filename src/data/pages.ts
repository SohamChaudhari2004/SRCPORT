/**
 * Copy for the About, Contact and Privacy pages. The HTML pages, their Markdown versions
 * for AI agents and the MCP server all read from here, so they never drift apart.
 */
import { site } from "./profile";
import { seo } from "./seo";

export interface InfoSection {
  heading: string;
  paragraphs: string[];
  /** Optional link list under the paragraphs. */
  links?: { label: string; href: string; note?: string }[];
}

export interface InfoPage {
  path: string;
  title: string;
  /** Meta description, ~155 characters. */
  description: string;
  lead: string;
  sections: InfoSection[];
  updated?: string;
}

export const aboutPage: InfoPage = {
  path: "/about",
  title: `About ${site.name}`,
  description: `${site.name} is an AI Engineer in ${site.location} who builds agentic AI, LLM, RAG, voice and computer vision systems. Background, focus and way of working.`,
  lead: `${site.name} is an ${site.role} based in ${site.location}, building production AI systems: LLM agents, retrieval-augmented generation, voice AI and computer vision, from the first notebook to a product people use.`,
  sections: [
    {
      heading: "What I do",
      paragraphs: [
        `I am currently an ${site.current.role} at ${site.current.company}, ${site.current.focus.charAt(0).toLowerCase()}${site.current.focus.slice(1)} Before that I worked across fintech, legal-tech and consumer products, always on the applied side of AI: taking a model or an idea and making it reliable, fast and affordable enough to ship.`,
        "Most of my work involves agentic systems: LLMs that plan, call tools, read documents and act. I also build retrieval pipelines, voice assistants and vision models, and I care about the unglamorous parts that decide whether an AI feature survives contact with real users: evaluations, latency, cost and failure handling.",
      ],
    },
    {
      heading: "Focus areas",
      paragraphs: [
        "Agentic AI and multi-agent systems with LangGraph and LangChain. LLM orchestration, tool calling and the Model Context Protocol (MCP). Retrieval-augmented generation over documents and video. Voice AI. Computer vision, including models that run entirely in the browser with ONNX Runtime Web. Backends in Python and FastAPI.",
      ],
    },
    {
      heading: "Selected work",
      paragraphs: [
        "MOSAIC searches and explains long videos with multimodal retrieval. Stock AI is an LLM agent that answers questions about stocks with live market data and also ships as an MCP server. GPTs is a decoder-only transformer written from scratch in PyTorch. VISION AI restores low-quality images and video. The face detection and MNIST demos run neural networks directly in your browser.",
      ],
      links: [
        { label: "Case studies", href: "/#work" },
        { label: "Live demos in the AI Playground", href: "/playground" },
        { label: "GitHub", href: "https://github.com/SohamChaudhari2004" },
      ],
    },
    {
      heading: "Education",
      paragraphs: [`I studied at ${seo.alumni.name} in Mumbai. Along the way I placed in several hackathons, including first place at Syrus'26 and second place at IIT Ropar's Medino's x Advitiya'25.`],
    },
  ],
};

export const contactPage: InfoPage = {
  path: "/contact",
  title: `Contact ${site.name}`,
  description: `How to reach ${site.name}, AI Engineer in ${site.location}, about roles, projects and collaborations: email, LinkedIn, GitHub and X.`,
  lead: "I am always happy to talk about AI engineering roles, freelance or consulting projects, collaborations and anything to do with agents, retrieval or vision.",
  sections: [
    {
      heading: "Email",
      paragraphs: [
        `Email is the fastest way to reach me: ${site.email}. For a role or a project, a few lines on what you are building, the problem you want solved and any timeline helps me give you a useful answer.`,
      ],
      links: [
        { label: site.email, href: `mailto:${site.email}` },
        { label: "Freelance solutions", href: "https://services.sohamchaudhari.in", note: "What I build for businesses" },
      ],
    },
    {
      heading: "Elsewhere",
      paragraphs: ["You can also find me on these profiles. LinkedIn has my full work history; GitHub has the code behind the projects on this site."],
      links: [
        { label: "LinkedIn", href: site.linkedin, note: "Experience and recommendations" },
        { label: "GitHub", href: "https://github.com/SohamChaudhari2004", note: "Code and experiments" },
        { label: "X", href: site.x, note: "Build logs and ideas" },
        { label: "Medium", href: site.medium, note: "Long-form write-ups" },
      ],
    },
    {
      heading: "Location and time zone",
      paragraphs: [
        `I am based in ${site.location} and work in ${site.timeZoneLabel}. I am open to remote work and to teams in other time zones.`,
      ],
    },
  ],
};

export const privacyPage: InfoPage = {
  path: "/privacy",
  title: "Privacy Policy",
  description: `What data ${seo.url.replace("https://", "")} collects, why, and for how long: cookieless analytics, the contact form and the live AI demos.`,
  lead: "This is a personal portfolio. It has no accounts, no ads and no tracking cookies, and I do not sell or share your data. This page explains the little that is collected.",
  updated: "2026-10-03",
  sections: [
    {
      heading: "Analytics",
      paragraphs: [
        "The site uses Cloudflare Web Analytics to count page views. It does not use cookies or local storage, does not fingerprint visitors and does not track you across sites. I only see aggregate numbers such as page views and referrers.",
      ],
    },
    {
      heading: "Contact form",
      paragraphs: [
        "If you use the contact form, your name, email address and message are sent to my inbox by email so that I can reply. They are not stored in a database on this site. To stop spam, your IP address and email address are kept in server memory for up to an hour to enforce a limit of five messages per hour, and are then discarded.",
      ],
    },
    {
      heading: "AI Playground",
      paragraphs: [
        "The face detection and handwritten digit demos run entirely in your browser. Photos, webcam frames and drawings are processed on your device and are never uploaded.",
        "The Stock AI demo sends your questions and ticker lookups through this site to my stock API, which uses Groq to run the language model and Yahoo Finance for market data. A conversation ID is kept in your browser's session storage so follow-up questions have context, and the API keeps recent messages of that conversation until the server restarts. Please do not type personal information into it. Your IP address is held in memory briefly to rate-limit requests.",
      ],
    },
    {
      heading: "Browser storage",
      paragraphs: [
        "The site stores your light or dark theme choice in local storage, and a flag in session storage so the intro animation does not replay on every page. Neither is used for tracking.",
      ],
    },
    {
      heading: "Hosting and your rights",
      paragraphs: [
        `The site is hosted on Vercel, which keeps standard server logs, including IP addresses, for security and operations. To ask what I hold about you or to have it deleted, email ${site.email}.`,
      ],
    },
  ],
};

/** Tool names served by /mcp. Kept in sync with src/lib/mcp.ts by a test. */
export const MCP_TOOL_NAMES = ["get_profile", "list_projects", "get_project", "list_demos", "get_services", "get_contact"];

export const developersPage: InfoPage = {
  path: "/developers",
  title: `${site.name} Developer Resources`,
  description: `Developer resources from ${site.name}: a public MCP server, Markdown versions of every page, llms.txt, and the open-source Stock AI API and MCP server.`,
  lead: `Everything on this site is readable by software as well as people. Use these endpoints to look up ${site.name}'s profile, projects and demos from an AI agent, a script or an MCP client. All of them are public, read-only and free, with no API key.`,
  sections: [
    {
      heading: "MCP server",
      paragraphs: [
        `A Model Context Protocol server runs at ${seo.url}/mcp over Streamable HTTP. It is stateless, needs no authentication and answers in JSON. Add that URL as a remote MCP server in Claude, ChatGPT, Cursor or any MCP client.`,
        `Tools: ${MCP_TOOL_NAMES.join(", ")}. get_project takes a project slug from list_projects and returns the full case study. Every tool is read-only. The server is described for automatic discovery at ${seo.url}/.well-known/mcp.json. Requests are limited to 60 per minute per IP address.`,
      ],
      links: [
        { label: "MCP endpoint", href: "/mcp", note: "POST, JSON-RPC 2.0" },
        { label: "MCP server card", href: "/.well-known/mcp.json", note: "Discovery manifest" },
      ],
    },
    {
      heading: "Markdown for every page",
      paragraphs: [
        "Every page on this site is also available as clean Markdown at its normal URL. Send the request header Accept: text/markdown and the response comes back with Content-Type: text/markdown instead of HTML. Pages that do not exist return a 404 with a short Markdown explanation and links to the index.",
      ],
    },
    {
      heading: "llms.txt and sitemap",
      paragraphs: [
        "llms.txt follows the llmstxt.org format: a short summary, guidance on when to use the site, and links to every important page. The XML sitemap lists every indexable URL.",
      ],
      links: [
        { label: "llms.txt", href: "/llms.txt" },
        { label: "sitemap.xml", href: "/sitemap.xml" },
      ],
    },
    {
      heading: "Stock AI API and MCP server",
      paragraphs: [
        "Stock AI is an open-source FastAPI service with an LLM stock-analysis agent, plain JSON endpoints for prices, company data, financials and Yahoo Finance screeners, and an MCP server that exposes the same tools to Claude Desktop and IDEs. The integration guide covers authentication, rate limits, every endpoint and error code, with examples in TypeScript, Python and curl.",
      ],
      links: [
        { label: "Integration guide", href: "https://github.com/SohamChaudhari2004/YfinanceMCP/blob/main/docs/INTEGRATION.md" },
        { label: "Source code", href: "https://github.com/SohamChaudhari2004/YfinanceMCP" },
        { label: "Live demo", href: "/stock-ai" },
      ],
    },
    {
      heading: "Open-source code",
      paragraphs: ["The code behind the projects on this site is on GitHub, and published Python packages are on PyPI."],
      links: [
        { label: "GitHub", href: "https://github.com/SohamChaudhari2004" },
        { label: "PyPI", href: site.pypi },
      ],
    },
  ],
};

export const infoPages = [aboutPage, contactPage, privacyPage, developersPage];
