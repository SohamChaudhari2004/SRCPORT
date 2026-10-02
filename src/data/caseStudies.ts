/**
 * Long-form copy for the featured project pages (/projects/[slug]).
 * Keyed by project slug (title lowercased, non-alphanumerics to "-").
 */
export interface CaseStudyMedia {
  /** Screen recordings of the product, shown in a "See it work" section. */
  videos?: { src: string; poster: string; title: string; caption: string }[];
}

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
  media?: CaseStudyMedia;
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
    media: {
      videos: [
        {
          src: "/assets/mosaic/mosaic-demo-1.mp4",
          poster: "/assets/mosaic/poster-1.webp",
          title: "Find a clip by describing it",
          caption: "Asked for the part where the Swift network is explained, MOSAIC returns a 20-second clip with its exact timestamps.",
        },
        {
          src: "/assets/mosaic/mosaic-demo-2.mp4",
          poster: "/assets/mosaic/poster-2.webp",
          title: "Search with an image",
          caption: "Upload a frame and ask for the moment it appears. The query is matched against CLIP embeddings of the video.",
        },
        {
          src: "/assets/mosaic/mosaic-demo-3.mp4",
          poster: "/assets/mosaic/poster-3.webp",
          title: "Image to clip, then explain",
          caption: "The matching 10-second clip comes back, then the same chat summarises what the whole video is about.",
        },
      ],
    },
  },

  "stock-ai": {
    seoTitle: "Stock AI: LLM Stock Analysis Agent and MCP Server with FastAPI",
    tagline: "Ask about any stock in plain English. An agent fetches live market data and answers.",
    overview: [
      "Stock AI is an HTTP API for stock market data with an LLM agent on top. You ask a question such as \"What is Nvidia trading at and what is its P/E?\" and the agent decides which data it needs, calls the right tools, and answers in Markdown with tables.",
      "It merges two earlier projects, an MCP server of stock tools and a LangGraph stock screener, into one FastAPI service. The same tools are also available as an MCP server, so Claude Desktop or an IDE can use them directly.",
      "It is built to be called from a public website: API-key auth, per-IP rate limits, restricted CORS, response caching and clear error codes. The live demo on this site calls it through a server-side proxy so the key never reaches the browser.",
    ],
    features: [
      { title: "Tool-calling agent", body: "A LangChain agent on Groq's gpt-oss-120b chooses between ticker search, prices, company info, income statements and screeners for each question." },
      { title: "Conversation memory", body: "Each conversation has a thread ID, so follow-ups like \"and its revenue trend?\" keep context. Old turns are trimmed to bound cost." },
      { title: "Plain data endpoints", body: "The same data is available as JSON without the LLM: search, price history, company metrics, financials and 15 Yahoo Finance screens." },
      { title: "MCP server", body: "An optional MCP server exposes the tools over stdio for Claude Desktop and IDE assistants." },
      { title: "Built for public traffic", body: "API keys with zero-downtime rotation, per-IP rate limits with standard headers, CORS limited to known origins, and cached responses." },
      { title: "Graceful failure", body: "Typed errors for bad input, unknown tickers, rate limits, provider outages and timeouts, each with a Retry-After hint where it helps." },
    ],
    flow: [
      "The client sends a question, plus the thread ID of an ongoing conversation.",
      "The API checks the key and rate limit, then loads that thread's recent history.",
      "The agent plans which tools to call and fetches live data from Yahoo Finance through yfinance, using cached results where fresh enough.",
      "The model writes a Markdown answer from the data and returns it with the list of tools it used.",
      "The thread is saved, so the next message continues the same conversation.",
    ],
    stack: ["Python", "FastAPI", "LangChain", "LangGraph", "Groq", "gpt-oss-120b", "yfinance", "MCP", "Docker", "Render", "uv", "pytest"],
    keywords: ["LLM stock analysis agent", "yfinance MCP server", "FastAPI AI agent", "LangChain tool calling", "Groq agent", "stock market chatbot", "Model Context Protocol"],
  },

  "face-detection": {
    seoTitle: "Real-Time Face Detection in the Browser with ONNX",
    tagline: "Face and landmark detection that runs live in your browser, with nothing uploaded.",
    overview: [
      "A real-time face detector that runs entirely on the visitor's device. It finds every face in a photo or webcam feed, scores it, and marks five facial landmarks: both eyes, the nose tip and the mouth corners.",
      "It uses YuNet, OpenCV's lightweight face detection model, exported to ONNX. I wrote the whole inference pipeline for the browser: preprocessing, decoding the raw model outputs, non-maximum suppression and drawing. There is no server and no Python, so images never leave the device.",
    ],
    features: [
      { title: "Runs in the browser", body: "ONNX Runtime Web executes the model with WebAssembly. No backend, no GPU, no install." },
      { title: "Private by design", body: "Photos and video frames are processed on the device and never uploaded anywhere." },
      { title: "Live webcam mode", body: "Detects faces frame by frame from the camera, one inference at a time so it never queues up." },
      { title: "Five-point landmarks", body: "Eyes, nose tip and mouth corners for every face, ready for alignment or cropping." },
      { title: "Tiny model", body: "Under 250 KB, so it downloads and starts almost instantly, even on mobile." },
      { title: "Custom decoder", body: "Anchor decoding and NMS written in TypeScript, matching OpenCV's FaceDetectorYN." },
    ],
    flow: [
      "Letterbox the image or video frame into a 640x640 canvas, keeping its aspect ratio.",
      "Pack the pixels into a planar BGR float tensor, the layout the model expects.",
      "Run YuNet with ONNX Runtime Web on WebAssembly.",
      "Decode class, objectness, box and landmark outputs at strides 8, 16 and 32.",
      "Drop overlapping boxes with non-maximum suppression and draw the results.",
    ],
    stack: ["ONNX", "ONNX Runtime Web", "WebAssembly", "YuNet", "Computer vision", "TypeScript", "Canvas API", "WebRTC"],
    keywords: ["face detection in browser", "YuNet ONNX", "ONNX Runtime Web", "real-time face detection", "client-side computer vision", "facial landmarks"],
  },

  "mnist-cnn": {
    seoTitle: "MNIST CNN: Handwritten Digit Recognition in the Browser",
    tagline: "A PyTorch CNN that reads your handwriting live, running in the browser through ONNX.",
    overview: [
      "A convolutional neural network trained from scratch in PyTorch on the MNIST handwritten digit dataset, then exported to ONNX so it can run anywhere without PyTorch.",
      "Draw a digit on the pad and the model classifies it as you draw, showing its confidence for every class from 0 to 9. I trained it alongside a plain MLP baseline to compare how much convolution helps on image data.",
    ],
    features: [
      { title: "Two-block CNN", body: "Two convolution blocks (32 then 64 filters) with ReLU and max pooling, then a 128-unit dense head." },
      { title: "Trained from scratch", body: "PyTorch training loop with Adam and cross-entropy over 10 epochs on 60,000 digits." },
      { title: "MLP baseline", body: "A 784-128-64-10 fully connected network trained the same way, as a point of comparison." },
      { title: "Exported to ONNX", body: "About 420K parameters in a 1.7 MB file, served as a static asset." },
      { title: "Live inference", body: "Classifies while you draw, with at most one inference in flight at a time." },
      { title: "Matching preprocessing", body: "Crop, scale to 20x20 and centre on 28x28, exactly as during training." },
    ],
    flow: [
      "Train the CNN in PyTorch on MNIST with inputs normalised to [-1, 1].",
      "Export the trained weights to ONNX.",
      "In the browser, crop the drawing to its bounding box and scale it into 20x20.",
      "Centre it on a 28x28 canvas and normalise it the same way as in training.",
      "Run the model with ONNX Runtime Web and softmax the logits into confidences.",
    ],
    stack: ["Python", "PyTorch", "CNN", "ONNX", "ONNX Runtime Web", "WebAssembly", "TypeScript"],
    keywords: ["MNIST CNN", "handwritten digit recognition", "PyTorch to ONNX", "CNN in browser", "ONNX Runtime Web", "digit classifier demo"],
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
