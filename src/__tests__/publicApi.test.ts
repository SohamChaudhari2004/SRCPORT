import { describe, expect, it } from "vitest";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { AddressInfo } from "node:net";
import { handleApiGet } from "@/lib/publicApi";
import { openApiDocument } from "@/lib/openapi";
import { GET, POST, OPTIONS } from "@/app/api/v1/[...path]/route";
import { GET as catchAll, POST as catchAllPost } from "@/app/api/[...path]/route";
import { GET as openapiRoute } from "@/app/openapi.json/route";
import { categories, servicesUrl, solutions } from "@/data/services";
import { projectViews } from "@/lib/derive";
import { demos } from "@/components/playground/demos";
import { seo } from "@/data/seo";

/* eslint-disable @typescript-eslint/no-explicit-any */
const q = (s = "") => new URLSearchParams(s);
const v1 = (path: string[], qs = "") =>
  GET(new Request(`https://x/api/v1/${path.join("/")}${qs}`), { params: Promise.resolve({ path }) });

const expectError = (body: any, code: string) => {
  expect(body.error).toMatchObject({ code, message: expect.any(String), hint: expect.any(String) });
  expect(body.error.docs).toBe(`${seo.url}/openapi.json`);
};

describe("public API handlers", () => {
  it("lists and fetches solutions, with category filtering", () => {
    const all = handleApiGet(["solutions"], q()).body as any;
    expect(all.solutions).toHaveLength(solutions.length);
    expect(all.categories).toEqual(categories);
    const filtered = handleApiGet(["solutions"], q("category=Automation")).body as any;
    expect(filtered.solutions.length).toBeGreaterThan(0);
    expect(filtered.solutions.every((s: any) => s.category === "Automation")).toBe(true);
    const one = handleApiGet(["solutions", "ai-crm"], q());
    expect(one.status).toBe(200);
    expect((one.body as any).features.length).toBeGreaterThan(0);
  });

  it("returns profile, projects and demos", () => {
    expect((handleApiGet(["profile"], q()).body as any).email).toBeTruthy();
    expect((handleApiGet(["projects"], q()).body as any).projects).toHaveLength(projectViews.length);
    expect((handleApiGet(["projects", "stock-ai"], q()).body as any).caseStudy.stack.length).toBeGreaterThan(0);
    expect((handleApiGet(["demos"], q()).body as any).demos).toHaveLength(demos.length);
  });

  it("returns structured JSON errors with a hint", () => {
    const missing = handleApiGet(["solutions", "nope"], q());
    expect(missing.status).toBe(404);
    expectError(missing.body, "not_found");
    const bad = handleApiGet(["solutions"], q("category=Nope"));
    expect(bad.status).toBe(400);
    expectError(bad.body, "invalid_parameter");
    expect(handleApiGet(["nope"], q()).status).toBe(404);
    expect(handleApiGet(["profile", "extra"], q()).status).toBe(404);
  });
});

describe("API routes", () => {
  it("serve JSON with CORS and caching", async () => {
    const res = await v1(["solutions"]);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect(res.headers.get("cache-control")).toContain("s-maxage");
    const err = await v1(["solutions", "nope"]);
    expect(err.headers.get("cache-control")).toBe("no-store");
  });

  it("reject writes with a JSON 405", async () => {
    const res = POST(new Request("https://x/api/v1/solutions", { method: "POST" }));
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toBe("GET, OPTIONS");
    expectError(await res.json(), "method_not_allowed");
    expect(OPTIONS().status).toBe(204);
  });

  it("answer unknown /api paths with a JSON 404", async () => {
    for (const handler of [catchAll, catchAllPost]) {
      const res = await handler(new Request("https://x/api/nothing/here"), { params: Promise.resolve({ path: ["nothing", "here"] }) });
      expect(res.status).toBe(404);
      expect(res.headers.get("content-type")).toContain("application/json");
      expectError(await res.json(), "not_found");
    }
  });
});

describe("OpenAPI document", () => {
  const doc = openApiDocument() as any;
  const operations = Object.entries(doc.paths).flatMap(([path, item]: [string, any]) =>
    Object.entries(item).map(([method, op]: [string, any]) => ({ path, method, op })),
  );

  it("is OpenAPI 3.1 with servers for both sites", () => {
    expect(doc.openapi).toBe("3.1.0");
    expect(doc.info.title).toBeTruthy();
    expect(doc.servers.map((s: any) => s.url)).toEqual([seo.url, servicesUrl]);
    expect((openApiDocument(servicesUrl) as any).servers[0].url).toBe(servicesUrl);
  });

  it("has a unique operationId, a description and typed responses on every operation", () => {
    const ids = operations.map((o) => o.op.operationId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const { path, op } of operations) {
      expect(op.operationId, path).toMatch(/^[a-z][A-Za-z]+$/);
      expect(op.summary, path).toBeTruthy();
      expect(op.description?.length, path).toBeGreaterThan(30);
      for (const p of op.parameters ?? []) expect(p.schema?.type, `${path} ${p.name}`).toBe("string");
      const ok = op.responses["200"];
      expect(ok?.content?.["application/json"]?.schema, path).toBeTruthy();
    }
  });

  it("resolves every $ref", () => {
    const refs = JSON.stringify(doc).match(/#\/components\/(schemas|responses)\/\w+/g) ?? [];
    for (const r of refs) {
      const [, , kind, name] = r.split("/");
      expect(doc.components[kind][name], r).toBeTruthy();
    }
  });

  it("documents exactly the GET endpoints the handlers serve", () => {
    for (const { path, method, op } of operations) {
      if (method !== "get") continue;
      const example = op.parameters?.find((p: any) => p.in === "path")?.schema.examples[0];
      const segments = path.replace("/api/v1/", "").replace("{slug}", example ?? "").split("/").filter(Boolean);
      expect(handleApiGet(segments, q()).status, path).toBe(200);
    }
  });

  it("is served at /openapi.json with the requesting host first", async () => {
    const res = openapiRoute(new Request("https://x/openapi.json", { headers: { host: "services.sohamchaudhari.in" } }));
    expect(res.headers.get("content-type")).toContain("application/json");
    expect((await res.json()).servers[0].url).toBe(servicesUrl);
  });
});

describe("CLI", () => {
  const run = promisify(execFile);

  it("talks to the API end to end", async () => {
    const server = createServer((req, res) => {
      const url = new URL(req.url!, "http://local");
      const { status, body } = handleApiGet(url.pathname.replace(/^\/api\/v1\//, "").split("/").filter(Boolean), url.searchParams);
      res.writeHead(status, { "Content-Type": "application/json" }).end(JSON.stringify(body));
    });
    await new Promise<void>((r) => server.listen(0, r));
    const env = { ...process.env, SOHAM_API_URL: `http://127.0.0.1:${(server.address() as AddressInfo).port}` };
    const cli = (...args: string[]) => run(process.execPath, ["cli/bin/sohamchaudhari.mjs", ...args], { env });
    try {
      const list = await cli("solutions");
      expect(list.stdout).toContain("ai-crm");
      const json = JSON.parse((await cli("solution", "ai-crm", "--json")).stdout);
      expect(json.slug).toBe("ai-crm");
      expect((await cli("profile")).stdout).toContain("Email:");
      await expect(cli("solution", "nope")).rejects.toMatchObject({ stderr: expect.stringContaining("No solution") });
      expect((await cli("--help")).stdout).toContain("Usage: sohamchaudhari");
    } finally {
      server.close();
    }
  });
});
