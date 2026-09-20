"use client";

import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { HERO_LAYERS, HERO_SCENE, type HeroLayer } from "@/components/portfolio/hero-system/layers";

type SceneColors = {
  layer: THREE.Color;
  highlight: THREE.Color;
  edge: THREE.Color;
  accent: THREE.Color;
  mark: THREE.Color;
  ground: THREE.Color;
};

function colorFromToken(name: string, fallback: [number, number, number]) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const match = raw.match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  const [h, s, l] = match
    ? [Number(match[1]) / 360, Number(match[2]) / 100, Number(match[3]) / 100]
    : fallback;
  return new THREE.Color().setHSL(h, s, l, THREE.SRGBColorSpace);
}

function useSceneColors(): SceneColors {
  return React.useMemo(() => ({
    layer: colorFromToken("--hero-system-layer", [0.07, 0.08, 0.13]),
    highlight: colorFromToken("--hero-system-layer-highlight", [0.07, 0.08, 0.21]),
    edge: colorFromToken("--hero-system-edge", [0.07, 0.05, 0.48]),
    accent: colorFromToken("--hero-system-accent", [0.71, 1, 0.75]),
    mark: colorFromToken("--hero-system-mark", [0.07, 0.05, 0.72]),
    ground: colorFromToken("--canvas", [0.05, 0.12, 0.04]),
  }), []);
}

function roundedSlabGeometry() {
  const { width, depth, height, cornerRadius: radius } = HERO_SCENE;
  const shape = new THREE.Shape();
  const left = -width / 2;
  const top = -depth / 2;

  shape.moveTo(left + radius, top);
  shape.lineTo(left + width - radius, top);
  shape.quadraticCurveTo(left + width, top, left + width, top + radius);
  shape.lineTo(left + width, top + depth - radius);
  shape.quadraticCurveTo(left + width, top + depth, left + width - radius, top + depth);
  shape.lineTo(left + radius, top + depth);
  shape.quadraticCurveTo(left, top + depth, left, top + depth - radius);
  shape.lineTo(left, top + radius);
  shape.quadraticCurveTo(left, top, left + radius, top);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.055,
    bevelThickness: 0.055,
    curveSegments: 5,
    steps: 1,
  });
  geometry.center();
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function LineMark({ from, to, y = 0.12, color, opacity = 1 }: {
  from: [number, number];
  to: [number, number];
  y?: number;
  color: THREE.Color;
  opacity?: number;
}) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const length = Math.hypot(dx, dz);
  const angle = Math.atan2(dz, dx);
  return (
    <mesh position={[(from[0] + to[0]) / 2, y, (from[1] + to[1]) / 2]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[length, 0.018, 0.018]} />
      <meshBasicMaterial color={color} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
}

function InterfacePlate({ geometry, edgeGeometry, colors }: {
  geometry: THREE.BufferGeometry;
  edgeGeometry: THREE.BufferGeometry;
  colors: SceneColors;
}) {
  return (
    <group>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color={colors.layer} roughness={0.38} metalness={0.42} />
      </mesh>
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial color={colors.edge} transparent opacity={0.72} />
      </lineSegments>
      <mesh position={[0, -0.185, 0]}>
        <boxGeometry args={[HERO_SCENE.width - 0.08, 0.035, HERO_SCENE.depth - 0.08]} />
        <meshStandardMaterial color={colors.accent} emissive={colors.accent} emissiveIntensity={0.72} />
      </mesh>
      <mesh position={[-0.72, 0.207, -0.42]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.195, 32]} />
        <meshBasicMaterial color={colors.mark} />
      </mesh>
      <LineMark from={[-1, 0.1]} to={[-0.25, 0.1]} y={0.205} color={colors.accent} />
      <LineMark from={[-1, 0.35]} to={[-0.45, 0.35]} y={0.205} color={colors.mark} />
      <LineMark from={[0.05, -0.42]} to={[0.95, -0.42]} y={0.205} color={colors.mark} />
      <LineMark from={[0.05, -0.16]} to={[0.72, -0.16]} y={0.205} color={colors.mark} />
      <mesh position={[0.86, 0.21, 0.43]}>
        <boxGeometry args={[0.42, 0.04, 0.22]} />
        <meshBasicMaterial color={colors.accent} />
      </mesh>
    </group>
  );
}

const DECISION_NODES: readonly [number, number][] = [
  [-0.85, -0.42], [-0.2, -0.1], [0.52, -0.42], [-0.78, 0.43], [0.12, 0.52], [0.87, 0.22],
];

function DecisionFramework({ colors }: { colors: SceneColors }) {
  return (
    <group>
      {[-0.92, 0.92].map((z) => (
        <mesh key={`rail-z-${z}`} position={[0, 0, z]} castShadow>
          <boxGeometry args={[3.05, 0.18, 0.12]} />
          <meshStandardMaterial color={colors.highlight} roughness={0.5} metalness={0.34} />
        </mesh>
      ))}
      {[-1.46, 1.46].map((x) => (
        <mesh key={`rail-x-${x}`} position={[x, 0, 0]} castShadow>
          <boxGeometry args={[0.12, 0.18, 1.72]} />
          <meshStandardMaterial color={colors.highlight} roughness={0.5} metalness={0.34} />
        </mesh>
      ))}
      <LineMark from={DECISION_NODES[0]} to={DECISION_NODES[1]} color={colors.mark} />
      <LineMark from={DECISION_NODES[1]} to={DECISION_NODES[2]} color={colors.mark} />
      <LineMark from={DECISION_NODES[1]} to={DECISION_NODES[3]} color={colors.mark} />
      <LineMark from={DECISION_NODES[1]} to={DECISION_NODES[4]} color={colors.accent} />
      <LineMark from={DECISION_NODES[4]} to={DECISION_NODES[5]} color={colors.mark} />
      {DECISION_NODES.map(([x, z], index) => (
        <mesh key={`${x}-${z}`} position={[x, 0.135, z]}>
          <boxGeometry args={[index === 1 ? 0.34 : 0.22, 0.06, 0.18]} />
          <meshStandardMaterial color={index === 1 ? colors.accent : colors.layer} emissive={colors.accent} emissiveIntensity={index === 1 ? 0.45 : 0.04} />
        </mesh>
      ))}
    </group>
  );
}

const SYSTEM_NODES: readonly [number, number][] = [
  [-1.05, -0.44], [-0.52, 0.02], [0, -0.28], [0.52, 0.12], [1.02, -0.34], [0.05, 0.54],
];

function SystemNetwork({ colors }: { colors: SceneColors }) {
  return (
    <group>
      <mesh position={[0, -0.02, 0]} castShadow>
        <cylinderGeometry args={[0.46, 0.58, 0.16, 6]} />
        <meshStandardMaterial color={colors.layer} roughness={0.48} metalness={0.4} />
      </mesh>
      {SYSTEM_NODES.slice(0, -1).map((node, index) => (
        <LineMark key={`path-${index}`} from={node} to={SYSTEM_NODES[index + 1]} y={0.1} color={colors.mark} opacity={0.8} />
      ))}
      <LineMark from={SYSTEM_NODES[1]} to={SYSTEM_NODES[5]} y={0.1} color={colors.accent} opacity={0.9} />
      <LineMark from={SYSTEM_NODES[5]} to={SYSTEM_NODES[3]} y={0.1} color={colors.mark} opacity={0.8} />
      {SYSTEM_NODES.map(([x, z], index) => (
        <mesh key={`${x}-${z}`} position={[x, 0.13, z]} castShadow>
          <sphereGeometry args={[index === 5 ? 0.105 : 0.08, 18, 12]} />
          <meshStandardMaterial color={index % 2 === 0 ? colors.accent : colors.mark} emissive={colors.accent} emissiveIntensity={index % 2 === 0 ? 0.48 : 0.08} />
        </mesh>
      ))}
    </group>
  );
}

function LayerObject({ layer, geometry, edgeGeometry, colors }: {
  layer: HeroLayer;
  geometry: THREE.BufferGeometry;
  edgeGeometry: THREE.BufferGeometry;
  colors: SceneColors;
}) {
  if (layer.id === "interface") {
    return <InterfacePlate geometry={geometry} edgeGeometry={edgeGeometry} colors={colors} />;
  }
  if (layer.id === "decisions") return <DecisionFramework colors={colors} />;
  return <SystemNetwork colors={colors} />;
}

function Sculpture({ expanded }: { expanded: boolean }) {
  const root = React.useRef<THREE.Group>(null);
  const layerRefs = React.useRef<Array<THREE.Group | null>>([]);
  const progress = React.useRef(0);
  const colors = useSceneColors();
  const geometry = React.useMemo(() => roundedSlabGeometry(), []);
  const edgeGeometry = React.useMemo(() => new THREE.EdgesGeometry(geometry, 28), [geometry]);
  const { invalidate } = useThree();

  React.useEffect(() => {
    invalidate();
  }, [expanded, invalidate]);

  React.useEffect(() => {
    const onVisibility = () => {
      if (!document.hidden) invalidate();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [invalidate]);

  React.useEffect(() => () => {
    geometry.dispose();
    edgeGeometry.dispose();
  }, [edgeGeometry, geometry]);

  useFrame((_, delta) => {
    if (document.hidden) return;
    const target = expanded ? 1 : HERO_SCENE.restProgress;
    progress.current = THREE.MathUtils.damp(progress.current, target, HERO_SCENE.damping, Math.min(delta, 0.05));
    if (Math.abs(progress.current - target) < HERO_SCENE.settleThreshold) progress.current = target;
    const eased = progress.current * progress.current * (3 - 2 * progress.current);

    HERO_LAYERS.forEach((layer, index) => {
      const group = layerRefs.current[index];
      if (!group) return;
      group.position.x = layer.expandedX * eased;
      group.position.y = THREE.MathUtils.lerp(layer.assembledY, layer.expandedY, eased);
      group.rotation.y = layer.rotation * eased;
    });
    if (root.current) root.current.rotation.z = THREE.MathUtils.lerp(-0.018, 0.018, eased);
    if (progress.current !== target) invalidate();
  });

  return (
    <group ref={root} rotation={[0.02, -0.46, 0]} position={[0, 0.02, 0]}>
      {HERO_LAYERS.map((layer, index) => (
        <group key={layer.id} ref={(node) => { layerRefs.current[index] = node; }} position={[0, layer.assembledY, 0]}>
          <LayerObject layer={layer} geometry={geometry} edgeGeometry={edgeGeometry} colors={colors} />
        </group>
      ))}
      {[-1.05, 1.08].map((x) => (
        <mesh key={x} position={[x, 0, 0.08]}>
          <cylinderGeometry args={[0.012, 0.012, 2.72, 8]} />
          <meshBasicMaterial color={colors.accent} transparent opacity={0.2} />
        </mesh>
      ))}
      <mesh position={[0.1, -1.64, 0.12]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.15, 48]} />
        <meshStandardMaterial color={colors.ground} transparent opacity={0.22} roughness={1} />
      </mesh>
    </group>
  );
}

function SceneLifecycle({ onReady, onContextLost }: { onReady: () => void; onContextLost: () => void }) {
  const { gl, invalidate } = useThree();

  React.useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", onContextLost);
    invalidate();
    const readyFrame = requestAnimationFrame(onReady);
    return () => {
      cancelAnimationFrame(readyFrame);
      canvas.removeEventListener("webglcontextlost", onContextLost);
    };
  }, [gl, invalidate, onContextLost, onReady]);

  return null;
}

function SceneContents({ expanded, onReady, onContextLost }: {
  expanded: boolean;
  onReady: () => void;
  onContextLost: () => void;
}) {
  const colors = useSceneColors();
  return (
    <>
      <SceneLifecycle onReady={onReady} onContextLost={onContextLost} />
      <ambientLight intensity={1.32} />
      <directionalLight position={[4, 7, 5]} intensity={2.55} castShadow shadow-mapSize={[512, 512]} />
      <directionalLight position={[-5, 2, -3]} intensity={0.82} color={colors.accent} />
      <Sculpture expanded={expanded} />
    </>
  );
}

function HeroScene({ expanded, onReady, onContextLost }: {
  expanded: boolean;
  onReady: () => void;
  onContextLost: () => void;
}) {
  return (
    <Canvas
      aria-hidden="true"
      frameloop="demand"
      dpr={[1, 1.5]}
      orthographic
      shadows="basic"
      camera={{ position: [5.3, 4.6, 6.1], zoom: 70, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <SceneContents expanded={expanded} onReady={onReady} onContextLost={onContextLost} />
    </Canvas>
  );
}

export { HeroScene };
export default HeroScene;
