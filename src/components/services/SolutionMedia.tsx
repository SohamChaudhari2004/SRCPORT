import type { Solution } from "@/data/services";
import { SOLUTION_ICONS } from "./icons";

/**
 * The solution's demo video when it has one, otherwise a branded visual
 * in the same frame, so cards and pages keep their layout until videos are added.
 */
export default function SolutionMedia({ solution, large = false }: { solution: Solution; large?: boolean }) {
  const Icon = SOLUTION_ICONS[solution.icon];
  if (solution.video) {
    return (
      <video
        src={solution.video.src}
        poster={solution.video.poster}
        className="block aspect-video w-full bg-black object-cover"
        {...(large ? { controls: true, preload: "metadata" } : { autoPlay: true, muted: true, loop: true, preload: "none" })}
        playsInline
        aria-label={`${solution.title} demo`}
      />
    );
  }
  return (
    <div
      aria-hidden
      className="relative grid aspect-video w-full place-items-center overflow-hidden bg-[radial-gradient(120%_120%_at_0%_0%,color-mix(in_oklab,var(--accent)_28%,transparent),transparent_60%),radial-gradient(120%_120%_at_100%_100%,color-mix(in_oklab,var(--accent-2)_26%,transparent),transparent_55%)] bg-paper"
    >
      <div className="absolute inset-0 bg-[linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] bg-[size:28px_28px] opacity-60" />
      <span
        className={`relative grid place-items-center rounded-2xl border border-line bg-bg/80 text-accent shadow-sm backdrop-blur ${large ? "size-24" : "size-14"}`}
      >
        <Icon size={large ? 40 : 24} strokeWidth={1.6} />
      </span>
    </div>
  );
}
