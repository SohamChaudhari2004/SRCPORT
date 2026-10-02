/**
 * Font playground. Exactly ONE `sans`, ONE `mono` and ONE `serif` must be active.
 * To try another face: comment out the active block, uncomment an option, save.
 * Everything in the UI reads the CSS variables below, so nothing else needs to change.
 *
 *   --font-sans-face   body, headings, UI
 *   --font-mono-face   labels, chips, terminal
 *   --font-serif-face  italic accent words
 */
import {
  Inter_Tight,
  // Geist,
  // Space_Grotesk,
  // Manrope,
  // Plus_Jakarta_Sans,
  // DM_Sans,
  // Bricolage_Grotesque,
  // Hanken_Grotesk,
  // Schibsted_Grotesk,
  JetBrains_Mono,
  // Geist_Mono,
  // IBM_Plex_Mono,
  // DM_Mono,
  // Space_Mono,
  // Fragment_Mono,
  Instrument_Serif,
  // Fraunces,
  // Playfair_Display,
  // Newsreader,
  // Cormorant_Garamond,
  // DM_Serif_Display,
} from "next/font/google";

/* ---------------------------------------------------------------- sans */

export const sans = Inter_Tight({ variable: "--font-sans-face", subsets: ["latin"], display: "swap" });

// Vercel's Geist: neutral, very Apple-adjacent.
// export const sans = Geist({ variable: "--font-sans-face", subsets: ["latin"], display: "swap" });

// Quirky grotesk with techy character.
// export const sans = Space_Grotesk({ variable: "--font-sans-face", subsets: ["latin"], display: "swap" });

// Geometric, rounded, friendly.
// export const sans = Manrope({ variable: "--font-sans-face", subsets: ["latin"], display: "swap" });

// Crisp geometric with tall x-height.
// export const sans = Plus_Jakarta_Sans({ variable: "--font-sans-face", subsets: ["latin"], display: "swap" });

// Low-contrast geometric, clean.
// export const sans = DM_Sans({ variable: "--font-sans-face", subsets: ["latin"], display: "swap" });

// Expressive, editorial grotesque. Loud at display sizes.
// export const sans = Bricolage_Grotesque({ variable: "--font-sans-face", subsets: ["latin"], display: "swap" });

// Swiss style, a touch warmer than Inter.
// export const sans = Hanken_Grotesk({ variable: "--font-sans-face", subsets: ["latin"], display: "swap" });

// Dense newspaper grotesk, great brutalist headlines.
// export const sans = Schibsted_Grotesk({ variable: "--font-sans-face", subsets: ["latin"], display: "swap" });

/* ---------------------------------------------------------------- mono */

export const mono = JetBrains_Mono({ variable: "--font-mono-face", subsets: ["latin"], display: "swap" });

// export const mono = Geist_Mono({ variable: "--font-mono-face", subsets: ["latin"], display: "swap" });

// export const mono = IBM_Plex_Mono({
//   variable: "--font-mono-face",
//   subsets: ["latin"],
//   weight: ["400", "500", "600"],
//   display: "swap",
// });

// export const mono = DM_Mono({ variable: "--font-mono-face", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

// export const mono = Space_Mono({ variable: "--font-mono-face", subsets: ["latin"], weight: ["400", "700"], display: "swap" });

// export const mono = Fragment_Mono({ variable: "--font-mono-face", subsets: ["latin"], weight: "400", display: "swap" });

/* ---------------------------------------------------------------- serif (accent) */

export const serif = Instrument_Serif({
  variable: "--font-serif-face",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

// Soft, "wonky" variable serif.
// export const serif = Fraunces({ variable: "--font-serif-face", subsets: ["latin"], style: ["normal", "italic"], display: "swap" });

// High-contrast fashion serif.
// export const serif = Playfair_Display({ variable: "--font-serif-face", subsets: ["latin"], style: ["normal", "italic"], display: "swap" });

// Bookish, calm italic.
// export const serif = Newsreader({ variable: "--font-serif-face", subsets: ["latin"], style: ["normal", "italic"], display: "swap" });

// Elegant, very thin Garamond.
// export const serif = Cormorant_Garamond({ variable: "--font-serif-face", subsets: ["latin"], style: ["normal", "italic"], display: "swap" });

// Chunky display serif.
// export const serif = DM_Serif_Display({
//   variable: "--font-serif-face",
//   subsets: ["latin"],
//   weight: "400",
//   style: ["normal", "italic"],
//   display: "swap",
// });

export const fontVariables = `${sans.variable} ${mono.variable} ${serif.variable}`;
