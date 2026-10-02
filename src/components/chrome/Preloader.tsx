"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { site } from "@/lib/site";
import { evals, stats } from "@/lib/derive";

const bootLines = [
  "init runtime ............................ ok",
  `load weights  soham.safetensors  [${stats.projects} repos]`,
  `tokenizer     ${stats.tools} tools · ${stats.layers} layers`,
  "agents        autogen · langgraph · online",
  `evals         ${evals.map((e) => (e.rank.kind === "place" ? `#${e.rank.value}` : `top ${e.rank.value}`)).join(" · ")}`,
  "ready.",
];

/** Boot sequence: counter + log, then a hard wipe up into the hero. */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;

      // Seen it this session: the inline head script already hid the overlay, go straight to the hero.
      if (document.documentElement.hasAttribute("data-booted")) {
        el.style.display = "none";
        onDone();
        return;
      }
      try {
        sessionStorage.setItem("booted", "1");
      } catch {
        /* storage blocked: the preloader just plays again next time */
      }

      const reduce = prefersReducedMotion();
      const count = el.querySelector<HTMLElement>("[data-count]")!;
      const bar = el.querySelector<HTMLElement>("[data-bar]")!;
      const counter = { v: 0 };

      const tl = gsap.timeline({ paused: true });
      tl.to(counter, {
        v: 100,
        duration: reduce ? 0.3 : 1.3,
        ease: "power2.inOut",
        onUpdate: () => {
          count.textContent = String(Math.round(counter.v)).padStart(3, "0");
          bar.style.transform = `scaleX(${counter.v / 100})`;
        },
      })
        .from("[data-line]", { opacity: 0, x: -8, duration: 0.25, stagger: reduce ? 0 : 0.16, ease: "power2.out" }, 0.1)
        .to("[data-inner]", { yPercent: -18, opacity: 0, duration: 0.55, ease: "power3.in" }, "+=0.1")
        .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: reduce ? 0.3 : 0.85, ease: "expo.inOut" }, "-=0.2")
        .add(onDone, "-=0.6")
        .set(el, { display: "none" });

      // Start once fonts are in so the hero splits on real metrics.
      let started = false;
      const start = () => {
        if (started) return;
        started = true;
        tl.play();
      };
      document.fonts?.ready.then(start);
      const fallback = window.setTimeout(start, 1200);
      return () => window.clearTimeout(fallback);
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      data-preloader
      className="fixed inset-0 z-[100] bg-ink text-bg"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      <div data-inner className="shell relative flex h-full flex-col justify-between py-6">
        <div className="label flex items-center justify-between opacity-70">
          <span>
            {site.initials}/ latent-space
          </span>
          <span>{site.version}</span>
        </div>

        <div className="grid items-end gap-8 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="label mb-3 opacity-60">booting {site.name.toLowerCase()}</p>
            <div
              data-count
              className="font-mono text-[clamp(5rem,18vw,16rem)] font-bold leading-[0.78] tracking-[-0.08em] tabular-nums"
            >
              000
            </div>
          </div>
          <ul className="font-mono text-[11px] leading-6 opacity-80 md:col-span-5 md:text-xs">
            {bootLines.map((line) => (
              <li key={line} data-line className="whitespace-pre">
                <span className="text-accent">&gt;</span> {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative h-px w-full bg-bg/15">
          <div data-bar className="absolute inset-0 origin-left scale-x-0 bg-accent" />
        </div>
      </div>
    </div>
  );
}
