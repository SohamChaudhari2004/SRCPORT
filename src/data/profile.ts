/**
 * Identity, links and editorial picks.
 * Edit this file to change who the site is about.
 */
export const site = {
  name: "Soham Chaudhari",
  firstName: "Soham",
  lastName: "Chaudhari",
  initials: "SC",
  role: "AI Engineer",
  version: "v2026.01",

  location: "Mumbai, India",
  timeZone: "Asia/Kolkata",
  timeZoneLabel: "IST, UTC+5:30",

  /** Where you work right now (shown in the hero and the About section). */
  current: {
    role: "AI Engineer",
    company: "FLIP",
    url: "https://paybyflip.com",
    since: "2026",
    focus: "A platform that helps people find card offers, earn more rewards and redeem points well.",
  },

  /** Portraits: one per theme. Files live in /public/images. */
  photo: {
    light: "/images/soham-light.webp",
    dark: "/images/soham-dark.webp",
    alt: "Portrait of Soham Chaudhari",
  },

  email: "sohamrc08@gmail.com",
  linkedin: "https://www.linkedin.com/in/sohamchaudhari2004/",
  x: "https://x.com/sohamrchaudhari",
  medium: "https://medium.com/@sohamrc08",
  pypi: "https://pypi.org/user/SohamChaudhari2004",

  /** Titles from data/projects.ts shown in the pinned "Selected work" reel. Everything else goes to Explore. */
  featured: ["MOSAIC", "GPTs", "Stock AI", "VISION AI", "Face Detection", "MNIST CNN"],
} as const;
