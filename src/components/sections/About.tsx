"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowUpRight, Download } from "lucide-react";
import { gsap, useGSAP, revealIn, prefersReducedMotion } from "@/lib/gsap";
import { capabilities, githubProfile, resumeUrl, stats } from "@/lib/derive";
import { site } from "@/lib/site";
import { about } from "@/data/content";
import { education } from "@/data/experience";
import SectionLabel from "@/components/ui/SectionLabel";
import CountUp from "@/components/ui/CountUp";
import GithubIcon from "@/components/ui/GithubIcon";

const FACTS: [string, string][] = [
  ["Now", `${site.current.role} at ${site.current.company}`],
  ["Based in", site.location],
  ["Studied", `${education.degree}, ${education.period.split(" - ")[1]}`],
  // ["Shipped", `${stats.projects} public repos, ${stats.ai} in AI / ML`],
];

const maxCap = Math.max(...capabilities.map((c) => c.count), 1);

export default function About() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      revealIn(root.current!);
      if (prefersReducedMotion()) return;


      gsap.from("[data-photo]", {
        clipPath: "inset(100% 0% 0% 0% round 24px)",
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-photo]", start: "top 85%", once: true },
      });

      gsap.from("[data-bar]", {
        scaleX: 0,
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: "[data-caps]", start: "top 80%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section id="about" ref={root} className="shell relative z-10 py-[11vh]">
      <SectionLabel
        index={about.index}
        title={
          <>
            {about.title.plain}
            <span className="serif-accent font-normal">{about.title.accent}</span>
          </>
        }
      />


      <div className="mt-10 grid md:mt-12 gap-4 md:grid-cols-2 lg:grid-cols-12">
        {/* portrait: one image per theme */}
        <figure data-fade className="glass relative overflow-hidden rounded-[24px] p-1.5 lg:col-span-4">
          <div data-photo className="relative aspect-[4/5] overflow-hidden rounded-[19px] bg-paper">
            <Image
              src={site.photo.light}
              alt={site.photo.alt}
              fill
              sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover dark:hidden"
            />
            <Image
              src={site.photo.dark}
              alt={site.photo.alt}
              fill
              sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
              className="hidden object-cover dark:block"
            />
            <figcaption className="label absolute bottom-3 left-3 rounded-full bg-ink/80 px-2.5 py-1 text-bg backdrop-blur">
              {about.photoCaption}
            </figcaption>
          </div>
        </figure>

        {/* bio + facts */}
        <div data-fade className="glass flex flex-col rounded-[24px] p-5 md:p-6 lg:col-span-4">
          <span className="label text-muted">{about.factsTitle}</span>
          <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-ink-2">
            {about.bio.map((b) => (
              <p key={b}>{b}</p>
            ))}
          </div>
          <dl className="mt-5 border-t-[1.5px] border-line-strong">
            {FACTS.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[5.5rem_1fr] gap-3 border-b border-line py-2.5">
                <dt className="label pt-0.5 text-muted">{k}</dt>
                <dd className="min-w-0 text-sm leading-snug">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-auto flex flex-wrap gap-3 pt-5">
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn-brutal" data-cursor="PDF">
              <Download size={14} /> {about.resumeCta}
            </a>
            <a href={githubProfile.url} target="_blank" rel="noreferrer" className="btn-line" data-cursor="Source">
              <GithubIcon size={14} /> {about.sourceCta} <ArrowUpRight size={13} />
            </a>
          </div>
        </div>

        {/* where the commits go */}
        <aside data-fade data-caps className="glass flex flex-col rounded-[24px] p-5 md:col-span-2 md:p-6 lg:col-span-4">
          <div className="flex items-center justify-between">
            <span className="label">Capability mix</span>
            <span className="label text-muted">n = {stats.projects} repos</span>
          </div>
          <p className="mt-4 text-xl font-semibold leading-tight tracking-[-0.03em]">Where the commits go.</p>
          <ul className="mt-5 flex flex-1 flex-col justify-center gap-3.5">
            {capabilities.map((c, i) => (
              <li key={c.label}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-sm font-medium">{c.label}</span>
                  <span className="label text-muted">
                    <CountUp value={c.count} pad={2} /> repos
                  </span>
                </div>
                <div className="h-2 w-full bg-line">
                  <div
                    data-bar
                    className="h-full origin-left"
                    style={{
                      width: `${(c.count / maxCap) * 100}%`,
                      background: c.support
                        ? "var(--muted)"
                        : i === 0
                          ? "var(--accent)"
                          : i === 1
                            ? "var(--accent-2)"
                            : "var(--ink)",
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="label mt-5 text-muted">* keyword coverage across public repositories</p>
        </aside>
      </div>
    </section>
  );
}
