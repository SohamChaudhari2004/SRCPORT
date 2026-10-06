import { describe, expect, it } from "vitest";
import { createLimiter } from "@/lib/rateLimit";
import { GET } from "@/app/api/stocks/[...path]/route";

describe("rate limiter", () => {
  it("allows up to max hits per window, then returns seconds to wait", () => {
    const l = createLimiter({ windowMs: 60_000, max: 2 });
    expect(l.take("a")).toBe(0);
    expect(l.take("a")).toBe(0);
    expect(l.take("a")).toBeGreaterThan(0);
    expect(l.take("b")).toBe(0);
  });
});

describe("stock proxy validation", () => {
  const get = (path: string[], qs = "") =>
    GET(new Request(`https://x/api/stocks/${path.join("/")}${qs}`), { params: Promise.resolve({ path }) });

  it("rejects routes that are not on the allowlist", async () => {
    expect((await get(["stocks", "AAPL", "delete"])).status).toBe(404);
    expect((await get(["admin"])).status).toBe(404);
    expect((await get(["stocks", "../../etc", "info"])).status).toBe(404);
  });

  it("rejects invalid query values", async () => {
    expect((await get(["stocks", "AAPL", "price"], "?period=10y")).status).toBe(400);
  });
});
