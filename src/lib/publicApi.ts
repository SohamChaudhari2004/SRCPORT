/**
 * Public, read-only JSON API (v1) over the site's data: profile, projects, demos and
 * freelance solutions. Served at /api/v1/* on both sohamchaudhari.in and
 * services.sohamchaudhari.in, described by /openapi.json, and used by the CLI in /cli.
 */
import { seo } from "@/data/seo";
import { site } from "@/data/profile";
import { caseStudies } from "@/data/caseStudies";
import { categories, servicesUrl, solutions, solutionUrl, type SolutionCategory } from "@/data/services";
import { demos } from "@/components/playground/demos";
import { featuredProjects, projectViews } from "@/lib/derive";

export interface ApiResult {
  status: number;
  body: unknown;
}

export type ErrorCode = "not_found" | "invalid_parameter" | "method_not_allowed";

/** Every error has the same shape: a stable code, a message and a hint on how to fix it. */
export const apiError = (status: number, code: ErrorCode, message: string, hint: string): ApiResult => ({
  status,
  body: { error: { code, message, hint, docs: `${seo.url}/openapi.json` } },
});

const abs = (path: string) => (path.startsWith("http") ? path : `${seo.url}${path}`);

const profile = () => ({
  name: site.name,
  role: site.role,
  company: site.current.company,
  location: site.location,
  timeZone: site.timeZone,
  email: site.email,
  summary: seo.description,
  links: {
    website: seo.url,
    services: servicesUrl,
    linkedin: site.linkedin,
    github: "https://github.com/SohamChaudhari2004",
    x: site.x,
    medium: site.medium,
  },
});

const projectSummary = (p: (typeof projectViews)[number]) => {
  const featured = featuredProjects.includes(p);
  return {
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.categoryLabel,
    featured,
    sourceUrl: p.githubLink || null,
    liveUrl: p.liveLink ? abs(p.liveLink) : null,
    caseStudyUrl: featured && caseStudies[p.slug] ? `${seo.url}/projects/${p.slug}` : null,
  };
};

const projectDetail = (p: (typeof projectViews)[number]) => {
  const study = featuredProjects.includes(p) ? caseStudies[p.slug] : undefined;
  return {
    ...projectSummary(p),
    caseStudy: study
      ? { tagline: study.tagline, overview: study.overview, features: study.features, howItWorks: study.flow, stack: study.stack }
      : null,
  };
};

const solutionSummary = (s: (typeof solutions)[number]) => ({
  slug: s.slug,
  title: s.title,
  category: s.category,
  tagline: s.tagline,
  url: solutionUrl(s),
});

const solutionDetail = (s: (typeof solutions)[number]) => ({
  ...solutionSummary(s),
  problem: s.problem,
  features: s.features,
  impact: s.impact,
  industries: s.industries,
  video: s.video ? { src: `${servicesUrl}${s.video.src}`, poster: `${servicesUrl}${s.video.poster}` } : null,
  enquire: `mailto:${site.email}?subject=${encodeURIComponent(`Enquiry: ${s.title}`)}`,
});

const demoSummary = (d: (typeof demos)[number]) => ({
  slug: d.slug,
  title: d.title,
  description: d.blurb,
  runsOnDevice: d.onDevice,
  url: `${seo.url}/${d.slug}`,
  details: Object.fromEntries(d.spec.map((s) => [s.label, s.value])),
});

const notFound = (what: string, slug: string, listPath: string) =>
  apiError(404, "not_found", `No ${what} with slug "${slug}".`, `List valid slugs with GET ${listPath}.`);

/** Routes a GET request under /api/v1. `path` excludes the /api/v1 prefix. */
export function handleApiGet(path: string[], query: URLSearchParams): ApiResult {
  const [resource, slug, ...rest] = path;
  if (rest.length) return unknownRoute(["v1", ...path]);

  switch (resource) {
    case "profile":
      return slug ? unknownRoute(["v1", ...path]) : { status: 200, body: profile() };
    case "projects": {
      if (!slug) return { status: 200, body: { projects: projectViews.map(projectSummary) } };
      const p = projectViews.find((x) => x.slug === slug);
      return p ? { status: 200, body: projectDetail(p) } : notFound("project", slug, "/api/v1/projects");
    }
    case "demos":
      return slug ? unknownRoute(["v1", ...path]) : { status: 200, body: { demos: demos.map(demoSummary) } };
    case "solutions": {
      if (!slug) {
        const category = query.get("category");
        if (category !== null && !categories.includes(category as SolutionCategory)) {
          return apiError(400, "invalid_parameter", `Unknown category "${category}".`, `Use one of: ${categories.join(", ")}.`);
        }
        const list = category ? solutions.filter((s) => s.category === category) : solutions;
        return { status: 200, body: { categories, solutions: list.map(solutionSummary) } };
      }
      const s = solutions.find((x) => x.slug === slug);
      return s ? { status: 200, body: solutionDetail(s) } : notFound("solution", slug, "/api/v1/solutions");
    }
    default:
      return unknownRoute(["v1", ...path]);
  }
}

export const unknownRoute = (path: string[]) =>
  apiError(
    404,
    "not_found",
    `No API endpoint at /api/${path.join("/")}.`,
    "See the list of endpoints in the OpenAPI document.",
  );

export const methodNotAllowed = (method: string) =>
  apiError(405, "method_not_allowed", `${method} is not supported. This API is read-only.`, "Use GET.");
