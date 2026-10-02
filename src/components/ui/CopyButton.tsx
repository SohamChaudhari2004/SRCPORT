"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy } from "lucide-react";

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older / insecure contexts: fall back to a hidden textarea.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

const swap = { type: "spring" as const, bounce: 0, duration: 0.3 };

/** Copy-to-clipboard button whose label flips to a confirmation for a moment. */
export default function CopyButton({
  text,
  label = "Copy",
  done = "Copied",
  className = "",
  iconSize = 14,
  children,
}: {
  text: string;
  label?: string;
  done?: string;
  className?: string;
  iconSize?: number;
  children?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      data-sound="soft"
      aria-label={copied ? done : `${label}: ${text}`}
      onClick={async (e) => {
        e.stopPropagation();
        if (!(await copyText(text))) return;
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 1600);
      }}
      className={className}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={copied ? "done" : "idle"}
          initial={{ y: 10, opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -10, opacity: 0, filter: "blur(4px)" }}
          transition={swap}
          className="inline-flex items-center gap-2"
        >
          {copied ? <Check size={iconSize} strokeWidth={2.25} /> : <Copy size={iconSize} strokeWidth={1.9} />}
          {children ?? (copied ? done : label)}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
