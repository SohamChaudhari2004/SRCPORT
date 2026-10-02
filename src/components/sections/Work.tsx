"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { gsap, useGSAP, revealIn, prefersReducedMotion } from "@/lib/gsap";
import { featuredProjects, stats, pad, type ProjectView } from "@/lib/derive";
import SectionLabel from "@/components/ui/SectionLabel";
import { work as copy } from "@/data/content";
import { caseStudies } from "@/data/caseStudies";
import ProjectCover from "@/components/ui/ProjectCover";
import GithubIcon from "@/components/ui/GithubIcon";
import { scrollToId } from "@/components/chrome/SmoothScroll";

function Visual({ project }: { project: ProjectView }) {
  if (project.image) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper">
        <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
          <span className="size-2 rounded-full bg-[#ff5f57]" />
          <span className="size-2 rounded-full bg-[#febc2e]" />
          <span className="size-2 rounded-full bg-[#28c840]" />
          <span className="label ml-3 truncate text-muted">{project.liveLink || project.githubLink}</span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <Image
            data-parallax
            src={project.image}
            alt={`${project.title} screenshot`}
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="scale-[1.18] object-cover object-top"
          />
        </div>
      </div>
    );
  }
  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-line bg-paper/60">
      <div data-parallax className="absolute inset-0 scale-[1.18]">
        <ProjectCover project={project} />
      </div>
    </div>
  );
}

// Scale each title to its longest word so long names never spill out of the card.
// ~0.64em per bold uppercase glyph; the text column is ~88vw on mobile, ~30vw on desktop.
function titleSize(title: string) {
  const em = Math.max(...title.split(/\s+/).map((w) => w.length)) * 0.64;
  const f = (n: number) => (n / em).toFixed(2);
  return {
    "--t-sm": `clamp(1.8rem, ${f(88)}vw, 2.9rem)`,
    "--t-lg": `clamp(2rem, min(4vw, ${f(30)}vw, ${f(440)}px), 4.3rem)`,
  } as CSSProperties;
}

function WorkCard({ project, i }: { project: ProjectView; i: number }) {
  return (
    <article
      data-card
      className="glass relative grid shrink-0 overflow-hidden rounded-[32px] p-5 md:p-7 lg:h-[74vh] lg:w-[min(80vw,1180px)] lg:grid-cols-12 lg:gap-8"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-[0.18em] -left-[0.04em] select-none font-extrabold leading-none tracking-[-0.08em] text-ink/[0.05] lg:text-[22vw]"
      >
        {pad(i + 1)}
      </span>

      <div className="relative flex flex-col lg:col-span-5">
        <div className="label flex items-center justify-between border-b border-line pb-3">
          <span>
            02.{i + 1} / {project.categoryLabel}
          </span>
          <span className="text-muted">{project.kind}</span>
        </div>

        <h3
          style={titleSize(project.title)}
          className="mt-6 text-(length:--t-sm) font-bold uppercase leading-[0.86] tracking-[-0.055em] lg:text-(length:--t-lg)"
        >
          {project.title}
        </h3>
        <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-ink-2 md:text-base">{project.description}</p>

        <ul className="mt-5 flex flex-wrap gap-1.5">
          {project.tags.map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap gap-3 pt-7">
          {caseStudies[project.slug] && (
            <Link href={`/projects/${project.slug}`} className="btn-brutal" data-cursor="Read">
              Case study <ArrowUpRight size={14} />
            </Link>
          )}
          <a href={project.githubLink} target="_blank" rel="noreferrer" className="btn-line" data-cursor="Repo">
            <GithubIcon size={15} /> Source
          </a>
          {project.liveLink && (
            <a href={project.liveLink} target="_blank" rel="noreferrer" className="btn-line" data-cursor="Live">
              Live demo <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </div>

      <div className="relative mt-6 h-[46vw] min-h-56 lg:col-span-7 lg:mt-0 lg:h-auto">
        <Visual project={project} />
      </div>
    </article>
  );
}

export default function Work() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      revealIn(root.current!);
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const pin = root.current!.querySelector<HTMLElement>("[data-pin]")!;
        const track = root.current!.querySelector<HTMLElement>("[data-track]")!;
        const bar = root.current!.querySelector<HTMLElement>("[data-progress]")!;
        const counter = root.current!.querySelector<HTMLElement>("[data-counter]")!;
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", root.current!);
        const distance = () => track.scrollWidth - window.innerWidth;

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              bar.style.transform = `scaleX(${self.progress})`;
              const n = Math.min(cards.length, Math.floor(self.progress * cards.length) + 1);
              counter.textContent = pad(n);
            },
          },
        });

        cards.forEach((card) => {
          const media = card.querySelector("[data-parallax]");
          if (media)
            gsap.fromTo(
              media,
              { xPercent: -7 },
              {
                xPercent: 7,
                ease: "none",
                scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
              },
            );
          // Cards already on screen when the pin starts can't use the horizontal trigger
          // (its start is behind them), so they straighten while the section scrolls in.
          const visibleAtPin = card.offsetLeft < window.innerWidth * 0.55;
          gsap.from(card, {
            rotate: 3,
            yPercent: 6,
            ease: "none",
            scrollTrigger: visibleAtPin
              ? { trigger: pin, start: "top 85%", end: "top top", scrub: true }
              : { trigger: card, containerAnimation: tween, start: "left right", end: "left 45%", scrub: true },
          });
        });
      });

      mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
        if (prefersReducedMotion()) return;
        gsap.utils.toArray<HTMLElement>("[data-card]", root.current!).forEach((card) =>
          gsap.from(card, { y: 60, opacity: 0, duration: 1, scrollTrigger: { trigger: card, start: "top 88%", once: true } }),
        );
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="work" ref={root} className="relative z-10 pt-[10vh]">
      <div className="shell">
        <SectionLabel
          index={copy.index}
          title={
            <>
              {copy.title.plain} <span className="serif-accent font-normal">{copy.title.accent}</span>
            </>
          }
          meta={`${pad(featuredProjects.length)} / ${pad(stats.projects)} systems`}
        />
      </div>

      <div data-pin className="relative lg:flex lg:h-[100svh] lg:items-center lg:overflow-hidden">
        <div
          data-track
          className="shell flex flex-col gap-6 py-10 lg:w-max lg:max-w-none lg:flex-row lg:items-center lg:gap-[3vw] lg:py-0 lg:pr-[12vw]"
        >
          <div className="shrink-0 lg:w-[26vw]">
            <p className="text-[clamp(1.6rem,2.5vw,2.6rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
              {featuredProjects.length} {copy.lead.count}{" "}
              <span className="serif-accent font-normal text-accent">{copy.lead.words[0]}</span>,{" "}
              <span className="serif-accent font-normal text-accent">{copy.lead.words[1]}</span> and{" "}
              <span className="serif-accent font-normal text-accent">{copy.lead.words[2]}</span>.
            </p>
            <p className="label mt-6 hidden items-center gap-2 text-muted lg:flex">
              Scroll <span className="inline-block h-px w-10 bg-current" /> {copy.scrollHint}
            </p>
          </div>

          {featuredProjects.map((p, i) => (
            <WorkCard key={p.slug} project={p} i={i} />
          ))}

          <button
            type="button"
            onClick={() => scrollToId("explore")}
            data-cursor="Index"
            className="group flex shrink-0 flex-col items-start justify-center gap-4 border-[1.5px] border-line-strong p-8 text-left lg:h-[74vh] lg:w-[24vw]"
          >
            <span className="label text-muted">
              +{stats.projects - featuredProjects.length} {copy.archiveMore}
            </span>
            <span className="text-4xl font-bold uppercase leading-[0.9] tracking-[-0.05em]">{copy.archiveCta}</span>
            <span className="grid size-14 place-items-center rounded-full bg-ink text-bg transition-transform duration-300 group-hover:translate-y-1">
              <ArrowDown size={20} />
            </span>
          </button>
        </div>

        <div className="shell pointer-events-none absolute inset-x-0 bottom-[max(3.5rem,6.5vh)] hidden items-center gap-4 lg:flex">
          <span className="label tabular-nums">
            <span data-counter>01</span>/{pad(featuredProjects.length)}
          </span>
          <div className="h-[2px] flex-1 bg-line">
            <div data-progress className="h-full origin-left scale-x-0 bg-accent" />
          </div>
        </div>
      </div>
    </section>
  );
}
