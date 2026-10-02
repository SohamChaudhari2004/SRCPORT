import type { ComponentType } from "react";
import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon, MediumIcon, XIcon } from "@/components/ui/BrandIcons";
import { githubProfile } from "./derive";
import { site } from "./site";
import { socialsCopy } from "@/data/content";

export type SocialId = "email" | "linkedin" | "github" | "x" | "medium";

export interface Social {
  id: SocialId;
  label: string;
  /** What the channel is for, in one line. */
  blurb: string;
  handle: string;
  href: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

const handleOf = (url: string) => url.replace(/\/$/, "").split("/").pop() ?? url;

export const socials: Social[] = [
  {
    id: "email",
    label: "Email",
    blurb: socialsCopy.blurbs.email,
    handle: site.email,
    href: `mailto:${site.email}`,
    icon: Mail,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    blurb: socialsCopy.blurbs.linkedin,
    handle: `in/${handleOf(site.linkedin)}`,
    href: site.linkedin,
    icon: LinkedinIcon,
  },
  {
    id: "github",
    label: "GitHub",
    blurb: socialsCopy.blurbs.github,
    handle: `@${githubProfile.handle}`,
    href: githubProfile.url,
    icon: GithubIcon,
  },
  {
    id: "x",
    label: "X",
    blurb: socialsCopy.blurbs.x,
    handle: `@${handleOf(site.x)}`,
    href: site.x,
    icon: XIcon,
  },
  {
    id: "medium",
    label: "Medium",
    blurb: socialsCopy.blurbs.medium,
    handle: handleOf(site.medium),
    href: site.medium,
    icon: MediumIcon,
  },
];

export const socialById = (id: SocialId) => socials.find((s) => s.id === id)!;
