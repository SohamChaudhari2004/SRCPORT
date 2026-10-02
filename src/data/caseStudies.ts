/**
 * Long-form copy for the featured project pages (/projects/[slug]).
 * Keyed by project slug (title lowercased, non-alphanumerics to "-").
 */
export interface CaseStudy {
  /** One line under the title; also the page's meta description lead. */
  tagline: string;
  /** Search-facing title for the page, ~50 chars before the "| Soham Chaudhari" suffix. */
  seoTitle: string;
  overview: string[];
  features: { title: string; body: string }[];
  /** Ordered steps of how the system works. */
  flow: string[];
  stack: string[];
  keywords: string[];
}

export const caseStudies: Record<string, CaseStudy> = {
  mosaic: {
    seoTitle: "MOSAIC: Multimodal AI Video Search and Q&A",
    tagline: "Ask questions about any video and jump straight to the moment that answers it.",
    overview: [
      "MOSAIC is a multimodal video understanding system. It indexes what is said, what is shown and what is written on screen, so a long video becomes something you can search and talk to.",
      "Upload one or more videos and ask in plain language. MOSAIC finds the relevant moments, cuts the clips with timestamps, and answers with grounded references back to the footage.",
    ],
    features: [
      { title: "Transcript search", body: "Speech is transcribed with Whisper and embedded, so you can search a video by what was said." },
      { title: "Visual search", body: "Frames are embedded with CLIP, so a query like \"red car at night\" finds the scene even if nobody says it." },
      { title: "Caption understanding", body: "A vision LLM describes key frames, adding a third, descriptive layer to retrieval." },
      { title: "Clip extraction", body: "Matching moments are cut with FFmpeg and returned with exact timestamps." },
      { title: "Video Q&A and summaries", body: "A ReAct agent plans which search tools to call and answers with sources from the video." },
      { title: "Multi-video and MCP", body: "Search across a library of videos, and expose the tools to any MCP client." },
    ],
    flow: [
      "Ingest: FFmpeg splits audio and samples frames from each upload.",
      "Understand: Whisper transcribes speech, CLIP embeds frames, a vision LLM captions key frames.",
      "Index: embeddings go into ChromaDB and FAISS for fast hybrid retrieval.",
      "Reason: a LangChain ReAct agent picks the right search tools for the question.",
      "Answer: the agent replies with timestamps and extracted clips as evidence.",
    ],
    stack: ["Python", "FastAPI", "LangChain", "CLIP", "Whisper", "ChromaDB", "FAISS", "Groq", "Mistral", "FFmpeg", "PyTorch", "Next.js", "Docker", "MCP"],
    keywords: ["AI video search", "multimodal RAG", "video question answering", "CLIP video retrieval", "MCP server", "LangChain agent"],
  },

  "vision-ai": {
    seoTitle: "VISION AI: Image Super-Resolution and Face Restoration",
    tagline: "Restore low-quality images and videos with super-resolution and face enhancement.",
    overview: [
      "VISION AI is an image and video restoration tool built as a hackathon project. It upscales low-resolution images and repairs blurred or damaged faces in video, frame by frame.",
      "The goal was to make state-of-the-art restoration models usable from a simple web interface, without any setup on the user's side.",
    ],
    features: [
      { title: "Image super-resolution", body: "ESRGAN upscales low-resolution images while recovering fine texture and edges." },
      { title: "Video enhancement", body: "Videos are split into frames with OpenCV, enhanced, and stitched back together." },
      { title: "Face detection", body: "RetinaFace locates every face in a frame so restoration is applied where it matters." },
      { title: "Face restoration", body: "GFPGAN and CodeFormer rebuild facial detail in blurred or compressed footage." },
      { title: "Format conversion", body: "Convert results between common image formats straight from the app." },
      { title: "Domain upscaling", body: "Satellite and medical image upscaling are planned as dedicated modes." },
    ],
    flow: [
      "Upload an image or video from the React frontend.",
      "The Flask API routes it to the right pipeline.",
      "Images go through ESRGAN; videos are split into frames with OpenCV.",
      "Faces are detected with RetinaFace and restored with GFPGAN or CodeFormer.",
      "The enhanced result is returned for preview and download.",
    ],
    stack: ["Python", "PyTorch", "ESRGAN", "GFPGAN", "CodeFormer", "RetinaFace", "OpenCV", "Flask", "React", "Tailwind CSS"],
    keywords: ["image super-resolution", "ESRGAN", "face restoration", "GFPGAN", "CodeFormer", "video enhancement AI"],
  },

  gpts: {
    seoTitle: "GPT from Scratch in PyTorch: Decoder-Only Transformer",
    tagline: "A decoder-only GPT written from scratch in PyTorch, about 10M parameters.",
    overview: [
      "A from-scratch implementation of a GPT-style language model in roughly 200 lines of PyTorch. No Hugging Face, no shortcuts: tokenisation, attention, training loop and sampling are all written by hand.",
      "It is trained on the tiny Shakespeare dataset and generates new text in the same style, character by character.",
    ],
    features: [
      { title: "Multi-head self-attention", body: "Causal masked attention with 6 heads per block, written from first principles." },
      { title: "Transformer blocks", body: "6 stacked blocks with pre-norm LayerNorm, residual connections and feed-forward layers." },
      { title: "Positional embeddings", body: "Learned token and position embeddings over a 256-token context window." },
      { title: "Regularisation", body: "Dropout of 0.2 throughout to keep a small model from overfitting." },
      { title: "Training", body: "AdamW over 5,000 iterations with periodic train and validation loss checks." },
      { title: "Generation", body: "Autoregressive sampling that streams new Shakespeare-style text." },
    ],
    flow: [
      "Encode the corpus at character level and split into train and validation sets.",
      "Sample random 256-token blocks as training batches.",
      "Run them through embeddings, 6 transformer blocks and a language-model head.",
      "Optimise cross-entropy loss with AdamW.",
      "Sample from the trained model one token at a time.",
    ],
    stack: ["Python", "PyTorch", "Transformers", "Self-attention", "AdamW"],
    keywords: ["GPT from scratch", "PyTorch transformer", "decoder-only transformer", "self-attention implementation", "language model from scratch"],
  },

  "ai-agents": {
    seoTitle: "AI Agents with LangChain, Pydantic AI and MCP",
    tagline: "Research and tool-using AI agents built with LangChain, Pydantic AI and MCP.",
    overview: [
      "A collection of AI agents exploring different agent frameworks side by side. Each one is small, focused and built to show how the framework handles tools, structured output and observability.",
      "The research agent searches the web and Wikipedia, then writes a cited summary. The Pydantic AI agents show typed, validated agent outputs and tool access through MCP.",
    ],
    features: [
      { title: "Research agent", body: "A LangChain agent on Groq that searches Wikipedia and DuckDuckGo and returns a summary with sources." },
      { title: "Structured output", body: "Responses are parsed into typed models, so downstream code gets clean data, not loose text." },
      { title: "Pydantic AI agents", body: "Typed agents with dependency injection and validated results." },
      { title: "MCP tools", body: "Agents connect to Model Context Protocol servers to use external tools." },
      { title: "Observability", body: "Runs are traced with Logfire to inspect each tool call and model step." },
      { title: "Model choice", body: "Swaps between Groq-hosted models and Mistral without changing agent logic." },
    ],
    flow: [
      "The user asks a research question.",
      "The agent decides which tools to call: web search, Wikipedia or an MCP tool.",
      "Tool results are fed back to the model for reasoning.",
      "The final answer is validated against a typed schema.",
      "Each step is logged to Logfire for debugging.",
    ],
    stack: ["Python", "LangChain", "Pydantic AI", "MCP", "Groq", "Mistral", "Logfire"],
    keywords: ["AI agents", "LangChain agent", "Pydantic AI", "MCP agent", "research agent", "tool-using LLM"],
  },
};
