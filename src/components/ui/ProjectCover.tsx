import type { ReactElement } from "react";
import type { CoverKind, ProjectView } from "@/lib/derive";
import { mulberry32 } from "@/components/three/shapes";

/**
 * Deterministic generative artwork for projects without a screenshot.
 * The motif follows what the project does: agent graphs, detection boxes,
 * token streams, scatter fits, pipelines, wireframes.
 */
const W = 480;
const H = 360;
// Transcendental math can differ in the last bit between Node and the browser;
// round so server and client markup match exactly.
const q = (n: number) => Math.round(n * 100) / 100;

function Agents({ seed }: { seed: number }) {
  const r = mulberry32(seed);
  const n = 6 + Math.floor(r() * 3);
  const cx = W / 2;
  const cy = H / 2 + 6;
  const nodes = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + r() * 0.4;
    const rad = 110 + r() * 30;
    return { x: q(cx + Math.cos(a) * rad * 1.25), y: q(cy + Math.sin(a) * rad * 0.82) };
  });
  return (
    <g>
      {nodes.map((p, i) => (
        <line key={`e${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="currentColor" strokeOpacity={0.35} strokeDasharray="3 5" className="cover-flow" />
      ))}
      {nodes.map((p, i) => {
        const q = nodes[(i + 2) % n];
        return <line key={`c${i}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="currentColor" strokeOpacity={0.12} />;
      })}
      {nodes.map((p, i) => (
        <g key={`n${i}`}>
          <rect x={p.x - 26} y={p.y - 11} width={52} height={22} fill="var(--bg)" stroke="currentColor" />
          <text x={p.x} y={p.y + 3.5} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="currentColor">
            agent_{i}
          </text>
        </g>
      ))}
      <circle cx={cx} cy={cy} r={30} className="fill-accent" />
      <circle cx={cx} cy={cy} r={42} fill="none" className="stroke-accent" strokeOpacity={0.5} />
      <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--bg)">
        ORCH
      </text>
    </g>
  );
}

function Vision({ seed }: { seed: number }) {
  const r = mulberry32(seed);
  const cols = 16;
  const rows = 12;
  const cw = W / cols;
  const ch = H / rows;
  const boxes = [
    { x: 40 + r() * 60, y: 50 + r() * 40, w: 150 + r() * 40, h: 170 + r() * 40, label: "person", c: 0.9 + r() * 0.09 },
    { x: 270 + r() * 40, y: 120 + r() * 50, w: 120 + r() * 40, h: 110 + r() * 30, label: "object", c: 0.8 + r() * 0.15 },
  ];
  return (
    <g>
      {Array.from({ length: cols * rows }, (_, i) => {
        const x = (i % cols) * cw;
        const y = Math.floor(i / cols) * ch;
        const v = q(0.04 + Math.pow(r(), 2.2) * 0.28);
        return <rect key={i} x={x + 1} y={y + 1} width={cw - 2} height={ch - 2} fill="currentColor" fillOpacity={v} />;
      })}
      {boxes.map((b) => (
        <g key={b.label}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="none" className="stroke-accent" strokeWidth={2} />
          <rect x={b.x - 1} y={b.y - 18} width={b.label.length * 7 + 44} height={18} className="fill-accent" />
          <text x={b.x + 6} y={b.y - 5.5} fontSize={10} fontFamily="var(--font-mono)" fill="var(--bg)">
            {b.label} {b.c.toFixed(2)}
          </text>
        </g>
      ))}
      <rect x={0} y={0} width={W} height={2} className="fill-accent cover-scan" />
    </g>
  );
}

function Language({ seed }: { seed: number }) {
  const r = mulberry32(seed);
  const rows = 9;
  const lines = Array.from({ length: rows }, () => {
    const toks: { w: number; hot: boolean }[] = [];
    let used = 0;
    while (used < 250) {
      const w = 18 + r() * 46;
      toks.push({ w, hot: r() < 0.14 });
      used += w + 6;
    }
    return toks;
  });
  const n = 8;
  return (
    <g>
      {lines.map((toks, li) => {
        let x = 32;
        return toks.map((t, ti) => {
          const el = (
            <rect
              key={`${li}-${ti}`}
              x={x}
              y={50 + li * 30}
              width={t.w}
              height={14}
              className={t.hot ? "fill-accent" : undefined}
              fill={t.hot ? undefined : "currentColor"}
              fillOpacity={t.hot ? 1 : 0.18}
            />
          );
          x += t.w + 6;
          return el;
        });
      })}
      <g transform="translate(330 60)">
        {Array.from({ length: n * n }, (_, i) => {
          const a = i % n;
          const b = Math.floor(i / n);
          const v = a <= b ? 0.1 + r() * 0.9 * (a === b ? 1 : 0.6) : 0.03;
          return <rect key={i} x={a * 15} y={b * 15} width={14} height={14} className="fill-accent" fillOpacity={v} />;
        })}
        <text x={0} y={-10} fontSize={9} fontFamily="var(--font-mono)" fill="currentColor" fillOpacity={0.6}>
          ATTN · HEAD 3
        </text>
      </g>
    </g>
  );
}

function Ml({ seed }: { seed: number }) {
  const r = mulberry32(seed);
  const pts = Array.from({ length: 70 }, () => {
    const x = r();
    const y = 0.15 + 0.6 * x + 0.12 * Math.sin(x * 7) + (r() - 0.5) * 0.18;
    return { x: q(50 + x * 380), y: q(H - 50 - y * 250) };
  });
  const curve = Array.from({ length: 50 }, (_, i) => {
    const x = i / 49;
    const y = 0.15 + 0.6 * x + 0.12 * Math.sin(x * 7);
    return `${i ? "L" : "M"}${q(50 + x * 380)},${q(H - 50 - y * 250)}`;
  }).join(" ");
  return (
    <g>
      <line x1={50} y1={H - 50} x2={W - 30} y2={H - 50} stroke="currentColor" strokeOpacity={0.5} />
      <line x1={50} y1={40} x2={50} y2={H - 50} stroke="currentColor" strokeOpacity={0.5} />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="currentColor" fillOpacity={0.55} />
      ))}
      <path d={curve} fill="none" className="stroke-accent" strokeWidth={2.5} />
      <text x={W - 34} y={H - 60} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill="currentColor">
        R² = {(0.86 + r() * 0.12).toFixed(3)}
      </text>
    </g>
  );
}

function Automation({ seed }: { seed: number }) {
  const r = mulberry32(seed);
  const steps = ["trigger", "fetch", "parse", "send"];
  const y = H / 2;
  return (
    <g>
      {steps.map((s, i) => {
        const x = 40 + i * 110;
        return (
          <g key={s}>
            {i < steps.length - 1 && (
              <line x1={x + 84} y1={y} x2={x + 110} y2={y} stroke="currentColor" strokeDasharray="3 4" className="cover-flow" />
            )}
            <rect x={x} y={y - 34} width={84} height={68} fill={i === 3 ? undefined : "var(--bg)"} className={i === 3 ? "fill-accent" : undefined} stroke="currentColor" />
            <text x={x + 42} y={y + 4} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" fill={i === 3 ? "var(--bg)" : "currentColor"}>
              {s}()
            </text>
          </g>
        );
      })}
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={40 + i * 30} y={y + 70} width={20} height={6 + r() * 30} fill="currentColor" fillOpacity={0.2} />
      ))}
      <text x={40} y={y - 60} fontSize={10} fontFamily="var(--font-mono)" fill="currentColor" fillOpacity={0.6}>
        CRON · */{Math.ceil(r() * 30)} * * * *
      </text>
    </g>
  );
}

function Web({ seed }: { seed: number }) {
  const r = mulberry32(seed);
  return (
    <g>
      <rect x={30} y={30} width={W - 60} height={H - 60} fill="var(--bg)" stroke="currentColor" />
      <line x1={30} y1={56} x2={W - 30} y2={56} stroke="currentColor" />
      {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
        <circle key={c} cx={46 + i * 14} cy={43} r={4} fill={c} />
      ))}
      <rect x={50} y={76} width={180} height={20} fill="currentColor" />
      <rect x={50} y={104} width={120} height={8} fill="currentColor" fillOpacity={0.3} />
      <rect x={50} y={128} width={86} height={24} className="fill-accent" />
      {Array.from({ length: 3 }, (_, i) => (
        <rect key={i} x={50 + i * 128} y={180} width={118} height={100 + r() * 30} fill="currentColor" fillOpacity={0.08 + r() * 0.1} stroke="currentColor" strokeOpacity={0.3} />
      ))}
      <rect x={260} y={76} width={170} height={76} fill="currentColor" fillOpacity={0.12} />
    </g>
  );
}

const MOTIFS: Record<CoverKind, (p: { seed: number }) => ReactElement> = {
  agents: Agents,
  vision: Vision,
  language: Language,
  ml: Ml,
  automation: Automation,
  web: Web,
};

export default function ProjectCover({ project, className = "" }: { project: ProjectView; className?: string }) {
  const Motif = MOTIFS[project.kind];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`h-full w-full text-ink ${className}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <pattern id={`dots-${project.slug}`} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" fillOpacity="0.18" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#dots-${project.slug})`} />
      <Motif seed={project.seed} />
      <text x={16} y={22} fontSize={10} fontFamily="var(--font-mono)" fill="currentColor" fillOpacity={0.55}>
        {project.kind.toUpperCase()} · {project.repo.split("/")[1] ?? project.slug}
      </text>
      <text x={W - 16} y={H - 14} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill="currentColor" fillOpacity={0.55}>
        0x{project.seed.toString(16).slice(0, 6)}
      </text>
    </svg>
  );
}
