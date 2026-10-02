import { seo } from "@/data/seo";
import { site } from "@/data/profile";
import { experience } from "@/data/experience";
import { achievements } from "@/data/achievements";
import { featuredProjects, resumeUrl } from "@/lib/derive";

// Plain-text profile for AI agents and answer engines, built from the same data as the site.
export const dynamic = "force-static";

export function GET() {
  const lines = [
    `# ${site.name}`,
    "",
    `> ${seo.description}`,
    "",
    "## Profile",
    `- Role: ${site.role} at ${site.current.company} (${site.current.url})`,
    `- Location: ${site.location}`,
    `- Email: ${site.email}`,
    `- Resume: ${seo.url}${resumeUrl}`,
    ...seo.sameAs.map((u) => `- ${u}`),
    "",
    "## Experience",
    ...experience.map((e) => `- ${e.role}, ${e.company} (${e.period}): ${e.summary}`),
    "",
    "## Featured projects",
    ...featuredProjects.map((p) => `- [${p.title}](${seo.url}/projects/${p.slug}): ${p.description} Source: ${p.githubLink}`),
    "",
    "## Achievements",
    ...achievements.map((a) => `- ${a.title}, ${a.subtitle}${a.date ? ` (${a.date})` : ""}: ${a.description}`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
