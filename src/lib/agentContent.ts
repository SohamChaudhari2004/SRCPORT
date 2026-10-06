/**
 * Markdown versions of the site for AI agents. Served when a request asks for
 * `Accept: text/markdown` (see src/proxy.ts), and reused by llms.txt and the MCP server.
 */
import { seo } from "@/data/seo";
import { site } from "@/data/profile";
import { experience } from "@/data/experience";
import { achievements } from "@/data/achievements";
import { caseStudies } from "@/data/caseStudies";
import { infoPages, type InfoPage } from "@/data/pages";
import { engagements, faqs, industries, process, servicesCta, servicesPage, servicesUrl, solutions, solutionUrl, valueProps } from "@/data/services";
import { demos } from "@/components/playground/demos";
import { exploreProjects, featuredProjects, projectViews, resumeUrl } from "@/lib/derive";

const abs = (path: string) => (path.startsWith("http") ? path : `${seo.url}${path}`);
const list = (items: string[]) => items.map((i) => `- ${i}`).join("\n");

const footer = () =>
  [
    "---",
    "",
    `Site index for agents: ${seo.url}/llms.txt · Sitemap: ${seo.url}/sitemap.xml · MCP server: ${seo.url}/mcp`,
  ].join("\n");

const doc = (...parts: (string | false | undefined)[]) => `${parts.filter(Boolean).join("\n\n")}\n\n${footer()}\n`;

export function homeMd() {
  return doc(
    `# ${site.name}: ${site.role}`,
    `> ${seo.description}`,
    "## Profile",
    list([
      `Role: ${site.role} at ${site.current.company} (${site.current.url})`,
      `Location: ${site.location} (${site.timeZoneLabel})`,
      `Email: ${site.email}`,
      `Resume: ${abs(resumeUrl)}`,
      `About: ${abs("/about")}`,
      `Contact: ${abs("/contact")}`,
      `Services: ${servicesUrl}`,
    ]),
    "## Experience",
    list(experience.map((e) => `**${e.role}, ${e.company}** (${e.period}): ${e.summary}`)),
    "## Featured projects",
    list(
      featuredProjects.map((p) => {
        const page = caseStudies[p.slug] ? abs(`/projects/${p.slug}`) : p.githubLink;
        return `[${p.title}](${page}): ${p.description}`;
      }),
    ),
    "## Live demos",
    list(demos.map((d) => `[${d.title}](${abs(`/${d.slug}`)}): ${d.blurb}`)),
    "## More projects",
    list(exploreProjects.map((p) => `${p.githubLink ? `[${p.title}](${p.githubLink})` : p.title}: ${p.description}`)),
    "## Achievements",
    list(achievements.map((a) => `${a.title}, ${a.subtitle}${a.date ? ` (${a.date})` : ""}`)),
    "## Profiles",
    list(seo.sameAs.map((u) => u)),
  );
}

export function projectMd(slug: string) {
  const project = projectViews.find((p) => p.slug === slug);
  if (!project) return null;
  const study = caseStudies[slug];
  const demo = demos.find((d) => d.slug === slug);
  const links = [
    project.githubLink && `Source: ${project.githubLink}`,
    demo && `Live demo: ${abs(`/${demo.slug}`)}`,
    !demo && project.liveLink && `Live: ${abs(project.liveLink)}`,
  ].filter(Boolean) as string[];
  if (!study) return doc(`# ${project.title}`, project.description, links.length > 0 && list(links));
  return doc(
    `# ${project.title}`,
    `> ${study.tagline}`,
    links.length > 0 && list(links),
    "## Overview",
    study.overview.join("\n\n"),
    "## What it does",
    list(study.features.map((f) => `**${f.title}**: ${f.body}`)),
    "## How it works",
    study.flow.map((s, i) => `${i + 1}. ${s}`).join("\n"),
    "## Stack",
    study.stack.join(", "),
    `Built by ${site.name} (${seo.url}).`,
  );
}

export function demoMd(slug: string) {
  const demo = demos.find((d) => d.slug === slug);
  if (!demo) return null;
  return doc(
    `# ${demo.title}: live demo`,
    `> ${demo.blurb}`,
    `Try it in a browser: ${abs(`/${demo.slug}`)}. ${demo.hint}`,
    demo.onDevice
      ? "It runs entirely in the visitor's browser with ONNX Runtime Web; nothing is uploaded."
      : "It calls a live API deployed by the author, through a server-side proxy on this site.",
    "## Details",
    list(demo.spec.map((s) => `${s.label}: ${s.value}`)),
    caseStudies[demo.slug] && `Case study: ${abs(`/projects/${demo.slug}`)}`,
  );
}

export function playgroundMd() {
  return doc(
    "# AI Playground",
    `> Live AI demos by ${site.name}. Each one also has its own page.`,
    ...demos.map((d) =>
      [`## ${d.title}`, d.blurb, list([`Page: ${abs(`/${d.slug}`)}`, ...d.spec.map((s) => `${s.label}: ${s.value}`)])].join("\n\n"),
    ),
  );
}

export function infoMd(page: InfoPage) {
  return doc(
    `# ${page.title}`,
    `> ${page.lead}`,
    page.updated && `Last updated: ${page.updated}`,
    ...page.sections.map((s) =>
      [
        `## ${s.heading}`,
        ...s.paragraphs,
        s.links?.length && list(s.links.map((l) => `[${l.label}](${abs(l.href)})${l.note ? `: ${l.note}` : ""}`)),
      ]
        .filter(Boolean)
        .join("\n\n"),
    ),
  );
}

export function servicesMd() {
  return doc(
    `# ${servicesPage.title}`,
    `> ${servicesPage.lead}`,
    `Site: ${servicesUrl} · Contact: ${site.email}`,
    "## Why work with us",
    list(valueProps.map((v) => `**${v.title}**: ${v.body}`)),
    "## Solutions",
    list(solutions.map((s) => `[${s.title}](${solutionUrl(s)}) (${s.category}): ${s.tagline}`)),
    "## Industries",
    industries.join(", "),
    "## How it works",
    process.map((p, i) => `${i + 1}. **${p.title}**: ${p.body}`).join("\n"),
    "## Ways to work together",
    list(engagements.map((e) => `**${e.title}**: ${e.body}`)),
    servicesPage.pricing,
    "## Questions",
    faqs.map((f) => `**${f.q}**\n\n${f.a}`).join("\n\n"),
    `## ${servicesCta.title}`,
    `${servicesCta.body} Email ${site.email}.`,
  );
}

export function solutionMd(slug: string) {
  const s = solutions.find((x) => x.slug === slug);
  if (!s) return null;
  return doc(
    `# ${s.title}`,
    `> ${s.tagline}`,
    `Category: ${s.category} · Page: ${solutionUrl(s)} · All solutions: ${servicesUrl}`,
    "## The problem",
    s.problem,
    "## What you get",
    list(s.features),
    "## The impact",
    list(s.impact),
    "## Great for",
    s.industries.join(", "),
    `To discuss this for your business, email ${site.email}. ${servicesPage.pricing}`,
  );
}

export function notFoundMd(path: string) {
  return doc(
    "# 404: page not found",
    `There is no page at \`${path}\` on ${seo.url}.`,
    "Useful places to start:",
    list([
      `[Home](${seo.url}/): profile, experience and projects`,
      `[AI Playground](${abs("/playground")}): live demos`,
      `[llms.txt](${abs("/llms.txt")}): index of the site for AI agents`,
      `[Sitemap](${abs("/sitemap.xml")}): every page`,
    ]),
  );
}

/** Markdown for a site path, or a 404 document. */
export function markdownFor(path: string): { status: number; body: string } {
  const clean = path.replace(/\/+$/, "") || "/";
  if (clean === "/") return { status: 200, body: homeMd() };
  if (clean === "/playground") return { status: 200, body: playgroundMd() };
  if (clean === "/services") return { status: 200, body: servicesMd() };
  const solution = clean.match(/^\/services\/([^/]+)$/);
  if (solution) {
    const md = solutionMd(solution[1]);
    return md ? { status: 200, body: md } : { status: 404, body: notFoundMd(clean) };
  }
  const info = infoPages.find((p) => p.path === clean);
  if (info) return { status: 200, body: infoMd(info) };
  const project = clean.match(/^\/projects\/([^/]+)$/);
  if (project && caseStudies[project[1]] && featuredProjects.some((p) => p.slug === project[1])) {
    return { status: 200, body: projectMd(project[1])! };
  }
  const demo = clean.match(/^\/([^/]+)$/);
  if (demo) {
    const md = demoMd(demo[1]);
    if (md) return { status: 200, body: md };
  }
  return { status: 404, body: notFoundMd(clean) };
}
