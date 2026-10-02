"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Precise dot (no lag) + trailing ring. Elements with data-cursor="Label"
 * morph the ring into a labelled disc. Only on fine pointers.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!fine || !dot || !ring || !label) return;

    document.documentElement.classList.add("has-cursor");
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

    const dx = gsap.quickTo(dot, "x", { duration: 0.06, ease: "power3" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.06, ease: "power3" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.42, ease: "power3" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.42, ease: "power3" });

    let mode = "";
    const setMode = (next: string, text = "") => {
      if (next === mode && label.textContent === text) return;
      mode = next;
      label.textContent = text;
      const scale = next === "label" ? 2.4 : next === "hover" ? 1.55 : 1;
      gsap.to(ring, {
        scale,
        backgroundColor: next === "label" ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)",
        duration: 0.45,
        ease: "expo.out",
      });
      gsap.to(label, { opacity: next === "label" ? 1 : 0, duration: 0.2 });
      gsap.to(dot, { scale: next === "label" ? 0 : 1, duration: 0.25 });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      gsap.to([dot, ring], { opacity: 1, duration: 0.3, overwrite: "auto" });
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      if (labelled) return setMode("label", labelled.dataset.cursor ?? "");
      if (target?.closest("a, button, [role='button'], summary, label")) return setMode("hover");
      setMode("default");
    };

    const onDown = () => gsap.to(ring, { scale: "*=0.8", duration: 0.15 });
    const onUp = () => {
      const s = mode === "label" ? 2.4 : mode === "hover" ? 1.55 : 1;
      gsap.to(ring, { scale: s, duration: 0.4, ease: "expo.out" });
    };
    const onLeave = () => gsap.to([dot, ring], { opacity: 0, duration: 0.3 });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] hidden mix-blend-difference [@media(hover:hover)_and_(pointer:fine)]:block">
      <div
        ref={ringRef}
        className="fixed left-0 top-0 grid size-9 place-items-center rounded-full border-[1.5px] border-white"
      >
        <span
          ref={labelRef}
          className="font-mono text-[5px] font-bold uppercase tracking-[0.08em] text-black opacity-0"
        />
      </div>
      <div ref={dotRef} className="fixed left-0 top-0 size-1.5 rounded-full bg-white" />
    </div>
  );
}
