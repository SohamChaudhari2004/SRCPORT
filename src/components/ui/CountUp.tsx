"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

interface Props {
  value: number;
  pad?: number;
  decimals?: number;
  /** play when this becomes true; if omitted, plays when scrolled into view */
  play?: boolean;
  duration?: number;
  className?: string;
}

const format = (v: number, pad: number, decimals: number) => {
  const fixed = v.toFixed(decimals);
  const [int, dec] = fixed.split(".");
  const grouped = Number(int).toLocaleString("en-US").padStart(pad, "0");
  return dec ? `${grouped}.${dec}` : grouped;
};

export default function CountUp({ value, pad = 0, decimals = 0, play, duration = 1.8, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        el.textContent = format(value, pad, decimals);
        return;
      }
      el.textContent = format(0, pad, decimals);
      if (play === false) return;
      const obj = { v: 0 };
      gsap.to(obj, {
        v: value,
        duration,
        ease: "expo.out",
        onUpdate: () => {
          el.textContent = format(obj.v, pad, decimals);
        },
        scrollTrigger: play === undefined ? { trigger: el, start: "top 92%", once: true } : undefined,
      });
    },
    { dependencies: [play, value] },
  );

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {format(value, pad, decimals)}
    </span>
  );
}
