"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, FileText, Menu, Moon, Sun, X } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { activeSectionStore, bootStore, useStore } from "@/lib/store";
import { SECTIONS } from "@/lib/sections";
import { site } from "@/lib/site";
import { resumeUrl } from "@/lib/derive";
import { toggleTheme, useTheme } from "@/lib/theme";
import { openContact } from "@/lib/contact";
import { playWhoosh, setSound, soundStore } from "@/lib/sound";
import { scrollToId } from "./SmoothScroll";

const NAV = SECTIONS.map((s, i) => ({ ...s, i })).filter((s) => s.nav);

/** explore shares the "Work" tab */
const navIndexFor = (active: number) => {
  const id = SECTIONS[active]?.id;
  if (id === "explore") return NAV.findIndex((n) => n.id === "work");
  return NAV.findIndex((n) => n.i === active);
};

const spring = { type: "spring" as const, bounce: 0, duration: 0.45 };

/** Pulsing dot that marks the Playground link as live. */
const LiveDot = () => (
  <span aria-hidden className="relative flex size-1.5">
    <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-2 opacity-70" />
    <span className="relative inline-flex size-1.5 rounded-full bg-accent-2" />
  </span>
);

function ScrambleLink({ label, onClick, active }: { label: string; onClick: () => void; active: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={() =>
        ref.current &&
        gsap.to(ref.current, {
          duration: 0.55,
          scrambleText: { text: label, chars: "01ABCDEFGHIJKLMNOPQRSTUVWXYZ", speed: 0.7 },
        })
      }
      className="relative z-10 rounded-full px-3 py-2 transition-colors duration-200"
      aria-current={active ? "true" : undefined}
      style={{ color: active ? "var(--bg)" : "var(--ink)" }}
    >
      <span ref={ref} className="label block">
        {label}
      </span>
    </button>
  );
}

/** Equaliser bars that dance while UI sound is on and flatten when muted. */
export function SoundToggle({ className = "" }: { className?: string }) {
  const on = useStore(soundStore, true);
  return (
    <button
      type="button"
      aria-label="Sound effects"
      aria-pressed={on}
      data-cursor={on ? "Mute" : "Sound"}
      data-sound="none"
      onClick={() => setSound(!on)}
      className={`glass grid size-11 place-items-center rounded-full active:scale-95 ${on ? "" : "eq-off"} ${className}`}
    >
      <span aria-hidden className="flex h-4 items-end gap-[3px]">
        {[0, 0.28, 0.12, 0.4].map((delay, i) => (
          <span
            key={i}
            className="eq-bar block h-full w-[2.5px] rounded-full bg-current"
            style={{ animationDelay: `-${delay}s`, animationDuration: `${0.9 + i * 0.13}s` }}
          />
        ))}
      </span>
    </button>
  );
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  return (
    <button
      type="button"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      data-cursor="Theme"
      data-sound="none"
      onClick={(e) => {
        playWhoosh(theme === "dark" ? "up" : "down");
        toggleTheme({ x: e.clientX, y: e.clientY });
      }}
      className={`glass grid size-11 place-items-center overflow-hidden rounded-full active:scale-95 ${className}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 18, rotate: -90, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -18, rotate: 90, opacity: 0 }}
          transition={spring}
          className="grid place-items-center"
        >
          {theme === "dark" ? <Moon size={17} strokeWidth={1.75} /> : <Sun size={17} strokeWidth={1.75} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export default function Nav() {
  const root = useRef<HTMLElement>(null);
  const active = useStore(activeSectionStore, 0);
  const booted = useStore(bootStore, false);
  const [open, setOpen] = useState(false);
  const activeNav = navIndexFor(active);

  useGSAP(
    () => {
      if (!booted) {
        gsap.set("[data-nav-item]", { y: -24, opacity: 0 });
        return;
      }
      gsap.to("[data-nav-item]", { y: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.08, delay: 0.35 });
    },
    { scope: root, dependencies: [booted] },
  );

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <>
      <header ref={root} className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="shell flex items-center justify-between gap-4 pt-4 md:pt-5">
          <button
            type="button"
            data-nav-item
            onClick={() => go("top")}
            className="pointer-events-auto flex items-center gap-3"
            aria-label="Back to top"
          >
            <span className="grid size-11 place-items-center bg-ink font-mono text-sm font-bold text-bg shadow-[3px_3px_0_0_var(--accent)]">
              {site.initials}
            </span>
            <span className="hidden text-left xl:block">
              <span className="block text-sm font-semibold leading-tight tracking-tight">{site.name}</span>
              <span className="label block text-muted">{site.role}</span>
            </span>
          </button>

          <nav
            data-nav-item
            aria-label="Sections"
            className="glass pointer-events-auto hidden items-center gap-0.5 rounded-full p-1.5 lg:flex"
          >
            {NAV.map((item, idx) => (
              <div key={item.id} className="relative">
                {activeNav === idx && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={spring}
                    className="absolute inset-0 rounded-full bg-ink"
                  />
                )}
                <ScrambleLink label={item.nav!} active={activeNav === idx} onClick={() => go(item.id)} />
              </div>
            ))}
            <span aria-hidden className="mx-1 h-5 w-px bg-line" />
            <Link
              href="/playground"
              data-cursor="Try"
              className="label relative z-10 inline-flex items-center gap-2 rounded-full px-3 py-2 text-ink transition-colors duration-200 hover:bg-ink hover:text-bg"
            >
              <LiveDot /> Playground
            </Link>
          </nav>

          <div data-nav-item className="pointer-events-auto flex items-center gap-2">
            <SoundToggle />
            <ThemeToggle />
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              data-cursor="PDF"
              aria-label="Resume (PDF)"
              className="glass hidden h-11 items-center gap-2 rounded-full px-3.5 font-mono text-[12px] font-semibold uppercase tracking-[0.06em] transition-colors hover:bg-ink hover:text-bg lg:inline-flex xl:px-4"
            >
              <FileText size={16} strokeWidth={1.75} />
              <span className="hidden xl:inline">Resume</span>
            </a>
            <button
              type="button"
              onClick={(e) => openContact(e.currentTarget)}
              data-cursor="Hello"
              data-sound="none"
              className="btn-brutal hidden !h-11 sm:inline-flex"
            >
              Let&apos;s talk <ArrowUpRight size={15} />
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="glass grid size-11 place-items-center rounded-full lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="glass-strong glass fixed inset-0 z-[70] flex flex-col lg:hidden"
            style={{ ["--glass-blur" as string]: "40px" }}
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(40px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.35 }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="shell flex items-center justify-between pt-4">
              <span className="label">Index</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-11 place-items-center rounded-full border border-line"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <ul className="shell mt-10 flex flex-1 flex-col gap-1">
              {NAV.map((item, idx) => (
                <motion.li
                  key={item.id}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ ...spring, delay: 0.05 + idx * 0.05 }}
                  className="border-b border-line"
                >
                  <button
                    type="button"
                    onClick={() => go(item.id)}
                    className="flex w-full items-baseline justify-between py-4 text-left"
                  >
                    <span className="text-4xl font-bold tracking-[-0.04em]">{item.nav}</span>
                    <span className="label text-muted">0{idx + 1}</span>
                  </button>
                </motion.li>
              ))}
              <motion.li
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ...spring, delay: 0.05 + NAV.length * 0.05 }}
                className="border-b border-line"
              >
                <Link
                  href="/playground"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-baseline justify-between py-4 text-left"
                >
                  <span className="inline-flex items-center gap-3 text-4xl font-bold tracking-[-0.04em]">
                    Playground <LiveDot />
                  </span>
                  <ArrowUpRight size={20} className="text-muted" />
                </Link>
              </motion.li>
            </ul>
            <div className="shell flex flex-col gap-4 pb-8">
              <button
                type="button"
                data-sound="none"
                onClick={(e) => {
                  setOpen(false);
                  openContact(e.currentTarget);
                }}
                className="btn-brutal justify-center !h-14 text-[13px]"
              >
                Let&apos;s talk <ArrowUpRight size={15} />
              </button>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <SoundToggle />
                  <ThemeToggle />
                </div>
                <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn-line">
                  <FileText size={15} /> Resume
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
