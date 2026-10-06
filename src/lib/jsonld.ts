import { seo } from "@/data/seo";
import { site } from "@/data/profile";
import { servicesUrl } from "@/data/services";

/**
 * The professional practice behind the portfolio and the services site. Used on both
 * home pages so agents can verify contact details and location for hiring, freelance
 * and consulting enquiries. Same @id everywhere, so it is one entity.
 */
export const organizationNode = () => ({
  "@type": ["Organization", "ProfessionalService"],
  "@id": `${seo.url}/#organization`,
  name: `${site.name}, AI Engineering`,
  url: seo.url,
  logo: `${seo.url}/icon.svg`,
  image: `${seo.url}${site.photo.light}`,
  description: seo.ogDescription,
  email: site.email,
  founder: { "@id": `${seo.url}/#person` },
  address: { "@type": "PostalAddress", addressLocality: "Mumbai", addressRegion: "Maharashtra", addressCountry: "IN" },
  areaServed: "Worldwide",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: site.email,
    url: `${seo.url}/contact`,
    availableLanguage: ["English"],
  },
  knowsAbout: seo.knowsAbout,
  sameAs: [...seo.sameAs, servicesUrl],
});

/** Minimal Person node for pages outside the portfolio home. */
export const personNode = () => ({
  "@type": "Person",
  "@id": `${seo.url}/#person`,
  name: site.name,
  jobTitle: site.role,
  url: seo.url,
  email: `mailto:${site.email}`,
  sameAs: seo.sameAs,
});
