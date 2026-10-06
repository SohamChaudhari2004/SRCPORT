import { ogCard, ogSize } from "@/lib/ogCard";
import { categories, servicesPage } from "@/data/services";

export const size = ogSize;
export const contentType = "image/png";
export const alt = servicesPage.title;

export default function Image() {
  return ogCard({
    eyebrow: "Freelance solutions",
    title: "Software that works for your business",
    subtitle: "AI chatbots, CRM, ERP, voice agents, automation and immersive websites.",
    tags: categories,
  });
}
