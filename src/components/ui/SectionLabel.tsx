import type { ReactNode } from "react";

/** `[03] Selected work -------- meta`: the recurring brutalist section header. */
export default function SectionLabel({
  index,
  title,
  meta,
}: {
  index: string;
  title: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b-[1.5px] border-line-strong pb-4">
      <div className="flex items-start gap-3 md:gap-5">
        <span data-fade className="label mt-2 text-accent md:mt-4">
          [{index}]
        </span>
        <h2
          data-split
          className="text-[clamp(2.2rem,5.6vw,5.6rem)] font-bold leading-[0.88] tracking-[-0.055em]"
        >
          {title}
        </h2>
      </div>
      {meta && (
        <span data-fade className="label pb-2 text-muted">
          {meta}
        </span>
      )}
    </div>
  );
}
