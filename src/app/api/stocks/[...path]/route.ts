import { clientIp, createLimiter } from "@/lib/rateLimit";

/**
 * Proxy to the Stock AI API (github.com/SohamChaudhari2004/YfinanceMCP).
 * The API key stays on the server, only known routes and query params are passed on,
 * and each visitor gets their own rate limit here because the upstream API only sees
 * this server's IP.
 */

export const runtime = "nodejs";
// The agent can take up to 90 s, plus up to a minute when the free Render plan wakes up.
export const maxDuration = 120;

const API_URL = (process.env.STOCK_API_URL || "https://yfinancemcp.onrender.com").replace(/\/+$/, "");

const chatLimit = createLimiter({ windowMs: 60_000, max: 5 });
const chatDailyLimit = createLimiter({ windowMs: 24 * 60 * 60_000, max: 50 });
const dataLimit = createLimiter({ windowMs: 60_000, max: 40 });

const TICKER = /^[A-Za-z0-9.^=-]{1,20}$/;
const SCREEN = /^[a-z_]{1,40}$/;
const THREAD = /^[A-Za-z0-9_-]{8,64}$/;

type Query = Record<string, RegExp>;

/** Maps an incoming path to the upstream path and the query params it may carry. */
function route(path: string[]): { upstream: string; query: Query; cacheSeconds: number } | null {
  const [a, b, c, ...rest] = path;
  if (rest.length) return null;
  if (a === "health" && !b) return { upstream: "/health", query: {}, cacheSeconds: 0 };
  if (a === "search" && !b) return { upstream: "/api/v1/search", query: { q: /^.{1,80}$/, limit: /^([1-9]|10)$/ }, cacheSeconds: 3600 };
  if (a === "screener" && !b) return { upstream: "/api/v1/screener", query: {}, cacheSeconds: 86400 };
  if (a === "screener" && b && !c && SCREEN.test(b)) {
    return { upstream: `/api/v1/screener/${b}`, query: { offset: /^\d{1,4}$/, count: /^\d{1,2}$/ }, cacheSeconds: 300 };
  }
  if (a === "stocks" && b && TICKER.test(b)) {
    const t = encodeURIComponent(b.toUpperCase());
    if (c === "price") return { upstream: `/api/v1/stocks/${t}/price`, query: { period: /^(5d|1mo|3mo|6mo|1y|5y)$/ }, cacheSeconds: 120 };
    if (c === "info") return { upstream: `/api/v1/stocks/${t}/info`, query: {}, cacheSeconds: 3600 };
    if (c === "income-statement") {
      return { upstream: `/api/v1/stocks/${t}/income-statement`, query: { frequency: /^(yearly|quarterly)$/ }, cacheSeconds: 21600 };
    }
  }
  return null;
}

const json = (body: unknown, status: number, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

const limited = (seconds: number) =>
  json({ detail: "Too many requests. Please slow down." }, 429, { "Retry-After": String(seconds) });

async function forward(upstreamPath: string, init: RequestInit, timeoutMs: number) {
  const key = process.env.STOCK_API_KEY;
  try {
    const res = await fetch(`${API_URL}${upstreamPath}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(key && { "X-API-Key": key }) },
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    const body = await res.text();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const retry = res.headers.get("Retry-After");
    if (retry) headers["Retry-After"] = retry;
    // A wrong key is our problem, not the visitor's: don't leak the upstream message.
    if (res.status === 401) return json({ detail: "The stock service is not configured." }, 503);
    return { res, body, headers };
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    return json({ detail: timedOut ? "The stock service took too long to answer." : "The stock service is unreachable." }, timedOut ? 504 : 502);
  }
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, { params }: Ctx) {
  const { path } = await params;
  const match = route(path);
  if (!match) return json({ detail: "Not found." }, 404);

  const incoming = new URL(request.url).searchParams;
  const query = new URLSearchParams();
  for (const [name, rule] of Object.entries(match.query)) {
    const v = incoming.get(name);
    if (v === null) continue;
    if (!rule.test(v)) return json({ detail: `Invalid ${name}.` }, 400);
    query.set(name, v);
  }

  if (path[0] !== "health") {
    const wait = dataLimit.take(clientIp(request));
    if (wait) return limited(wait);
  }

  const qs = query.size ? `?${query}` : "";
  // Yahoo often refuses a request from the API's cloud IP and accepts the next one,
  // so retry a 503 a couple of times before giving up.
  let out = await forward(`${match.upstream}${qs}`, { method: "GET" }, 75_000);
  for (const delay of [800, 2000]) {
    if (out instanceof Response || out.res.status !== 503) break;
    await new Promise((r) => setTimeout(r, delay));
    out = await forward(`${match.upstream}${qs}`, { method: "GET" }, 30_000);
  }
  if (out instanceof Response) return out;
  const { res, body, headers } = out;
  // Successful lookups are shared by everyone, so let the CDN cache them like the API does.
  if (res.ok && match.cacheSeconds) {
    headers["Cache-Control"] = `public, s-maxage=${match.cacheSeconds}, stale-while-revalidate=${match.cacheSeconds}`;
  } else headers["Cache-Control"] = "no-store";
  return new Response(body, { status: res.status, headers });
}

export async function POST(request: Request, { params }: Ctx) {
  const { path } = await params;
  if (path.join("/") !== "chat") return json({ detail: "Not found." }, 404);

  const input = (await request.json().catch(() => null)) as { message?: unknown; thread_id?: unknown } | null;
  const message = typeof input?.message === "string" ? input.message.trim() : "";
  if (!message || message.length > 2000) return json({ detail: "Write a question of up to 2000 characters." }, 400);
  const thread = typeof input?.thread_id === "string" && THREAD.test(input.thread_id) ? input.thread_id : undefined;

  const ip = clientIp(request);
  const wait = chatLimit.take(ip) || chatDailyLimit.take(ip);
  if (wait) return limited(wait);

  const out = await forward("/api/v1/chat", { method: "POST", body: JSON.stringify({ message, thread_id: thread }) }, 110_000);
  if (out instanceof Response) return out;
  return new Response(out.body, { status: out.res.status, headers: { ...out.headers, "Cache-Control": "no-store" } });
}
