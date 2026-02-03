import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { Fighter } from "../../lib/characters";
import AnatomicalBeastModel from "./models/AnatomicalBeastModel";
import { Group } from "three";
import type { BeastPresetKind } from "../../lib/stores/useBeastPreset";
import * as THREE from "three";
import CinematicPostFX from "./graphics/CinematicPostFX";
import { LegendaryLightingRig } from "./graphics/LegendaryGraphicsSystem";
import { getQualitySettings } from "../../lib/threejs/PerformanceOptimizer";

interface CharacterPreview3DProps {
  fighter: Fighter;
  preset?: BeastPresetKind;
}

export default function CharacterPreview3D({ fighter, preset = "auto" }: CharacterPreview3DProps) {
  const bodyRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);

  const renderCharacterModel = () => {
    const modelProps = {
      fighter,
      bodyRef,
      headRef,
      leftArmRef,
      rightArmRef,
      leftLegRef,
      rightLegRef,
      emotionIntensity: 0.5,
      hitAnim: 0,
      animTime: 0,
      isAttacking: false,
      isInvulnerable: false,
      presetOverride: preset === "auto" ? null : preset
    };

    return <AnatomicalBeastModel {...modelProps} />;
  };

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          // Backed up so larger fighters fit in frame
          position: [0, 1.65, 6.4],
          fov: 42
        }}
        shadows
        onCreated={({ gl }) => {
          const q = getQualitySettings();
          gl.setPixelRatio(q.pixelRatio);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = q.shadowMap.type;
        }}
        gl={{ antialias: getQualitySettings().antialias, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#0b0b12"]} />

        <LegendaryLightingRig />
        <Environment preset="sunset" />
        <CinematicPostFX
          grade={fighter.id === "kai-jax" ? "cosmic" : fighter.id === "jaxon" ? "ice" : fighter.id === "kaison" ? "ember" : "neutral"}
          accent={fighter.accentColor || "#00f2ff"}
          punch={fighter.id === "kai-jax" ? 0.35 : 0.18}
          center={[0.5, 0.44]}
        />
        
        <Suspense fallback={null}>
          <group position={[0, -1, 0]}>
            {renderCharacterModel()}
          </group>
          
          {/* Ground shadow plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.7, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <shadowMaterial opacity={0.3} />
          </mesh>
          
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
