import type { Metadata } from "next";
import { servicesUrl } from "@/data/services";

// The services pages live on their own subdomain, so their canonical and OG image
// URLs resolve against it rather than the portfolio's domain.
export const metadata: Metadata = {
  metadataBase: new URL(servicesUrl),
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
