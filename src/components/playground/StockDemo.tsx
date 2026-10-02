"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUp, Loader2, RotateCcw, Search } from "lucide-react";
import {
  describeError,
  stockApi,
  type Period,
  type PriceData,
  type SearchResult,
  type StockInfo,
} from "@/lib/stockApi";

type Mode = "ask" | "quote";

/** Live demo of the Stock AI API: an LLM agent chat and a plain data lookup. */
export default function StockDemo() {
  const [mode, setMode] = useState<Mode>("ask");

  // The API runs on a free plan that sleeps; wake it while the visitor reads.
  useEffect(() => {
    stockApi.wake();
  }, []);

  return (
    <div>
      <div role="tablist" aria-label="Demo mode" className="mb-3 inline-flex rounded-lg border border-line bg-bg-2 p-0.5">
        {(
          [
            ["ask", "Ask the agent"],
            ["quote", "Quote lookup"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            onClick={() => setMode(id)}
            className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
              mode === id ? "bg-bg text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === "ask" ? <Chat /> : <Quote />}
      <p className="mt-3 px-1 text-[12px] leading-relaxed text-muted">
        Data from Yahoo Finance, may be delayed. Answers are written by an LLM and are not investment advice.
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------------------- Chat */

type Msg = { role: "user" | "assistant"; text: string; tools?: string[]; error?: boolean };

const SUGGESTIONS = [
  "What is Nvidia trading at, and what is its P/E?",
  "Top 5 day gainers today",
  "Compare Apple and Microsoft valuation",
  "How has Reliance Industries' revenue changed?",
];

const THREAD_KEY = "stock-thread";

const readThread = () => {
  try {
    return sessionStorage.getItem(THREAD_KEY) ?? undefined;
  } catch {
    return undefined;
  }
};

const saveThread = (id: string | null) => {
  try {
    if (id) sessionStorage.setItem(THREAD_KEY, id);
    else sessionStorage.removeItem(THREAD_KEY);
  } catch {}
};

const md: Components = {
  p: (p) => <p className="my-2 first:mt-0 last:mb-0" {...p} />,
  ul: (p) => <ul className="my-2 list-disc space-y-1 pl-5" {...p} />,
  ol: (p) => <ol className="my-2 list-decimal space-y-1 pl-5" {...p} />,
  strong: (p) => <strong className="font-semibold text-ink" {...p} />,
  a: (p) => <a className="text-accent underline underline-offset-2" target="_blank" rel="noreferrer" {...p} />,
  h1: (p) => <p className="mb-2 mt-3 font-semibold text-ink" {...p} />,
  h2: (p) => <p className="mb-2 mt-3 font-semibold text-ink" {...p} />,
  h3: (p) => <p className="mb-2 mt-3 font-semibold text-ink" {...p} />,
  table: (p) => (
    <div className="my-2 overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-collapse text-[13px] tabular-nums" {...p} />
    </div>
  ),
  th: (p) => <th className="border-b border-line bg-bg-2 px-3 py-1.5 text-left font-semibold text-ink" {...p} />,
  td: (p) => <td className="border-b border-line px-3 py-1.5 align-top" {...p} />,
  code: (p) => <code className="rounded bg-bg-2 px-1 py-0.5 font-mono text-[12px]" {...p} />,
};

function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const thread = useRef<string | undefined>(undefined);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) return;
    setMessages((m) => [...m, { role: "user", text: message }]);
    setInput("");
    setLoading(true);
    setSlow(false);
    const timer = setTimeout(() => setSlow(true), 12_000);
    try {
      thread.current ??= readThread();
      const res = await stockApi.chat(message, thread.current);
      thread.current = res.thread_id;
      saveThread(res.thread_id);
      setMessages((m) => [...m, { role: "assistant", text: res.reply, tools: res.tools_used }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: describeError(err), error: true }]);
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }

  function reset() {
    thread.current = undefined;
    saveThread(null);
    setMessages([]);
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-bg">
      <div ref={listRef} className="h-[46svh] min-h-64 overflow-y-auto px-3 py-4 md:px-4" aria-live="polite">
        {messages.length === 0 ? (
          <div className="grid h-full place-content-center gap-4 text-center">
            <p className="text-[14px] text-ink-2">
              Ask about any listed company. The agent looks up live prices, metrics, financials and screeners itself.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-line bg-bg-2 px-3 py-1.5 text-[13px] text-ink-2 transition-colors hover:border-accent hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <li key={i} className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2 text-[14px] text-white">{m.text}</p>
                </li>
              ) : (
                <li key={i} className="max-w-[95%]">
                  <div className={`text-[14px] leading-relaxed ${m.error ? "text-signal" : "text-ink-2"}`}>
                    {m.error ? m.text : <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>{m.text}</ReactMarkdown>}
                  </div>
                  {m.tools?.length ? (
                    <p className="mt-2 flex flex-wrap gap-1.5">
                      {[...new Set(m.tools)].map((tool) => (
                        <span key={tool} className="rounded-md bg-bg-2 px-1.5 py-0.5 font-mono text-[11px] text-muted">
                          {tool}
                        </span>
                      ))}
                    </p>
                  ) : null}
                </li>
              ),
            )}
            {loading && (
              <li className="flex items-center gap-2 text-[13px] text-muted">
                <Loader2 size={14} className="animate-spin" />
                {slow ? "Still working. The server may be waking up, which takes up to a minute." : "Looking up live data…"}
              </li>
            )}
          </ul>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-line bg-bg-2 p-2">
        {messages.length > 0 && (
          <button
            type="button"
            onClick={reset}
            disabled={loading}
            title="New conversation"
            aria-label="New conversation"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-ink/10 hover:text-ink disabled:opacity-40"
          >
            <RotateCcw size={15} />
          </button>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={2000}
          placeholder="Ask about a stock…"
          aria-label="Your question"
          className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 text-[14px] outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send"
          className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-white transition-opacity disabled:opacity-40"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowUp size={16} />}
        </button>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------------------- Quote */

const PERIODS: Period[] = ["5d", "1mo", "3mo", "6mo", "1y", "5y"];

type QuoteState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; price: PriceData; info: null };

function money(v: number | undefined, currency = "USD") {
  if (v == null) return "—";
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 2 }).format(v);
  } catch {
    return v.toFixed(2);
  }
}

const compact = (v: number | undefined, currency = "USD") =>
  v == null
    ? "—"
    : (() => {
        try {
          return new Intl.NumberFormat("en", { style: "currency", currency, notation: "compact", maximumFractionDigits: 2 }).format(v);
        } catch {
          return new Intl.NumberFormat("en", { notation: "compact" }).format(v);
        }
      })();

const num = (v: number | undefined, suffix = "") => (v == null ? "—" : `${v.toFixed(2)}${suffix}`);

function Quote() {
  const [symbol, setSymbol] = useState("NVDA");
  const [period, setPeriod] = useState<Period>("1mo");
  const [state, setState] = useState<QuoteState>({ status: "loading" });
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<{ q: string; results: SearchResult[] } | null>(null);
  const [infoTry, setInfoTry] = useState(0);
  const [infoState, setInfoState] = useState<{ key: string; info: StockInfo | null; loading: boolean }>({
    key: "",
    info: null,
    loading: false,
  });

  useEffect(() => {
    let alive = true;
    stockApi
      .price(symbol, period)
      .then((price) => alive && setState({ status: "ready", price, info: null }))
      .catch((err) => alive && setState({ status: "error", message: describeError(err) }));
    return () => {
      alive = false;
    };
  }, [symbol, period]);

  // Company details load separately: Yahoo rate-limits them more often than prices,
  // and a failure there shouldn't hide the price and chart.
  useEffect(() => {
    let alive = true;
    stockApi
      .info(symbol)
      .then((info) => alive && setInfoState({ key: symbol, info, loading: false }))
      .catch(() => alive && setInfoState({ key: symbol, info: null, loading: false }));
    return () => {
      alive = false;
    };
  }, [symbol, infoTry]);

  const info = infoState.key === symbol ? infoState.info : null;
  const infoPending = infoState.key !== symbol || infoState.loading;

  function retryInfo() {
    setInfoState((s) => ({ ...s, loading: true }));
    setInfoTry((n) => n + 1);
  }

  // Debounced company-name search.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const ctrl = new AbortController();
    const id = setTimeout(() => {
      stockApi
        .search(q, { signal: ctrl.signal })
        .then((r) => setFound({ q, results: r.results }))
        .catch(() => {});
    }, 300);
    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [query]);

  const results = found && found.q === query.trim() ? found.results : [];

  function open(next: string) {
    const s = next.trim().toUpperCase();
    if (!s) return;
    setQuery("");
    setFound(null);
    if (s === symbol) return;
    setState({ status: "loading" });
    setSymbol(s);
  }

  function changePeriod(p: Period) {
    if (p === period) return;
    setState({ status: "loading" });
    setPeriod(p);
  }

  return (
    <div className="rounded-xl border border-line bg-bg p-3 md:p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          open(results[0]?.symbol ?? query);
        }}
        className="relative"
      >
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Company or ticker, e.g. Tesla, TCS.NS, ^GSPC"
          aria-label="Search for a company or ticker"
          className="h-10 w-full rounded-lg border border-line bg-bg-2 pl-9 pr-3 text-[14px] outline-none placeholder:text-muted focus:border-accent"
        />
        {results.length > 0 && (
          <ul className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-line bg-bg shadow-lg">
            {results.map((r) => (
              <li key={r.symbol}>
                <button
                  type="button"
                  onClick={() => open(r.symbol)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[13px] hover:bg-bg-2"
                >
                  <span className="min-w-0 truncate text-ink">{r.name}</span>
                  <span className="shrink-0 font-mono text-[12px] text-muted">
                    {r.symbol} · {r.exchange}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      <div className="mt-4 min-h-72">
        {state.status === "loading" && (
          <p className="grid h-72 place-items-center text-[13px] text-muted">
            <span className="inline-flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Loading {symbol}
            </span>
          </p>
        )}
        {state.status === "error" && <p className="grid h-72 place-items-center text-[14px] text-signal">{state.message}</p>}
        {state.status === "ready" && (
          <QuoteView
            price={state.price}
            info={info}
            infoPending={infoPending}
            onRetryInfo={retryInfo}
            period={period}
            onPeriod={changePeriod}
          />
        )}
      </div>
    </div>
  );
}

function QuoteView({
  price,
  info,
  infoPending,
  onRetryInfo,
  period,
  onPeriod,
}: {
  price: PriceData;
  info: StockInfo | null;
  infoPending: boolean;
  onRetryInfo: () => void;
  period: Period;
  onPeriod: (p: Period) => void;
}) {
  const cur = price.currency || info?.currency || "USD";
  const up = price.change >= 0;
  const closes = price.history.map((h) => h.close);
  const first = closes[0];
  const last = closes[closes.length - 1];
  const rangeUp = last >= first;

  const periodChange = first ? ((last - first) / first) * 100 : 0;
  // Always available from the price history, whatever Yahoo returns for company info.
  const fromHistory: [string, string][] = [
    ["Previous close", money(price.previous_close, cur)],
    [`${period.toUpperCase()} high`, money(Math.max(...closes), cur)],
    [`${period.toUpperCase()} low`, money(Math.min(...closes), cur)],
    [`${period.toUpperCase()} change`, `${periodChange >= 0 ? "+" : ""}${periodChange.toFixed(2)}%`],
  ];
  const fromInfo: [string, string | undefined][] = info
    ? [
        ["Market cap", info.marketCap != null ? compact(info.marketCap, cur) : undefined],
        ["P/E (trailing)", info.trailingPE != null ? num(info.trailingPE) : undefined],
        ["P/E (forward)", info.forwardPE != null ? num(info.forwardPE) : undefined],
        ["Dividend yield", info.dividendYield != null ? num(info.dividendYield, "%") : undefined],
        [
          "52-week range",
          info.fiftyTwoWeekLow != null && info.fiftyTwoWeekHigh != null
            ? `${money(info.fiftyTwoWeekLow, cur)} – ${money(info.fiftyTwoWeekHigh, cur)}`
            : undefined,
        ],
        ["Beta", info.beta != null ? num(info.beta) : undefined],
        ["Industry", info.industry],
        ["Analyst rating", info.averageAnalystRating],
      ]
    : [];
  // Yahoo omits fields it doesn't have; show only what came back.
  const metrics = [...fromHistory, ...fromInfo.filter((m): m is [string, string] => Boolean(m[1]))];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] text-muted">
            {info?.longName ?? info?.shortName ?? price.symbol}
            {info?.sector ? ` · ${info.sector}` : ""}
          </p>
          <p className="mt-0.5 flex items-baseline gap-3">
            <span className="text-[28px] font-semibold tracking-[-0.02em] tabular-nums">{money(price.price, cur)}</span>
            <span className={`text-[14px] font-medium tabular-nums ${up ? "text-accent-2" : "text-signal"}`}>
              {up ? "+" : ""}
              {price.change.toFixed(2)} ({up ? "+" : ""}
              {price.change_percent.toFixed(2)}%)
            </span>
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-line bg-bg-2 p-0.5" role="group" aria-label="Chart period">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={p === period}
              onClick={() => onPeriod(p)}
              className={`rounded-md px-2 py-1 text-[12px] font-medium uppercase transition-colors ${
                p === period ? "bg-bg text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <Chart values={closes} up={rangeUp} label={`${price.symbol} closing prices, ${period}`} />
      <p className="mt-1 flex justify-between text-[11px] tabular-nums text-muted">
        <span>{price.history[0]?.date}</span>
        <span>{price.history[price.history.length - 1]?.date}</span>
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
        {metrics.map(([k, v]) => (
          <div key={k} className="bg-bg px-3 py-2">
            <dt className="text-[11px] text-muted">{k}</dt>
            <dd className="mt-0.5 truncate text-[14px] font-medium tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      {!info && (
        <p className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-muted">
          {infoPending ? (
            <>
              <Loader2 size={12} className="animate-spin" /> Loading company details
            </>
          ) : (
            <>
              Company details are rate limited by Yahoo right now.
              <button type="button" onClick={onRetryInfo} className="font-medium text-accent hover:underline">
                Retry
              </button>
            </>
          )}
        </p>
      )}
      {info?.longBusinessSummary && (
        <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-ink-2">{info.longBusinessSummary}</p>
      )}
    </div>
  );
}

function Chart({ values, up, label }: { values: number[]; up: boolean; label: string }) {
  if (values.length < 2) return <div className="mt-4 h-40 rounded-lg bg-bg-2" />;
  const W = 600;
  const H = 160;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * W, H - 8 - ((v - min) / span) * (H - 16)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const color = up ? "var(--accent-2)" : "var(--signal)";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label} className="mt-4 block h-40 w-full">
      <defs>
        <linearGradient id="stock-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${W},${H} L0,${H} Z`} fill="url(#stock-fill)" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}
