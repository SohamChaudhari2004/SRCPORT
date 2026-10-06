import type { Metadata } from "next";
import {
  ArrowUpRight,
  AudioLines,
  Bot,
  Check,
  FileSearch,
  Gauge,
  Plug,
  Rocket,
  ScanEye,
  type LucideIcon,
} from "lucide-react";
import { site } from "@/data/profile";
import { seo } from "@/data/seo";
import {
  engagements,
  faqs,
  process,
  services,
  servicesCta,
  servicesPage,
  servicesUrl,
  type Service,
} from "@/data/services";

// Served at services.sohamchaudhari.in (src/proxy.ts rewrites "/" there to this page).
// Links back to the portfolio are absolute because they live on another host.

const ICONS: Record<Service["id"], LucideIcon> = {
  agents: Bot,
  rag: FileSearch,
  mcp: Plug,
  voice: AudioLines,
  vision: ScanEye,
  mvp: Rocket,
  evals: Gauge,
};

export const metadata: Metadata = {
  title: { absolute: servicesPage.title },
  description: servicesPage.description,
  alternates: { canonical: servicesUrl },
  openGraph: {
    type: "website",
    url: servicesUrl,
    title: servicesPage.title,
    description: servicesPage.description,
  },
  twitter: { card: "summary_large_image", title: servicesPage.title, description: servicesPage.description },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${servicesUrl}/#page`,
      url: servicesUrl,
      name: servicesPage.title,
      description: servicesPage.description,
      about: { "@id": `${seo.url}/#organization` },
      inLanguage: "en-IN",
    },
    {
      "@type": "OfferCatalog",
      "@id": `${servicesUrl}/#catalog`,
      name: "AI engineering services",
      url: servicesUrl,
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.title,
          description: s.pitch,
          serviceType: s.title,
          provider: { "@id": `${seo.url}/#organization` },
          areaServed: "Worldwide",
        },
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

// The last card stretches to fill its row, so the grid never shows empty cells.
const lastSpan = [
  services.length % 2 === 1 && "md:col-span-2",
  services.length % 3 === 1 && "xl:col-span-3",
  services.length % 3 === 2 && "xl:col-span-2",
  services.length % 2 === 1 && services.length % 3 === 0 && "xl:col-span-1",
]
  .filter(Boolean)
  .join(" ");

export default function ServicesPage() {
  return (
    <div className="min-h-svh">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <header className="shell flex items-center justify-between gap-4 border-b border-line py-4">
        <a href={seo.url} className="flex items-center gap-3 hover:text-accent">
          <span className="grid size-9 place-items-center bg-ink text-[13px] font-bold text-bg">{site.initials}</span>
          <span className="label">{site.name}</span>
        </a>
        <nav aria-label="Main" className="flex items-center gap-5">
          <a href={`${seo.url}/#work`} className="label hidden text-muted hover:text-accent sm:inline">
            Work
          </a>
          <a href={`${seo.url}/about`} className="label hidden text-muted hover:text-accent sm:inline">
            About
          </a>
          <a href={servicesCta.mailto} className="btn-brutal">
            Start a project
          </a>
        </nav>
      </header>

      <main className="shell pb-24">
        <section className="pt-14 md:pt-24" aria-labelledby="hero">
          <p className="label text-accent">{servicesPage.eyebrow}</p>
          <h1
            id="hero"
            className="mt-5 max-w-[14ch] text-[clamp(2.8rem,9vw,7.5rem)] font-bold uppercase leading-[0.86] tracking-[-0.055em]"
          >
            {servicesPage.headline}
          </h1>
          <p className="mt-8 max-w-[58ch] text-[clamp(1.05rem,1.8vw,1.3rem)] leading-relaxed text-ink-2">{servicesPage.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={servicesCta.mailto} className="btn-brutal">
              Email me <ArrowUpRight size={14} />
            </a>
            <a href={`${seo.url}/#work`} className="btn-line">
              See my work <ArrowUpRight size={14} />
            </a>
          </div>
        </section>

        <section className="mt-20 md:mt-28" aria-labelledby="services">
          <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
            <h2 id="services" className="label">
              What I build
            </h2>
            <span className="label text-muted">{String(services.length).padStart(2, "0")} services</span>
          </div>
          <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2 xl:grid-cols-3">
            {services.map((s, i) => {
              const Icon = ICONS[s.id];
              return (
                <li key={s.id} id={s.id} className={`flex flex-col bg-bg p-6 md:p-7 ${i === services.length - 1 ? lastSpan : ""}`}>
                  <div className="flex items-center justify-between">
                    <Icon size={22} strokeWidth={1.75} className="text-accent" aria-hidden />
                    <span className="label tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em]">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{s.pitch}</p>
                  <ul className="mt-5 space-y-2 text-[14px]">
                    {s.deliverables.map((d) => (
                      <li key={d} className="flex gap-2.5">
                        <Check size={15} className="mt-0.5 shrink-0 text-accent-2" aria-hidden />
                        {d}
                      </li>
                    ))}
                  </ul>
                  {s.proof?.length ? (
                    <p className="mt-auto flex flex-wrap items-center gap-1.5 pt-6">
                      <span className="label mr-1 text-muted">See</span>
                      {s.proof.map((p) => (
                        <a key={p.href} href={p.href} className="chip hover:border-accent hover:text-accent">
                          {p.label}
                        </a>
                      ))}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-20 grid gap-10 md:mt-28 md:grid-cols-12" aria-labelledby="process">
          <h2 id="process" className="label md:col-span-3">
            How we work
          </h2>
          <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 md:col-span-9 lg:grid-cols-4">
            {process.map((step, n) => (
              <li key={step.title} className="bg-bg p-6">
                <span className="label tabular-nums text-accent">{String(n + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-lg font-semibold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16 grid gap-10 md:grid-cols-12" aria-labelledby="engagements">
          <h2 id="engagements" className="label md:col-span-3">
            Ways to work together
          </h2>
          <div className="md:col-span-9">
            <ul className="grid gap-4 sm:grid-cols-3">
              {engagements.map((e) => (
                <li key={e.title} className="rounded-2xl border border-line p-6">
                  <h3 className="text-lg font-semibold tracking-[-0.02em]">{e.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{e.body}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[15px] text-muted">{servicesPage.pricing}</p>
          </div>
        </section>

        <section className="mt-16 grid gap-10 md:grid-cols-12" aria-labelledby="faq">
          <h2 id="faq" className="label md:col-span-3">
            Questions
          </h2>
          <div className="border-t border-line md:col-span-9">
            {faqs.map((f) => (
              <details key={f.q} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-medium [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="text-xl leading-none text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="max-w-[64ch] pb-5 text-[15px] leading-relaxed text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-24 rounded-[28px] bg-ink p-8 text-bg md:p-14" aria-labelledby="cta">
          <h2 id="cta" className="max-w-[18ch] text-[clamp(2rem,5vw,4rem)] font-bold uppercase leading-[0.9] tracking-[-0.05em]">
            {servicesCta.title}
          </h2>
          <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed opacity-80">{servicesCta.body}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={servicesCta.mailto}
              className="inline-flex items-center gap-2 rounded-full bg-bg px-5 py-3 text-[15px] font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              {site.email} <ArrowUpRight size={15} />
            </a>
            <a href={site.linkedin} target="_blank" rel="noreferrer" className="text-[15px] underline-offset-4 opacity-80 hover:underline">
              or message me on LinkedIn
            </a>
          </div>
        </section>
      </main>

      <footer className="shell label flex flex-wrap justify-between gap-3 border-t border-line py-5 text-muted">
        <span>
          © {new Date().getFullYear()} {site.name} · {site.location}
        </span>
        <span className="flex gap-4">
          <a href={seo.url} className="hover:text-accent">
            Portfolio
          </a>
          <a href={`${seo.url}/contact`} className="hover:text-accent">
            Contact
          </a>
          <a href={`${seo.url}/privacy`} className="hover:text-accent">
            Privacy
          </a>
        </span>
      </footer>
    </div>
  );
}
