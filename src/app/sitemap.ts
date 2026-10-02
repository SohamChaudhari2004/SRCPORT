import type { MetadataRoute } from "next";
import { seo } from "@/data/seo";
import { caseStudies } from "@/data/caseStudies";
import { featuredProjects, resumeUrl } from "@/lib/derive";
import { demos } from "@/components/playground/demos";
import { infoPages } from "@/data/pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: seo.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...featuredProjects
      .filter((p) => caseStudies[p.slug])
      .map((p) => ({
        url: `${seo.url}/projects/${p.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    { url: `${seo.url}/playground`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...demos.map((d) => ({
      url: `${seo.url}/${d.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...infoPages.map((p) => ({
      url: `${seo.url}${p.path}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: p.path === "/privacy" ? 0.3 : 0.6,
    })),
    { url: `${seo.url}${resumeUrl}`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
