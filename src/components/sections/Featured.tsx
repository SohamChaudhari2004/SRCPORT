"use client";

import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { useGSAP, revealIn } from "@/lib/gsap";
import { featuredItems, hasFeatured, pad } from "@/lib/derive";

/** Renders only when data/featured.ts has entries. */
export default function Featured() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    if (root.current) revealIn(root.current);
  }, { scope: root });

  if (!hasFeatured) return null;

  return (
    <section id="featured" ref={root} className="shell relative z-10 py-[10vh]">
      <div className="label flex items-center justify-between border-b-[1.5px] border-line-strong pb-3">
        <span>[06.1] Featured</span>
        <span className="text-muted">{pad(featuredItems.length)} items</span>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {featuredItems.map((f) => (
          <article key={f.id} data-fade className="glass flex flex-col rounded-[24px] p-6">
            <div className="label flex justify-between text-muted">
              <span>{f.category}</span>
              {f.date && <span>{f.date}</span>}
            </div>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">{f.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{f.description}</p>
            {f.tags && (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {f.tags.map((t) => (
                  <li key={t} className="chip">
                    {t}
                  </li>
                ))}
              </ul>
            )}
            {f.link && (
              <a href={f.link} target="_blank" rel="noreferrer" className="label mt-auto flex items-center gap-1 pt-6 hover:text-accent">
                Open <ArrowUpRight size={13} />
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
