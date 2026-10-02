import type { Metadata } from "next";
import InfoPageView from "@/components/ui/InfoPageView";
import { aboutPage as page } from "@/data/pages";
import { site } from "@/data/profile";

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: page.path },
  openGraph: { type: "website", url: page.path, title: `${page.title} | ${site.name}`, description: page.description },
  twitter: { card: "summary_large_image", title: page.title, description: page.description },
};

export default function AboutPage() {
  return <InfoPageView page={page} />;
}
