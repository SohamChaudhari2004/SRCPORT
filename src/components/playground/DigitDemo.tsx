"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Eraser, Loader2 } from "lucide-react";
import { loadModel, loadOrt } from "@/lib/onnx";

const MODEL_URL = "/models/mnist-cnn.onnx";
const PAD = 280; // drawing surface, in canvas pixels
const BRUSH = 20;

/**
 * Same preprocessing the model was trained with: white digit on black, cropped to
 * its bounding box, scaled to fit 20x20, centred on a 28x28 canvas, then
 * normalised with (x - 0.5) / 0.5. Returns null when nothing is drawn.
 */
function toTensor(pad: HTMLCanvasElement) {
  const ctx = pad.getContext("2d", { willReadFrequently: true })!;
  const { data } = ctx.getImageData(0, 0, PAD, PAD);
  let x0 = PAD, y0 = PAD, x1 = -1, y1 = -1;
  for (let y = 0; y < PAD; y++)
    for (let x = 0; x < PAD; x++)
      if (data[(y * PAD + x) * 4] > 30) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 < 0) return null;

  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const scale = Math.min(1, 20 / Math.max(w, h));
  const dw = Math.max(1, Math.round(w * scale));
  const dh = Math.max(1, Math.round(h * scale));
  const small = Object.assign(document.createElement("canvas"), { width: 28, height: 28 });
  const sctx = small.getContext("2d", { willReadFrequently: true })!;
  sctx.fillStyle = "#000";
  sctx.fillRect(0, 0, 28, 28);
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(pad, x0, y0, w, h, Math.floor((28 - dw) / 2), Math.floor((28 - dh) / 2), dw, dh);

  const px = sctx.getImageData(0, 0, 28, 28).data;
  const input = new Float32Array(28 * 28);
  for (let i = 0; i < input.length; i++) input[i] = (px[i * 4] / 255 - 0.5) / 0.5;
  return input;
}

const softmax = (logits: Float32Array) => {
  const max = Math.max(...logits);
  const exps = Array.from(logits, (v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
};

export default function DigitDemo() {
  const padRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<[number, number] | null>(null);
  const busy = useRef(false);
  const queued = useRef(false);
  const [probs, setProbs] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const clear = () => {
    const ctx = padRef.current!.getContext("2d")!;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, PAD, PAD);
    setProbs(null);
  };

  // Warm the model up so the first stroke classifies straight away.
  useEffect(() => {
    loadModel(MODEL_URL)
      .catch(() => setError("Couldn't load the model."))
      .finally(() => setLoading(false));
  }, []);

  // Classify while drawing, at most one inference in flight; a stroke made during
  // one run triggers exactly one more when it finishes.
  const classify = async () => {
    if (busy.current) {
      queued.current = true;
      return;
    }
    busy.current = true;
    try {
      const input = toTensor(padRef.current!);
      if (!input) return setProbs(null);
      const [ort, session] = await Promise.all([loadOrt(), loadModel(MODEL_URL)]);
      const out = await session.run({ input: new ort.Tensor("float32", input, [1, 1, 28, 28]) });
      setProbs(softmax(out.logits.data as Float32Array));
    } catch (e) {
      console.error("[mnist]", e);
      setError("Inference failed.");
    } finally {
      busy.current = false;
      if (queued.current) {
        queued.current = false;
        classify();
      }
    }
  };

  const point = (e: PointerEvent<HTMLCanvasElement>): [number, number] => {
    const r = e.currentTarget.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * PAD, ((e.clientY - r.top) / r.height) * PAD];
  };

  const stroke = (to: [number, number]) => {
    const ctx = padRef.current!.getContext("2d")!;
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "#fff";
    ctx.lineWidth = BRUSH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const from = last.current ?? to;
    ctx.beginPath();
    ctx.moveTo(...from);
    ctx.lineTo(...to);
    ctx.stroke();
    last.current = to;
  };

  const onDown = (e: PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = null;
    stroke(point(e));
  };
  const onMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    stroke(point(e));
    classify();
  };
  const onUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    classify();
  };

  const best = probs ? probs.indexOf(Math.max(...probs)) : null;

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,280px)_1fr]">
      <div>
        <div className="relative overflow-hidden rounded-2xl border border-line">
          <canvas
            ref={padRef}
            width={PAD}
            height={PAD}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            className="block aspect-square w-full cursor-crosshair touch-none bg-black"
            aria-label="Drawing pad: draw a digit from 0 to 9"
          />
          {!probs && !loading && (
            <span className="label pointer-events-none absolute inset-0 grid place-items-center text-white/50">
              Draw a digit, 0 to 9
            </span>
          )}
          {loading && (
            <span className="label absolute inset-0 grid place-items-center text-white/70">
              <span className="inline-flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Loading model
              </span>
            </span>
          )}
        </div>
        <button type="button" onClick={clear} className="btn-line mt-3">
          <Eraser size={15} /> Clear
        </button>
      </div>

      <div className="flex flex-col">
        <div className="flex items-end justify-between border-b border-line pb-3">
          <span className="label text-muted">Prediction</span>
          <span className="text-6xl font-bold leading-none tracking-[-0.05em] tabular-nums text-accent" aria-live="polite">
            {best ?? "-"}
          </span>
        </div>
        <ul className="mt-4 grid flex-1 gap-1.5" aria-label="Confidence per digit">
          {Array.from({ length: 10 }, (_, d) => {
            const p = probs?.[d] ?? 0;
            return (
              <li key={d} className="grid grid-cols-[1.25rem_1fr_3rem] items-center gap-3">
                <span className="label tabular-nums">{d}</span>
                <span className="h-2 overflow-hidden rounded-full bg-line">
                  <span
                    className={`block h-full origin-left rounded-full transition-transform duration-200 ${d === best ? "bg-accent" : "bg-ink/40"}`}
                    style={{ transform: `scaleX(${p})` }}
                  />
                </span>
                <span className="label text-right tabular-nums text-muted">{(p * 100).toFixed(1)}%</span>
              </li>
            );
          })}
        </ul>
        <p className="label mt-4 text-muted normal-case tracking-normal">
          {error || "PyTorch CNN exported to ONNX, running in your browser."}
        </p>
      </div>
    </div>
  );
}
