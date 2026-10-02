import { LucideIcon, Code, Sparkles, Brain, Database, Server, Cloud, Heart } from "lucide-react";

export type SkillCategory =
  | "Programming Languages"
  | "GenAI & LLMs"
  | "ML & Deep Learning"
  | "Vector & Databases"
  | "Backend & APIs"
  | "MLOps & Cloud"
  | "Interests";

export interface Skill {
  name: string;
  category: SkillCategory;
  icon: string; // URL to the icon
}

// Simple Icons URL
const getIcon = (slug: string) => `https://cdn.simpleicons.org/${slug}/white`;
// Monogram tile when Simple Icons has no mark
const getGenericIcon = (name: string) => `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=32`;

export const skills: Skill[] = [
  // Programming Languages
  { name: "Python", category: "Programming Languages", icon: getIcon("python") },
  { name: "TypeScript", category: "Programming Languages", icon: getIcon("typescript") },
  { name: "JavaScript", category: "Programming Languages", icon: getIcon("javascript") },
  { name: "Java", category: "Programming Languages", icon: getIcon("openjdk") },
  { name: "SQL", category: "Programming Languages", icon: getGenericIcon("SQL") },

  // GenAI & LLMs
  { name: "LangChain", category: "GenAI & LLMs", icon: getIcon("langchain") },
  { name: "LangGraph", category: "GenAI & LLMs", icon: getGenericIcon("LG") },
  { name: "RAG", category: "GenAI & LLMs", icon: getGenericIcon("RAG") },
  { name: "Agentic AI", category: "GenAI & LLMs", icon: getGenericIcon("AA") },
  { name: "Prompt Engineering", category: "GenAI & LLMs", icon: getGenericIcon("PE") },
  { name: "Function Calling", category: "GenAI & LLMs", icon: getGenericIcon("FC") },
  { name: "LLM Evaluation", category: "GenAI & LLMs", icon: getGenericIcon("EV") },
  { name: "Hugging Face", category: "GenAI & LLMs", icon: getIcon("huggingface") },

  // ML & Deep Learning
  { name: "PyTorch", category: "ML & Deep Learning", icon: getIcon("pytorch") },
  { name: "TensorFlow", category: "ML & Deep Learning", icon: getIcon("tensorflow") },
  { name: "Keras", category: "ML & Deep Learning", icon: getIcon("keras") },
  { name: "scikit-learn", category: "ML & Deep Learning", icon: getIcon("scikitlearn") },
  { name: "Transformers", category: "ML & Deep Learning", icon: getGenericIcon("TF") },
  { name: "CLIP", category: "ML & Deep Learning", icon: getGenericIcon("CLIP") },
  { name: "Computer Vision", category: "ML & Deep Learning", icon: getIcon("opencv") },
  { name: "Optuna", category: "ML & Deep Learning", icon: getGenericIcon("OP") },

  // Vector & Databases
  { name: "FAISS", category: "Vector & Databases", icon: getGenericIcon("FA") },
  { name: "Pinecone", category: "Vector & Databases", icon: getGenericIcon("PC") },
  { name: "ChromaDB", category: "Vector & Databases", icon: getGenericIcon("CDB") },
  { name: "PostgreSQL", category: "Vector & Databases", icon: getIcon("postgresql") },
  { name: "MongoDB", category: "Vector & Databases", icon: getIcon("mongodb") },
  { name: "Redis", category: "Vector & Databases", icon: getIcon("redis") },

  // Backend & APIs
  { name: "FastAPI", category: "Backend & APIs", icon: getIcon("fastapi") },
  { name: "Flask", category: "Backend & APIs", icon: getIcon("flask") },
  { name: "Node.js", category: "Backend & APIs", icon: getIcon("nodedotjs") },
  { name: "Express", category: "Backend & APIs", icon: getIcon("express") },
  { name: "React", category: "Backend & APIs", icon: getIcon("react") },
  { name: "Next.js", category: "Backend & APIs", icon: getIcon("nextdotjs") },

  // MLOps & Cloud
  { name: "AWS", category: "MLOps & Cloud", icon: getGenericIcon("AWS") },
  { name: "Docker", category: "MLOps & Cloud", icon: getIcon("docker") },
  { name: "Kubernetes", category: "MLOps & Cloud", icon: getIcon("kubernetes") },
  { name: "MLflow", category: "MLOps & Cloud", icon: getIcon("mlflow") },
  { name: "GitHub Actions", category: "MLOps & Cloud", icon: getIcon("githubactions") },
  { name: "Terraform", category: "MLOps & Cloud", icon: getIcon("terraform") },
  { name: "Git", category: "MLOps & Cloud", icon: getIcon("git") },

  // Interests
  { name: "Generative AI", category: "Interests", icon: getGenericIcon("GenAI") },
  { name: "Agentic AI", category: "Interests", icon: getGenericIcon("AI") },
  { name: "Multimodal AI", category: "Interests", icon: getGenericIcon("MM") },
  { name: "Deep Learning", category: "Interests", icon: getGenericIcon("DL") },
];

export const categoryIcons: Record<SkillCategory, LucideIcon> = {
  "Programming Languages": Code,
  "GenAI & LLMs": Sparkles,
  "ML & Deep Learning": Brain,
  "Vector & Databases": Database,
  "Backend & APIs": Server,
  "MLOps & Cloud": Cloud,
  Interests: Heart,
};
