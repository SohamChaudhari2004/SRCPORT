"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * Layers behind/over the content: drifting colour fields (give the glass
 * something to refract) and film grain.
 */
export default function Backdrop() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-blob]").forEach((blob, i) => {
        gsap.to(blob, {
          xPercent: i % 2 ? -22 : 26,
          yPercent: i % 2 ? 18 : -20,
          scale: 1.15,
          duration: 16 + i * 5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });
    },
    { scope: root },
  );

  return (
    <>
      <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          data-blob
          className="absolute -left-[10vw] top-[8vh] size-[55vw] rounded-full blur-[90px]"
          style={{ background: "radial-gradient(circle, var(--blob-a), transparent 65%)" }}
        />
        <div
          data-blob
          className="absolute -right-[12vw] top-[40vh] size-[50vw] rounded-full blur-[90px]"
          style={{ background: "radial-gradient(circle, var(--blob-b), transparent 65%)" }}
        />
        <div
          data-blob
          className="absolute bottom-[-20vh] left-[30vw] size-[40vw] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, var(--blob-c), transparent 65%)" }}
        />
      </div>
      <div aria-hidden className="noise pointer-events-none fixed inset-0 z-[80] opacity-[0.07] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-screen" />
    </>
  );
}
