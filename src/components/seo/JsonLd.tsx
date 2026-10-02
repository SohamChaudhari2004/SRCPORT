import { seo } from "@/data/seo";
import { site } from "@/data/profile";
import { experience } from "@/data/experience";
import { featuredProjects, resumeUrl } from "@/lib/derive";

const personId = `${seo.url}/#person`;
const websiteId = `${seo.url}/#website`;

/**
 * Schema.org graph for the home page: ProfilePage -> Person, plus WebSite and the
 * featured projects. Server-rendered so crawlers get it in the first HTML response.
 */
export default function JsonLd() {
  const current = experience.find((e) => e.current);

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: seo.url,
        name: seo.siteName,
        description: seo.description,
        inLanguage: "en-IN",
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": `${seo.url}/#profile`,
        url: seo.url,
        name: seo.title,
        description: seo.description,
        isPartOf: { "@id": websiteId },
        mainEntity: { "@id": personId },
        inLanguage: "en-IN",
      },
      {
        "@type": "Person",
        "@id": personId,
        name: site.name,
        givenName: site.firstName,
        familyName: site.lastName,
        url: seo.url,
        image: `${seo.url}${site.photo.light}`,
        jobTitle: site.role,
        description: seo.ogDescription,
        email: `mailto:${site.email}`,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "professional inquiries",
          email: site.email,
          url: `${seo.url}/contact`,
        },
        address: { "@type": "PostalAddress", addressLocality: "Mumbai", addressRegion: "Maharashtra", addressCountry: "IN" },
        ...(current && {
          worksFor: {
            "@type": "Organization",
            name: current.company,
            ...(current.companyUrl && { url: current.companyUrl }),
          },
        }),
        alumniOf: { "@type": "CollegeOrUniversity", name: seo.alumni.name, url: seo.alumni.url },
        knowsAbout: seo.knowsAbout,
        sameAs: seo.sameAs,
        subjectOf: { "@type": "DigitalDocument", name: `${site.name} resume`, url: `${seo.url}${resumeUrl}` },
      },
      ...featuredProjects.map((p) => ({
        "@type": "SoftwareSourceCode",
        name: p.title,
        description: p.description,
        url: `${seo.url}/projects/${p.slug}`,
        ...(p.githubLink && { codeRepository: p.githubLink }),
        ...(p.liveLink && { sameAs: new URL(p.liveLink, seo.url).href }),
        author: { "@id": personId },
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Escape "<" so no string in the data can close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  );
}
