"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { bootStore, useStore } from "@/lib/store";

/** Scroll progress hairline pinned to the top edge. */
export default function Hud() {
  const root = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const booted = useStore(bootStore, false);

  useGSAP(
    () => {
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
        },
      });
    },
    { scope: root },
  );

  useGSAP(
    () => {
      gsap.to(root.current, { opacity: booted ? 1 : 0, duration: 0.8, delay: booted ? 0.8 : 0 });
    },
    { dependencies: [booted] },
  );

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] opacity-0">
      <div ref={barRef} className="h-full origin-left scale-x-0 bg-accent" />
    </div>
  );
}
