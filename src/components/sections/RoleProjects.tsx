"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { ScrollTrigger } from "@/lib/gsap";
import { pad } from "@/lib/derive";
import type { RoleProject } from "@/data/experience";
import { experienceCopy as copy } from "@/data/content";

/** Product cards for one role, collapsed until the visitor asks for them. */
export default function RoleProjects({ projects }: { projects: RoleProject[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className="border-t border-line pt-4 lg:col-span-12">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        data-cursor={open ? "Hide" : "Open"}
        className="group label flex w-full items-center justify-between gap-3 text-left text-ink"
      >
        <span className="flex items-center gap-2">
          {open ? copy.hideBuilt : copy.builtHere}
          <span className="text-muted">({pad(projects.length)})</span>
        </span>
        <span className="grid size-8 place-items-center rounded-full border border-line-strong transition-colors group-hover:bg-ink group-hover:text-bg">
          <Plus
            size={14}
            className={`transition-transform duration-500 ease-[var(--ease-apple)] ${open ? "rotate-45" : ""}`}
          />
        </span>
      </button>

      <div
        id={id}
        inert={!open}
        onTransitionEnd={(e) => e.target === e.currentTarget && ScrollTrigger.refresh()}
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-apple)] ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="min-h-0 overflow-hidden">
          <ul className="grid gap-3 pt-4 md:grid-cols-2">
            {projects.map((p, i) => (
              <li
                key={p.name}
                className="flex flex-col rounded-[18px] border border-line bg-paper/50 p-4 transition-colors hover:border-line-strong md:p-5"
              >
                <div className="label flex items-center justify-between gap-2">
                  <span className="text-accent">
                    {pad(i + 1)} / {p.tag}
                  </span>
                  {p.status && <span className="rounded-full border border-current px-2 py-0.5 text-signal">{p.status}</span>}
                </div>
                <h4 className="mt-2 text-lg font-semibold tracking-[-0.03em]">{p.name}</h4>
                <p className="mt-1 text-sm text-ink-2">{p.summary}</p>
                <ul className="mt-3 space-y-1.5">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-2">
                      <span aria-hidden className="mt-[0.6em] size-1 shrink-0 rounded-full bg-accent" />
                      {pt}
                    </li>
                  ))}
                </ul>
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
                  {p.stack.map((s) => (
                    <li key={s} className="chip">
                      {s}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
