import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { InfoPage } from "@/data/pages";
import { infoPages } from "@/data/pages";
import { seo } from "@/data/seo";
import { site } from "@/data/profile";

const PAGE_TYPE: Record<string, string> = { "/about": "AboutPage", "/contact": "ContactPage" };

/** Simple prose page used for About, Contact and Privacy. */
export default function InfoPageView({ page }: { page: InfoPage }) {
  const url = `${seo.url}${page.path}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": PAGE_TYPE[page.path] ?? "WebPage",
        "@id": `${url}#page`,
        url,
        name: page.title,
        description: page.description,
        isPartOf: { "@id": `${seo.url}/#website` },
        about: { "@id": `${seo.url}/#person` },
        ...(page.path !== "/privacy" && { mainEntity: { "@id": `${seo.url}/#person` } }),
        ...(page.updated && { dateModified: page.updated }),
        inLanguage: "en-IN",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: seo.url },
          { "@type": "ListItem", position: 2, name: page.title, item: url },
        ],
      },
    ],
  };

  return (
    <main className="shell pb-24 pt-6 md:pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Breadcrumb" className="label flex items-center justify-between gap-4 border-b border-line pb-3">
        <Link href="/" className="inline-flex items-center gap-2 hover:text-accent">
          <ArrowLeft size={14} /> {site.name}
        </Link>
        <span className="flex gap-4">
          {infoPages
            .filter((p) => p.path !== page.path)
            .map((p) => (
              <Link key={p.path} href={p.path} className="text-muted hover:text-accent">
                {p.path.slice(1)}
              </Link>
            ))}
        </span>
      </nav>

      <article className="mx-auto mt-12 max-w-[68ch] md:mt-16">
        <h1 className="text-[clamp(2.4rem,7vw,5rem)] font-bold uppercase leading-[0.9] tracking-[-0.05em]">{page.title}</h1>
        {page.updated && <p className="label mt-4 text-muted">Last updated {page.updated}</p>}
        <p className="mt-6 text-[clamp(1.1rem,2vw,1.35rem)] leading-relaxed text-ink">{page.lead}</p>

        {page.sections.map((s) => (
          <section key={s.heading} className="mt-12">
            <h2 className="label text-accent">{s.heading}</h2>
            <div className="mt-3 space-y-4 text-[17px] leading-relaxed text-ink-2">
              {s.paragraphs.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
            {s.links?.length ? (
              <ul className="mt-4 border-t border-line">
                {s.links.map((l) => {
                  const external = !l.href.startsWith("/");
                  return (
                    <li key={l.href} className="border-b border-line">
                      <a
                        href={l.href}
                        {...(external && !l.href.startsWith("mailto:") && { target: "_blank", rel: "noreferrer" })}
                        className="group flex items-center justify-between gap-4 py-3 hover:text-accent"
                      >
                        <span className="font-medium">{l.label}</span>
                        <span className="flex items-center gap-2 text-[14px] text-muted">
                          {l.note}
                          <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </section>
        ))}
      </article>
    </main>
  );
}
