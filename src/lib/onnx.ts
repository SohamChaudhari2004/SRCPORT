/**
 * Loads ONNX models in the browser with ONNX Runtime Web (WASM backend).
 * The runtime is imported on first use, so it never ships with the main bundle,
 * and each model session is created once and reused.
 */
import type { InferenceSession } from "onnxruntime-web";

type Ort = typeof import("onnxruntime-web/wasm");

let ortPromise: Promise<Ort> | null = null;
const sessions = new Map<string, Promise<InferenceSession>>();

export function loadOrt() {
  ortPromise ??= import("onnxruntime-web/wasm").then((ort) => {
    // Served from public/ort (copied from node_modules by scripts/copy-ort.mjs).
    ort.env.wasm.wasmPaths = "/ort/";
    // Threads need cross-origin isolation, which this site doesn't enable.
    ort.env.wasm.numThreads = 1;
    return ort;
  });
  return ortPromise;
}

export function loadModel(url: string) {
  let session = sessions.get(url);
  if (!session) {
    session = loadOrt().then((ort) => ort.InferenceSession.create(url, { executionProviders: ["wasm"] }));
    // Let a failed load be retried instead of caching the rejection.
    session.catch(() => sessions.delete(url));
    sessions.set(url, session);
  }
  return session;
}
