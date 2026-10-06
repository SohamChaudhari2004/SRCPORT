/* eslint-disable @next/next/no-html-link-for-pages --
   On services.sohamchaudhari.in, "/" and "/<slug>" only exist through the proxy rewrite,
   so these links use full page loads instead of the client router. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { seo } from "@/data/seo";
import { servicesUrl, solutions, solutionUrl } from "@/data/services";
import SolutionMedia from "@/components/services/SolutionMedia";
import { organizationNode } from "@/lib/jsonld";
import { CtaBlock, ServicesFooter, ServicesHeader } from "@/components/services/ServicesChrome";
import { ContactButton } from "@/components/services/ServicesContact";

// One page per solution, served at services.sohamchaudhari.in/<slug> (see src/proxy.ts).

export const dynamicParams = false;

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

type Props = { params: Promise<{ slug: string }> };

const find = (slug: string) => solutions.find((s) => s.slug === slug);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = find((await params).slug);
  if (!s) return {};
  const url = solutionUrl(s);
  const title = `${s.title} for Your Business`;
  const description = `${s.tagline} ${s.problem}`.slice(0, 158);
  return {
    title: { absolute: `${title} | Soham Chaudhari` },
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SolutionPage({ params }: Props) {
  const s = find((await params).slug);
  if (!s) notFound();
  const url = solutionUrl(s);
  const related = solutions.filter((o) => o.category === s.category && o.slug !== s.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: s.title,
        description: `${s.tagline} ${s.problem}`,
        url,
        category: s.category,
        serviceType: s.title,
        audience: s.industries.map((i) => ({ "@type": "BusinessAudience", name: i })),
        provider: { "@id": `${seo.url}/#organization` },
        areaServed: "Worldwide",
        ...(s.video && { subjectOf: { "@type": "VideoObject", name: `${s.title} demo`, contentUrl: `${servicesUrl}${s.video.src}`, thumbnailUrl: `${servicesUrl}${s.video.poster}` } }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Solutions", item: servicesUrl },
          { "@type": "ListItem", position: 2, name: s.title, item: url },
        ],
      },
    ],
  };

  return (
    <div className="min-h-svh">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ServicesHeader />

      <main className="shell pb-24">
        <a href="/#solutions" className="label mt-8 inline-flex items-center gap-2 text-muted hover:text-accent">
          <ArrowLeft size={14} /> All solutions
        </a>

        <section className="mt-8 grid items-center gap-10 lg:grid-cols-2" aria-labelledby="title">
          <div>
            <p className="label text-accent">{s.category}</p>
            <h1
              id="title"
              className="mt-4 text-[clamp(2.4rem,6vw,4.75rem)] font-bold uppercase leading-[0.9] tracking-[-0.05em]"
            >
              {s.title}
            </h1>
            <p className="mt-6 max-w-[48ch] text-[clamp(1.1rem,1.8vw,1.35rem)] leading-relaxed text-ink">{s.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ContactButton topic={s.title} className="btn-brutal">
                Get this built <ArrowUpRight size={14} />
              </ContactButton>
              <a href="/#process" className="btn-line">
                How it works
              </a>
            </div>
          </div>
          <div className="overflow-hidden rounded-[22px] border border-line">
            <SolutionMedia solution={s} large />
          </div>
        </section>

        <section className="mt-20 grid gap-10 md:grid-cols-12" aria-labelledby="problem">
          <h2 id="problem" className="label md:col-span-3">
            The problem
          </h2>
          <p className="text-[clamp(1.15rem,2vw,1.5rem)] leading-relaxed text-ink md:col-span-9">{s.problem}</p>
        </section>

        <section className="mt-16 grid gap-10 md:grid-cols-12" aria-labelledby="build">
          <h2 id="build" className="label md:col-span-3">
            What you get
          </h2>
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 md:col-span-9">
            {s.features.map((f) => (
              <li key={f} className="flex gap-3 bg-bg p-5 text-[15px] leading-relaxed">
                <Check size={17} className="mt-0.5 shrink-0 text-accent-2" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 grid gap-10 md:grid-cols-12" aria-labelledby="impact">
          <h2 id="impact" className="label md:col-span-3">
            The impact
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3 md:col-span-9">
            {s.impact.map((i) => (
              <li key={i} className="rounded-2xl border border-line p-6 text-[17px] font-medium leading-snug tracking-[-0.01em]">
                {i}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 grid gap-10 md:grid-cols-12" aria-labelledby="for">
          <h2 id="for" className="label md:col-span-3">
            Great for
          </h2>
          <ul className="flex flex-wrap gap-2 md:col-span-9">
            {s.industries.map((i) => (
              <li key={i} className="rounded-full border border-line px-4 py-2 text-[14px] text-ink-2">
                {i}
              </li>
            ))}
          </ul>
        </section>

        {related.length > 0 && (
          <section className="mt-20" aria-labelledby="related">
            <h2 id="related" className="label border-b border-line pb-3">
              Related solutions
            </h2>
            <ul className="mt-2">
              {related.map((r) => (
                <li key={r.slug} className="border-b border-line">
                  <a
                    href={`/${r.slug}`}
                    className="group flex items-center justify-between gap-4 py-5 text-[clamp(1.3rem,3vw,2.2rem)] font-bold uppercase leading-none tracking-[-0.04em] hover:text-accent"
                  >
                    {r.title}
                    <ArrowUpRight className="shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <CtaBlock title={`Want ${s.title.replace(/ & .*/, "")} for your business?`} topic={s.title} />
      </main>

      <ServicesFooter />
    </div>
  );
}
