"use client";

import { useState } from "react";
import type { Skill } from "@/data/skills";
import { iconInfo, monogram } from "@/lib/derive";

/** Simple Icons glyph (theme-inverted), or a brutalist monogram when there is none / it fails. */
export default function TechIcon({ skill, size = 18 }: { skill: Skill; size?: number }) {
  const info = iconInfo(skill);
  const [failed, setFailed] = useState(false);

  if (info.type === "img" && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={info.src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        className="tech-icon shrink-0"
        onError={() => setFailed(true)}
      />
    );
  }

  const text = info.type === "mono" ? info.text : monogram(skill.name);
  return (
    <span
      className="grid shrink-0 place-items-center border border-line-strong font-mono font-bold leading-none"
      style={{ width: size + 4, height: size + 4, fontSize: text.length > 2 ? 7 : 8.5 }}
      aria-hidden
    >
      {text}
    </span>
  );
}
