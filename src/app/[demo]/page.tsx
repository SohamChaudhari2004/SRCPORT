import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, FlaskConical } from "lucide-react";
import { demos } from "@/components/playground/demos";
import { featuredProjects, projectViews } from "@/lib/derive";
import { site } from "@/data/profile";
import { seo } from "@/data/seo";
import GithubIcon from "@/components/ui/GithubIcon";

/** Standalone page for each playground demo, e.g. /stock-ai, for linking from anywhere. */

export const dynamicParams = false;

export function generateStaticParams() {
  return demos.map((d) => ({ demo: d.slug }));
}

type Props = { params: Promise<{ demo: string }> };

const find = (slug: string) => demos.find((d) => d.slug === slug);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const demo = find((await params).demo);
  if (!demo) return {};
  const path = `/${demo.slug}`;
  const title = `${demo.title}: Live Demo`;
  return {
    title,
    description: demo.blurb,
    alternates: { canonical: path },
    openGraph: { url: path, title: `${title} | ${site.name}`, description: demo.blurb },
    twitter: { card: "summary_large_image", title, description: demo.blurb },
  };
}

export default async function DemoPage({ params }: Props) {
  const demo = find((await params).demo);
  if (!demo) notFound();
  const project = projectViews.find((p) => p.slug === demo.slug);
  const hasCaseStudy = featuredProjects.some((p) => p.slug === demo.slug);
  const Icon = demo.icon;
  const url = `${seo.url}/${demo.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${url}#app`,
        name: `${demo.title} live demo`,
        url,
        description: demo.blurb,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any (web browser)",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: demo.spec.map((s) => `${s.label}: ${s.value}`),
        author: { "@id": `${seo.url}/#person` },
        creator: { "@id": `${seo.url}/#person` },
        ...(hasCaseStudy && { subjectOf: { "@type": "TechArticle", url: `${seo.url}/projects/${demo.slug}` } }),
        ...(project?.githubLink && { sameAs: project.githubLink }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: seo.url },
          { "@type": "ListItem", position: 2, name: "AI Playground", item: `${seo.url}/playground` },
          { "@type": "ListItem", position: 3, name: demo.title, item: url },
        ],
      },
    ],
  };

  return (
    <main className="shell pb-20 pt-6 md:pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Breadcrumb" className="label flex items-center justify-between gap-4 border-b border-line pb-3">
        <Link href="/" className="inline-flex items-center gap-2 hover:text-accent">
          <ArrowLeft size={14} /> {site.name}
        </Link>
        <Link href={`/playground#${demo.anchor}`} className="inline-flex items-center gap-2 text-muted hover:text-accent">
          <FlaskConical size={14} /> All demos
        </Link>
      </nav>

      <header className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="label flex items-center gap-2 text-muted">
            <span className="size-1.5 rounded-full bg-[#28c840]" />
            Live · {demo.onDevice ? "Runs in your browser" : "Live API"}
          </p>
          <h1 className="mt-3 flex items-center gap-3 text-[clamp(2rem,5vw,3.5rem)] font-bold uppercase leading-none tracking-[-0.05em]">
            <Icon className="size-[0.8em] shrink-0 text-accent" strokeWidth={1.75} aria-hidden />
            {demo.title}
          </h1>
          <p className="mt-3 max-w-[60ch] text-ink-2">{demo.blurb}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasCaseStudy && (
            <Link href={`/projects/${demo.slug}`} className="btn-brutal">
              Case study <ArrowUpRight size={14} />
            </Link>
          )}
          {project?.githubLink && (
            <a href={project.githubLink} target="_blank" rel="noreferrer" className="btn-line">
              <GithubIcon size={15} /> Source
            </a>
          )}
        </div>
      </header>

      <section aria-label={`${demo.title} demo`} className="mt-8">
        <p className="mb-2 px-1 text-[13px] text-muted">{demo.hint}</p>
        <div className="glass rounded-[24px] p-3 md:p-4">
          <demo.Demo />
        </div>
        <p className="mt-2 px-1 text-[12px] text-muted">
          {demo.runtime} · {demo.footnote}
        </p>
      </section>

      <section aria-labelledby="specs" className="mt-14">
        <h2 id="specs" className="label text-muted">
          Under the hood
        </h2>
        <dl className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {demo.spec.map((s) => (
            <div key={s.label} className="bg-bg p-5">
              <dt className="label text-muted">{s.label}</dt>
              <dd className="mt-2 text-[17px] font-medium leading-snug tracking-[-0.01em]">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
