"use client";

import { useRef } from "react";
import { ArrowDown, ArrowUpRight, MessageCircle } from "lucide-react";
import { gsap, ScrollTrigger, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { bootStore, useStore } from "@/lib/store";
import { site } from "@/lib/site";
import { openContact } from "@/lib/contact";
import { hero } from "@/data/content";
import { scrollToId } from "@/components/chrome/SmoothScroll";

// Size the name so its longest line always fits the shell: at -0.065em tracking
// the display face averages ~0.6em per uppercase glyph.
const longest = Math.max(site.firstName.length, site.lastName.length) * 0.6;
const NAME_SIZE = `clamp(2.4rem, ${(60 / longest).toFixed(2)}vw, ${(60 / longest).toFixed(2)}rem)`;

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const booted = useStore(bootStore, false);

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      const lines = gsap.utils.toArray<HTMLElement>("[data-name-line]");
      const splits = lines.map((l) => SplitText.create(l, { type: "chars", charsClass: "hero-char" }));
      const chars = splits.flatMap((s) => s.chars);

      if (!booted) {
        gsap.set(chars, { yPercent: 118, rotate: 6 });
        gsap.set("[data-hero-fade]", { opacity: 0, y: 24 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo(
        chars,
        { yPercent: 118, rotate: 6 },
        { yPercent: 0, rotate: 0, duration: reduce ? 0.01 : 1.5, stagger: reduce ? 0 : 0.035 },
      ).fromTo(
        "[data-hero-fade]",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1.1, stagger: 0.07 },
        reduce ? 0 : 0.45,
      );

      if (reduce) return;
      // Scroll-out: the two name lines shear apart, the content lifts away.
      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 };
      gsap.to(lines[0], { xPercent: -9, ease: "none", scrollTrigger: st });
      gsap.to(lines[1], { xPercent: 7, ease: "none", scrollTrigger: st });
      gsap.to("[data-hero-bottom]", { yPercent: -30, opacity: 0.1, ease: "none", scrollTrigger: st });
      ScrollTrigger.refresh();
    },
    { scope: root, dependencies: [booted], revertOnUpdate: true },
  );

  return (
    <section id="top" ref={root} className="shell relative flex flex-col pb-10 pt-24 md:pb-14 md:pt-28">
      {/* name */}
      <h1 className="relative select-none pt-2 font-extrabold uppercase leading-[0.8] tracking-[-0.065em]">
        <span className="sr-only">
          {site.name}, {site.role}
        </span>
        <span aria-hidden className="block overflow-hidden pb-[0.04em]">
          <span data-name-line className="block tracking-[-0.065em]" style={{ fontSize: NAME_SIZE }}>
            {site.firstName}
          </span>
        </span>
        <span aria-hidden className="block overflow-hidden pb-[0.04em]">
          <span data-name-line className="block tracking-[-0.065em]" style={{ fontSize: NAME_SIZE }}>
            {site.lastName}
          </span>
        </span>
      </h1>

      {/* bottom band */}
      <div data-hero-bottom className="mt-7 grid gap-5 border-t-[1.5px] border-line-strong pt-5 md:grid-cols-12">
        <div data-hero-fade className="md:col-span-6 lg:col-span-5">
          <p className="serif-accent mb-2.5 text-2xl leading-none text-accent md:text-3xl">{site.role}</p>
          <p className="max-w-[40ch] text-base leading-snug tracking-[-0.01em] text-ink-2 md:text-lg">
            {hero.tagline.before} <strong className="font-semibold text-ink">{hero.tagline.strong}</strong>
            {hero.tagline.after}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              type="button"
              onClick={() => scrollToId("work")}
              className="label group inline-flex items-center gap-3 text-ink"
              data-cursor="Scroll"
            >
              <span className="grid size-9 place-items-center rounded-full border border-line-strong transition-colors group-hover:bg-ink group-hover:text-bg">
                <ArrowDown size={14} />
              </span>
              {hero.ctaWork}
            </button>
            <button
              type="button"
              onClick={(e) => openContact(e.currentTarget)}
              className="label group inline-flex items-center gap-3 text-ink"
              data-cursor="Hello"
              data-sound="none"
            >
              <span className="grid size-9 place-items-center rounded-full bg-accent text-bg transition-transform group-hover:scale-110">
                <MessageCircle size={14} />
              </span>
              {hero.ctaHello}
            </button>
          </div>
        </div>

        {/* what I'm doing right now */}
        <a
          data-hero-fade
          href={site.current.url}
          target="_blank"
          rel="noreferrer"
          data-cursor="Visit"
          className="glass group flex flex-col justify-between gap-4 rounded-[20px] p-4 md:col-span-6 md:p-5 lg:col-span-4 lg:col-start-9"
        >
          <div className="label flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="live-dot" /> {hero.nowLabel}
            </span>
            <span className="text-muted">{site.current.since}</span>
          </div>
          <div>
            <p className="text-xl font-semibold leading-tight tracking-[-0.03em] md:text-2xl">
              {site.current.role} <span className="serif-accent font-normal text-accent">at</span> {site.current.company}
              <ArrowUpRight
                size={18}
                className="ml-1 inline-block align-[-0.1em] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </p>
            <p className="mt-1.5 text-sm leading-snug text-ink-2">{site.current.focus}</p>
          </div>
          <ul className="flex flex-wrap gap-1.5 border-t border-line pt-3" aria-label={hero.focusLabel}>
            {hero.focus.map((f) => (
              <li
                key={f}
                className="label rounded-full bg-accent/10 px-2.5 py-1 normal-case tracking-[0.02em] text-accent"
              >
                {f}
              </li>
            ))}
          </ul>
        </a>
      </div>
    </section>
  );
}
