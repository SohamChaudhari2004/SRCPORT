"use client";

import { useEffect } from "react";
import { playClick, playTick, unlockAudio } from "@/lib/sound";
import { lenisRef } from "./SmoothScroll";

const INTERACTIVE = "a[href], button, [role=tab], [role=radio], [role=button], summary, select";

/** Pixels of travel between two scroll "detents". */
const DETENT = 96;
/** Never tick faster than this (ms), keeps fast flings from buzzing. */
const MIN_GAP = 48;

/**
 * Global audio feedback: a soft click on press (pointerdown, same frame as the
 * visual :active state) and detent ticks while the page scrolls.
 * Opt out per element with data-sound="none"; data-sound="soft" for a lighter click.
 */
export default function SoundFX() {
  useEffect(() => {
    const variantFor = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;
      const el = target.closest(INTERACTIVE);
      if (!el || el.closest("[data-sound='none']") || (el as HTMLButtonElement).disabled) return null;
      return el.closest("[data-sound='soft']") ? "soft" : "normal";
    };

    const onPointerDown = (e: PointerEvent) => {
      unlockAudio();
      if (e.button !== 0) return;
      const v = variantFor(e.target);
      if (v) playClick(v);
    };
    // Keyboard activation fires click with detail 0, give it the same feedback.
    const onClick = (e: MouseEvent) => {
      if (e.detail !== 0) return;
      const v = variantFor(e.target);
      if (v) playClick(v);
    };
    const onKey = () => unlockAudio();

    let last = -1;
    let acc = 0;
    let lastTick = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (last < 0) {
        last = y;
        return;
      }
      const d = Math.abs(y - last);
      last = y;
      acc += d;
      if (acc < DETENT) return;
      acc %= DETENT;
      const now = performance.now();
      if (now - lastTick < MIN_GAP) return;
      lastTick = now;
      const velocity = Math.abs(lenisRef.current?.velocity ?? d);
      playTick(Math.min(velocity / 60, 1));
    };

    document.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });
    document.addEventListener("click", onClick, { capture: true, passive: true });
    document.addEventListener("keydown", onKey, { capture: true, passive: true });
    document.addEventListener("touchend", onKey, { capture: true, passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, { capture: true });
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("keydown", onKey, { capture: true });
      document.removeEventListener("touchend", onKey, { capture: true });
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
