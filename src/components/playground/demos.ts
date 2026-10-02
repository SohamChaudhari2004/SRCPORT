import type { ComponentType } from "react";
import { ChartCandlestick, PenLine, ScanFace, type LucideIcon } from "lucide-react";
import FaceDetectDemo from "./FaceDetectDemo";
import DigitDemo from "./DigitDemo";
import StockDemo from "./StockDemo";

export interface DemoSpec {
  /** Project slug, links to /projects/[slug]. */
  slug: string;
  /** URL hash on /playground that opens this demo. */
  anchor: string;
  title: string;
  /** Sidebar group. */
  task: string;
  icon: LucideIcon;
  blurb: string;
  /** How to use it, one line. */
  hint: string;
  spec: { label: string; value: string }[];
  /** Short label for the sidebar list, e.g. model size. */
  size: string;
  /** True when inference runs in the visitor's browser; false for live API demos. */
  onDevice: boolean;
  /** Status bar text: what it runs on, and a note on the right. */
  runtime: string;
  footnote: string;
  Demo: ComponentType;
}

/** Live in-browser demos. Shown on /playground and on each project's case study. */
export const demos: DemoSpec[] = [
  {
    slug: "face-detection",
    anchor: "face-detection",
    title: "Face Detection",
    task: "Computer vision",
    icon: ScanFace,
    blurb: "Finds every face in a photo or live webcam feed and marks five landmarks per face.",
    hint: "Upload a photo or turn on the webcam.",
    size: "227 KB",
    onDevice: true,
    runtime: "ONNX Runtime Web (WASM)",
    footnote: "227 KB model · 0 bytes uploaded",
    spec: [
      { label: "Model", value: "YuNet (OpenCV Zoo, 2023)" },
      { label: "Weights", value: "53K parameters" },
      { label: "Input", value: "1 × 3 × 640 × 640, BGR" },
      { label: "Output", value: "Boxes, scores, 5 landmarks" },
      { label: "Post-processing", value: "Anchor decoding + NMS in TypeScript" },
      { label: "Runtime", value: "ONNX Runtime Web, WASM" },
    ],
    Demo: FaceDetectDemo,
  },
  {
    slug: "mnist-cnn",
    anchor: "mnist",
    title: "MNIST CNN",
    task: "Image classification",
    icon: PenLine,
    blurb: "A CNN I trained in PyTorch reads a handwritten digit as you draw it.",
    hint: "Draw a digit from 0 to 9 on the pad.",
    size: "1.7 MB",
    onDevice: true,
    runtime: "ONNX Runtime Web (WASM)",
    footnote: "1.7 MB model · 0 bytes uploaded",
    spec: [
      { label: "Model", value: "2 conv blocks + dense head" },
      { label: "Weights", value: "421K parameters" },
      { label: "Input", value: "1 × 1 × 28 × 28, normalised" },
      { label: "Output", value: "10 class logits, softmaxed" },
      { label: "Training", value: "PyTorch, Adam, 10 epochs on MNIST" },
      { label: "Runtime", value: "ONNX Runtime Web, WASM" },
    ],
    Demo: DigitDemo,
  },
  {
    slug: "stock-ai",
    anchor: "stock-ai",
    title: "Stock AI",
    task: "AI agents",
    icon: ChartCandlestick,
    blurb: "An LLM agent that answers questions about stocks using live market data, plus a plain quote lookup on the same API.",
    hint: "Ask a question or look up a ticker.",
    size: "Live API",
    onDevice: false,
    runtime: "Live API · FastAPI on Render",
    footnote: "Groq gpt-oss-120b · Yahoo Finance data",
    spec: [
      { label: "Agent", value: "LangChain tool-calling agent" },
      { label: "Model", value: "gpt-oss-120b on Groq" },
      { label: "Tools", value: "Ticker search, prices, company info, financials, screeners" },
      { label: "Memory", value: "Per conversation, by thread ID" },
      { label: "Backend", value: "FastAPI, Docker, Render" },
      { label: "Also ships", value: "MCP server for Claude Desktop and IDEs" },
    ],
    Demo: StockDemo,
  },
];

export const demoFor = (slug: string) => demos.find((d) => d.slug === slug);
