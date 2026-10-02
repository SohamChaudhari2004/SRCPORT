import { useSyncExternalStore } from "react";

export interface Store<T> {
  get: () => T;
  set: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
}

/** Tiny external store, shared between React UI, GSAP and the WebGL scene. */
export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (next) => {
      if (Object.is(next, state)) return;
      state = next;
      listeners.forEach((l) => l());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function useStore<T>(store: Store<T>, serverValue?: T): T {
  return useSyncExternalStore(store.subscribe, store.get, () => serverValue ?? store.get());
}

/** Preloader finished → hero intro may play. */
export const bootStore = createStore(false);

/** Index into SECTIONS of the section currently in view. */
export const activeSectionStore = createStore(0);
