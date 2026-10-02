/**
 * Non-reactive, per-frame state shared by DOM listeners and the WebGL scene.
 * Written by event handlers, read inside useFrame, never triggers React renders.
 */
export const pointer = {
  /** normalised device coords, -1..1 */
  x: 0,
  y: 0,
  active: false,
};

export const scrollState = {
  velocity: 0,
  y: 0,
};
