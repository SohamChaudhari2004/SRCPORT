import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "lenis/dist/lenis.css";
import "./globals.css";
import { seo } from "@/data/seo";
import { site } from "@/data/profile";
import { fontVariables } from "./fonts";

/** Cloudflare Web Analytics site token (public, safe to commit). Set to "" to disable. */
const CF_ANALYTICS_TOKEN = "20beb2b4098d4b23bef6785847949c99";

export const metadata: Metadata = {
  metadataBase: new URL(seo.url),
  title: { default: seo.title, template: seo.titleTemplate },
  description: seo.description,
  applicationName: seo.siteName,
  keywords: seo.keywords,
  authors: [{ name: site.name, url: seo.url }],
  creator: site.name,
  publisher: site.name,
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: seo.siteName,
    locale: seo.locale,
    title: seo.title,
    description: seo.ogDescription,
    firstName: site.firstName,
    lastName: site.lastName,
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.ogDescription,
    creator: seo.twitterHandle,
    site: seo.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  verification: {
    ...(seo.verification.google && { google: seo.verification.google }),
    ...(seo.verification.bing && { other: { "msvalidate.01": seo.verification.bing } }),
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ece5d8" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0d0b" },
  ],
};

// Runs before first paint: applies the saved / system theme, and flags repeat visits
// in this session so the preloader is hidden before it can flash.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t);if(sessionStorage.getItem("booted"))document.documentElement.setAttribute("data-booted","")}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={fontVariables}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        {/* Cloudflare Web Analytics: production only, so local dev visits aren't counted. */}
        {process.env.NODE_ENV === "production" && CF_ANALYTICS_TOKEN && (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="afterInteractive"
            data-cf-beacon={JSON.stringify({ token: CF_ANALYTICS_TOKEN })}
          />
        )}
      </body>
    </html>
  );
}
