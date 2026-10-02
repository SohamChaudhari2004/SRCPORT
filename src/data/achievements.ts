export interface Achievement {
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  /** Year only, e.g. "2026". */
  date?: string;
}

export const achievements: Achievement[] = [
  {
    title: "1st Position Syrus",
    subtitle: "@Syrus'26 Hackathon",
    description:
      "Won Syrus'26 among 150+ teams with Common Brain, a RAG assistant that unifies scattered organisational documents into one queryable, source-grounded knowledge layer with role-aware retrieval.",
    date: "2026",
  },
  {
    title: "2nd Position IIT Ropar",
    subtitle: "@Medino'sXAdvitiya'25",
    description:
      "Runner-up at Medino'sXAdvitiya'25, hosted by IIT Ropar, among 200+ teams. Built a symptom analyser chatbot and an OCR-based prescription reader.",
    date: "2025",
  },
  {
    title: "Top 10 IIIT Dharwad",
    subtitle: "@Hack2Future 2024",
    description:
      "Top 10 at Hack2Future among 1,700+ participants with Vision AI: real-time object detection, scene recognition and automated insights for video and images.",
    date: "2024",
  },
];
