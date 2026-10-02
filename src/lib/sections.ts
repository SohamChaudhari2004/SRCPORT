export interface SectionDef {
  id: string;
  label: string;
  nav?: string;
  /** Legacy particle-field formation (only used when SCENE_MODE = "field"). */
  shape: number;
  x: number;
  y: number;
  scale: number;
  dim?: number;
}

export const SECTIONS: SectionDef[] = [
  { id: "top", label: "Index", shape: 0, x: 1.7, y: 0.15, scale: 1 },
  { id: "about", label: "About", nav: "About", shape: 1, x: 1.9, y: 0, scale: 0.85, dim: 0.75 },
  { id: "work", label: "Selected work", nav: "Work", shape: 2, x: 0, y: -0.1, scale: 1 },
  { id: "explore", label: "Explore", shape: 2, x: 0, y: -0.4, scale: 1.1, dim: 0.35 },
  { id: "experience", label: "Experience", nav: "Experience", shape: 1, x: 1.6, y: 0, scale: 0.9, dim: 0.5 },
  { id: "stack", label: "Stack", nav: "Stack", shape: 3, x: 1.5, y: 0, scale: 0.9 },
  { id: "achievements", label: "Achievements", nav: "Achievements", shape: 4, x: 0.6, y: 0, scale: 1, dim: 0.8 },
  { id: "socials", label: "Elsewhere", nav: "Socials", shape: 4, x: 0, y: 0, scale: 1, dim: 0.6 },
  { id: "contact", label: "Terminal", shape: 0, x: 1.7, y: 0.35, scale: 0.85 },
];
