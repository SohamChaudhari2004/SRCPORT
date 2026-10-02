export interface FeaturedItem {
  id: string;
  title: string;
  category: "achievement" | "project" | "certification" | "publication";
  description: string;
  date?: string;
  link?: string;
  tags?: string[];
  icon?: string;
}

export const featuredItems: FeaturedItem[] = [
//   {
//     id: "1",
//     title: "MOSAIC AI-Powered Video Analysis System",
//     category: "project",
//     description: "Built an advanced computer vision solution for real-time video analysis using TensorFlow and OpenCV, achieving 95% accuracy in object detection.",
//     date: "2024",
//     link: "https://github.com/yourusername/project",
//     tags: ["AI", "Computer Vision", "Python"],
//     icon: "🚀"
//   },
//   {
//     id: "2",
//     title: "Best Innovation Award - Tech Hackathon 2024",
//     category: "achievement",
//     description: "Won first place among 200+ teams for developing an AI-driven solution for sustainable food distribution.",
//     date: "March 2024",
//     tags: ["Hackathon", "AI", "Innovation"],
//     icon: "🏆"
//   },
//   {
//     id: "3",
//     title: "AWS Machine Learning Specialty",
//     category: "certification",
//     description: "Earned AWS Machine Learning Specialty certification demonstrating expertise in ML solution design and implementation.",
//     date: "2024",
//     link: "https://aws.amazon.com/certification/",
//     tags: ["AWS", "Machine Learning"],
//     icon: "📜"
//   },
//   {
//     id: "4",
//     title: "Deep Learning Research Paper",
//     category: "publication",
//     description: "Published research on novel neural network architectures for multimodal learning in IEEE conference proceedings.",
//     date: "2024",
//     link: "https://example.com/paper",
//     tags: ["Research", "Deep Learning"],
//     icon: "📚"
//   },
//   {
//     id: "5",
//     title: "Open Source Contribution - LangChain",
//     category: "achievement",
//     description: "Contributed key features to LangChain framework, improving RAG performance by 30%.",
//     date: "2024",
//     link: "https://github.com/langchain-ai/langchain",
//     tags: ["Open Source", "LLM"],
//     icon: "💻"
//   },
//   {
//     id: "6",
//     title: "Full-Stack AI Application",
//     category: "project",
//     description: "Developed end-to-end AI application with React, FastAPI, and PostgreSQL serving 10K+ users.",
//     date: "2024",
//     tags: ["Full Stack", "AI", "React"],
//     icon: "🔥"
//   }
];
