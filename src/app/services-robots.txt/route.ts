import { servicesUrl } from "@/data/services";

// robots.txt for services.sohamchaudhari.in (the proxy rewrites /robots.txt there to this route).
export const dynamic = "force-static";

export function GET() {
  const body = ["User-Agent: *", "Allow: /", "", `Host: ${servicesUrl}`, `Sitemap: ${servicesUrl}/sitemap.xml`, ""].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
