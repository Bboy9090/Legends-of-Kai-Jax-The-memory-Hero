import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { HeroAttachment } from "../../lib/heroVisualIdentity";
import type { BossWeaponKind } from "../../lib/bossPhases";

interface AuraProps {
  color: string;
  accent?: string;
  intensity?: number;
  radius?: number;
  /** Bursts the aura brighter for a moment, e.g. a boss phase-transition roar. */
  pulse?: number;
}

/** Rotating additive rings, rising sparks and a coloured point light around a character. */
export function Aura3D({ color, accent, intensity = 1, radius = 1.2, pulse = 0 }: AuraProps) {
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (ringA.current) { ringA.current.rotation.y += delta * 0.9; ringA.current.position.y = 0.2 + (Math.sin(t * 1.4) + 1) * 0.1; }
    if (ringB.current) { ringB.current.rotation.y -= delta * 0.6; ringB.current.position.y = 1.1 + (Math.sin(t * 1.1 + 1) + 1) * 0.12; }
    if (light.current) light.current.intensity = (1.2 + Math.sin(t * 3) * 0.3 + pulse * 3) * intensity;
  });

  const additive = { transparent: true, blending: THREE.AdditiveBlending, depthWrite: false } as const;
  return (
    <group>
      <mesh ref={ringA} rotation={[Math.PI / 2 - 0.5, 0, 0]}>
        <torusGeometry args={[radius, 0.03, 8, 64]} />
        <meshBasicMaterial color={color} opacity={0.65 * intensity} {...additive} />
      </mesh>
      <mesh ref={ringB} rotation={[Math.PI / 2 - 0.35, 0.3, 0]}>
        <torusGeometry args={[radius * 0.78, 0.022, 8, 64]} />
        <meshBasicMaterial color={accent ?? color} opacity={0.55 * intensity} {...additive} />
      </mesh>
      <Sparkles count={Math.round(24 * intensity)} scale={[radius * 2, 2.6, radius * 2]} position={[0, 1.2, 0]} size={3} speed={0.6} color={accent ?? color} />
      <pointLight ref={light} position={[0, 1.3, 0.6]} color={color} distance={7} decay={2} />
    </group>
  );
}

const ATTACHMENT_KIND: Record<HeroAttachment, "blade" | "orb" | "ring" | "claws" | "shield" | "staff"> = {
  spiderLimbs: "claws", stormTails: "blade", fusionTails: "orb", webBlades: "blade", hourglass: "orb", voltClaws: "claws",
  tower: "shield", scales: "staff", prophecyScroll: "staff", timeRing: "ring", moonThreads: "ring", sealRing: "ring",
  vines: "staff", emberSpark: "orb", burrowClaws: "claws", shadeBlade: "blade",
};

interface AttachmentProps {
  kind: HeroAttachment | BossWeaponKind;
  color: string;
  /** Local position, normally beside the character's weapon hand. */
  position?: [number, number, number];
  scale?: number;
}

/** Signature glowing attachment (weapon / focus) rendered with simple emissive primitives. */
export function GlowAttachment({ kind, color, position = [0.75, 1.1, 0.2], scale = 1 }: AttachmentProps) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.8;
  });
  const shape = (kind in ATTACHMENT_KIND ? ATTACHMENT_KIND[kind as HeroAttachment] : kind === "mace" ? "mace" : kind) as string;
  const mat = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} roughness={0.35} metalness={0.4} />;
  if (shape === "none") return null;

  return (
    <group ref={ref} position={position} scale={scale}>
      {shape === "blade" && <mesh rotation={[0, 0, 0.25]}><boxGeometry args={[0.06, 1.3, 0.12]} />{mat}</mesh>}
      {shape === "orb" && <mesh><icosahedronGeometry args={[0.2, 1]} />{mat}</mesh>}
      {shape === "ring" && <mesh rotation={[Math.PI / 2.4, 0, 0]}><torusGeometry args={[0.32, 0.045, 12, 40]} />{mat}</mesh>}
      {shape === "claws" && [-0.12, 0, 0.12].map((x) => <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.05, 0.5, 6]} />{mat}</mesh>)}
      {shape === "shield" && <mesh><boxGeometry args={[0.55, 0.85, 0.08]} />{mat}</mesh>}
      {shape === "staff" && <mesh><cylinderGeometry args={[0.04, 0.04, 1.4, 8]} />{mat}</mesh>}
      {shape === "mace" && <group><mesh><cylinderGeometry args={[0.05, 0.05, 1.1, 8]} />{mat}</mesh><mesh position={[0, 0.65, 0]}><icosahedronGeometry args={[0.24, 1]} />{mat}</mesh></group>}
      <pointLight color={color} intensity={1.2} distance={3} decay={2} />
    </group>
  );
}
