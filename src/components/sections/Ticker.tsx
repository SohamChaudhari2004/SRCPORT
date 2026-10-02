"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { scrollState } from "@/lib/scene";
import { projectViews, skillGroups } from "@/lib/derive";

/** Infinite row whose speed, direction and skew follow scroll velocity. */
function Row({ children, speed = 1, reverse = false }: { children: ReactNode; speed?: number; reverse?: boolean }) {
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = track.current;
      if (!el || prefersReducedMotion()) return;
      let x = 0;
      let dir = 1;
      let skew = 0;
      const setX = gsap.quickSetter(el, "x", "px");
      const setSkew = gsap.quickSetter(el, "skewX", "deg");
      const tick = (_t: number, dtMs: number) => {
        const half = el.scrollWidth / 2;
        if (!half) return;
        const v = scrollState.velocity;
        if (Math.abs(v) > 0.4) dir = Math.sign(v);
        const px = (0.9 + Math.min(Math.abs(v) * 0.9, 28)) * speed * (dtMs / 16.67);
        x -= px * dir * (reverse ? -1 : 1);
        x = gsap.utils.wrap(-half, 0, x);
        skew += (gsap.utils.clamp(-10, 10, -v * 0.35) - skew) * 0.12;
        setX(x);
        setSkew(skew);
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { scope: track },
  );

  return (
    <div className="overflow-hidden">
      <div ref={track} className="flex w-max will-change-transform">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

const tools = skillGroups
  .filter((g) => g.category === "GenAI & LLMs" || g.category === "ML & Deep Learning")
  .flatMap((g) => g.items.map((s) => s.name));

const titles = projectViews.filter((p) => p.category === "ai-ml").map((p) => p.title);

export default function Ticker() {
  return (
    <section aria-label="Tools and projects" className="relative z-10 overflow-hidden py-[8vh]">
      <div className="-rotate-[2.2deg] scale-[1.04] border-y-[1.5px] border-ink bg-ink py-3 text-bg md:py-4">
        <Row speed={1.1}>
          {tools.map((t) => (
            <span key={t} className="flex items-center whitespace-nowrap text-[clamp(1.8rem,4.4vw,4.2rem)] font-extrabold uppercase leading-none tracking-[-0.045em]">
              <span className="px-[0.35em]">{t}</span>
              <span className="text-accent" aria-hidden>
                ✳
              </span>
            </span>
          ))}
        </Row>
      </div>
      <div className="glass relative -mt-3 rotate-[1.6deg] scale-[1.04] rounded-none border-x-0 py-3 md:py-4">
        <Row speed={0.7} reverse>
          {titles.map((t) => (
            <span key={t} className="flex items-center whitespace-nowrap">
              <span className="text-outline px-[0.4em] text-[clamp(1.6rem,3.8vw,3.6rem)] font-extrabold uppercase leading-none tracking-[-0.04em]">
                {t}
              </span>
              <span className="label rounded-full border border-line-strong px-2 py-1">ai/ml</span>
            </span>
          ))}
        </Row>
      </div>
    </section>
  );
}
