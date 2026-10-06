import { servicesUrl, solutions, solutionUrl } from "@/data/services";

// Sitemap for services.sohamchaudhari.in (the proxy rewrites /sitemap.xml there to this route).
export const dynamic = "force-static";

export function GET() {
  const lastmod = new Date().toISOString();
  const urls = [
    { loc: servicesUrl, priority: "1.0" },
    ...solutions.map((s) => ({ loc: solutionUrl(s), priority: "0.8" })),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `<url><loc>${u.loc}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>${u.priority}</priority></url>`)
  .join("\n")}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
}
