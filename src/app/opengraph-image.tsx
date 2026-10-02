import { ImageResponse } from "next/og";
import { seo } from "@/data/seo";
import { site } from "@/data/profile";

// Social preview card (LinkedIn, X, WhatsApp, Slack). Also used for Twitter via metadata fallback.
export const alt = seo.ogImageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const tags = ["Agentic AI", "LLMs", "RAG", "Voice AI", "Fintech"];

export default function Image() {
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
            SOHAMCHAUDHARI.IN
          </span>
          <span style={{ color: "#2b3bff" }}>
            {site.location.toUpperCase()}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 148, fontWeight: 800, lineHeight: 0.86, letterSpacing: -7, textTransform: "uppercase" }}>
            {site.firstName}
          </div>
          <div style={{ fontSize: 148, fontWeight: 800, lineHeight: 0.86, letterSpacing: -7, textTransform: "uppercase" }}>
            {site.lastName}
          </div>
          <div style={{ marginTop: 28, fontSize: 40, color: "#2b3bff", fontStyle: "italic" }}>
            {`${site.role} at ${site.current.company}`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, borderTop: "3px solid #15130f", paddingTop: 26 }}>
          {tags.map((t) => (
            <span
              key={t}
              style={{ fontSize: 26, padding: "8px 20px", border: "2px solid #15130f", borderRadius: 999 }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
