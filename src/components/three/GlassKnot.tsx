"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { activeSectionStore, bootStore } from "@/lib/store";
import { pointer, scrollState } from "@/lib/scene";
import type { Theme } from "@/lib/theme";

const TINT: Record<Theme, { bg: string; color: string; attenuation: string }> = {
  light: { bg: "#ece5d8", color: "#ffffff", attenuation: "#dfe3ff" },
  dark: { bg: "#0e0d0b", color: "#d8dcff", attenuation: "#8e9bff" },
};

/**
 * Refractive glass torus-knot that floats in the hero.
 * Hidden (material.visible = false) outside the hero so its extra render pass is skipped.
 */
export default function GlassKnot({ theme }: { theme: Theme }) {
  const wrapRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const shown = useRef({ value: 0 });

  const background = useMemo(() => new THREE.Color(TINT[theme].bg), [theme]);

  useEffect(() => {
    const target = shown.current;
    const update = () => {
      const visible = bootStore.get() && activeSectionStore.get() === 0;
      gsap.to(target, {
        value: visible ? 1 : 0,
        duration: visible ? 1.8 : 0.9,
        delay: visible && target.value === 0 ? 0.35 : 0,
        ease: visible ? "expo.out" : "power3.in",
        overwrite: true,
      });
    };
    update();
    const a = bootStore.subscribe(update);
    const b = activeSectionStore.subscribe(update);
    return () => {
      a();
      b();
    };
  }, []);

  useFrame((state, delta) => {
    const wrap = wrapRef.current;
    const mesh = meshRef.current;
    if (!wrap || !mesh) return;
    const dt = Math.min(delta, 1 / 20);
    const s = shown.current.value;
    const material = mesh.material as THREE.Material;
    material.visible = s > 0.001;
    if (!material.visible) return;

    const vel = Math.min(Math.abs(scrollState.velocity) / 30, 2);
    mesh.rotation.x += dt * (0.18 + vel * 0.6);
    mesh.rotation.y += dt * (0.26 + vel * 0.8);

    const scrollOut = Math.min(scrollState.y / window.innerHeight, 1.5);
    wrap.scale.setScalar(0.5 * s * (1 - scrollOut * 0.25));
    wrap.position.x = THREE.MathUtils.damp(wrap.position.x, 1.75 + pointer.x * 0.25, 2.5, dt);
    wrap.position.y = THREE.MathUtils.damp(
      wrap.position.y,
      0.15 + pointer.y * 0.2 + scrollOut * 2.4 + Math.sin(state.clock.elapsedTime * 0.8) * 0.06,
      3,
      dt,
    );
    wrap.rotation.z = scrollOut * 0.9;
  });

  const tint = TINT[theme];

  return (
    <>
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[8, 2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} color="#2b3bff" />
        <Lightformer form="rect" intensity={2} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} color="#4fe3c9" />
        <Lightformer form="ring" intensity={1.5} position={[0, -3, 4]} scale={3} color="#ff7a45" />
      </Environment>
      <group ref={wrapRef} position={[1.75, 0.15, 1.3]} scale={0}>
        <mesh ref={meshRef}>
          <torusKnotGeometry args={[1, 0.3, 280, 40, 2, 3]} />
          <MeshTransmissionMaterial
            background={background}
            backside
            backsideThickness={0.35}
            samples={6}
            resolution={640}
            transmission={1}
            thickness={1}
            roughness={0.05}
            ior={1.38}
            chromaticAberration={0.45}
            anisotropy={0.25}
            distortion={0.25}
            distortionScale={0.35}
            temporalDistortion={0.08}
            clearcoat={1}
            attenuationDistance={2.2}
            attenuationColor={tint.attenuation}
            color={tint.color}
          />
        </mesh>
      </group>
    </>
  );
}
