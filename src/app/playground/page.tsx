import type { Metadata } from "next";
import Playground from "@/components/playground/Playground";
import { site } from "@/data/profile";
import { seo } from "@/data/seo";
import { demos } from "@/components/playground/demos";

const description =
  "Live AI demos: real-time face detection and handwritten digit recognition that run in your browser on ONNX Runtime Web, and an LLM stock-analysis agent on live market data.";

export const metadata: Metadata = {
  title: "AI Playground: Live Model and Agent Demos",
  description,
  alternates: { canonical: "/playground" },
  openGraph: { url: "/playground", title: `AI Playground | ${site.name}`, description },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${seo.url}/playground#page`,
  url: `${seo.url}/playground`,
  name: "AI Playground",
  description,
  isPartOf: { "@id": `${seo.url}/#website` },
  author: { "@id": `${seo.url}/#person` },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: demos.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${seo.url}/${d.slug}`,
      name: d.title,
    })),
  },
};

export default function PlaygroundPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Playground />
    </>
  );
}
