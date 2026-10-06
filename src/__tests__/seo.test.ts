import { describe, expect, it } from "vitest";
import { GET as llms } from "@/app/llms.txt/route";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import JsonLd from "@/components/seo/JsonLd";
import { infoPages } from "@/data/pages";
import { demos } from "@/components/playground/demos";
import { seo } from "@/data/seo";

/* eslint-disable @typescript-eslint/no-explicit-any */

describe("llms.txt", () => {
  it("follows the llmstxt.org layout and tells agents when to use the site", async () => {
    const res = llms();
    expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    const text = await res.text();
    const lines = text.split("\n");
    expect(lines[0]).toMatch(/^# \S/);
    expect(lines[2]).toMatch(/^> \S/);
    expect(text).toContain("## When to use this site");
    expect(text).toContain(`${seo.url}/mcp`);
    expect(text).toContain("Accept: text/markdown");
    for (const p of infoPages) expect(text).toContain(`${seo.url}${p.path}`);
  });
});

describe("sitemap and robots", () => {
  it("lists every public page once, with lastmod", () => {
    const entries = sitemap();
    for (const e of entries) expect(e.lastModified, e.url).toBeTruthy();
    const urls = entries.map((e) => e.url);
    for (const p of [...infoPages.map((i) => i.path), ...demos.map((d) => `/${d.slug}`), "/playground"]) {
      expect(urls).toContain(`${seo.url}${p}`);
    }
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("points crawlers at the sitemap", () => {
    expect(robots().sitemap).toBe(`${seo.url}/sitemap.xml`);
  });
});

describe("trust pages", () => {
  it("about, contact and privacy exist with at least 500 characters each", () => {
    expect(infoPages.map((p) => p.path)).toEqual(expect.arrayContaining(["/about", "/contact", "/privacy"]));
    for (const p of infoPages) {
      const text = [p.lead, ...p.sections.flatMap((s) => [s.heading, ...s.paragraphs])].join(" ");
      expect(text.length, p.path).toBeGreaterThanOrEqual(500);
    }
  });
});

describe("home page JSON-LD", () => {
  const html = (JsonLd() as { props: { dangerouslySetInnerHTML: { __html: string } } }).props.dangerouslySetInnerHTML.__html;
  const graph: Record<string, any>[] = JSON.parse(html)["@graph"];
  const byType = (t: string) => graph.find((n) => [n["@type"]].flat().includes(t));

  it("escapes < so data cannot close the script tag", () => {
    expect(html).not.toContain("<");
  });

  it("describes the person and the website", () => {
    const person = byType("Person")!;
    expect(person.name).toBeTruthy();
    expect(person.sameAs.length).toBeGreaterThan(0);
    expect(person.contactPoint.email).toBeTruthy();
    expect(byType("WebSite")!.url).toBe(seo.url);
  });

  it("has a complete Organization with contactPoint and address", () => {
    const org = byType("Organization")!;
    expect(org.contactPoint).toMatchObject({ "@type": "ContactPoint", contactType: expect.any(String), email: expect.any(String) });
    expect(org.address).toMatchObject({ "@type": "PostalAddress", addressCountry: "IN" });
  });
});
