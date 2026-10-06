import { describe, expect, it } from "vitest";
import { markdownFor } from "@/lib/agentContent";
import { GET } from "@/app/md/[[...path]]/route";
import sitemap from "@/app/sitemap";
import { seo } from "@/data/seo";

const call = (path: string[]) => GET(new Request("https://x"), { params: Promise.resolve({ path }) });

describe("markdown pages", () => {
  it("has Markdown for every page in the sitemap", () => {
    for (const { url } of sitemap()) {
      const path = url.replace(seo.url, "") || "/";
      if (/\.[a-z0-9]+$/i.test(path)) continue; // files such as the resume PDF
      const { status, body } = markdownFor(path);
      expect(status, path).toBe(200);
      expect(body.startsWith("# "), path).toBe(true);
      expect(body.length, path).toBeGreaterThan(200);
    }
  });

  it("returns a helpful Markdown 404 for unknown paths", () => {
    const { status, body } = markdownFor("/__probe-404");
    expect(status).toBe(404);
    expect(body).toContain("404");
    expect(body).toContain(`${seo.url}/llms.txt`);
    expect(body).toContain(`${seo.url}/sitemap.xml`);
  });

  it("serves text/markdown with Vary: Accept and the right status", async () => {
    const home = await call([]);
    expect(home.status).toBe(200);
    expect(home.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    expect(home.headers.get("vary")).toBe("Accept");
    expect(home.headers.get("link")).toBe(`<${seo.url}>; rel="canonical"`);
    expect((await home.text()).length).toBeGreaterThan(500);

    const missing = await call(["nope", "deeper"]);
    expect(missing.status).toBe(404);
    expect(missing.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    expect(missing.headers.get("vary")).toBe("Accept");
  });
});
