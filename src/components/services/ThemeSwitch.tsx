"use client";

import { Moon, Sun } from "lucide-react";
import { toggleTheme, useTheme } from "@/lib/theme";

/**
 * Light/dark switch for the services site. The theme itself is applied before first
 * paint by the root layout (saved choice, else the system setting); the choice is
 * remembered per domain, so the services subdomain keeps its own.
 */
export default function ThemeSwitch() {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={(e) => toggleTheme({ x: e.clientX, y: e.clientY })}
      className="grid size-9 place-items-center border border-line text-ink transition-colors hover:border-accent hover:text-accent active:scale-95"
    >
      {theme === "dark" ? <Moon size={16} strokeWidth={1.75} /> : <Sun size={16} strokeWidth={1.75} />}
    </button>
  );
}
