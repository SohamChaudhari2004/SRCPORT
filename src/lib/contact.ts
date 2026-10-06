"use client";

import { createStore } from "./store";
import { playClose, playOpen } from "./sound";

export interface ContactState {
  open: boolean;
  /** Viewport point the modal grows out of (the trigger's centre). */
  origin: { x: number; y: number } | null;
  /** What the enquiry is about (e.g. a solution's title); added to the email subject. */
  topic?: string;
}

export interface Draft {
  name: string;
  email: string;
  message: string;
}

export const contactStore = createStore<ContactState>({ open: false, origin: null });

/** Lives outside the dialog so a half-written message survives closing it. */
export const draftStore = createStore<Draft>({ name: "", email: "", message: "" });
export const updateDraft = (fn: (d: Draft) => Draft) => draftStore.set(fn(draftStore.get()));

type Source = Element | { x: number; y: number } | null | undefined;

const centreOf = (src: Source) => {
  if (!src) return null;
  if (src instanceof Element) {
    const r = src.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return src;
};

export function openContact(from?: Source, topic?: string) {
  const s = contactStore.get();
  if (s.open) return;
  playOpen();
  contactStore.set({ open: true, origin: centreOf(from), topic });
}

export function closeContact() {
  const s = contactStore.get();
  if (!s.open) return;
  playClose();
  contactStore.set({ ...s, open: false });
}
