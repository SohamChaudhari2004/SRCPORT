import { ogCard, ogSize } from "@/lib/ogCard";
import { caseStudies } from "@/data/caseStudies";
import { featuredProjects } from "@/lib/derive";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Project case study";

export function generateStaticParams() {
  return featuredProjects.filter((p) => caseStudies[p.slug]).map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = featuredProjects.find((p) => p.slug === slug);
  const study = caseStudies[slug];
  return ogCard({
    eyebrow: "Case study",
    title: project?.title ?? slug,
    subtitle: study?.tagline ?? "",
    tags: study?.stack ?? [],
  });
}
