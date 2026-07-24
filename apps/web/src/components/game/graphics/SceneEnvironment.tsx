/**
 * SceneEnvironment — offline-safe image-based lighting.
 *
 * Replaces drei's `<Environment preset="...">`, which fetches an HDR map from a
 * CDN (breaks offline and adds network flakiness). This bakes an equivalent
 * environment in-engine from Lightformers — no remote assets — so PBR
 * reflections/ambience still work with zero network access.
 *
 * `mode` approximates the two presets the game used:
 *   - "sunset": warm key + amber fill (menus, previews)
 *   - "night":  cool key + deep-blue ambience (battle, world)
 */

import { Environment, Lightformer } from "@react-three/drei";

export type SceneEnvironmentMode = "sunset" | "night";

interface SceneEnvironmentProps {
  mode?: SceneEnvironmentMode;
  /** Passed through to <Environment> (e.g. battle uses a lower intensity). */
  environmentIntensity?: number;
}

export default function SceneEnvironment({
  mode = "sunset",
  environmentIntensity,
}: SceneEnvironmentProps) {
  const warm = mode === "sunset";

  return (
    <Environment
      resolution={256}
      frames={1}
      environmentIntensity={environmentIntensity}
    >
      {/* Sky / ambient dome */}
      <Lightformer
        form="rect"
        intensity={warm ? 1.2 : 0.7}
        color={warm ? "#ffe0b0" : "#1a2450"}
        position={[0, 6, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[20, 20, 1]}
      />
      {/* Key light */}
      <Lightformer
        form="rect"
        intensity={warm ? 2.2 : 1.4}
        color={warm ? "#ffd8a0" : "#89b4ff"}
        position={[6, 5, -4]}
        scale={[10, 10, 1]}
      />
      {/* Warm/cool fill from the opposite side */}
      <Lightformer
        form="rect"
        intensity={warm ? 1.0 : 0.6}
        color={warm ? "#ff9e64" : "#33407a"}
        position={[-6, 2, 3]}
        scale={[8, 8, 1]}
      />
      {/* Ground bounce */}
      <Lightformer
        form="rect"
        intensity={warm ? 0.7 : 0.4}
        color={warm ? "#4a2c5a" : "#0b1030"}
        position={[0, -4, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[20, 20, 1]}
      />
    </Environment>
  );
}
