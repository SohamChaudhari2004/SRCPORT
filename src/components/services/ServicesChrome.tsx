/* eslint-disable @next/next/no-html-link-for-pages --
   On services.sohamchaudhari.in, "/" and "/<slug>" only exist through the proxy rewrite,
   so these links use full page loads instead of the client router. */
import { ArrowUpRight } from "lucide-react";
import { site } from "@/data/profile";
import { servicesCta } from "@/data/services";

/** Header for the services site. Links are relative to services.sohamchaudhari.in. */
export function ServicesHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="shell flex items-center justify-between gap-4 py-3.5">
        <a href="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center bg-ink text-[13px] font-bold text-bg">{site.initials}</span>
          <span className="leading-tight">
            <span className="block text-[15px] font-semibold tracking-[-0.01em]">{site.name}</span>
            <span className="label block text-muted">Solutions</span>
          </span>
        </a>
        <nav aria-label="Main" className="flex items-center gap-6">
          <a href="/#solutions" className="label hidden text-muted hover:text-accent md:inline">
            Solutions
          </a>
          <a href="/#process" className="label hidden text-muted hover:text-accent md:inline">
            Process
          </a>
          <a href="/#faq" className="label hidden text-muted hover:text-accent md:inline">
            FAQ
          </a>
          <a href={servicesCta.mailto} className="btn-brutal">
            Start a project
          </a>
        </nav>
      </div>
    </header>
  );
}

export function ServicesFooter() {
  return (
    <footer className="shell label flex flex-wrap justify-between gap-3 border-t border-line py-6 text-muted">
      <span>
        © {new Date().getFullYear()} {site.name} · {site.location}
      </span>
      <span className="flex flex-wrap gap-5">
        <a href="/openapi.json" className="hover:text-accent">
          API
        </a>
        <a href="/llms.txt" className="hover:text-accent">
          For AI agents
        </a>
        <a href={`mailto:${site.email}`} className="hover:text-accent">
          {site.email}
        </a>
        <a href={site.linkedin} target="_blank" rel="noreferrer" className="hover:text-accent">
          LinkedIn
        </a>
      </span>
    </footer>
  );
}

/** Closing call to action, shared by the services home and solution pages. */
export function CtaBlock({ title = servicesCta.title, mailto = servicesCta.mailto }: { title?: string; mailto?: string }) {
  return (
    <section className="mt-24 rounded-[28px] bg-ink p-8 text-bg md:p-14" aria-labelledby="cta">
      <h2 id="cta" className="max-w-[20ch] text-[clamp(2rem,5vw,4rem)] font-bold uppercase leading-[0.9] tracking-[-0.05em]">
        {title}
      </h2>
      <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed opacity-80">{servicesCta.body}</p>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <a
          href={mailto}
          className="inline-flex items-center gap-2 rounded-full bg-bg px-5 py-3 text-[15px] font-semibold text-ink transition-transform hover:-translate-y-0.5"
        >
          {site.email} <ArrowUpRight size={15} />
        </a>
        <a href={site.linkedin} target="_blank" rel="noreferrer" className="text-[15px] underline-offset-4 opacity-80 hover:underline">
          or message us on LinkedIn
        </a>
      </div>
    </section>
  );
}
