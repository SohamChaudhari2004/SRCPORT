import type { Metadata } from "next";
import { ArrowUpRight, Check } from "lucide-react";
import { seo } from "@/data/seo";
import {
  engagements,
  faqs,
  industries,
  process,
  servicesCta,
  servicesPage,
  servicesUrl,
  solutions,
  solutionUrl,
  valueProps,
} from "@/data/services";
import SolutionsGrid from "@/components/services/SolutionsGrid";
import { CtaBlock, ServicesFooter, ServicesHeader } from "@/components/services/ServicesChrome";

// Served at services.sohamchaudhari.in (src/proxy.ts rewrites "/" there to this page).

export const metadata: Metadata = {
  title: { absolute: servicesPage.title },
  description: servicesPage.description,
  alternates: { canonical: servicesUrl },
  openGraph: { type: "website", url: servicesUrl, title: servicesPage.title, description: servicesPage.description },
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
      name: "AI and software solutions",
      url: servicesUrl,
      itemListElement: solutions.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.title,
          description: s.tagline,
          url: solutionUrl(s),
          category: s.category,
          provider: { "@id": `${seo.url}/#organization` },
          areaServed: "Worldwide",
        },
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

export default function ServicesPage() {
  return (
    <div className="min-h-svh">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ServicesHeader />

      <main className="shell pb-24">
        <section className="pt-14 md:pt-24" aria-labelledby="hero">
          <p className="label text-accent">{servicesPage.eyebrow}</p>
          <h1
            id="hero"
            className="mt-5 max-w-[15ch] text-[clamp(2.8rem,8.5vw,7rem)] font-bold uppercase leading-[0.88] tracking-[-0.055em]"
          >
            {servicesPage.headline}
          </h1>
          <p className="mt-8 max-w-[60ch] text-[clamp(1.05rem,1.8vw,1.3rem)] leading-relaxed text-ink-2">{servicesPage.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={servicesCta.mailto} className="btn-brutal">
              Book a discovery call <ArrowUpRight size={14} />
            </a>
            <a href="#solutions" className="btn-line">
              Explore solutions
            </a>
          </div>
        </section>

        <section aria-label="Why work with me" className="mt-16 md:mt-24">
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {valueProps.map((v) => (
              <li key={v.title} className="bg-bg p-6">
                <Check size={18} className="text-accent-2" aria-hidden />
                <h2 className="mt-3 text-[17px] font-semibold tracking-[-0.01em]">{v.title}</h2>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{v.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="solutions" className="mt-20 scroll-mt-24 md:mt-28" aria-labelledby="solutions-title">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
            <div>
              <p className="label text-muted">Solutions</p>
              <h2
                id="solutions-title"
                className="mt-2 text-[clamp(1.8rem,4vw,3rem)] font-bold uppercase leading-none tracking-[-0.05em]"
              >
                What I can build for you
              </h2>
            </div>
            <p className="max-w-[40ch] text-[15px] text-ink-2">
              Don&apos;t see yours? Most projects start as a problem, not a product. Tell me about it.
            </p>
          </div>
          <div className="mt-8">
            <SolutionsGrid />
          </div>
        </section>

        <section className="mt-20 grid gap-8 md:mt-28 md:grid-cols-12" aria-labelledby="industries">
          <h2 id="industries" className="label md:col-span-3">
            Industries I work with
          </h2>
          <ul className="flex flex-wrap gap-2 md:col-span-9">
            {industries.map((i) => (
              <li key={i} className="rounded-full border border-line px-4 py-2 text-[14px] text-ink-2">
                {i}
              </li>
            ))}
          </ul>
        </section>

        <section id="process" className="mt-16 grid scroll-mt-24 gap-10 md:grid-cols-12" aria-labelledby="process-title">
          <h2 id="process-title" className="label md:col-span-3">
            How it works
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

        <section id="faq" className="mt-16 grid scroll-mt-24 gap-10 md:grid-cols-12" aria-labelledby="faq-title">
          <h2 id="faq-title" className="label md:col-span-3">
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

        <CtaBlock />
      </main>

      <ServicesFooter />
    </div>
  );
}
