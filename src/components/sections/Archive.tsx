"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP, revealIn } from "@/lib/gsap";
import { exploreProjects, pad, type ProjectView } from "@/lib/derive";
import { archive as copy } from "@/data/content";
import SectionLabel from "@/components/ui/SectionLabel";
import ProjectCover from "@/components/ui/ProjectCover";

const spring = { type: "spring" as const, bounce: 0, duration: 0.5 };

/** Floating preview that trails the pointer while a row is hovered. */
function Preview({ project }: { project: ProjectView | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.55, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.55, ease: "power3" });
    const rTo = gsap.quickTo(el, "rotation", { duration: 0.8, ease: "power3" });
    let lastX = 0;
    const move = (e: PointerEvent) => {
      xTo(e.clientX + 28);
      yTo(e.clientY - 120);
      rTo(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div ref={ref} className="pointer-events-none fixed left-0 top-0 z-40 hidden lg:block" aria-hidden>
      <AnimatePresence>
        {project && (
          <motion.div
            key={project.slug}
            initial={{ opacity: 0, scale: 0.85, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
            transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            className="glass absolute left-0 top-0 h-[210px] w-[300px] overflow-hidden rounded-2xl p-1.5"
          >
            <div className="relative h-full w-full overflow-hidden rounded-xl bg-paper">
              {project.image ? (
                <Image src={project.image} alt={`${project.title} preview`} fill sizes="300px" className="object-cover object-top" />
              ) : (
                <ProjectCover project={project} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Archive() {
  const root = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState(copy.order[0]);
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState<ProjectView | null>(null);
  const all = exploreProjects.filter((p) => filter === "All" || p.category === filter);
  const list = expanded ? all : all.slice(0, copy.collapsedCount);
  const hiddenCount = all.length - copy.collapsedCount;

  useGSAP(() => revealIn(root.current!), { scope: root });

  // Height changes when filtering, let pinned/scrubbed sections below re-measure.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 650);
    return () => window.clearTimeout(id);
  }, [filter, expanded]);

  return (
    <section id="explore" ref={root} className="shell relative z-10 py-[11vh]">
      <SectionLabel
        index={copy.index}
        title={
          <>
            {copy.title.plain} <span className="serif-accent font-normal">{copy.title.accent}</span>
          </>
        }
        meta={copy.meta}
      />

      <LayoutGroup>
        <div data-fade className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div role="tablist" aria-label="Filter projects" className="glass flex rounded-full p-1">
            {copy.order.map((c) => {
              const count = c === "All" ? exploreProjects.length : exploreProjects.filter((p) => p.category === c).length;
              const active = filter === c;
              return (
                <button
                  key={c}
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setFilter(c);
                    setExpanded(false);
                  }}
                  className="relative rounded-full px-4 py-2"
                >
                  {active && <motion.span layoutId="archive-tab" transition={spring} className="absolute inset-0 rounded-full bg-ink" />}
                  <span className="label relative z-10 transition-colors" style={{ color: active ? "var(--bg)" : "var(--ink)" }}>
                    {copy.labels[c] ?? c} <sup className="opacity-60">{pad(count)}</sup>
                  </span>
                </button>
              );
            })}
          </div>
          <span className="label text-muted [@media(hover:none)]:hidden">{copy.hoverHint}</span>
          <span className="label hidden text-muted [@media(hover:none)]:inline">{copy.tapHint}</span>
        </div>

        <div className="label mt-8 hidden grid-cols-[4rem_1.4fr_1.2fr_7rem_2.5rem] gap-4 border-b-[1.5px] border-line-strong pb-2 text-muted md:grid">
          <span>No.</span>
          <span>Project</span>
          <span>Signals</span>
          <span>Track</span>
          <span />
        </div>

        <motion.ul layout transition={spring} className="relative" onPointerLeave={() => setHovered(null)}>
          <AnimatePresence initial={false} mode="popLayout">
            {list.map((p) => (
              <motion.li
                key={p.slug}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={spring}
                className="border-b border-line"
              >
                <a
                  href={p.githubLink}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="Open"
                  onPointerEnter={() => setHovered(p)}
                  onFocus={() => setHovered(p)}
                  onBlur={() => setHovered(null)}
                  className="group relative grid grid-cols-[2.6rem_1fr_2rem] items-center gap-4 overflow-hidden py-3.5 md:grid-cols-[4rem_1.4fr_1.2fr_7rem_2.5rem] md:py-4"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-ink transition-transform duration-500 ease-[var(--ease-brutal)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
                  <span className="label relative text-muted transition-colors group-hover:text-bg/60">{pad(p.index)}</span>
                  <span className="relative text-[clamp(1.2rem,1.9vw,1.75rem)] font-semibold leading-none tracking-[-0.035em] transition-[color,transform] duration-500 ease-[var(--ease-apple)] group-hover:translate-x-2 group-hover:text-bg">
                    {p.title}
                  </span>
                  <span className="relative hidden flex-wrap gap-1.5 md:flex">
                    {p.tags.slice(0, 3).map((t) => (
                      <span key={t} className="chip transition-colors group-hover:border-bg/50 group-hover:text-bg">
                        {t}
                      </span>
                    ))}
                  </span>
                  <span className="label relative hidden transition-colors group-hover:text-bg md:block">
                    {p.categoryLabel}
                    {p.liveLink && <span className="ml-2 text-accent-2">● live</span>}
                  </span>
                  <span className="relative grid size-8 place-items-center justify-self-end rounded-full border border-line-strong transition-all duration-300 group-hover:rotate-45 group-hover:border-bg group-hover:bg-bg group-hover:text-ink">
                    <ArrowUpRight size={15} />
                  </span>
                </a>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        {hiddenCount > 0 && (
          <motion.div layout transition={spring} className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="btn-line rounded-full"
            >
              {expanded ? copy.showLess : `${copy.showAll} ${pad(all.length)}`}
              <ChevronDown size={15} className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
            </button>
          </motion.div>
        )}
      </LayoutGroup>

      <Preview project={hovered} />
    </section>
  );
}
