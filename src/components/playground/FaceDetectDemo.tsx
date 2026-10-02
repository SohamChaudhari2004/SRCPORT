"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { Camera, CameraOff, ImageUp, Loader2 } from "lucide-react";
import { loadModel, loadOrt } from "@/lib/onnx";
import { site } from "@/data/profile";

const MODEL_URL = "/models/face-yunet.onnx";
const SIZE = 640; // YuNet 2023mar takes a fixed 1x3x640x640 BGR input, 0-255.
const STRIDES = [8, 16, 32];
const SCORE_MIN = 0.6;
const NMS_IOU = 0.3;

interface Face {
  score: number;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Right eye, left eye, nose tip, right and left mouth corners. */
  points: [number, number][];
}

type Source = HTMLImageElement | HTMLVideoElement;

const loadImage = async (url: string) => {
  const img = new Image();
  img.src = url;
  await img.decode();
  return img;
};

const sourceSize = (s: Source) =>
  s instanceof HTMLVideoElement ? { w: s.videoWidth, h: s.videoHeight } : { w: s.naturalWidth, h: s.naturalHeight };

/** Letterbox the source into the top-left of a 640x640 canvas and pack it as planar BGR floats. */
function toTensor(src: Source, scratch: HTMLCanvasElement) {
  const { w, h } = sourceSize(src);
  const scale = SIZE / Math.max(w, h);
  const ctx = scratch.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.drawImage(src, 0, 0, Math.round(w * scale), Math.round(h * scale));
  const rgba = ctx.getImageData(0, 0, SIZE, SIZE).data;
  const plane = SIZE * SIZE;
  const data = new Float32Array(3 * plane);
  for (let i = 0; i < plane; i++) {
    data[i] = rgba[i * 4 + 2];
    data[plane + i] = rgba[i * 4 + 1];
    data[2 * plane + i] = rgba[i * 4];
  }
  return { data, scale };
}

const iou = (a: Face, b: Face) => {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  return inter / (a.w * a.h + b.w * b.h - inter);
};

/** Decode YuNet's per-stride anchor outputs (same maths as OpenCV's FaceDetectorYN), then NMS. */
function decode(out: Record<string, { data: unknown }>, scale: number) {
  const found: Face[] = [];
  for (const s of STRIDES) {
    const cols = SIZE / s;
    const cls = out[`cls_${s}`].data as Float32Array;
    const obj = out[`obj_${s}`].data as Float32Array;
    const box = out[`bbox_${s}`].data as Float32Array;
    const kps = out[`kps_${s}`].data as Float32Array;
    for (let i = 0; i < cls.length; i++) {
      const score = Math.sqrt(Math.min(Math.max(cls[i], 0), 1) * Math.min(Math.max(obj[i], 0), 1));
      if (score < SCORE_MIN) continue;
      const r = Math.floor(i / cols);
      const c = i % cols;
      const cx = (c + box[i * 4]) * s;
      const cy = (r + box[i * 4 + 1]) * s;
      const w = Math.exp(box[i * 4 + 2]) * s;
      const h = Math.exp(box[i * 4 + 3]) * s;
      const points: [number, number][] = [];
      for (let k = 0; k < 5; k++)
        points.push([((kps[i * 10 + k * 2] + c) * s) / scale, ((kps[i * 10 + k * 2 + 1] + r) * s) / scale]);
      found.push({ score, x: (cx - w / 2) / scale, y: (cy - h / 2) / scale, w: w / scale, h: h / scale, points });
    }
  }
  found.sort((a, b) => b.score - a.score);
  const kept: Face[] = [];
  for (const f of found) if (kept.every((k) => iou(k, f) < NMS_IOU)) kept.push(f);
  return kept;
}

function draw(canvas: HTMLCanvasElement, src: Source, faces: Face[]) {
  const { w, h } = sourceSize(src);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(src, 0, 0, w, h);
  const line = Math.max(2, Math.round(Math.max(w, h) / 320));
  const accent = getComputedStyle(canvas).getPropertyValue("--accent").trim() || "#2b3bff";
  ctx.lineWidth = line;
  ctx.font = `600 ${line * 7}px ui-monospace, monospace`;
  for (const f of faces) {
    ctx.strokeStyle = accent;
    ctx.strokeRect(f.x, f.y, f.w, f.h);
    const label = `${Math.round(f.score * 100)}%`;
    const pad = line * 2;
    const tw = ctx.measureText(label).width + pad * 2;
    const th = line * 10;
    ctx.fillStyle = accent;
    ctx.fillRect(f.x - line / 2, f.y - th, tw, th);
    ctx.fillStyle = "#fff";
    ctx.fillText(label, f.x + pad, f.y - line * 3);
    ctx.fillStyle = "#28c840";
    for (const [px, py] of f.points) {
      ctx.beginPath();
      ctx.arc(px, py, line * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

type Status = "idle" | "loading" | "ready" | "error";

export default function FaceDetectDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scratchRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const loopRef = useRef(0);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");
  const [faces, setFaces] = useState<number | null>(null);
  const [ms, setMs] = useState<number | null>(null);
  const [live, setLive] = useState(false);

  const detect = useCallback(async (src: Source) => {
    const scratch = (scratchRef.current ??= Object.assign(document.createElement("canvas"), { width: SIZE, height: SIZE }));
    const [ort, session] = await Promise.all([loadOrt(), loadModel(MODEL_URL)]);
    const { data, scale } = toTensor(src, scratch);
    const t0 = performance.now();
    const out = await session.run({ input: new ort.Tensor("float32", data, [1, 3, SIZE, SIZE]) });
    const t1 = performance.now();
    const found = decode(out, scale);
    if (canvasRef.current) draw(canvasRef.current, src, found);
    setFaces(found.length);
    setMs(Math.round(t1 - t0));
  }, []);

  const runOnImage = useCallback(
    async (url: string) => {
      setStatus("loading");
      setError("");
      try {
        await detect(await loadImage(url));
        setStatus("ready");
      } catch (e) {
        console.error("[face-detection]", e);
        setError("Couldn't run the model on that image.");
        setStatus("error");
      }
    },
    [detect],
  );

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(loopRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLive(false);
  }, []);

  const startCamera = async () => {
    setStatus("loading");
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640 }, audio: false });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      setLive(true);
      setStatus("ready");
      // One frame at a time: the next detection starts only after the last one finished.
      const tick = async () => {
        if (!streamRef.current) return;
        await detect(video).catch(() => {});
        loopRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      console.error("[face-detection]", e);
      setError("Camera unavailable. Allow camera access or upload a photo instead.");
      setStatus("error");
      stopCamera();
    }
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    stopCamera();
    const url = URL.createObjectURL(file);
    runOnImage(url).finally(() => URL.revokeObjectURL(url));
  };

  // Start with a sample photo so the demo shows a result before any input.
  useEffect(() => {
    let alive = true;
    loadImage(site.photo.light)
      .then(detect)
      .then(
        () => alive && setStatus("ready"),
        (e) => {
          console.error("[face-detection]", e);
          if (alive) setStatus("idle");
        },
      );
    return () => {
      alive = false;
      stopCamera();
    };
  }, [detect, stopCamera]);

  return (
    <div>
      <div className="relative grid min-h-64 place-items-center overflow-hidden rounded-xl bg-[#0f0f10]">
        <canvas ref={canvasRef} className="block h-auto max-h-[52svh] w-auto max-w-full" aria-label="Face detection result" />
        <video ref={videoRef} playsInline muted className="hidden" />
        {status === "loading" && (
          <span className="label absolute inset-0 grid place-items-center bg-black/40 text-white/80">
            <span className="inline-flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Loading model
            </span>
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 px-1">
        <label className="btn-brutal cursor-pointer">
          <ImageUp size={15} /> Upload photo
          <input type="file" accept="image/*" onChange={onFile} className="sr-only" />
        </label>
        {live ? (
          <button type="button" onClick={stopCamera} className="btn-line">
            <CameraOff size={15} /> Stop camera
          </button>
        ) : (
          <button type="button" onClick={startCamera} className="btn-line">
            <Camera size={15} /> Use webcam
          </button>
        )}
        <p className="label ml-auto tabular-nums text-muted" aria-live="polite">
          {status === "error"
            ? error
            : faces === null
              ? "YuNet / ONNX Runtime Web"
              : `${faces} face${faces === 1 ? "" : "s"} · ${ms} ms`}
        </p>
      </div>
      <p className="label mt-3 px-1 text-muted normal-case tracking-normal">
        Runs on your device. Images and video never leave the browser.
      </p>
    </div>
  );
}
