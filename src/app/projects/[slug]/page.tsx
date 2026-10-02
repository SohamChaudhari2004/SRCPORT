import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { featuredProjects, pad } from "@/lib/derive";
import { caseStudies } from "@/data/caseStudies";
import { seo } from "@/data/seo";
import { site } from "@/data/profile";
import ProjectCover from "@/components/ui/ProjectCover";
import GithubIcon from "@/components/ui/GithubIcon";

export const dynamicParams = false;

export function generateStaticParams() {
  return featuredProjects.filter((p) => caseStudies[p.slug]).map((p) => ({ slug: p.slug }));
}

function load(slug: string) {
  const project = featuredProjects.find((p) => p.slug === slug);
  const study = caseStudies[slug];
  return project && study ? { project, study } : null;
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = load(slug);
  if (!data) return {};
  const { project, study } = data;
  const path = `/projects/${slug}`;
  const description = `${study.tagline} ${project.description}`.slice(0, 158);
  return {
    title: study.seoTitle,
    description,
    keywords: [...study.keywords, project.title, site.name],
    alternates: { canonical: path },
    openGraph: { type: "article", url: path, title: `${study.seoTitle} | ${site.name}`, description },
    twitter: { card: "summary_large_image", title: study.seoTitle, description },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const data = load(slug);
  if (!data) notFound();
  const { project, study } = data;
  const i = featuredProjects.indexOf(project);
  const others = featuredProjects.filter((p) => p !== project && caseStudies[p.slug]);
  const url = `${seo.url}/projects/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareSourceCode",
        "@id": `${url}#code`,
        name: project.title,
        headline: study.seoTitle,
        description: `${study.tagline} ${project.description}`,
        url,
        codeRepository: project.githubLink,
        programmingLanguage: "Python",
        keywords: study.keywords.join(", "),
        ...(project.liveLink && { sameAs: project.liveLink }),
        ...(project.image && { image: `${seo.url}${project.image}` }),
        author: { "@id": `${seo.url}/#person` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: seo.url },
          { "@type": "ListItem", position: 2, name: "Projects", item: `${seo.url}/#work` },
          { "@type": "ListItem", position: 3, name: project.title, item: url },
        ],
      },
    ],
  };

  return (
    <main className="shell pb-24 pt-8 md:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <nav aria-label="Breadcrumb" className="label flex items-center justify-between border-b border-line pb-3">
        <Link href="/#work" className="inline-flex items-center gap-2 hover:text-accent">
          <ArrowLeft size={14} /> {site.name}
        </Link>
        <span className="text-muted">
          02.{i + 1} / {project.categoryLabel}
        </span>
      </nav>

      <header className="mt-12 md:mt-16">
        <p className="label text-muted">Case study {pad(i + 1)}</p>
        <h1 className="mt-4 text-[clamp(2.6rem,9vw,7.5rem)] font-bold uppercase leading-[0.86] tracking-[-0.055em]">
          {project.title}
        </h1>
        <p className="serif-accent mt-6 max-w-[34ch] text-[clamp(1.4rem,2.6vw,2.2rem)] leading-[1.1] text-accent">
          {study.tagline}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={project.githubLink} target="_blank" rel="noreferrer" className="btn-brutal">
            <GithubIcon size={15} /> Source
          </a>
          {project.liveLink && (
            <a href={project.liveLink} target="_blank" rel="noreferrer" className="btn-line">
              Live demo <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </header>

      <div className="relative mt-12 aspect-[16/9] overflow-hidden rounded-[28px] border border-line bg-paper/60">
        {project.image ? (
          <Image
            src={project.image}
            alt={`${project.title} screenshot`}
            fill
            priority
            sizes="(min-width: 1280px) 1200px, 92vw"
            className="object-cover object-top"
          />
        ) : (
          <ProjectCover project={project} />
        )}
      </div>

      <section className="mt-16 grid gap-10 md:grid-cols-12" aria-labelledby="overview">
        <h2 id="overview" className="label md:col-span-3">
          Overview
        </h2>
        <div className="space-y-5 text-[17px] leading-relaxed text-ink-2 md:col-span-9 md:text-lg">
          {study.overview.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-10 md:grid-cols-12" aria-labelledby="features">
        <h2 id="features" className="label md:col-span-3">
          What it does
        </h2>
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 md:col-span-9">
          {study.features.map((f) => (
            <li key={f.title} className="bg-bg p-6">
              <h3 className="text-lg font-semibold tracking-[-0.02em]">{f.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{f.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 grid gap-10 md:grid-cols-12" aria-labelledby="flow">
        <h2 id="flow" className="label md:col-span-3">
          How it works
        </h2>
        <ol className="md:col-span-9">
          {study.flow.map((step, n) => (
            <li key={step} className="flex gap-5 border-t border-line py-4 text-[16px] leading-relaxed">
              <span className="label pt-1 tabular-nums text-accent">{pad(n + 1)}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 grid gap-10 md:grid-cols-12" aria-labelledby="stack">
        <h2 id="stack" className="label md:col-span-3">
          Stack
        </h2>
        <ul className="flex flex-wrap gap-1.5 md:col-span-9">
          {study.stack.map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-24 border-t border-line pt-8" aria-labelledby="more">
        <h2 id="more" className="label text-muted">
          More projects
        </h2>
        <ul className="mt-4">
          {others.map((p) => (
            <li key={p.slug} className="border-b border-line">
              <Link
                href={`/projects/${p.slug}`}
                className="group flex items-center justify-between gap-4 py-5 text-[clamp(1.6rem,4vw,3rem)] font-bold uppercase leading-none tracking-[-0.05em] hover:text-accent"
              >
                {p.title}
                <ArrowUpRight className="shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/#contact" className="btn-line mt-10">
          Work with me <ArrowUpRight size={14} />
        </Link>
      </section>
    </main>
  );
}
