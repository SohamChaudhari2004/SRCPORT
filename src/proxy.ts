import { NextResponse, type NextRequest } from "next/server";
import { seo } from "@/data/seo";
import { servicesUrl } from "@/data/services";

const SKIP = /^\/(api|_next|md|mcp|\.well-known)(\/|$)|\.[a-z0-9]+$/i;
/** Production hosts of the main site, where /services moves to its own subdomain. */
const MAIN_HOSTS = new Set([new URL(seo.url).host, `www.${new URL(seo.url).host}`]);

/** Quality value the Accept header gives a media type (explicit matches only). */
function quality(accept: string, type: string) {
  for (const part of accept.split(",")) {
    const [media, ...params] = part.trim().toLowerCase().split(";");
    if (media.trim() !== type) continue;
    const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    return q ? Number(q.slice(2)) || 0 : 1;
  }
  return -1;
}

const wantsMarkdown = (request: NextRequest) => {
  const accept = request.headers.get("accept") ?? "";
  const md = quality(accept, "text/markdown");
  return md > 0 && md >= quality(accept, "text/html");
};

const rewrite = (request: NextRequest, pathname: string) => {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.rewrite(url);
};

/**
 * services.sohamchaudhari.in serves only the services page (plus its own robots.txt and
 * sitemap); any other page path there redirects to the same path on the main site.
 */
function servicesHost(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") return rewrite(request, `/services-${pathname.slice(1)}`);
  if (SKIP.test(pathname) || pathname.startsWith("/services/")) return NextResponse.next();
  if (pathname === "/") return rewrite(request, wantsMarkdown(request) ? "/md/services" : "/services");
  return NextResponse.redirect(`${seo.url}${pathname}${search}`, 308);
}

/**
 * Routes the services subdomain, and negotiates Markdown for AI agents: a request that
 * prefers `text/markdown` over `text/html` gets the page as Markdown at the same URL.
 */
export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? request.nextUrl.host).toLowerCase();
  if (host.startsWith("services.")) return servicesHost(request);

  const { pathname } = request.nextUrl;
  // Only in production, so /services still works on localhost.
  if (pathname === "/services" && MAIN_HOSTS.has(host)) return NextResponse.redirect(servicesUrl, 308);

  // Pages only: skip API routes, Next internals, the Markdown routes, the MCP endpoint and files.
  if (SKIP.test(pathname)) return NextResponse.next();
  if (wantsMarkdown(request)) return rewrite(request, `/md${pathname === "/" ? "" : pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
