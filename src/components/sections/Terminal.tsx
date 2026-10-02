"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { evals, githubProfile, projectViews, resumeUrl, skillGroups, stats, pad } from "@/lib/derive";
import { site } from "@/lib/site";
import { setTheme, getTheme } from "@/lib/theme";
import { socials } from "@/lib/socials";
import { openContact } from "@/lib/contact";
import { terminalCopy } from "@/data/content";
import { prefersReducedMotion } from "@/lib/gsap";

type Line = { id: number; kind: "in" | "out" | "sys"; text: string };

const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

const MANIFESTO = terminalCopy.manifesto;

const listProjects = (filter?: string) => {
  const f = filter?.toLowerCase();
  const list = projectViews.filter((p) =>
    !f ? true : f.startsWith("ai") ? p.category === "ai-ml" : f.startsWith("web") ? p.category === "web-dev" : true,
  );
  return [
    ...list.map((p) => `${pad(p.index)}  ${p.title.padEnd(30, " ")} ${p.categoryLabel}${p.liveLink ? "  ● live" : ""}`),
    "",
    `${list.length} results · run \`open <no.>\` to view a repo`,
  ].join("\n");
};

const COMMANDS: Record<string, { desc: string; run: (args: string[]) => string | null }> = {
  help: {
    desc: "list commands",
    run: () =>
      Object.entries(COMMANDS)
        .map(([k, v]) => `${k.padEnd(12, " ")} ${v.desc}`)
        .join("\n"),
  },
  whoami: {
    desc: "who is this",
    run: () =>
      `${site.name} · ${site.role}\n${terminalCopy.whoamiLine}\n${stats.projects} repos · ${stats.tools} tools · ${stats.awards} hackathon podiums`,
  },
  projects: { desc: "list repos  [ai|web]", run: (a) => listProjects(a[0]) },
  open: {
    desc: "open a repo  <no.|name>",
    run: (a) => {
      const q = a.join(" ").toLowerCase();
      if (!q) return "usage: open <no.|name>";
      const n = Number(q);
      const p = Number.isFinite(n) && n > 0 ? projectViews[n - 1] : projectViews.find((x) => x.title.toLowerCase().includes(q));
      if (!p) return `open: no project matches "${q}"`;
      open(p.githubLink);
      return `opening github.com/${p.repo} ↗`;
    },
  },
  skills: {
    desc: "the stack, by layer",
    run: () =>
      skillGroups.map((g, i) => `L${pad(i)} ${g.category}\n    ${g.items.map((s) => s.name).join(" · ")}`).join("\n"),
  },
  evals: {
    desc: "hackathon results",
    run: () =>
      evals
        .map(
          (e) =>
            `${(e.rank.kind === "place" ? `#${e.rank.display}` : `TOP ${e.rank.display}`).padEnd(8, " ")}${e.venue} · ${e.subtitle}${e.date ? ` (${e.date})` : ""}`,
        )
        .join("\n"),
  },
  resume: {
    desc: "open resume.pdf",
    run: () => {
      open(resumeUrl);
      return "opening resume.pdf ↗";
    },
  },
  github: {
    desc: "open GitHub profile",
    run: () => {
      open(githubProfile.url);
      return `opening github.com/${githubProfile.handle} ↗`;
    },
  },
  contact: {
    desc: "open the contact form",
    run: () => {
      openContact(document.querySelector("[aria-label='Terminal command']"));
      return `opening contact.form …\nor write directly: ${site.email}`;
    },
  },
  socials: {
    desc: "where to find me",
    run: () =>
      [
        ...socials.map((s) => `${s.label.toLowerCase().padEnd(10, " ")}${s.href.replace(/^mailto:/, "")}`),
        `resume    ${resumeUrl}`,
      ].join("\n"),
  },
  theme: {
    desc: "switch theme  [light|dark]",
    run: (a) => {
      const next = a[0] === "light" || a[0] === "dark" ? a[0] : getTheme() === "dark" ? "light" : "dark";
      setTheme(next);
      return `theme → ${next}`;
    },
  },
  ls: { desc: "list files", run: () => "about.md   projects/   skills.json   evals.log   resume.pdf   contact.form" },
  cat: {
    desc: "print a file",
    run: (a) => {
      switch (a[0]) {
        case "about.md":
          return MANIFESTO;
        case "skills.json":
          return JSON.stringify(Object.fromEntries(skillGroups.map((g) => [g.category, g.items.length])), null, 2);
        case "evals.log":
          return COMMANDS.evals.run([]);
        case "contact.form":
          return COMMANDS.contact.run([]);
        case "resume.pdf":
          return "cat: resume.pdf: binary file · try `resume`";
        case "projects":
        case "projects/":
          return "cat: projects/: is a directory · try `projects`";
        default:
          return a[0] ? `cat: ${a[0]}: no such file` : "usage: cat <file>";
      }
    },
  },
  sudo: {
    desc: "try it",
    run: (a) => {
      if (a.join(" ") !== "hire-me") return "sudo: permission denied. try `sudo hire-me`";
      open(resumeUrl);
      return "[sudo] password for recruiter: ********\naccess granted ✓\nopening resume.pdf ↗";
    },
  },
  clear: { desc: "clear the screen", run: () => null },
};

const SUGGESTIONS = ["help", "whoami", "projects ai", "skills", "socials", "contact", "sudo hire-me"];
const WELCOME: Line[] = [
  { id: -2, kind: "sys", text: `soham-os ${site.version.replace("v", "")} (latent-space) · tty1` },
  { id: -1, kind: "sys", text: "type `help` to list commands, or tap a suggestion below." },
];

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [value, setValue] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);
  const frame = useRef(0);
  const live = useRef<{ id: number; full: string } | null>(null);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  /** Stream output token-by-token, like a model response. */
  const stream = useCallback((full: string) => {
    cancelAnimationFrame(frame.current);
    const id = ++idRef.current;
    live.current = { id, full };
    setLines((l) => [...l, { id, kind: "out", text: "" }]);
    let i = 0;
    const step = () => {
      i = Math.min(full.length, i + Math.max(3, Math.ceil(full.length / 90)));
      const text = full.slice(0, i);
      setLines((l) => l.map((x) => (x.id === id ? { ...x, text } : x)));
      if (i < full.length) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  }, []);

  const run = useCallback(
    (raw: string) => {
      const input = raw.trim();
      // finish any in-flight stream instantly
      cancelAnimationFrame(frame.current);
      const pending = live.current;
      live.current = null;
      setLines((l) => [
        ...l.map((x) => (pending && x.id === pending.id ? { ...x, text: pending.full } : x)),
        { id: ++idRef.current, kind: "in", text: input },
      ]);
      if (!input) return;
      history.current.unshift(input);
      cursor.current = -1;

      const [name, ...args] = input.split(/\s+/);
      const cmd = COMMANDS[name.toLowerCase()];
      if (!cmd) {
        stream(`zsh: command not found: ${name} · try \`help\``);
        return;
      }
      const out = cmd.run(args);
      if (out === null) {
        setLines([]);
        return;
      }
      stream(out);
    },
    [stream],
  );

  // First time the terminal scrolls into view, type and run `whoami` so it never sits empty.
  const touched = useRef(false);
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    let timer = 0;
    const demo = "whoami";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (prefersReducedMotion()) {
          if (!touched.current) run(demo);
          return;
        }
        let i = 0;
        const type = () => {
          if (touched.current) return setValue("");
          i++;
          setValue(demo.slice(0, i));
          if (i < demo.length) timer = window.setTimeout(type, 70 + Math.random() * 60);
          else
            timer = window.setTimeout(() => {
              if (touched.current) return;
              setValue("");
              run(demo);
            }, 380);
        };
        timer = window.setTimeout(type, 600);
      },
      { threshold: 0.6 },
    );
    io.observe(body);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [run]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    touched.current = true;
    if (e.key === "Enter") {
      run(value);
      setValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(cursor.current + 1, history.current.length - 1);
      if (next >= 0) {
        cursor.current = next;
        setValue(history.current[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = cursor.current - 1;
      cursor.current = Math.max(next, -1);
      setValue(next >= 0 ? history.current[next] : "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = Object.keys(COMMANDS).find((k) => k.startsWith(value.trim().toLowerCase()));
      if (match && value.trim()) setValue(match + " ");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div className="glass glass-strong overflow-hidden rounded-[24px]">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="label flex-1 text-center text-muted">soham@latent-space: ~ · zsh</span>
      </div>

      <div
        ref={bodyRef}
        data-lenis-prevent
        onClick={() => inputRef.current?.focus({ preventScroll: true })}
        className="h-[360px] overflow-y-auto overscroll-contain px-5 py-4 font-mono text-[12.5px] leading-6 md:h-[400px] md:text-[13px]"
        role="log"
        aria-live="polite"
      >
        {lines.map((l) =>
          l.kind === "in" ? (
            <div key={l.id} className="mt-2 break-all">
              <span className="text-accent-2">➜</span> <span className="text-accent">~</span> {l.text}
            </div>
          ) : (
            <pre key={l.id} className={`whitespace-pre-wrap break-words font-mono ${l.kind === "sys" ? "text-muted" : "text-ink-2"}`}>
              {l.text}
            </pre>
          ),
        )}
        <label className="mt-2 flex items-center gap-2">
          <span className="shrink-0">
            <span className="text-accent-2">➜</span> <span className="text-accent">~</span>
          </span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              touched.current = true;
              setValue(e.target.value);
            }}
            onKeyDown={onKeyDown}
            aria-label="Terminal command"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-ink caret-[var(--accent)] outline-none"
            placeholder="type a command…"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line p-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              touched.current = true;
              setValue("");
              run(s);
              inputRef.current?.focus({ preventScroll: true });
            }}
            data-sound="soft"
            className="chip rounded-full !border-line bg-paper/50 transition-colors hover:!border-accent hover:text-accent"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
