"use client";

import { createStore } from "./store";

/**
 * UI sound, synthesised with Web Audio, no audio files to download.
 *
 * Browsers only let an AudioContext start inside a user activation (pointerdown,
 * keydown, click…), so the context is created lazily by `unlockAudio()` from
 * those handlers. Anything triggered outside an activation (scroll ticks)
 * stays silent until the context is already running.
 */

const KEY = "sound";

const readPref = () => {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
};

export const soundStore = createStore<boolean>(typeof window === "undefined" ? true : readPref());

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let noise: AudioBuffer | null = null;

export function unlockAudio() {
  if (typeof window === "undefined" || !soundStore.get()) return;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC({ latencyHint: "interactive" });
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    out = ctx.createGain();
    out.gain.value = 0.8;
    out.connect(comp).connect(ctx.destination);

    // 0.25s of white noise, reused by every transient
    noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") void ctx.resume();
}

/** Returns the running context, or null when muted / not yet unlocked. */
function live() {
  if (!ctx || !out || ctx.state !== "running" || !soundStore.get()) return null;
  return ctx;
}

export function setSound(on: boolean) {
  soundStore.set(on);
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* storage may be blocked */
  }
  if (on) {
    unlockAudio();
    // context may still be resuming; confirm on the next tick
    window.setTimeout(() => playChime([659.25, 987.77], 0.05), 30);
  }
}

const jitter = (n: number, amount = 0.04) => n * (1 + (Math.random() - 0.5) * amount);

function env(c: AudioContext, peak: number, attack: number, decay: number, at = c.currentTime) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
  return g;
}

function burst(c: AudioContext, filter: BiquadFilterNode, gain: GainNode, length: number, at = c.currentTime) {
  const src = c.createBufferSource();
  src.buffer = noise;
  src.connect(filter).connect(gain).connect(out!);
  src.start(at, Math.random() * 0.2);
  src.stop(at + length);
}

/** Soft "tock", a pitched blip with a tiny noise transient on top. */
export function playClick(weight: "normal" | "soft" = "normal") {
  const c = live();
  if (!c) return;
  const t = c.currentTime;
  const soft = weight === "soft";

  const osc = c.createOscillator();
  osc.type = "sine";
  const f = jitter(soft ? 1400 : 1150);
  osc.frequency.setValueAtTime(f, t);
  osc.frequency.exponentialRampToValueAtTime(f * 0.48, t + 0.05);
  const g = env(c, soft ? 0.08 : 0.16, 0.002, 0.07, t);
  osc.connect(g).connect(out!);
  osc.start(t);
  osc.stop(t + 0.09);

  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 3800;
  burst(c, hp, env(c, soft ? 0.04 : 0.07, 0.001, 0.018, t), 0.03, t);
}

/** Scroll detent, a crisp band-passed tick, brighter and louder with speed. */
export function playTick(intensity = 0.5) {
  const c = live();
  if (!c) return;
  const t = c.currentTime;
  const k = Math.min(Math.max(intensity, 0), 1);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = jitter(2600 + k * 900, 0.08);
  bp.Q.value = 7;
  burst(c, bp, env(c, 0.09 + k * 0.13, 0.001, 0.016, t), 0.025, t);
}

/** Two-note chime; rising to open, falling to close. */
export function playChime(notes: number[], gap = 0.055, peak = 0.07) {
  const c = live();
  if (!c) return;
  const t = c.currentTime;
  notes.forEach((freq, i) => {
    const at = t + i * gap;
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const shimmer = c.createOscillator();
    shimmer.type = "sine";
    shimmer.frequency.value = freq * 2.01;
    const g = env(c, peak, 0.008, 0.42, at);
    const g2 = env(c, peak * 0.18, 0.008, 0.2, at);
    osc.connect(g).connect(out!);
    shimmer.connect(g2).connect(out!);
    osc.start(at);
    shimmer.start(at);
    osc.stop(at + 0.5);
    shimmer.stop(at + 0.3);
  });
}

export const playOpen = () => playChime([659.25, 987.77]);
export const playClose = () => playChime([987.77, 659.25], 0.045, 0.05);
export const playSuccess = () => playChime([659.25, 830.61, 987.77, 1318.51], 0.07, 0.06);

/** Filtered-noise swoosh for the theme wipe, sweeps up into light, down into dark. */
export function playWhoosh(direction: "up" | "down" = "up") {
  const c = live();
  if (!c) return;
  const t = c.currentTime;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.4;
  const [from, to] = direction === "up" ? [380, 2600] : [2600, 380];
  bp.frequency.setValueAtTime(from, t);
  bp.frequency.exponentialRampToValueAtTime(to, t + 0.5);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.16, t + 0.16);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
  const src = c.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  src.connect(bp).connect(g).connect(out!);
  src.start(t);
  src.stop(t + 0.62);
}
