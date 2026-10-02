"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "motion/react";
import { ArrowUpRight, Clock, LoaderCircle, MapPin, RotateCcw, Send, X } from "lucide-react";
import { closeContact, contactStore, draftStore, updateDraft, type Draft } from "@/lib/contact";
import { useStore } from "@/lib/store";
import { site } from "@/lib/site";
import { socials } from "@/lib/socials";
import { playSuccess } from "@/lib/sound";
import { modalCopy as copy } from "@/data/content";
import CopyButton from "@/components/ui/CopyButton";
import { lenisRef } from "./SmoothScroll";

const spring = { type: "spring" as const, bounce: 0, duration: 0.55 };
const snappy = { type: "spring" as const, bounce: 0, duration: 0.4 };
const MAX = copy.message.max;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Errors = Partial<Record<"name" | "email" | "message", string>>;

const validate = (d: Draft): Errors => {
  const e: Errors = {};
  if (!d.name.trim()) e.name = copy.name.error;
  if (!EMAIL_RE.test(d.email.trim())) e.email = copy.email.error;
  if (d.message.trim().length < 10) e.message = copy.message.error;
  return e;
};

/** Plain-text copy of the message, offered if the mail service fails. */
const compose = (d: Draft) => `From: ${d.name.trim()} <${d.email.trim()}>\n\n${d.message.trim()}`;

type Status = "idle" | "sending" | "sent" | "failed" | "limited";

function LocalTime() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(id);
  }, []);
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: site.timeZone }).format(now);
  return <time dateTime={now.toISOString()}>{time} IST</time>;
}

function Field({
  id,
  label,
  error,
  children,
  aside,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="group/field">
      <div className="label flex items-center justify-between text-muted">
        <label htmlFor={id} className="transition-colors group-focus-within/field:text-accent">
          {label}
        </label>
        {aside}
      </div>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={snappy}
            className="label overflow-hidden pt-2 normal-case tracking-normal text-signal"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls =
  "mt-1 w-full border-b-[1.5px] border-line-strong/40 bg-transparent py-2 text-base tracking-[-0.01em] outline-none transition-colors placeholder:text-muted/60 focus:border-accent aria-[invalid=true]:border-signal";

function Dialog({ origin }: { origin: { x: number; y: number } | null }) {
  const uid = useId();
  const draft = useStore(draftStore);
  const setDraft = updateDraft;
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const drag = useDragControls();
  const [sheet] = useState(() => window.matchMedia("(max-width: 639px)").matches);
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [trap2, setTrap2] = useState(""); // honeypot: humans never see this field
  const errors = tried ? validate(draft) : {};

  // Scroll lock + focus handling for the lifetime of the dialog.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    lenisRef.current?.stop();
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));

    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") closeContact();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      body.style.overflow = prevOverflow;
      lenisRef.current?.start();
      previous?.focus?.({ preventScroll: true });
    };
  }, []);

  const trap = (e: KeyboardEvent) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const nodes = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((n) => n.getClientRects().length > 0 && n.getAttribute("tabindex") !== "-1");
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === panelRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    const errs = validate(draft);
    if (Object.keys(errs).length) {
      const first = (["name", "email", "message"] as const).find((k) => errs[k]);
      panelRef.current?.querySelector<HTMLElement>(`#${CSS.escape(`${uid}-${first}`)}`)?.focus();
      return;
    }
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, company: trap2 }),
      });
      if (res.status === 429) return setStatus("limited");
      if (!res.ok) throw new Error(String(res.status));
      playSuccess();
      setStatus("sent");
    } catch {
      setStatus("failed");
    }
  };

  const reset = () => {
    setDraft((d) => ({ ...d, name: "", email: "", message: "" }));
    setTried(false);
    setStatus("idle");
  };

  // Grow out of the trigger: start offset toward it, shrunk and blurred, and leave the same way.
  const vw = typeof window === "undefined" ? 0 : window.innerWidth;
  const vh = typeof window === "undefined" ? 0 : window.innerHeight;
  const from = origin ? { x: (origin.x - vw / 2) * 0.4, y: (origin.y - vh / 2) * 0.4 } : { x: 0, y: 28 };
  const hidden = reduce
    ? { opacity: 0 }
    : sheet
      ? { y: "100%" }
      : { opacity: 0, scale: 0.86, x: from.x, y: from.y, filter: "blur(14px)" };
  const shown = reduce
    ? { opacity: 1 }
    : sheet
      ? { y: 0 }
      : { opacity: 1, scale: 1, x: 0, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } };


  return (
    <>
      <motion.div
        key="scrim"
        aria-hidden
        className="fixed inset-0 z-[85] bg-[color-mix(in_srgb,var(--ink)_30%,transparent)] backdrop-blur-[6px] dark:bg-[rgba(0,0,0,0.55)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={closeContact}
      />
      <div
        key="frame"
        className="pointer-events-none fixed inset-0 z-[86] flex items-end justify-center sm:items-center sm:p-6"
      >
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${uid}-title`}
          tabIndex={-1}
          onKeyDown={trap}
          data-lenis-prevent
          initial={hidden}
          animate={shown}
          exit={hidden}
          transition={spring}
          drag={sheet && !reduce ? "y" : false}
          dragControls={drag}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.7 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 110 || info.velocity.y > 650) closeContact();
          }}
          className="glass glass-strong pointer-events-auto flex max-h-[92svh] w-full flex-col overflow-y-auto overscroll-contain rounded-t-[28px] outline-none sm:grid sm:max-h-[min(90svh,780px)] sm:max-w-[1060px] sm:grid-cols-[0.92fr_1.08fr] sm:overflow-hidden sm:rounded-[30px]"
        >
          {/* sheet grabber (mobile) */}
          <div
            onPointerDown={(e) => drag.start(e)}
            className="flex touch-none justify-center pb-1 pt-3 sm:hidden"
            aria-hidden
          >
            <span className="h-1.5 w-11 rounded-full bg-ink/25" />
          </div>

          {/* ----- channels panel */}
          <aside className="relative order-2 m-2 mt-0 flex flex-col overflow-hidden rounded-[22px] bg-accent p-6 text-bg sm:order-1 sm:m-2 sm:p-8 md:p-9">
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full border border-current opacity-15" />
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full border border-current opacity-15" />

            <p className="label flex items-center gap-2 opacity-80">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />
                <span className="relative size-2 rounded-full bg-current" />
              </span>
              {copy.kicker}
            </p>
            <h2
              id={`${uid}-title`}
              className="mt-5 hidden text-[clamp(1.8rem,2.8vw,2.7rem)] font-extrabold leading-[0.9] tracking-[-0.055em] sm:block"
            >
              {copy.headline.plain} <span className="serif-accent font-normal">{copy.headline.accent}</span>
            </h2>
            <p className="mt-4 hidden max-w-[34ch] text-sm leading-relaxed opacity-80 sm:block">{copy.body}</p>

            <ul className="mt-2 border-t border-current/20 sm:mt-auto">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.id} className="flex items-center gap-2 border-b border-current/20">
                    <a
                      href={s.href}
                      target={s.id === "email" ? undefined : "_blank"}
                      rel="noreferrer"
                      className="group/row flex min-w-0 flex-1 items-center gap-3 py-3"
                    >
                      <Icon size={16} />
                      <span className="w-[4.6rem] shrink-0 text-sm font-semibold">{s.label}</span>
                      <span className="label min-w-0 truncate normal-case tracking-normal opacity-70">{s.handle}</span>
                      <ArrowUpRight
                        size={15}
                        className="ml-auto shrink-0 transition-transform duration-300 ease-[var(--ease-apple)] group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5"
                      />
                    </a>
                    {s.id === "email" && (
                      <CopyButton
                        text={site.email}
                        className="label rounded-full border border-current/30 px-2.5 py-1.5 transition-colors hover:bg-bg hover:text-accent"
                        iconSize={12}
                      />
                    )}
                  </li>
                );
              })}
            </ul>

            <p className="label mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 opacity-80">
              <span className="flex items-center gap-1.5">
                <MapPin size={12} /> {site.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} /> <LocalTime />
              </span>
            </p>
          </aside>

          {/* ----- form panel */}
          <div className="relative order-1 flex min-h-0 flex-col p-6 pt-3 sm:order-2 sm:overflow-y-auto sm:p-8 md:p-10">
            <div className="flex items-center justify-between">
              <p className="label text-muted">
                <span className="sm:hidden">{copy.mobileTitle}</span>
                <span className="hidden sm:inline">{copy.formLabel}</span>
              </p>
              <button
                type="button"
                onClick={closeContact}
                data-sound="none"
                data-cursor="Close"
                aria-label="Close contact dialog"
                className="grid size-10 place-items-center rounded-full border border-line transition-colors hover:border-ink hover:bg-ink hover:text-bg active:scale-95"
              >
                <X size={17} />
              </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {status === "sent" || status === "failed" || status === "limited" ? (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                  transition={snappy}
                  className="flex flex-1 flex-col justify-center py-10"
                  aria-live="polite"
                >
                  {status === "sent" ? (
                    <>
                      <svg viewBox="0 0 64 64" className="size-14 text-accent-2" aria-hidden>
                        <motion.circle
                          cx="32"
                          cy="32"
                          r="29"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                        />
                        <motion.path
                          d="M20 33 L28.5 41 L45 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.4, delay: 0.35, ease: [0.32, 0.72, 0, 1] }}
                        />
                      </svg>
                      <h3 className="mt-6 text-[clamp(1.8rem,2.6vw,2.4rem)] font-extrabold leading-none tracking-[-0.05em]">
                        {copy.sentTitle.plain} <span className="serif-accent font-normal text-accent">{copy.sentTitle.accent}</span>
                      </h3>
                      <p className="mt-4 max-w-[42ch] text-ink-2">{copy.sentBody}</p>
                      <div className="mt-8 flex flex-wrap gap-3">
                        <button type="button" onClick={reset} className="btn-line">
                          <RotateCcw size={14} /> {copy.another}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-[clamp(1.8rem,2.6vw,2.4rem)] font-extrabold leading-none tracking-[-0.05em]">
                        {status === "limited" ? copy.limitTitle : copy.failTitle}
                      </h3>
                      <p className="mt-4 max-w-[42ch] text-ink-2">
                        {status === "limited" ? copy.limitBody : copy.failBody} <span className="font-semibold text-ink">{site.email}</span>.
                      </p>
                      <div className="mt-8 flex flex-wrap gap-3">
                        <CopyButton text={compose(draft)} label={copy.copyMessage} className="btn-brutal" />
                        <button type="button" onClick={() => setStatus("idle")} className="btn-line">
                          <RotateCcw size={14} /> {copy.retry}
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  noValidate
                  onSubmit={submit}
                  initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                  transition={snappy}
                  className="mt-5 flex flex-1 flex-col gap-6"
                >
                  <input
                    type="text"
                    name="company"
                    value={trap2}
                    onChange={(e) => setTrap2(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                    className="absolute -left-[9999px] size-px opacity-0"
                  />

                  <div className="grid gap-7 sm:grid-cols-2 sm:gap-5">
                    <Field id={`${uid}-name`} label={copy.name.label} error={errors.name}>
                      <input
                        id={`${uid}-name`}
                        value={draft.name}
                        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                        autoComplete="name"
                        placeholder={copy.name.placeholder}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? `${uid}-name-error` : undefined}
                        className={inputCls}
                      />
                    </Field>
                    <Field id={`${uid}-email`} label={copy.email.label} error={errors.email}>
                      <input
                        id={`${uid}-email`}
                        type="email"
                        inputMode="email"
                        value={draft.email}
                        onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                        autoComplete="email"
                        placeholder={copy.email.placeholder}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? `${uid}-email-error` : undefined}
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <Field
                    id={`${uid}-message`}
                    label={copy.message.label}
                    error={errors.message}
                    aside={
                      <span className={`tabular-nums ${draft.message.length > MAX * 0.9 ? "text-signal" : ""}`}>
                        {draft.message.length}/{MAX}
                      </span>
                    }
                  >
                    <textarea
                      id={`${uid}-message`}
                      value={draft.message}
                      maxLength={MAX}
                      rows={4}
                      onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))}
                      placeholder={copy.message.placeholder}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? `${uid}-message-error` : undefined}
                      className={`${inputCls} resize-none leading-relaxed`}
                    />
                  </Field>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-1">
                    <button
                      type="submit"
                      className="btn-brutal disabled:opacity-70"
                      data-cursor="Send"
                      disabled={status === "sending"}
                      aria-busy={status === "sending"}
                    >
                      {status === "sending" ? (
                        <>
                          <LoaderCircle size={14} className="animate-spin" /> {copy.sending}
                        </>
                      ) : (
                        <>
                          <Send size={14} /> {copy.submit}
                        </>
                      )}
                    </button>
                    <span className="label text-muted">{copy.hint}</span>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}

/** Contact dialog: form posted to /api/contact + every direct channel. Opened via lib/contact. */
export default function ContactModal() {
  const { open, origin } = useStore(contactStore);
  return <AnimatePresence>{open && <Dialog key="contact" origin={origin} />}</AnimatePresence>;
}
