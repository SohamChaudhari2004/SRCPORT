import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { markdownFor } from "@/lib/agentContent";
import { handleMcp } from "@/lib/mcp";
import { GET as robots } from "@/app/services-robots.txt/route";
import { GET as sitemap } from "@/app/services-sitemap.xml/route";
import { services, servicesUrl } from "@/data/services";

const run = (url: string, accept?: string) => {
  const u = new URL(url);
  return proxy(new NextRequest(u, { headers: { host: u.host, ...(accept && { accept }) } }));
};
const rewrite = (res: Response) => res.headers.get("x-middleware-rewrite");

describe("services subdomain routing", () => {
  it("serves the services page at the subdomain root", () => {
    expect(rewrite(run("https://services.sohamchaudhari.in/"))).toBe("https://services.sohamchaudhari.in/services");
    expect(rewrite(run("https://services.localhost:3001/"))).toBe("https://services.localhost:3001/services");
  });

  it("serves Markdown to agents at the subdomain root", () => {
    expect(rewrite(run("https://services.sohamchaudhari.in/", "text/markdown"))).toBe("https://services.sohamchaudhari.in/md/services");
  });

  it("gives the subdomain its own robots.txt and sitemap", () => {
    expect(rewrite(run("https://services.sohamchaudhari.in/robots.txt"))).toBe("https://services.sohamchaudhari.in/services-robots.txt");
    expect(rewrite(run("https://services.sohamchaudhari.in/sitemap.xml"))).toBe("https://services.sohamchaudhari.in/services-sitemap.xml");
  });

  it("redirects other pages on the subdomain to the main site", () => {
    const res = run("https://services.sohamchaudhari.in/about?x=1");
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe("https://sohamchaudhari.in/about?x=1");
  });

  it("leaves assets on the subdomain alone", () => {
    for (const path of ["/_next/static/a.js", "/images/soham-light.webp", "/services/opengraph-image"]) {
      const res = run(`https://services.sohamchaudhari.in${path}`);
      expect(rewrite(res), path).toBeNull();
      expect(res.headers.get("location"), path).toBeNull();
    }
  });

  it("moves /services on the main site to the subdomain, but not on localhost", () => {
    for (const host of ["sohamchaudhari.in", "www.sohamchaudhari.in"]) {
      const res = run(`https://${host}/services`);
      expect(res.status).toBe(308);
      expect(res.headers.get("location")).toBe(`${servicesUrl}/`);
    }
    expect(run("http://localhost:3001/services").headers.get("location")).toBeNull();
  });
});

describe("services content for agents", () => {
  it("has a Markdown version listing every service", () => {
    const { status, body } = markdownFor("/services");
    expect(status).toBe(200);
    for (const s of services) expect(body).toContain(`## ${s.title}`);
  });

  it("is exposed as an MCP tool", () => {
    const reply = handleMcp({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "get_services" } }) as {
      result: { content: { text: string }[] };
    };
    expect(reply.result.content[0].text).toContain(services[0].title);
  });

  it("publishes robots.txt and a sitemap for the subdomain", async () => {
    const r = await robots().text();
    expect(r).toContain(`Sitemap: ${servicesUrl}/sitemap.xml`);
    const s = sitemap();
    expect(s.headers.get("content-type")).toBe("application/xml");
    const xml = await s.text();
    expect(xml).toContain(`<loc>${servicesUrl}</loc>`);
    expect(xml).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}T/);
  });
});
