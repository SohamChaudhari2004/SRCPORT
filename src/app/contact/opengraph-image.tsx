import { ogCard, ogSize } from "@/lib/ogCard";
import { contactPage as page } from "@/data/pages";

export const size = ogSize;
export const contentType = "image/png";
export const alt = page.title;

export default function Image() {
  return ogCard({ eyebrow: page.path.slice(1), title: page.title, subtitle: page.description.split(". ")[0] });
}
