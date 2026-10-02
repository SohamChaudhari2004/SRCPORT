"use client";

import { useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, FlaskConical, House, Info, Maximize2, Minimize2, Minus, Moon, PanelLeft, Sun, X } from "lucide-react";
import { demos } from "./demos";
import { toggleTheme, useTheme } from "@/lib/theme";
import GithubIcon from "@/components/ui/GithubIcon";
import { githubProfile } from "@/lib/derive";
import { site } from "@/data/profile";

const spring = { type: "spring" as const, bounce: 0, duration: 0.45 };

type WindowState = "open" | "minimized" | "closed";

/* ------------------------------------------------------------ url + media */

// The selected model lives in the URL hash, so /playground#mnist deep-links straight to it.
const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const getHash = () => window.location.hash.slice(1);

const mobileQuery = "(max-width: 767px)";
const subscribeMobile = (cb: () => void) => {
  const mq = window.matchMedia(mobileQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getMobile = () => window.matchMedia(mobileQuery).matches;

// Menu-bar clock, ticking once a minute; empty on the server.
const subscribeClock = (cb: () => void) => {
  const id = window.setInterval(cb, 15_000);
  return () => window.clearInterval(id);
};
const getClock = () =>
  new Date().toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** Model groups for the sidebar, in first-seen order. */
const groups = demos.reduce<{ task: string; items: number[] }[]>((acc, d, i) => {
  const g = acc.find((x) => x.task === d.task);
  if (g) g.items.push(i);
  else acc.push({ task: d.task, items: [i] });
  return acc;
}, []);

/* ------------------------------------------------------------------ parts */

function TrafficLights({
  zoomed,
  onClose,
  onMinimize,
  onZoom,
}: {
  zoomed: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onZoom: () => void;
}) {
  // Glyphs appear on hover of the whole group, like macOS.
  const light = "grid size-3 place-items-center rounded-full text-black/60 ring-1 ring-black/10 ring-inset";
  const glyph = "opacity-0 transition-opacity duration-100 group-hover/lights:opacity-100 group-focus-within/lights:opacity-100";
  return (
    <div className="group/lights flex items-center gap-2" onDoubleClick={(e) => e.stopPropagation()}>
      <button type="button" onClick={onClose} aria-label="Close window" className={`${light} bg-[#ff5f57]`}>
        <X size={8} strokeWidth={3} className={glyph} />
      </button>
      <button
        type="button"
        onClick={onMinimize}
        aria-label="Minimize window"
        className={`${light} bg-[#febc2e]`}
      >
        <Minus size={8} strokeWidth={3} className={glyph} />
      </button>
      <button
        type="button"
        onClick={onZoom}
        aria-label={zoomed ? "Exit full screen" : "Enter full screen"}
        aria-pressed={zoomed}
        className={`${light} bg-[#28c840]`}
      >
        {zoomed ? (
          <Minimize2 size={7} strokeWidth={3} className={glyph} />
        ) : (
          <Maximize2 size={7} strokeWidth={3} className={glyph} />
        )}
      </button>
    </div>
  );
}

function DockItem({
  label,
  running,
  onClick,
  href,
  external,
  children,
}: {
  label: string;
  running?: boolean;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  children: ReactNode;
}) {
  const tile =
    "grid size-11 place-items-center rounded-[12px] border border-line bg-bg shadow-sm transition-transform duration-200 ease-out group-hover/item:-translate-y-1.5 group-hover/item:scale-110 group-active/item:scale-95 md:size-12";
  const inner = (
    <>
      <span
        role="tooltip"
        className="label pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-bg opacity-0 transition-opacity duration-150 group-hover/item:opacity-100 group-focus-visible/item:opacity-100"
      >
        {label}
      </span>
      <span className={tile}>{children}</span>
      <span aria-hidden className={`mt-1 size-1 rounded-full ${running ? "bg-ink" : "bg-transparent"}`} />
    </>
  );
  const cls = "group/item relative flex flex-col items-center";
  if (href)
    return external ? (
      <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={cls}>
        {inner}
      </a>
    ) : (
      <Link href={href} aria-label={label} className={cls}>
        {inner}
      </Link>
    );
  return (
    <button type="button" onClick={onClick} aria-label={label} className={cls}>
      {inner}
    </button>
  );
}

/* ------------------------------------------------------------------- page */

export default function Playground() {
  const hash = useSyncExternalStore(subscribeHash, getHash, () => "");
  const isMobile = useSyncExternalStore(subscribeMobile, getMobile, () => false);
  const index = Math.max(0, demos.findIndex((d) => d.anchor === hash));
  const active = demos[index];

  const [win, setWin] = useState<WindowState>("open");
  // Starts full screen; the green light drops it to a floating window and back.
  const [zoomed, setZoomed] = useState(true);
  // Auto-hiding dock: revealed by hovering (or tapping) the bottom edge of the screen.
  const [dockHover, setDockHover] = useState(false);
  // null = follow the screen size (open on desktop, closed on phones) until the user toggles it.
  const [sidebarPref, setSidebarPref] = useState<boolean | null>(null);
  const sidebarOpen = sidebarPref ?? !isMobile;
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  // replaceState keeps the browser from jumping to an anchor; then notify the hash store.
  const select = (i: number) => {
    history.replaceState(null, "", `#${demos[i].anchor}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    if (isMobile) setSidebarPref(false);
  };

  const launch = (i?: number) => {
    if (i !== undefined) select(i);
    setWin("open");
  };
  const close = () => {
    setZoomed(false);
    setWin("closed");
  };
  const minimize = () => setWin("minimized");
  const toggleZoom = () => setZoomed((z) => !z);

  const showDetails = () => {
    setZoomed(false);
    requestAnimationFrame(() => document.getElementById("details")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };


  const onSidebarKey = (e: KeyboardEvent) => {
    const step = { ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = (index + step + demos.length) % demos.length;
    select(next);
    items.current[next]?.focus();
  };

  const Icon = active.icon;
  const theme = useTheme();
  const clock = useSyncExternalStore(subscribeClock, getClock, () => "");
  const menuBtn = "rounded px-1.5 py-0.5 transition-colors hover:bg-white/15";

  return (
    <div className="relative">
      <h1 className="sr-only">Playground: live AI model demos by {site.name}</h1>

      {/* The Mac: bezel with a notch, 95vw x 95vh. */}
      <div className="relative mx-auto mt-[2.5svh] h-[95svh] w-[95vw] rounded-[18px] bg-[#0b0b0c] p-[3px] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.55)] md:p-1">
        <span aria-hidden className="absolute left-1/2 top-[3px] z-[60] flex h-[22px] w-[150px] -translate-x-1/2 items-center justify-center rounded-b-[12px] bg-[#0b0b0c] md:top-1 md:h-[26px] md:w-[180px]">
          <span className="size-1.5 rounded-full bg-[#1d2333] ring-1 ring-[#2c3550]" />
        </span>

        {/* Screen: wallpaper, menu bar, window, dock. */}
        <div
          className="relative h-full w-full overflow-hidden rounded-[15px] bg-bg-2"
          style={{
            backgroundImage:
              "radial-gradient(1200px 600px at 15% 110%, color-mix(in oklab, var(--accent) 38%, transparent), transparent 60%), radial-gradient(900px 500px at 90% -10%, color-mix(in oklab, var(--accent-2) 30%, transparent), transparent 60%)",
          }}
        >
          {/* Menu bar; the notch sits in its middle, so items keep to the sides. */}
          <div className="absolute inset-x-0 top-0 z-50 flex h-[22px] items-center justify-between bg-black/25 px-3 text-[12px] font-medium text-white backdrop-blur-xl md:h-[26px] md:text-[13px]">
            <div className="flex items-center gap-1">
              <Link href="/" aria-label={`${site.name}, home`} className={`${menuBtn} font-mono text-[11px] font-bold`}>
                {site.initials}
              </Link>
              <span className="px-1.5 font-semibold">Playground</span>
              <Link href="/" className={`${menuBtn} hidden sm:inline`}>
                Portfolio
              </Link>
              <button type="button" onClick={showDetails} className={`${menuBtn} hidden sm:inline`}>
                Details
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                onClick={(e) => toggleTheme({ x: e.clientX, y: e.clientY })}
                className={`${menuBtn} grid place-items-center`}
              >
                {theme === "dark" ? <Moon size={13} /> : <Sun size={13} />}
              </button>
              <span className="hidden px-1.5 tabular-nums md:inline">{clock}</span>
            </div>
          </div>

          {/* Desktop shown behind a minimised or closed window. */}
          <div className="absolute inset-0 grid place-items-center">
            <div className="glass rounded-2xl px-6 py-5 text-center">
              <p className="label text-muted">{win === "minimized" ? "Minimised to the dock" : "Window closed"}</p>
              <button type="button" onClick={() => launch()} className="btn-line mt-3">
                {win === "minimized" ? "Restore window" : "Reopen Playground"}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {win !== "closed" && (
              <motion.div
                key="window"
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={
                  win === "minimized"
                    ? { opacity: 0, scale: 0.12, y: "55%", transitionEnd: { visibility: "hidden" } }
                    : { opacity: 1, scale: 1, y: 0, visibility: "visible" }
                }
                exit={{ opacity: 0, scale: 0.94 }}
                transition={spring}
                role="application"
                aria-roledescription="window"
                aria-label={`Playground: ${active.title}`}
                style={{ transformOrigin: "50% 100%" }}
                className={`absolute z-20 flex flex-col overflow-hidden border border-line-strong bg-bg shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] ${
                  zoomed
                    ? "inset-x-0 bottom-0 top-[22px] rounded-none border-x-0 border-b-0 md:top-[26px]"
                    : "inset-x-2 bottom-4 top-[34px] rounded-[12px] md:inset-x-[5%] md:bottom-[6%] md:top-[56px]"
                }`}
              >
                {/* Title bar */}
                <div
                  onDoubleClick={toggleZoom}
                  className="relative grid h-10 shrink-0 select-none grid-cols-[1fr_auto_1fr] items-center border-b border-line bg-bg-2 px-3.5"
                >
                  <div className="flex items-center gap-4">
                    <TrafficLights zoomed={zoomed} onClose={close} onMinimize={minimize} onZoom={toggleZoom} />
                    <button
                      type="button"
                      onClick={() => setSidebarPref(!sidebarOpen)}
                      aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                      aria-pressed={sidebarOpen}
                      className="grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-ink/10 hover:text-ink"
                    >
                      <PanelLeft size={15} strokeWidth={1.75} />
                    </button>
                  </div>
                  <p className="flex min-w-0 items-center gap-2 text-[13px] font-semibold">
                    <Icon size={14} strokeWidth={1.9} className="shrink-0 text-accent" />
                    <span className="truncate">{active.title}</span>
                    <span className="hidden font-normal text-muted sm:inline">— Playground</span>
                  </p>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={showDetails}
                      aria-label="Model details"
                      className="grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-ink/10 hover:text-ink"
                    >
                      <Info size={15} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>

                <div className="relative flex min-h-0 flex-1">
                  {/* Sidebar: the list of models. Overlays the content on phones. */}
                  <AnimatePresence initial={false}>
                    {sidebarOpen && (
                      <motion.nav
                        key="sidebar"
                        aria-label="Models"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 220, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={spring}
                        className="absolute inset-y-0 left-0 z-10 shrink-0 overflow-hidden border-r border-line bg-bg-2/95 backdrop-blur-xl md:relative md:bg-bg-2/70"
                      >
                        <div className="flex h-full w-[220px] flex-col p-3" onKeyDown={onSidebarKey}>
                          {groups.map((g) => (
                            <div key={g.task} className="mb-4">
                              <p className="px-2 pb-1.5 text-[11px] font-semibold text-muted">{g.task}</p>
                              <ul className="grid gap-0.5">
                                {g.items.map((i) => {
                                  const d = demos[i];
                                  const on = i === index;
                                  const ItemIcon = d.icon;
                                  return (
                                    <li key={d.slug}>
                                      <button
                                        ref={(el) => {
                                          items.current[i] = el;
                                        }}
                                        type="button"
                                        onClick={() => select(i)}
                                        aria-current={on ? "page" : undefined}
                                        className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${
                                          on ? "bg-accent text-white" : "hover:bg-ink/[0.07]"
                                        }`}
                                      >
                                        <ItemIcon size={15} strokeWidth={1.9} className={on ? "" : "text-accent"} />
                                        <span className="flex-1 truncate font-medium">{d.title}</span>
                                        <span className={`text-[11px] tabular-nums ${on ? "text-white/70" : "text-muted"}`}>
                                          {d.size}
                                        </span>
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))}
                          <div className="mt-auto rounded-lg border border-line bg-bg/60 p-3 text-[12px] leading-relaxed text-muted">
                            <p className="flex items-center gap-1.5 font-semibold text-ink">
                              <span className="size-1.5 rounded-full bg-[#28c840]" /> {active.onDevice ? "On-device" : "Live API"}
                            </p>
                            <p className="mt-1">
                              {active.onDevice
                                ? "Runs in your browser. No server, nothing uploaded."
                                : "Calls my deployed API through this site. The first request may take a minute while the server wakes."}
                            </p>
                          </div>
                        </div>
                      </motion.nav>
                    )}
                  </AnimatePresence>

                  {/* Main area: the live demo. */}
                  <div className="min-w-0 flex-1 overflow-y-auto overscroll-contain">
                    {win === "open" && (
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={active.slug}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                          className="p-3 md:p-5"
                        >
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <p className="max-w-[60ch] text-[14px] text-ink-2">{active.blurb}</p>
                            <p className="text-[12px] text-muted">{active.hint}</p>
                          </div>
                          <active.Demo />
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
                </div>

                {/* Status bar */}
                <div className="flex h-7 shrink-0 items-center justify-between gap-4 border-t border-line bg-bg-2 px-3.5 text-[11px] text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-[#28c840]" /> Ready · {active.runtime}
                  </span>
                  <span className="hidden tabular-nums sm:inline">{active.footnote}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dock: hidden until the pointer reaches the bottom edge, like macOS auto-hide.
              Always shown when no window is open, since there is nothing to cover. */}
          <div
            aria-hidden
            onPointerEnter={() => setDockHover(true)}
            onClick={() => setDockHover(true)}
            className="absolute inset-x-0 bottom-0 z-40 h-3"
          />
          <nav
            aria-label="Dock"
            onPointerEnter={() => setDockHover(true)}
            onPointerLeave={() => setDockHover(false)}
            onFocus={() => setDockHover(true)}
            onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setDockHover(false)}
            className={`absolute bottom-2 left-1/2 z-50 -translate-x-1/2 transition-[translate,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] md:bottom-3 ${
              dockHover || win !== "open" ? "" : "pointer-events-none translate-y-[calc(100%+20px)] opacity-0"
            }`}
          >
            <div className="glass flex items-end gap-1.5 rounded-[18px] px-2.5 pb-1 pt-2 md:gap-2.5 md:px-3 md:pt-2.5">
              <DockItem label="Playground" running={win !== "closed"} onClick={() => launch()}>
                <span className="grid size-full place-items-center rounded-[11px] bg-accent text-white">
                  <FlaskConical size={20} strokeWidth={1.9} />
                </span>
              </DockItem>
              {demos.map((d, i) => {
                const DIcon = d.icon;
                return (
                  <DockItem
                    key={d.slug}
                    label={`Open ${d.title}`}
                    running={win !== "closed" && i === index}
                    onClick={() => launch(i)}
                  >
                    <DIcon size={20} strokeWidth={1.75} className="text-accent" />
                  </DockItem>
                );
              })}
              <span aria-hidden className="mx-0.5 mb-3 h-9 w-px bg-line-strong" />
              <DockItem label="Portfolio" href="/">
                <House size={19} strokeWidth={1.75} />
              </DockItem>
              <DockItem label="GitHub" href={githubProfile.url} external>
                <GithubIcon size={19} />
              </DockItem>
            </div>
          </nav>
        </div>
      </div>

      {/* Details live outside the screen. */}
      <main className="shell pb-24">
        <section id="details" aria-labelledby="details-title" className="mt-16 scroll-mt-6 md:mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
            <div>
              <p className="label text-muted">Model details</p>
              <h2
                id="details-title"
                className="mt-2 text-[clamp(1.8rem,4vw,3rem)] font-bold uppercase leading-none tracking-[-0.05em]"
              >
                {active.title}
              </h2>
              <p className="mt-3 max-w-[56ch] text-ink-2">{active.blurb}</p>
            </div>
            <Link href={`/projects/${active.slug}`} className="btn-brutal">
              Read the case study <ArrowUpRight size={14} />
            </Link>
          </div>
          <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {active.spec.map((s) => (
              <div key={s.label} className="bg-bg p-5">
                <dt className="label text-muted">{s.label}</dt>
                <dd className="mt-2 text-[17px] font-medium leading-snug tracking-[-0.01em]">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </div>
  );
}
