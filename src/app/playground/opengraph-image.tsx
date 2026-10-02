import { ogCard, ogSize } from "@/lib/ogCard";
import { demos } from "@/components/playground/demos";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "AI Playground: live model and agent demos";

export default function Image() {
  return ogCard({
    eyebrow: "Live demos",
    title: "AI Playground",
    subtitle: "Neural networks in your browser and an AI agent on live market data.",
    tags: demos.map((d) => d.title),
  });
}
