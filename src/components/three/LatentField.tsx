"use client";
/* eslint-disable react-hooks/immutability -- three.js objects are mutated every frame by design (R3F useFrame idiom) */

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { activeSectionStore } from "@/lib/store";
import { SECTIONS } from "@/lib/sections";
import { pointer, scrollState } from "@/lib/scene";
import { getTheme, subscribeTheme, type Theme } from "@/lib/theme";
import { buildShapes, mulberry32 } from "./shapes";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uMouse;
  uniform float uMouseForce;
  uniform float uVelocity;
  attribute vec3 aTo;
  attribute vec3 aSeed;
  varying float vColor;
  varying float vAlpha;

  void main() {
    // per-particle staggered morph, eased
    float k = clamp(uProgress * 1.4 - aSeed.y * 0.4, 0.0, 1.0);
    k = k * k * (3.0 - 2.0 * k);
    vec3 p = mix(position, aTo, k);
    // particles swell outward mid-flight, then settle
    p += normalize(p + 1e-4) * sin(k * 3.14159) * 0.38 * aSeed.x;

    // idle drift, amplified by scroll velocity
    float t = uTime * 0.35 + aSeed.y * 6.2831;
    p += vec3(sin(t + p.y * 1.7), cos(t * 0.9 + p.x * 1.3), sin(t * 1.1 + p.z * 1.5)) * (0.022 + uVelocity * 0.09);

    vec4 world = modelMatrix * vec4(p, 1.0);

    // pointer repulsion in world space
    vec2 d = world.xy - uMouse.xy;
    float dist = length(d);
    float f = smoothstep(1.15, 0.0, dist) * uMouseForce;
    world.xy += normalize(d + 1e-4) * f * 0.5;
    world.z += f * 0.35;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;

    float size = uSize * (0.35 + aSeed.x * 0.95) * (1.0 + f * 1.1);
    gl_PointSize = size * uPixelRatio * (1.0 / -mv.z);

    vColor = aSeed.z;
    vAlpha = (0.35 + 0.65 * aSeed.x) * mix(1.0, 0.4, smoothstep(5.5, 9.5, -mv.z));
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uOpacity;
  uniform float uDim;
  varying float vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.12, d);
    vec3 col = vColor < 0.62 ? uColorA : (vColor < 0.955 ? uColorB : uColorC);
    gl_FragColor = vec4(col, a * vAlpha * uOpacity * uDim);
    #include <colorspace_fragment>
  }
`;

const PALETTE: Record<Theme, { a: string; b: string; c: string; opacity: number; blending: THREE.Blending }> = {
  light: { a: "#1b1813", b: "#2b3bff", c: "#ff5a1f", opacity: 0.8, blending: THREE.NormalBlending },
  dark: { a: "#ede5d6", b: "#8e9bff", c: "#4fe3c9", opacity: 0.95, blending: THREE.AdditiveBlending },
};

/** idle motion per formation */
const SPIN = [
  { axis: "y", speed: 0.07 },
  { axis: "x", speed: 0.16 },
  { axis: "sway", speed: 0 },
  { axis: "y", speed: 0.06 },
  { axis: "y", speed: 0.1 },
] as const;

const TAU = Math.PI * 2;
// scratch vectors for the per-frame pointer raycast
const ndc = new THREE.Vector3();
const hit = new THREE.Vector3();
const nearestTurn = (a: number) => Math.round(a / TAU) * TAU;

interface Props {
  count: number;
  clusterSizes: number[];
  mobile: boolean;
}

export default function LatentField({ count, clusterSizes, mobile }: Props) {
  const layoutRef = useRef<THREE.Group>(null);
  const tiltRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);
  const shapeRef = useRef(0);
  const spinLock = useRef(false);
  const camera = useThree((s) => s.camera);
  const height = useThree((s) => s.size.height);
  const dpr = useThree((s) => s.viewport.dpr);

  const shapes = useMemo(() => buildShapes(count, clusterSizes), [count, clusterSizes]);

  const { geometry, material } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(shapes[0].slice(), 3));
    g.setAttribute("aTo", new THREE.BufferAttribute(shapes[0].slice(), 3));
    const seeds = new Float32Array(count * 3);
    const rand = mulberry32(7);
    for (let i = 0; i < seeds.length; i++) seeds[i] = rand();
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 3));

    const m = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 1 },
        uSize: { value: 24 },
        uPixelRatio: { value: 1 },
        uMouse: { value: new THREE.Vector3(99, 99, 0) },
        uMouseForce: { value: 0 },
        uVelocity: { value: 0 },
        uColorA: { value: new THREE.Color() },
        uColorB: { value: new THREE.Color() },
        uColorC: { value: new THREE.Color() },
        uOpacity: { value: 0 },
        uDim: { value: 1 },
      },
    });
    return { geometry: g, material: m };
  }, [shapes, count]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  // Point size tracks viewport height so density reads the same on every screen.
  useEffect(() => {
    const m = pointsRef.current?.material;
    if (!m) return;
    m.uniforms.uSize.value = (mobile ? 30 : 24) * Math.min(Math.max(height / 900, 0.7), 1.4);
    m.uniforms.uPixelRatio.value = dpr;
  }, [height, dpr, material, mobile]);

  // Theme → palette + blending
  useEffect(() => {
    const apply = () => {
      const m = pointsRef.current?.material;
      if (!m) return;
      const p = PALETTE[getTheme()];
      const u = m.uniforms;
      u.uColorA.value.set(p.a);
      u.uColorB.value.set(p.b);
      u.uColorC.value.set(p.c);
      m.blending = p.blending;
      m.needsUpdate = true;
      gsap.to(u.uOpacity, { value: p.opacity, duration: 1.2, ease: "power2.out" });
    };
    apply();
    return subscribeTheme(apply);
  }, [material]);

  // Section → formation + placement. Morphs start from the on-screen (presentation) positions.
  useEffect(() => {
    const points = pointsRef.current;
    if (!points) return;
    const posAttr = points.geometry.getAttribute("position") as THREE.BufferAttribute;
    const toAttr = points.geometry.getAttribute("aTo") as THREE.BufferAttribute;
    const seeds = (points.geometry.getAttribute("aSeed") as THREE.BufferAttribute).array as Float32Array;
    const progress = points.material.uniforms.uProgress;

    const morphTo = (shape: number) => {
      const from = posAttr.array as Float32Array;
      const to = toAttr.array as Float32Array;
      const t = progress.value;
      for (let i = 0; i < count; i++) {
        let k = t * 1.4 - seeds[i * 3 + 1] * 0.4;
        k = k < 0 ? 0 : k > 1 ? 1 : k;
        k = k * k * (3 - 2 * k);
        const j = i * 3;
        const x = from[j] + (to[j] - from[j]) * k;
        const y = from[j + 1] + (to[j + 1] - from[j + 1]) * k;
        const z = from[j + 2] + (to[j + 2] - from[j + 2]) * k;
        const len = Math.hypot(x, y, z) || 1;
        const swell = Math.sin(k * Math.PI) * 0.38 * seeds[j];
        from[j] = x + (x / len) * swell;
        from[j + 1] = y + (y / len) * swell;
        from[j + 2] = z + (z / len) * swell;
      }
      to.set(shapes[shape]);
      posAttr.needsUpdate = true;
      toAttr.needsUpdate = true;
      gsap.killTweensOf(progress);
      progress.value = 0;
      gsap.to(progress, { value: 1, duration: 2.4, ease: "power2.inOut" });

      const spin = spinRef.current;
      if (spin) {
        spinLock.current = true;
        gsap.to(spin.rotation, {
          x: nearestTurn(spin.rotation.x),
          y: nearestTurn(spin.rotation.y),
          z: 0,
          duration: 2.2,
          ease: "power2.inOut",
          overwrite: true,
          onComplete: () => {
            spinLock.current = false;
          },
        });
      }
      shapeRef.current = shape;
    };

    const apply = () => {
      const s = SECTIONS[activeSectionStore.get()] ?? SECTIONS[0];
      if (s.shape !== shapeRef.current) morphTo(s.shape);
      const layout = layoutRef.current;
      if (!layout) return;
      const x = mobile ? 0 : s.x;
      const y = mobile ? s.y * 0.5 + 0.3 : s.y;
      const scale = mobile ? s.scale * 0.72 : s.scale;
      gsap.to(layout.position, { x, y, duration: 2.2, ease: "power3.inOut", overwrite: true });
      gsap.to(layout.scale, { x: scale, y: scale, z: scale, duration: 2.2, ease: "power3.inOut", overwrite: true });
      gsap.to(points.material.uniforms.uDim, { value: (s.dim ?? 1) * (mobile ? 0.5 : 1), duration: 1.4, ease: "power2.inOut", overwrite: true });
    };

    apply();
    return activeSectionStore.subscribe(apply);
  }, [geometry, material, shapes, count, mobile]);

  useFrame((state, delta) => {
    const m = pointsRef.current?.material;
    if (!m) return;
    const u = m.uniforms;
    const dt = Math.min(delta, 1 / 20);
    u.uTime.value += dt;

    // pointer → point on z=0 plane
    ndc.set(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
    const dist = -camera.position.z / ndc.z;
    hit.copy(camera.position).addScaledVector(ndc, dist);
    u.uMouse.value.lerp(hit, 1 - Math.exp(-dt * 7));
    u.uMouseForce.value = THREE.MathUtils.damp(u.uMouseForce.value, pointer.active ? 1 : 0, 3, dt);

    const vel = Math.min(Math.abs(scrollState.velocity) / 35, 1.4);
    u.uVelocity.value = THREE.MathUtils.damp(u.uVelocity.value, vel, 4, dt);

    const tilt = tiltRef.current;
    if (tilt) {
      tilt.rotation.x = THREE.MathUtils.damp(tilt.rotation.x, -pointer.y * 0.16, 2.5, dt);
      tilt.rotation.y = THREE.MathUtils.damp(tilt.rotation.y, pointer.x * 0.22, 2.5, dt);
    }

    const spin = spinRef.current;
    if (spin && !spinLock.current) {
      const cfg = SPIN[shapeRef.current];
      const boost = 1 + u.uVelocity.value * 2.5;
      if (cfg.axis === "x") spin.rotation.x += dt * cfg.speed * boost;
      else if (cfg.axis === "y") spin.rotation.y += dt * cfg.speed * boost;
      else spin.rotation.y = THREE.MathUtils.damp(spin.rotation.y, Math.sin(state.clock.elapsedTime * 0.25) * 0.16, 2, dt);
    }
  });

  return (
    <group ref={layoutRef}>
      <group ref={tiltRef}>
        <group ref={spinRef}>
          <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />
        </group>
      </group>
    </group>
  );
}
