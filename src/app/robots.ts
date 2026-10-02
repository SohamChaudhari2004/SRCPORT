import type { MetadataRoute } from "next";
import { seo } from "@/data/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // Search and AI-answer crawlers are welcome: a portfolio wants to be found and cited.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/md/"] }],
    sitemap: `${seo.url}/sitemap.xml`,
    host: seo.url,
  };
}
