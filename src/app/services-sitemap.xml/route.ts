import { servicesUrl } from "@/data/services";

// Sitemap for services.sohamchaudhari.in (the proxy rewrites /sitemap.xml there to this route).
export const dynamic = "force-static";

export function GET() {
  const lastmod = new Date().toISOString();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>${servicesUrl}</loc>
<lastmod>${lastmod}</lastmod>
<changefreq>monthly</changefreq>
<priority>1</priority>
</url>
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
}
