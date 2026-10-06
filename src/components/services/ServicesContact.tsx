"use client";

import type { ReactNode } from "react";
import ContactModal from "@/components/chrome/ContactModal";
import { openContact } from "@/lib/contact";
import { servicesModalCopy } from "@/data/services";

/** The portfolio's contact dialog, posting to the same /api/contact mailer, in the services voice. */
export function ServicesContactModal() {
  return <ContactModal copy={servicesModalCopy} source="services" />;
}

/** Opens the contact dialog from the button; `topic` (e.g. a solution) goes into the email subject. */
export function ContactButton({ topic, className, children }: { topic?: string; className?: string; children: ReactNode }) {
  return (
    <button type="button" className={className} onClick={(e) => openContact(e.currentTarget, topic)}>
      {children}
    </button>
  );
}
