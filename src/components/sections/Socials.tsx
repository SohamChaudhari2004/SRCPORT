"use client";

import { useRef, type CSSProperties, type PointerEvent } from "react";
import { ArrowUpRight, PenLine } from "lucide-react";
import { useGSAP, revealIn } from "@/lib/gsap";
import { socials, type SocialId } from "@/lib/socials";
import { site } from "@/lib/site";
import { pad } from "@/lib/derive";
import { openContact } from "@/lib/contact";
import SectionLabel from "@/components/ui/SectionLabel";
import CopyButton from "@/components/ui/CopyButton";
import { socialsCopy as copy } from "@/data/content";

/** Hover fill per channel; --fg is the text colour that reads on it. */
const FILL: Record<SocialId, CSSProperties> = {
  email: { "--fill": "var(--accent)", "--fg": "var(--bg)" } as CSSProperties,
  linkedin: { "--fill": "var(--ink)", "--fg": "var(--bg)" } as CSSProperties,
  github: { "--fill": "var(--accent-2)", "--fg": "var(--on-bright)" } as CSSProperties,
  x: { "--fill": "var(--ink)", "--fg": "var(--bg)" } as CSSProperties,
  medium: { "--fill": "var(--signal)", "--fg": "var(--on-bright)" } as CSSProperties,
};

/** The fill grows out of the point where the pointer entered, and retracts toward where it left. */
const track = (e: PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

const tile =
  "sweep group glass relative flex flex-col overflow-hidden rounded-[22px] p-5 transition-colors duration-500 md:p-6";
const flip = "relative z-10 transition-colors duration-500 group-hover:text-(color:--fg) group-focus-visible:text-(color:--fg)";

export default function Socials() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => revealIn(root.current!), { scope: root });

  const [email, ...rest] = socials;
  const EmailIcon = email.icon;

  return (
    <section id="socials" ref={root} className="shell relative z-10 py-[11vh]">
      <SectionLabel
        index={copy.index}
        title={
          <>
            {copy.title.plain}
            <span className="serif-accent font-normal">{copy.title.accent}</span>
          </>
        }
        meta={`${pad(socials.length)} channels`}
      />

      <div className="mt-10 grid gap-5 lg:grid-cols-12 lg:items-end">
        <h3
          data-split
          className="text-[clamp(2rem,3.8vw,3.8rem)] font-extrabold leading-[0.9] tracking-[-0.055em] lg:col-span-7"
        >
          {copy.lead.plain} <span className="serif-accent font-normal text-accent">{copy.lead.accent}</span>
        </h3>
        <p data-fade className="max-w-[44ch] text-ink-2 lg:col-span-4 lg:col-start-9">
          Based in {site.location} ({site.timeZoneLabel}). {copy.body}
        </p>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-6">
        {/* Email, the primary channel gets the big tile */}
        <div
          data-fade
          onPointerEnter={track}
          onPointerLeave={track}
          style={FILL.email}
          className={`${tile} min-h-[250px] sm:col-span-2 lg:col-span-4 lg:min-h-[290px]`}
        >
          <span aria-hidden className="sweep-fill" />
          <div className={`${flip} label flex items-center justify-between`}>
            <span>
              <span className="opacity-60">[{pad(1)}]</span> {email.label}
            </span>
            <EmailIcon size={20} />
          </div>
          <a
            href={email.href}
            data-cursor="Mail"
            className={`${flip} mt-auto block pt-10 text-[clamp(1.4rem,3.4vw,3.3rem)] font-extrabold leading-[0.95] tracking-[-0.05em] [overflow-wrap:anywhere]`}
          >
            {site.email}
          </a>
          <p className={`${flip} mt-3 max-w-[48ch] text-[15px] opacity-75`}>{email.blurb}</p>
          <div className={`${flip} mt-6 flex flex-wrap gap-3`}>
            <button
              type="button"
              data-sound="none"
              data-cursor="Write"
              onClick={(e) => openContact(e.currentTarget)}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 font-mono text-[12px] font-semibold uppercase tracking-[0.06em] text-bg transition-[background-color,color,transform] duration-300 active:scale-[0.97] group-hover:bg-(color:--fg) group-hover:text-(color:--fill)"
            >
              <PenLine size={14} /> {copy.writeCta}
            </button>
            <CopyButton
              text={site.email}
              label={copy.copyCta}
              className="inline-flex h-11 items-center rounded-full border-[1.5px] border-current px-5 font-mono text-[12px] font-semibold uppercase tracking-[0.06em] transition-transform active:scale-[0.97]"
            />
          </div>
        </div>

        {rest.map((s, i) => {
          const Icon = s.icon;
          return (
            <a
              key={s.id}
              data-fade
              href={s.href}
              target="_blank"
              rel="noreferrer"
              data-cursor="Open"
              onPointerEnter={track}
              onPointerLeave={track}
              style={FILL[s.id]}
              className={`${tile} min-h-[210px] lg:col-span-2 ${i === 0 ? "lg:min-h-[290px]" : "lg:min-h-[240px]"}`}
            >
              <span aria-hidden className="sweep-fill" />
              <div className={`${flip} label flex items-center justify-between`}>
                <span>
                  <span className="opacity-60">[{pad(i + 2)}]</span> {s.label}
                </span>
                <span className="grid size-10 place-items-center rounded-full border border-current/25 transition-transform duration-500 ease-(--ease-apple) group-hover:rotate-45">
                  <ArrowUpRight size={17} />
                </span>
              </div>
              <div className={`${flip} mt-auto pt-10`}>
                <Icon
                  size={28}
                  className="transition-transform duration-500 ease-(--ease-apple) group-hover:-translate-y-1 group-hover:scale-110"
                />
                <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] md:text-3xl">{s.label}</p>
                <p className="label mt-1.5 normal-case tracking-normal opacity-70">{s.handle}</p>
                <p className="mt-3 max-w-[34ch] text-sm leading-snug opacity-75">{s.blurb}</p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
