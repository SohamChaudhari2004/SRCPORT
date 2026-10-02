import { ImageResponse } from "next/og";
import { site } from "@/data/profile";

export const ogSize = { width: 1200, height: 630 };

/** Social preview card for sub-pages, in the same style as the home page card. */
export function ogCard({ eyebrow, title, subtitle, tags = [] }: { eyebrow: string; title: string; subtitle: string; tags?: string[] }) {
  const titleSize = title.length > 14 ? 96 : 132;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#ece5d8",
          color: "#15130f",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, letterSpacing: 2 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 52,
                height: 52,
                background: "#15130f",
                color: "#ece5d8",
                fontWeight: 700,
              }}
            >
              {site.initials}
            </span>
            {site.name.toUpperCase()}
          </span>
          <span style={{ color: "#2b3bff" }}>{eyebrow.toUpperCase()}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: titleSize, fontWeight: 800, lineHeight: 0.9, letterSpacing: -5, textTransform: "uppercase" }}>
            {title}
          </div>
          <div style={{ marginTop: 28, fontSize: 38, color: "#2b3bff", fontStyle: "italic", maxWidth: 1000 }}>{subtitle}</div>
        </div>

        <div style={{ display: "flex", gap: 14, borderTop: "3px solid #15130f", paddingTop: 26 }}>
          {tags.slice(0, 5).map((t) => (
            <span key={t} style={{ fontSize: 24, padding: "8px 20px", border: "2px solid #15130f", borderRadius: 999 }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
    ogSize,
  );
}
