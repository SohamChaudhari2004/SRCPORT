"use client";

import { useRef, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { gsap, useGSAP, revealIn } from "@/lib/gsap";
import { evals, stats, pad, type EvalView } from "@/lib/derive";
import { achievementsCopy as copy } from "@/data/content";
import SectionLabel from "@/components/ui/SectionLabel";
import CountUp from "@/components/ui/CountUp";

/** Podium: 2-1-3 bars, the achieved place lit in accent. */
function Podium({ place }: { place: number }) {
  const order = [2, 1, 3];
  const height: Record<number, string> = { 1: "100%", 2: "72%", 3: "50%" };
  return (
    <div className="flex h-24 items-end gap-2" aria-label={`Placed ${place} of top three`}>
      {order.map((p) => (
        <div key={p} className="flex h-full flex-1 flex-col justify-end">
          <div
            data-grow
            className={`relative origin-bottom border-[1.5px] ${p === place ? "border-accent bg-accent text-bg" : "border-line-strong"}`}
            style={{ height: height[p] }}
          >
            <span className="label absolute left-2 top-2">#{p}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Percentile strip: every tick is a slice of the field; the top slice is lit. */
function Percentile({ e }: { e: EvalView }) {
  const ticks = 56;
  const lit = Math.max(1, Math.round(((e.percentile ?? 1) / 100) * ticks));
  return (
    <div>
      <div className="flex h-24 items-end gap-[3px]" aria-label={`Top ${e.percentile?.toFixed(1)} percent`}>
        {Array.from({ length: ticks }, (_, i) => {
          const hot = i >= ticks - lit;
          const h = Math.round((22 + Math.pow(i / ticks, 2.2) * 78) * 100) / 100;
          return (
            <div
              key={i}
              data-grow
              className={`flex-1 origin-bottom ${hot ? "bg-accent" : "bg-ink/20"}`}
              style={{ height: hot ? "100%" : `${h}%` }}
            />
          );
        })}
      </div>
      <div className="label mt-2 flex justify-between text-muted">
        <span>{e.participants?.toLocaleString("en-US")}+ participants</span>
        <span className="text-accent">top {e.percentile?.toFixed(1)}%</span>
      </div>
    </div>
  );
}

function EvalCard({ e, i }: { e: EvalView; i: number }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { bounce: 0, duration: 0.5 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { bounce: 0, duration: 0.5 });

  const onMove = (ev: PointerEvent<HTMLElement>) => {
    if (ev.pointerType !== "mouse") return;
    const r = ev.currentTarget.getBoundingClientRect();
    mx.set((ev.clientX - r.left) / r.width - 0.5);
    my.set((ev.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div style={{ perspective: 1200 }} data-fade>
      <motion.article
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="glass flex h-full flex-col rounded-[26px] p-5 md:p-6"
      >
        <div className="label flex items-center justify-between">
          <span>
            {pad(i + 1)} · {e.rank.kind === "place" ? (e.rank.value === 1 ? "winner" : "podium") : "leaderboard"}
          </span>
          {e.date && <span className="rounded-full border border-line-strong px-2.5 py-1">{e.date}</span>}
        </div>

        <div className="mt-5 flex items-start font-extrabold leading-[0.78] tracking-[-0.075em]" style={{ transform: "translateZ(40px)" }}>
          {e.rank.kind === "place" ? (
            <>
              <span className="text-[clamp(3.6rem,6vw,5.6rem)]">#{e.rank.display}</span>
              <span className="serif-accent ml-2 mt-1 text-[clamp(1.6rem,2.6vw,2.4rem)] font-normal text-accent">
                {e.rank.suffix}
              </span>
            </>
          ) : (
            <>
              <span className="label mr-3 mt-3 text-accent">top</span>
              <span className="text-[clamp(3.6rem,6vw,5.6rem)]">{e.rank.display}</span>
            </>
          )}
        </div>

        <h3 className="mt-5 text-2xl font-semibold tracking-[-0.035em] md:text-[1.7rem]">{e.venue}</h3>
        <p className="label mt-1 text-muted">{e.subtitle}</p>
        <p className="mt-4 max-w-[56ch] text-sm leading-relaxed text-ink-2">{e.description}</p>

        <div className="mt-auto pt-6">
          {e.rank.kind === "place" ? <Podium place={e.rank.value} /> : e.percentile ? <Percentile e={e} /> : null}
        </div>
      </motion.article>
    </div>
  );
}

export default function Achievements() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      revealIn(root.current!);
      if (gsap.utils.toArray("[data-grow]").length)
        gsap.from("[data-grow]", {
          scaleY: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: { each: 0.012, from: "start" },
          scrollTrigger: { trigger: "[data-evals-grid]", start: "top 70%", once: true },
        });
    },
    { scope: root },
  );

  return (
    <section id="achievements" ref={root} className="shell relative z-10 py-[11vh]">
      <SectionLabel
        index={copy.index}
        title={
          <>
            {copy.title.plain}
            <span className="serif-accent font-normal">{copy.title.accent}</span>
          </>
        }
        meta={copy.meta}
      />

      <p data-fade className="mt-10 max-w-[24ch] text-[clamp(1.5rem,2.6vw,2.6rem)] font-semibold leading-[1] tracking-[-0.045em]">
        {copy.lead.before} <CountUp value={stats.participants} />
        {copy.lead.after}
      </p>

      <div data-evals-grid className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {evals.map((e, i) => (
          <EvalCard key={e.title} e={e} i={i} />
        ))}
      </div>
    </section>
  );
}
