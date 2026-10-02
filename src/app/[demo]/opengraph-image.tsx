import { ogCard, ogSize } from "@/lib/ogCard";
import { demos } from "@/components/playground/demos";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Live AI demo";

export function generateStaticParams() {
  return demos.map((d) => ({ demo: d.slug }));
}

export default async function Image({ params }: { params: Promise<{ demo: string }> }) {
  const { demo: slug } = await params;
  const demo = demos.find((d) => d.slug === slug);
  return ogCard({
    eyebrow: "Live demo",
    title: demo?.title ?? slug,
    subtitle: demo?.blurb ?? "",
    tags: [demo?.task ?? "AI", demo?.onDevice ? "Runs in your browser" : "Live API"],
  });
}
