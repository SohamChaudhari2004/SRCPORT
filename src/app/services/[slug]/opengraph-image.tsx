import { ogCard, ogSize } from "@/lib/ogCard";
import { solutions } from "@/data/services";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Solution";

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = solutions.find((x) => x.slug === slug);
  return ogCard({
    eyebrow: s?.category ?? "Solutions",
    title: s?.title ?? slug,
    subtitle: s?.tagline ?? "",
    tags: s?.industries ?? [],
  });
}
