// Copies the ONNX Runtime Web WASM runtime into public/ort so the in-browser
// model demos load it from this site instead of a CDN. Runs before dev and build.
import { cpSync, mkdirSync } from "node:fs";

const from = "node_modules/onnxruntime-web/dist";
const to = "public/ort";
mkdirSync(to, { recursive: true });
for (const f of ["ort-wasm-simd-threaded.wasm", "ort-wasm-simd-threaded.mjs"]) cpSync(`${from}/${f}`, `${to}/${f}`);
