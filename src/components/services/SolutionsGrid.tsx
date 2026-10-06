"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { categories, solutions, type SolutionCategory } from "@/data/services";
import SolutionMedia from "./SolutionMedia";

type Filter = SolutionCategory | "All";

/** Solutions with a category filter. Each card opens the solution's own page. */
export default function SolutionsGrid() {
  const [filter, setFilter] = useState<Filter>("All");
  const shown = filter === "All" ? solutions : solutions.filter((s) => s.category === filter);

  return (
    <div>
      <div role="group" aria-label="Filter solutions" className="flex flex-wrap gap-2">
        {(["All", ...categories] as Filter[]).map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={filter === c}
            onClick={() => setFilter(c)}
            className={`rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors ${
              filter === c ? "border-ink bg-ink text-bg" : "border-line text-ink-2 hover:border-ink hover:text-ink"
            }`}
          >
            {c}
            <span className="ml-1.5 tabular-nums opacity-60">
              {c === "All" ? solutions.length : solutions.filter((s) => s.category === c).length}
            </span>
          </button>
        ))}
      </div>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((s) => (
          <li key={s.slug}>
            <a
              href={`/${s.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-bg transition-[transform,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-ink"
            >
              <SolutionMedia solution={s} />
              <div className="flex flex-1 flex-col p-5">
                <p className="label text-muted">{s.category}</p>
                <h3 className="mt-2 text-lg font-semibold leading-snug tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{s.tagline}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[14px] font-medium text-accent">
                  Explore solution
                  <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
