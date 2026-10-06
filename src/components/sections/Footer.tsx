"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { resumeUrl } from "@/lib/derive";
import { servicesUrl } from "@/data/services";
import { socials } from "@/lib/socials";
import { openContact } from "@/lib/contact";
import { site } from "@/lib/site";
import { SECTIONS } from "@/lib/sections";
import { footer as copy } from "@/data/content";
import { scrollToId } from "@/components/chrome/SmoothScroll";

export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mark = root.current!.querySelector<HTMLElement>("[data-wordmark]")!;
      const split = SplitText.create(mark, { type: "chars" });
      gsap.from(split.chars, {
        yPercent: 100,
        ease: "none",
        stagger: 0.06,
        scrollTrigger: { trigger: root.current, start: "top 85%", end: "bottom bottom", scrub: 0.6 },
      });
    },
    { scope: root },
  );

  return (
    <footer ref={root} className="relative z-10 overflow-hidden border-t-[1.5px] border-line-strong">
      <div className="shell grid gap-8 py-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="label text-muted">{copy.index}</p>
          <ul className="mt-3 grid grid-cols-2 gap-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => scrollToId(s.id)} className="text-sm hover:text-accent">
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="label text-muted">{copy.elsewhere}</p>
          <ul className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
            {socials.map((s) => (
              <li key={s.id}>
                <a
                  href={s.href}
                  target={s.id === "email" ? undefined : "_blank"}
                  rel="noreferrer"
                  className="hover:text-accent"
                >
                  {s.label} ↗
                </a>
              </li>
            ))}
            <li>
              <a href={resumeUrl} target="_blank" rel="noreferrer" className="hover:text-accent">
                Resume ↗
              </a>
            </li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="label text-muted">{copy.builtWith}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">{copy.builtWithList}</p>
        </div>
        <div className="flex flex-wrap items-start gap-3 md:col-span-2 md:flex-col md:items-end">
          <button
            type="button"
            onClick={(e) => openContact(e.currentTarget)}
            className="btn-brutal"
            data-cursor="Hello"
            data-sound="none"
          >
            {copy.talk}
          </button>
          <button
            type="button"
            onClick={() => scrollToId("top")}
            className="btn-line"
            data-cursor="Top"
          >
            {copy.top} <ArrowUp size={14} />
          </button>
        </div>
      </div>

      <div className="shell label flex flex-wrap justify-between gap-2 border-t border-line py-4 text-muted">
        <span className="flex flex-wrap gap-x-4 gap-y-1">
          <span>
            © {new Date().getFullYear()} {site.name}
          </span>
          <Link href="/about" className="hover:text-accent">About</Link>
          <Link href="/contact" className="hover:text-accent">Contact</Link>
          <Link href="/privacy" className="hover:text-accent">Privacy</Link>
          <Link href="/playground" className="hover:text-accent">Playground</Link>
          <a href={servicesUrl} className="hover:text-accent">Services</a>
        </span>
        <span>
          {site.role} · {copy.signoff}
        </span>
      </div>

      <div
        aria-hidden
        data-wordmark
        className="-mb-[0.2em] select-none overflow-hidden whitespace-nowrap text-center text-[21vw] font-extrabold uppercase leading-[0.8] tracking-[-0.075em]"
      >
        {site.firstName}
      </div>
    </footer>
  );
}
