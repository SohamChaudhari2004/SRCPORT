import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

const run = (path: string, accept?: string) =>
  proxy(new NextRequest(`https://sohamchaudhari.in${path}`, { headers: accept ? { accept } : {} }));
const rewrite = (res: Response) => res.headers.get("x-middleware-rewrite");

describe("markdown content negotiation", () => {
  it("rewrites Accept: text/markdown to the Markdown route", () => {
    expect(rewrite(run("/", "text/markdown"))).toBe("https://sohamchaudhari.in/md");
    expect(rewrite(run("/stock-ai", "text/markdown"))).toBe("https://sohamchaudhari.in/md/stock-ai");
    expect(rewrite(run("/does-not-exist", "text/markdown"))).toBe("https://sohamchaudhari.in/md/does-not-exist");
  });

  it("keeps HTML for browsers and missing Accept headers", () => {
    expect(rewrite(run("/", "text/html,application/xhtml+xml,*/*;q=0.8"))).toBeNull();
    expect(rewrite(run("/"))).toBeNull();
    expect(rewrite(run("/", "*/*"))).toBeNull();
  });

  it("respects quality values", () => {
    expect(rewrite(run("/", "text/html;q=0.5, text/markdown"))).not.toBeNull();
    expect(rewrite(run("/", "text/markdown;q=0.9, text/html"))).toBeNull();
    expect(rewrite(run("/", "text/markdown;q=0"))).toBeNull();
  });

  it("never touches API routes, internals, MCP or files", () => {
    for (const path of ["/api/contact", "/_next/static/x.js", "/mcp", "/.well-known/mcp.json", "/llms.txt", "/md/about"]) {
      expect(rewrite(run(path, "text/markdown")), path).toBeNull();
    }
  });
});
