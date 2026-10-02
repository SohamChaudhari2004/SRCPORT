"use client";

import { useRef, type PointerEvent } from "react";
import { gsap, useGSAP, revealIn, prefersReducedMotion } from "@/lib/gsap";
import { skillGroups, stats, pad } from "@/lib/derive";
import SectionLabel from "@/components/ui/SectionLabel";
import TechIcon from "@/components/ui/TechIcon";
import { stack as copy } from "@/data/content";

const spot = (e: PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

const role = (i: number, last: boolean) => (i === 0 ? "input" : last ? "output" : "hidden");

export default function Stack() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      revealIn(root.current!);
      if (prefersReducedMotion()) return;

      // "Forward pass": a beam fills down the layer stack as you scroll.
      const layers = root.current!.querySelector<HTMLElement>("[data-layers]")!;
      gsap.fromTo(
        "[data-beam]",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: layers, start: "top 70%", end: "bottom 60%", scrub: true } },
      );
      gsap.fromTo(
        "[data-beam-dot]",
        { top: "0%" },
        { top: "100%", ease: "none", scrollTrigger: { trigger: layers, start: "top 70%", end: "bottom 60%", scrub: true } },
      );

      gsap.utils.toArray<HTMLElement>("[data-layer]").forEach((layer) => {
        const tiles = layer.querySelectorAll("[data-tile]");
        gsap.from(tiles, {
          opacity: 0,
          y: 18,
          scale: 0.96,
          duration: 0.7,
          stagger: 0.04,
          ease: "power3.out",
          scrollTrigger: { trigger: layer, start: "top 82%", once: true },
        });
        activateNode(layer);
      });
    },
    { scope: root },
  );

  return (
    <section id="stack" ref={root} className="shell relative z-10 py-[11vh]">
      <SectionLabel
        index={copy.index}
        title={
          <>
            {copy.title.plain} <span className="serif-accent font-normal">{copy.title.accent}</span>
          </>
        }
        meta={`${stats.tools} params · ${stats.layers} layers`}
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        <div className="self-start lg:sticky lg:top-28 lg:col-span-4">
          <p data-split className="text-[clamp(1.6rem,2.6vw,2.6rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
            {copy.lead}
          </p>
          <p data-fade className="mt-5 max-w-[38ch] text-ink-2">
            {copy.body}
          </p>
        </div>

        <div data-layers className="relative pl-7 md:pl-10 lg:col-span-8">
          <div aria-hidden className="absolute bottom-0 left-2 top-0 w-px bg-line md:left-3">
            <div data-beam className="absolute inset-0 origin-top bg-gradient-to-b from-accent via-accent-2 to-signal" />
            <div
              data-beam-dot
              className="absolute left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_6px_color-mix(in_srgb,var(--accent)_25%,transparent)]"
            />
          </div>

          <div className="flex flex-col gap-4">
            {skillGroups.map((g, i) => {
              const last = i === skillGroups.length - 1;
              const Icon = g.icon;
              return (
                <div
                  key={g.category}
                  data-layer
                  className={
                    last
                      ? "relative border-[1.5px] border-ink bg-ink p-4 text-bg shadow-[6px_6px_0_0_var(--accent)] md:p-5"
                      : "glass relative rounded-[22px] p-4 md:p-5"
                  }
                >
                  <span
                    aria-hidden
                    className={`absolute top-7 size-2.5 -translate-x-1/2 rounded-full border-2 ${last ? "border-accent bg-accent" : "border-accent bg-bg"} -left-[19.5px] md:-left-[27.5px]`}
                  />
                  <div className="label flex items-center justify-between opacity-70">
                    <span>
                      L{pad(i)} · {role(i, last)}
                    </span>
                    <span>{pad(g.items.length)} params</span>
                  </div>
                  <h3 className="mt-2.5 flex items-center gap-3 text-xl font-semibold tracking-[-0.03em] md:text-2xl">
                    <Icon size={20} strokeWidth={1.6} />
                    {last ? copy.objective : g.category}
                  </h3>
                  <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                    {g.items.map((s) => (
                      <li
                        key={s.name}
                        data-tile
                        onPointerMove={spot}
                        className={
                          last
                            ? "flex items-center gap-2.5 border border-bg/25 px-3 py-2.5 text-sm"
                            : "spotlight flex items-center gap-2.5 rounded-xl border border-line bg-paper/40 px-3 py-2.5 text-sm transition-colors hover:border-accent"
                        }
                      >
                        {last ? <span className="text-accent">↳</span> : <TechIcon skill={s} />}
                        <span className="truncate">{s.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Light up a layer's node on the beam while it's being "computed". */
function activateNode(layer: HTMLElement) {
  const node = layer.querySelector<HTMLElement>("span[aria-hidden]");
  if (!node) return;
  gsap.fromTo(
    node,
    { scale: 1 },
    {
      scale: 1.8,
      ease: "none",
      scrollTrigger: {
        trigger: layer,
        start: "top 62%",
        end: "bottom 62%",
        toggleActions: "play reverse play reverse",
      },
      duration: 0.3,
    },
  );
}
