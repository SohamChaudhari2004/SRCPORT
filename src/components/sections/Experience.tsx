"use client";

import { useRef } from "react";
import { ArrowUpRight, Award, GraduationCap } from "lucide-react";
import { gsap, useGSAP, revealIn, prefersReducedMotion } from "@/lib/gsap";
import { pad } from "@/lib/derive";
import { experience, education, certifications } from "@/data/experience";
import { experienceCopy as copy } from "@/data/content";
import SectionLabel from "@/components/ui/SectionLabel";
import RoleProjects from "./RoleProjects";

export default function Experience() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      revealIn(root.current!);
      if (prefersReducedMotion()) return;
      // The rail fills as the timeline scrolls past.
      gsap.fromTo(
        "[data-rail]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-timeline]", start: "top 70%", end: "bottom 70%", scrub: true },
        },
      );
    },
    { scope: root },
  );

  return (
    <section id="experience" ref={root} className="shell relative z-10 py-[11vh]">
      <SectionLabel
        index={copy.index}
        title={
          <>
            {copy.title.plain}
            <span className="serif-accent font-normal">{copy.title.accent}</span>
          </>
        }
        meta={`${pad(experience.length)} roles`}
      />

      <p data-split className="mt-10 text-[clamp(1.5rem,2.5vw,2.4rem)] font-semibold leading-none tracking-[-0.04em]">
        {copy.lead}
      </p>

      <ol data-timeline className="relative mt-10 pl-6 md:pl-8">
        <span aria-hidden className="absolute bottom-0 left-1.5 top-0 w-px bg-line md:left-2.5">
          <span data-rail className="absolute inset-0 origin-top bg-gradient-to-b from-accent via-accent-2 to-signal" />
        </span>

        {experience.map((e) => (
          <li key={`${e.company}-${e.role}`} data-fade className="relative pb-4 last:pb-0">
            <span
              aria-hidden
              className={`absolute top-7 size-3 -translate-x-1/2 rounded-full border-2 border-accent -left-[18px] md:-left-[22px] ${e.current ? "bg-accent" : "bg-bg"}`}
            />
            <article className="glass grid gap-5 rounded-[24px] p-5 md:p-6 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <p className="label flex flex-wrap items-center gap-2">
                  <span>{e.period}</span>
                  {e.current && (
                    <span className="flex items-center gap-1.5 rounded-full bg-accent px-2 py-0.5 text-bg">
                      {copy.current}
                    </span>
                  )}
                </p>
                <p className="label mt-1.5 text-muted">{e.location}</p>
              </div>

              <div className="lg:col-span-6">
                <h3 className="text-xl font-semibold leading-tight tracking-[-0.03em] md:text-2xl">
                  {e.role} <span className="serif-accent font-normal text-accent">at</span>{" "}
                  {e.companyUrl ? (
                    <a href={e.companyUrl} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 hover:text-accent">
                      {e.company}
                      <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  ) : (
                    e.company
                  )}
                </h3>
                <p className="mt-1.5 text-[15px] text-ink-2">{e.summary}</p>
                <ul className="mt-4 space-y-2">
                  {e.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-sm leading-relaxed text-ink-2">
                      <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-accent" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              <ul className="flex flex-wrap content-start gap-1.5 lg:col-span-3 lg:justify-end">
                {e.stack.map((s) => (
                  <li key={s} className="chip">
                    {s}
                  </li>
                ))}
              </ul>

              {e.projects && <RoleProjects projects={e.projects} />}
            </article>
          </li>
        ))}
      </ol>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div data-fade className="glass rounded-[24px] p-5 md:p-6">
          <p className="label flex items-center gap-2 text-muted">
            <GraduationCap size={14} /> {copy.education}
          </p>
          <p className="mt-3 text-lg font-semibold tracking-[-0.02em]">{education.degree}</p>
          <p className="mt-1 text-sm text-ink-2">{education.school}</p>
          <p className="label mt-3 text-muted">
            {education.period} · {education.grade}
          </p>
        </div>
        <div data-fade className="glass rounded-[24px] p-5 md:p-6">
          <p className="label flex items-center gap-2 text-muted">
            <Award size={14} /> {copy.certifications}
          </p>
          <ul className="mt-3 space-y-2">
            {certifications.map((c) => (
              <li key={c.name} className="flex gap-3 text-sm leading-snug text-ink-2">
                <span aria-hidden className="mt-[0.5em] size-1.5 shrink-0 rounded-full bg-accent-2" />
                {c.url ? (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="Verify"
                    className="group inline-flex items-start gap-1 hover:text-accent"
                  >
                    <span>
                      <span className="font-medium text-ink group-hover:text-accent">{c.issuer}</span> · {c.name}
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="mt-0.5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                ) : (
                  <span>
                    <span className="font-medium text-ink">{c.issuer}</span> · {c.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
