/**
 * Browser client for the Stock AI API. Calls go through this site's /api/stocks proxy,
 * which holds the API key and rate-limits per visitor.
 */

export type Period = "5d" | "1mo" | "3mo" | "6mo" | "1y" | "5y";

export interface ChatReply {
  reply: string;
  thread_id: string;
  tools_used: string[];
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export interface PriceData {
  symbol: string;
  currency: string;
  price: number;
  previous_close: number;
  change: number;
  change_percent: number;
  as_of: string;
  period: Period;
  history: { date: string; close: number }[];
}

/** Yahoo omits fields it doesn't have, so every metric is optional. */
export interface StockInfo {
  symbol: string;
  longName?: string;
  shortName?: string;
  exchange?: string;
  currency?: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  trailingPE?: number;
  forwardPE?: number;
  dividendYield?: number;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
  beta?: number;
  averageAnalystRating?: string;
  longBusinessSummary?: string;
}

export class StockApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/stocks/${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
      signal: init.signal ?? AbortSignal.timeout(120_000),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new StockApiError(0, "Could not reach the server. Check your connection.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = typeof data.detail === "string" ? data.detail : "Invalid request.";
    throw new StockApiError(res.status, detail, Number(res.headers.get("Retry-After")) || undefined);
  }
  return data as T;
}

/** A short, human message for any error thrown by the client. */
export function describeError(err: unknown) {
  if (!(err instanceof StockApiError)) return "Something went wrong. Please try again.";
  switch (err.status) {
    case 404:
      return "Nothing found for that. Check the ticker.";
    case 429:
      return `Too many requests. Try again in ${err.retryAfter ?? 60}s.`;
    case 503:
      return err.retryAfter
        ? `The data source is busy. Try again in ${err.retryAfter}s.`
        : "The stock service is unavailable right now. Try again shortly.";
    case 504:
      return "That took too long. Try a narrower question.";
    default:
      return err.message;
  }
}

const t = (ticker: string) => encodeURIComponent(ticker.trim().toUpperCase());

export const stockApi = {
  /** Wakes the free-plan server so the first real request is fast. */
  wake: () => request<{ status: string }>("health").catch(() => null),
  chat: (message: string, thread_id?: string) =>
    request<ChatReply>("chat", { method: "POST", body: JSON.stringify({ message, thread_id }) }),
  search: (q: string, init?: RequestInit) =>
    request<{ query: string; results: SearchResult[] }>(`search?q=${encodeURIComponent(q)}&limit=6`, init),
  price: (ticker: string, period: Period = "1mo") => request<PriceData>(`stocks/${t(ticker)}/price?period=${period}`),
  info: (ticker: string) => request<StockInfo>(`stocks/${t(ticker)}/info`),
};
