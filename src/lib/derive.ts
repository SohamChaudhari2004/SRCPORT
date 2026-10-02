/**
 * Everything the UI shows is derived from src/data, no hand-typed numbers.
 */
import { projects, type Project } from "@/data/projects";
import { skills, categoryIcons, type Skill, type SkillCategory } from "@/data/skills";
import { achievements, type Achievement } from "@/data/achievements";
import { featuredItems } from "@/data/featured";
import { resume } from "@/data/data";
import { site } from "./site";

/* ------------------------------------------------------------------ utils */

export function hashString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const pad = (n: number, len = 2) => String(n).padStart(len, "0");

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/* --------------------------------------------------------------- projects */

const TAG_RULES: [RegExp, string][] = [
  [/multi-?agent/i, "Multi-Agent"],
  [/autogen/i, "AutoGen"],
  [/langgraph/i, "LangGraph"],
  [/langchain/i, "LangChain"],
  [/llama/i, "Llama 3.1"],
  [/gemini/i, "Gemini"],
  [/\bmcp\b/i, "MCP"],
  [/\bocr\b/i, "OCR"],
  [/\bllms?\b|language model/i, "LLM"],
  [/pdf|retrieval|\brag\b/i, "RAG"],
  [/video|vision|image analysis/i, "Vision"],
  [/transcription|voice|speech/i, "Speech"],
  [/sentence transformer/i, "Transformers"],
  [/neural network|deep learning/i, "Deep Learning"],
  [/regression|machine learning/i, "ML"],
  [/fastapi/i, "FastAPI"],
  [/streamlit/i, "Streamlit"],
  [/docker/i, "Docker"],
  [/selenium/i, "Selenium"],
  [/scrap/i, "Scraping"],
  [/mern/i, "MERN"],
  [/react/i, "React"],
  [/next\.js/i, "Next.js"],
  [/typescript/i, "TypeScript"],
  [/firebase/i, "Firebase"],
  [/stripe/i, "Stripe"],
  [/jupyter/i, "Jupyter"],
  [/automat/i, "Automation"],
  [/python/i, "Python"],
];

export type CoverKind = "agents" | "vision" | "language" | "ml" | "automation" | "web";

function coverKind(p: Project): CoverKind {
  const text = `${p.title} ${p.description}`;
  if (p.category === "web-dev") return "web";
  if (/vision|video|image analysis/i.test(text)) return "vision";
  if (/agent|autogen|langgraph|orchestrat/i.test(text)) return "agents";
  if (/\bllms?\b|langchain|llama|gemini|pdf|chat|language|generative|transformer|semantic/i.test(text))
    return "language";
  if (/automat|selenium|scrap|email/i.test(text)) return "automation";
  return "ml";
}

export interface ProjectView extends Project {
  slug: string;
  index: number;
  tags: string[];
  kind: CoverKind;
  seed: number;
  repo: string;
  categoryLabel: string;
}

export const projectViews: ProjectView[] = projects.map((p, i) => {
  const text = `${p.title} ${p.description}`;
  const tags = TAG_RULES.filter(([re]) => re.test(text)).map(([, t]) => t);
  let repo = p.githubLink;
  try {
    repo = new URL(p.githubLink).pathname.replace(/^\//, "");
  } catch {
    /* keep raw */
  }
  return {
    ...p,
    slug: slugify(p.title),
    index: i + 1,
    tags: tags.slice(0, 4),
    kind: coverKind(p),
    seed: hashString(p.title),
    repo,
    categoryLabel: p.category === "ai-ml" ? "AI / ML" : "Web",
  };
});

export const featuredProjects: ProjectView[] = (() => {
  const picked = site.featured
    .map((t) => projectViews.find((p) => p.title.toLowerCase() === t.toLowerCase()))
    .filter((p): p is ProjectView => Boolean(p));
  return picked.length ? picked : projectViews.filter((p) => p.category === "ai-ml").slice(0, 6);
})();

/** Everything not in the featured reel, shown in the Explore section. */
export const exploreProjects: ProjectView[] = projectViews.filter((p) => !featuredProjects.includes(p));

export const findProject = (title: string) =>
  projectViews.find((p) => p.title.toLowerCase() === title.toLowerCase());

export const githubProfile = (() => {
  const owner = projectViews[0]?.repo.split("/")[0];
  return owner
    ? { handle: owner, url: `https://github.com/${owner}` }
    : { handle: "github", url: "https://github.com" };
})();

export const resumeUrl = resume.path;

/* ----------------------------------------------------------------- skills */

export interface SkillGroup {
  category: SkillCategory;
  items: Skill[];
  icon: (typeof categoryIcons)[SkillCategory];
}

export const skillGroups: SkillGroup[] = (() => {
  const order: SkillCategory[] = [];
  const map = new Map<SkillCategory, Skill[]>();
  skills.forEach((s) => {
    if (!map.has(s.category)) {
      map.set(s.category, []);
      order.push(s.category);
    }
    map.get(s.category)!.push(s);
  });
  return order.map((category) => ({ category, items: map.get(category)!, icon: categoryIcons[category] }));
})();

export const toolGroups = skillGroups.filter((g) => g.category !== "Interests");
export const interests = skillGroups.find((g) => g.category === "Interests")?.items ?? [];

export type IconInfo = { type: "img"; src: string } | { type: "mono"; text: string };

// Simple Icons slugs that were renamed upstream since the data was written.
const ICON_ALIASES: Record<string, string> = { css3: "css" };

export function iconInfo(skill: Skill): IconInfo {
  if (skill.icon.includes("simpleicons"))
    return { type: "img", src: skill.icon.replace(/\.org\/([^/]+)/, (m, slug: string) => `.org/${ICON_ALIASES[slug] ?? slug}`) };
  try {
    const name = new URL(skill.icon).searchParams.get("name");
    if (name) return { type: "mono", text: name };
  } catch {
    /* fall through */
  }
  return { type: "mono", text: monogram(skill.name) };
}

export const monogram = (name: string) =>
  name
    .split(/[\s/-]+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

/* ------------------------------------------------------------ achievements */

export interface EvalView extends Achievement {
  rank: { kind: "place" | "top" | "none"; value: number; display: string; suffix?: string };
  venue: string;
  participants?: number;
  percentile?: number;
}

export const evals: EvalView[] = achievements.map((a) => {
  const place = a.title.match(/(\d+)\s*(st|nd|rd|th)\b/i);
  const top = a.title.match(/top\s*(\d+)/i);
  const participantsMatch = a.description.match(/(\d[\d,]*)\+?\s*participants/i);
  const participants = participantsMatch ? Number(participantsMatch[1].replace(/,/g, "")) : undefined;

  let rank: EvalView["rank"] = { kind: "none", value: 0, display: "-" };
  let venue = a.title;
  if (place) {
    const value = Number(place[1]);
    rank = { kind: "place", value, display: pad(value), suffix: place[2].toLowerCase() };
    venue = a.title.replace(/\d+\s*(st|nd|rd|th)\s*(position|place)?/i, "").trim();
  } else if (top) {
    const value = Number(top[1]);
    rank = { kind: "top", value, display: String(value) };
    venue = a.title.replace(/top\s*\d+/i, "").trim();
  }

  const percentile = rank.kind === "top" && participants ? (rank.value / participants) * 100 : undefined;
  return { ...a, rank, venue, participants, percentile };
});

/* ------------------------------------------------------------------ stats */

const liveCount = projectViews.filter((p) => p.liveLink).length;

export const stats = {
  projects: projectViews.length,
  ai: projectViews.filter((p) => p.category === "ai-ml").length,
  web: projectViews.filter((p) => p.category === "web-dev").length,
  live: liveCount,
  tools: skills.filter((s) => s.category !== "Interests").length,
  layers: toolGroups.length,
  awards: evals.length,
  participants: evals.reduce((max, e) => Math.max(max, e.participants ?? 0), 0),
};

/** Capability coverage, measured by keyword presence across public repos. */
const CAPABILITIES: { label: string; test: (p: ProjectView) => boolean; support?: boolean }[] = [
  { label: "Agentic systems", test: (p) => /agent|autogen|langgraph|orchestrat/i.test(p.title + p.description) },
  {
    label: "LLMs & RAG",
    test: (p) => /\bllms?\b|langchain|llama|gemini|pdf|language model|generative/i.test(p.description),
  },
  {
    label: "Vision & multimodal",
    test: (p) => /vision|video|image analysis|\bocr\b|multimodal/i.test(p.title + p.description),
  },
  {
    label: "ML & deep learning",
    test: (p) => /machine learning|neural|regression|transformer|detection|deep learning/i.test(p.description),
  },
  { label: "Automation", test: (p) => /automat|selenium|scrap|bulk/i.test(p.description) },
  { label: "Full-stack web", test: (p) => p.category === "web-dev", support: true },
];

// AI capabilities ranked by coverage; supporting skills (web) always trail.
export const capabilities = CAPABILITIES.map((c) => ({
  label: c.label,
  count: projectViews.filter(c.test).length,
  support: Boolean(c.support),
})).sort((a, b) => Number(a.support) - Number(b.support) || b.count - a.count);

export const modalities = (() => {
  const text = projectViews.map((p) => p.description).join(" ");
  const list = ["text"];
  if (/vision|image/i.test(text)) list.push("vision");
  if (/video/i.test(text)) list.push("video");
  if (/voice|speech|transcription/i.test(text)) list.push("voice");
  return list;
})();

export const hasFeatured = featuredItems.length > 0;
export { featuredItems };
