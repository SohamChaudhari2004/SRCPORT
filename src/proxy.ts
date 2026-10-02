import { NextResponse, type NextRequest } from "next/server";

const SKIP = /^\/(api|_next|md|mcp|\.well-known)(\/|$)|\.[a-z0-9]+$/i;

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

/**
 * Markdown content negotiation for AI agents: a request that prefers
 * `text/markdown` over `text/html` gets the page as Markdown at the same URL.
 */
export function proxy(request: NextRequest) {
  // Pages only: skip API routes, Next internals, the Markdown routes, the MCP endpoint and files.
  if (SKIP.test(request.nextUrl.pathname)) return NextResponse.next();
  const accept = request.headers.get("accept") ?? "";
  const md = quality(accept, "text/markdown");
  if (md > 0 && md >= quality(accept, "text/html")) {
    const url = request.nextUrl.clone();
    url.pathname = `/md${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }
  const res = NextResponse.next();
  res.headers.append("Vary", "Accept");
  return res;
}

export const config = {
  matcher: "/:path*",
};
