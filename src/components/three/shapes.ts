/**
 * Particle formations. Each returns `count` xyz triples (Float32Array, length count*3)
 * so any formation can morph into any other point-for-point.
 */

export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rand = () => number;

function gauss(rand: Rand) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** 0 · Embedding sphere, fibonacci shell with a sparse inner volume. */
function sphere(count: number, rand: Rand) {
  const out = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;
    if (rand() < 0.14) {
      const r = 1.5 * Math.cbrt(rand());
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      x = Math.sin(ph) * Math.cos(th) * r;
      y = Math.cos(ph) * r;
      z = Math.sin(ph) * Math.sin(th) * r;
    } else {
      const yy = 1 - (i / (count - 1)) * 2;
      const rad = Math.sqrt(1 - yy * yy);
      const th = golden * i;
      const r = 1.85 + gauss(rand) * 0.045 + (rand() < 0.04 ? rand() * 0.45 : 0);
      x = Math.cos(th) * rad * r;
      y = yy * r;
      z = Math.sin(th) * rad * r;
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

/** 1 · Neural network, rings of nodes per layer, points streaming along edges. */
function network(count: number, rand: Rand) {
  const out = new Float32Array(count * 3);
  const layers = [3, 6, 10, 10, 6, 3];
  const spacing = 1.08;
  const x0 = (-(layers.length - 1) * spacing) / 2;
  const nodes: number[][][] = layers.map((n, l) => {
    const radius = n === 3 ? 0.42 : 0.3 + n * 0.12;
    return Array.from({ length: n }, (_, k) => {
      const a = (k / n) * Math.PI * 2 + l * 0.35;
      return [x0 + l * spacing, Math.cos(a) * radius, Math.sin(a) * radius * 0.85];
    });
  });
  const edges: [number[], number[]][] = [];
  for (let l = 0; l < nodes.length - 1; l++)
    for (const a of nodes[l]) for (const b of nodes[l + 1]) edges.push([a, b]);
  const flat = nodes.flat();

  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;
    if (rand() < 0.36) {
      const n = flat[Math.floor(rand() * flat.length)];
      x = n[0] + gauss(rand) * 0.045;
      y = n[1] + gauss(rand) * 0.045;
      z = n[2] + gauss(rand) * 0.045;
    } else {
      const [a, b] = edges[Math.floor(rand() * edges.length)];
      const t = rand();
      x = a[0] + (b[0] - a[0]) * t;
      y = a[1] + (b[1] - a[1]) * t + gauss(rand) * 0.006;
      z = a[2] + (b[2] - a[2]) * t + gauss(rand) * 0.006;
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

/** 2 · Loss landscape, a lattice surface with a global minimum, tilted toward camera. */
function landscape(count: number, rand: Rand) {
  const out = new Float32Array(count * 3);
  const cols = Math.round(Math.sqrt(count * 1.75));
  const rows = Math.ceil(count / cols);
  const tilt = 0.62;
  const c = Math.cos(tilt);
  const s = Math.sin(tilt);
  for (let i = 0; i < count; i++) {
    const cx = i % cols;
    const rz = Math.floor(i / cols);
    const x = (cx / (cols - 1) - 0.5) * 7.4 + (rand() - 0.5) * 0.01;
    const z = (rz / Math.max(rows - 1, 1) - 0.5) * 4.4;
    const y =
      0.42 * Math.sin(1.15 * x + 0.5) * Math.cos(1.05 * z) +
      0.18 * Math.sin(2.4 * x * 0.5 + z * 1.7) -
      1.15 * Math.exp(-((x - 0.9) ** 2 + (z + 0.3) ** 2) * 1.1) +
      0.55 * Math.exp(-((x + 1.8) ** 2 + (z - 0.7) ** 2) * 1.4);
    out.set([x, y * c - z * s - 0.25, y * s + z * c], i * 3);
  }
  return out;
}

/** 3 · Skill clusters, one gaussian blob per skill category, sized by its count. */
function clusters(count: number, rand: Rand, sizes: number[]) {
  const out = new Float32Array(count * 3);
  const k = Math.max(sizes.length, 1);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const centers = Array.from({ length: k }, (_, i) => {
    const y = 1 - (i / Math.max(k - 1, 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i + 0.6;
    return [Math.cos(th) * r * 1.65, y * 1.45, Math.sin(th) * r * 1.1];
  });
  const weights = sizes.map((s) => s + 2);
  const total = weights.reduce((a, b) => a + b, 0) || 1;

  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;
    if (rand() < 0.07) {
      x = (rand() - 0.5) * 5;
      y = (rand() - 0.5) * 3.6;
      z = (rand() - 0.5) * 2.4;
    } else {
      let pick = rand() * total;
      let idx = 0;
      while (idx < k - 1 && pick > weights[idx]) pick -= weights[idx++];
      const sigma = 0.13 + 0.028 * (sizes[idx] ?? 3);
      const cc = centers[idx];
      x = cc[0] + gauss(rand) * sigma;
      y = cc[1] + gauss(rand) * sigma;
      z = cc[2] + gauss(rand) * sigma;
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

/** 4 · Ring, a tilted torus with a thin orbit and a spiral core. */
function ring(count: number, rand: Rand) {
  const out = new Float32Array(count * 3);
  const tiltX = 1.12;
  const tiltZ = 0.28;
  const cx = Math.cos(tiltX);
  const sx = Math.sin(tiltX);
  const cz = Math.cos(tiltZ);
  const sz = Math.sin(tiltZ);
  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;
    const roll = rand();
    if (roll < 0.66) {
      const u = rand() * Math.PI * 2;
      const v = rand() * Math.PI * 2;
      const r = 0.24 * (0.8 + 0.2 * rand());
      x = (1.75 + r * Math.cos(v)) * Math.cos(u);
      y = (1.75 + r * Math.cos(v)) * Math.sin(u);
      z = r * Math.sin(v);
    } else if (roll < 0.86) {
      const u = rand() * Math.PI * 2;
      const r = 2.45 + gauss(rand) * 0.02;
      x = Math.cos(u) * r;
      y = Math.sin(u) * r;
      z = gauss(rand) * 0.02;
    } else {
      const t = rand();
      const a = t * Math.PI * 7;
      const r = 0.15 + t * 1.1;
      x = Math.cos(a) * r + gauss(rand) * 0.03;
      y = Math.sin(a) * r + gauss(rand) * 0.03;
      z = gauss(rand) * 0.04;
    }
    // rotate about X, then Z
    const y1 = y * cx - z * sx;
    const z1 = y * sx + z * cx;
    const x2 = x * cz - y1 * sz;
    const y2 = x * sz + y1 * cz;
    out.set([x2, y2, z1], i * 3);
  }
  return out;
}

export function buildShapes(count: number, clusterSizes: number[]) {
  return [
    sphere(count, mulberry32(11)),
    network(count, mulberry32(23)),
    landscape(count, mulberry32(37)),
    clusters(count, mulberry32(41), clusterSizes),
    ring(count, mulberry32(59)),
  ];
}
