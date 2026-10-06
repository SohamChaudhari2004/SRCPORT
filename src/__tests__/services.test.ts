/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { markdownFor } from "@/lib/agentContent";
import { handleMcp } from "@/lib/mcp";
import { GET as robots } from "@/app/services-robots.txt/route";
import { GET as sitemap } from "@/app/services-sitemap.xml/route";
import { categories, servicesUrl, solutions, solutionUrl } from "@/data/services";
import { SOLUTION_ICONS } from "@/components/services/icons";

const run = (url: string, accept?: string) => {
  const u = new URL(url);
  return proxy(new NextRequest(u, { headers: { host: u.host, ...(accept && { accept }) } }));
};
const rewrite = (res: Response) => res.headers.get("x-middleware-rewrite");
const SUB = "https://services.sohamchaudhari.in";

describe("services subdomain routing", () => {
  it("serves the services home at the subdomain root", () => {
    expect(rewrite(run(`${SUB}/`))).toBe(`${SUB}/services`);
    expect(rewrite(run("https://services.localhost:3001/"))).toBe("https://services.localhost:3001/services");
  });

  it("serves each solution at /<slug> on the subdomain, without leaving it", () => {
    const res = run(`${SUB}/ai-crm`);
    expect(rewrite(res)).toBe(`${SUB}/services/ai-crm`);
    expect(res.headers.get("location")).toBeNull();
    // Unknown paths stay on the subdomain too (and 404 there), never redirecting to the portfolio.
    expect(run(`${SUB}/about`).headers.get("location")).toBeNull();
  });

  it("serves Markdown to agents", () => {
    expect(rewrite(run(`${SUB}/`, "text/markdown"))).toBe(`${SUB}/md/services`);
    expect(rewrite(run(`${SUB}/ai-chatbot`, "text/markdown"))).toBe(`${SUB}/md/services/ai-chatbot`);
  });

  it("gives the subdomain its own robots.txt and sitemap", () => {
    expect(rewrite(run(`${SUB}/robots.txt`))).toBe(`${SUB}/services-robots.txt`);
    expect(rewrite(run(`${SUB}/sitemap.xml`))).toBe(`${SUB}/services-sitemap.xml`);
  });

  it("leaves assets and OG images alone", () => {
    for (const path of ["/_next/static/a.js", "/images/soham-light.webp", "/services/opengraph-image", "/services/ai-crm/opengraph-image"]) {
      const res = run(`${SUB}${path}`);
      expect(rewrite(res), path).toBeNull();
      expect(res.headers.get("location"), path).toBeNull();
    }
  });

  it("moves /services pages on the main site to the subdomain, but not on localhost", () => {
    for (const host of ["sohamchaudhari.in", "www.sohamchaudhari.in"]) {
      const home = run(`https://${host}/services`);
      expect(home.status).toBe(308);
      expect(home.headers.get("location")).toBe(`${servicesUrl}/`);
      expect(run(`https://${host}/services/erp`).headers.get("location")).toBe(`${servicesUrl}/erp`);
    }
    expect(run("http://localhost:3001/services").headers.get("location")).toBeNull();
  });
});

describe("solutions data", () => {
  it("has unique slugs, a known category and an icon for every solution", () => {
    expect(new Set(solutions.map((s) => s.slug)).size).toBe(solutions.length);
    for (const s of solutions) {
      expect(categories, s.slug).toContain(s.category);
      expect(SOLUTION_ICONS[s.icon], s.slug).toBeTruthy();
      expect(s.features.length, s.slug).toBeGreaterThanOrEqual(3);
      expect(s.impact.length, s.slug).toBeGreaterThanOrEqual(2);
    }
    for (const c of categories) expect(solutions.some((s) => s.category === c), c).toBe(true);
  });
});

describe("services content for agents", () => {
  it("has Markdown for the home and every solution", () => {
    const home = markdownFor("/services");
    expect(home.status).toBe(200);
    for (const s of solutions) {
      expect(home.body).toContain(solutionUrl(s));
      const page = markdownFor(`/services/${s.slug}`);
      expect(page.status, s.slug).toBe(200);
      expect(page.body, s.slug).toContain(`# ${s.title}`);
    }
    expect(markdownFor("/services/not-a-solution").status).toBe(404);
  });

  it("is exposed as an MCP tool", () => {
    const reply = handleMcp({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "get_services" } }) as {
      result: { content: { text: string }[] };
    };
    expect(reply.result.content[0].text).toContain(solutions[0].title);
  });

  it("publishes robots.txt and a sitemap listing every solution", async () => {
    expect(await robots().text()).toContain(`Sitemap: ${servicesUrl}/sitemap.xml`);
    const res = sitemap();
    expect(res.headers.get("content-type")).toBe("application/xml");
    const xml = await res.text();
    expect(xml).toContain(`<loc>${servicesUrl}</loc>`);
    for (const s of solutions) expect(xml).toContain(`<loc>${solutionUrl(s)}</loc>`);
    expect(xml).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}T/);
  });
});

describe("services identity and agent files", () => {
  it("publishes an llms.txt with when-to-use guidance and machine endpoints", async () => {
    const { GET: llms } = await import("@/app/services-llms.txt/route");
    const text = await llms().text();
    expect(text.split("\n")[0]).toMatch(/^# \S/);
    expect(text).toContain("## When to use this site");
    expect(text).toContain(`${servicesUrl}/openapi.json`);
    expect(text).toContain(`${servicesUrl}/mcp`);
    for (const s of solutions) expect(text).toContain(solutionUrl(s));
    expect(rewrite(run(`${SUB}/llms.txt`))).toBe(`${SUB}/services-llms.txt`);
  });

  it("passes API, OpenAPI and MCP requests through on the subdomain", () => {
    for (const path of ["/openapi.json", "/api/v1/solutions", "/mcp", "/.well-known/mcp.json"]) {
      const res = run(`${SUB}${path}`);
      expect(rewrite(res), path).toBeNull();
      expect(res.headers.get("location"), path).toBeNull();
    }
  });

  it("has Organization JSON-LD with contactPoint and address on the home and solution pages", async () => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: Home } = await import("@/app/services/page");
    const { default: Solution } = await import("@/app/services/[slug]/page");
    const pages = [
      renderToStaticMarkup(Home()),
      renderToStaticMarkup(await Solution({ params: Promise.resolve({ slug: "ai-crm" }) })),
    ];
    for (const html of pages) {
      const json = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1];
      const graph: Record<string, unknown>[] = JSON.parse(json)["@graph"];
      const org = graph.find((n) => [n["@type"]].flat().includes("Organization")) as Record<string, any>;
      expect(org.contactPoint).toMatchObject({ "@type": "ContactPoint", email: expect.any(String), contactType: expect.any(String) });
      expect(org.address).toMatchObject({ "@type": "PostalAddress", addressCountry: "IN" });
    }
  });
});
