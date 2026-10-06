import { ogCard, ogSize } from "@/lib/ogCard";
import { services, servicesPage } from "@/data/services";

export const size = ogSize;
export const contentType = "image/png";
export const alt = servicesPage.title;

export default function Image() {
  return ogCard({
    eyebrow: "Services",
    title: "AI Engineering",
    subtitle: servicesPage.headline,
    tags: services.slice(0, 5).map((s) => s.title.split(" and ")[0]),
  });
}
