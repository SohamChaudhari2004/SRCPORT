"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Standard scroll reveal used by every section:
 *  - [data-split]  → headline lines rise out of a mask
 *  - [data-fade]   → blocks fade up, staggered per parent batch
 */
export function revealIn(scope: Element) {
  const reduce = prefersReducedMotion();

  scope.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
    if (reduce) return;
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }),
    });
  });

  const fades = gsap.utils.toArray<HTMLElement>(scope.querySelectorAll("[data-fade]"));
  if (reduce || !fades.length) return;
  gsap.set(fades, { opacity: 0, y: 28 });
  ScrollTrigger.batch(fades, {
    start: "top 90%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 }),
  });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
