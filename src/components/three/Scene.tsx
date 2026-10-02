"use client";

import { Component, useMemo, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { skillGroups } from "@/lib/derive";
import { useTheme } from "@/lib/theme";
import LatentField from "./LatentField";
import GlassKnot from "./GlassKnot";

/** WebGL is decoration: if it fails, the page still works. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Scene() {
  const theme = useTheme();
  const [mobile] = useState(
    () => window.matchMedia("(max-width: 767px), (pointer: coarse)").matches,
  );
  const clusterSizes = useMemo(() => skillGroups.map((g) => g.items.length), []);

  return (
    <SceneBoundary>
      <Canvas
        aria-hidden
        dpr={[1, mobile ? 1.5 : 1.75]}
        camera={{ position: [0, 0, 6.5], fov: 42, near: 0.1, far: 40 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
      >
        <LatentField count={mobile ? 4200 : 9000} clusterSizes={clusterSizes} mobile={mobile} />
        {!mobile && <GlassKnot theme={theme} />}
      </Canvas>
    </SceneBoundary>
  );
}
