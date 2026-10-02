import { markdownFor } from "@/lib/agentContent";
import { seo } from "@/data/seo";

// Markdown version of any page. src/proxy.ts rewrites requests that ask for
// `Accept: text/markdown` here, so agents get Markdown at the normal URL.

type Ctx = { params: Promise<{ path?: string[] }> };

export async function GET(_request: Request, { params }: Ctx) {
  const { path = [] } = await params;
  const pagePath = `/${path.join("/")}`;
  const { status, body } = markdownFor(pagePath);
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      "Cache-Control": status === 200 ? "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" : "no-store",
      ...(status === 200 && { Link: `<${seo.url}${pagePath === "/" ? "" : pagePath}>; rel="canonical"` }),
    },
  });
}
