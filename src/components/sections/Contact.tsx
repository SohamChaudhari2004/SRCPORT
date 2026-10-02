"use client";

import { useRef } from "react";
import { Download, MessageCircle } from "lucide-react";
import { useGSAP, revealIn } from "@/lib/gsap";
import { resumeUrl } from "@/lib/derive";
import { openContact } from "@/lib/contact";
import SectionLabel from "@/components/ui/SectionLabel";
import Magnetic from "@/components/ui/Magnetic";
import Terminal from "./Terminal";
import { contactCopy as copy } from "@/data/content";

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => revealIn(root.current!), { scope: root });

  return (
    <section id="contact" ref={root} className="shell relative z-10 py-[11vh]">
      <SectionLabel
        index={copy.index}
        title={
          <>
            {copy.title.plain}
            <span className="serif-accent font-normal">{copy.title.accent}</span>
          </>
        }
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        <div className="flex flex-col lg:col-span-5">
          <h3
            data-split
            className="text-[clamp(2.4rem,4.6vw,4.8rem)] font-extrabold leading-[0.88] tracking-[-0.06em]"
          >
            {copy.headline.plain} <span className="serif-accent font-normal text-accent">{copy.headline.accent}</span>
          </h3>
          <p data-fade className="mt-5 max-w-[40ch] text-ink-2">
            {copy.body}
          </p>

          <div data-fade className="mt-8 flex flex-wrap gap-4">
            <Magnetic>
              <button
                type="button"
                onClick={(e) => openContact(e.currentTarget)}
                className="btn-brutal"
                data-cursor="Hello"
                data-sound="none"
              >
                <MessageCircle size={15} /> {copy.cta}
              </button>
            </Magnetic>
            <Magnetic>
              <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn-line" data-cursor="PDF">
                <Download size={15} /> {copy.resume}
              </a>
            </Magnetic>
          </div>
        </div>

        <div data-fade className="lg:col-span-7">
          <Terminal />
        </div>
      </div>
    </section>
  );
}
