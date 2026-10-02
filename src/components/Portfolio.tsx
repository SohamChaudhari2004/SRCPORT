"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { activeSectionStore, bootStore } from "@/lib/store";
import { SECTIONS } from "@/lib/sections";
import { SCENE_MODE } from "@/lib/flags";
import SmoothScroll from "./chrome/SmoothScroll";
import Preloader from "./chrome/Preloader";
import Nav from "./chrome/Nav";
import Cursor from "./chrome/Cursor";
import Backdrop from "./chrome/Backdrop";
import Hud from "./chrome/Hud";
import SoundFX from "./chrome/SoundFX";
import ContactModal from "./chrome/ContactModal";
import Hero from "./sections/Hero";
import Ticker from "./sections/Ticker";
import About from "./sections/About";
import Work from "./sections/Work";
import Archive from "./sections/Archive";
import Stack from "./sections/Stack";
import Achievements from "./sections/Achievements";
import Experience from "./sections/Experience";
import Featured from "./sections/Featured";
import Socials from "./sections/Socials";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";

// Legacy full-page particle field, only mounted when SCENE_MODE is "field" (lib/flags.ts).
const Scene = dynamic(() => import("./three/Scene"), { ssr: false });

/** Watches which section owns the viewport → drives the nav pill (and the legacy 3D formation). */
function SectionDirector() {
  useGSAP(() => {
    SECTIONS.forEach((s, i) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive) activeSectionStore.set(i);
        },
      });
    });
  });
  return null;
}

export default function Portfolio() {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  const onBooted = useCallback(() => {
    setBooted(true);
    bootStore.set(true);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  return (
    <SmoothScroll paused={!booted}>
      <Backdrop />
      {SCENE_MODE === "field" && <Scene />}
      <Cursor />
      <Hud />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <Ticker />
        <About />
        <Work />
        <Archive />
        <Experience />
        <Stack />
        <Achievements />
        <Featured />
        <Socials />
        <Contact />
      </main>
      <Footer />
      <SectionDirector />
      <ContactModal />
      <SoundFX />
      <Preloader onDone={onBooted} />
    </SmoothScroll>
  );
}
