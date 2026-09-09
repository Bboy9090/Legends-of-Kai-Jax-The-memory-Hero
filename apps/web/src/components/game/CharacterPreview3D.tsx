import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import SceneEnvironment from "./graphics/SceneEnvironment";
import { Suspense, useEffect, useRef, useState } from "react";
import { Fighter } from "../../lib/characters";
import AnatomicalBeastModel from "./models/AnatomicalBeastModel";
import { Group } from "three";
import type { BeastPresetKind } from "../../lib/stores/useBeastPreset";
import * as THREE from "three";
import CinematicPostFX from "./graphics/CinematicPostFX";
import { LegendaryLightingRig } from "./graphics/LegendaryGraphicsSystem";
import { getQualitySettings } from "../../lib/threejs/PerformanceOptimizer";
import { getModelPath } from "../../assets/modelRegistry";
import {
  ProductionCharacterVisual,
  type ProductionStoryHeroId,
} from "./characters/ProductionCharacterVisual";

interface CharacterPreview3DProps {
  fighter: Fighter;
  preset?: BeastPresetKind;
}

type ModelStatus = "procedural" | "loading" | "ready";

export default function CharacterPreview3D({ fighter, preset = "auto" }: CharacterPreview3DProps) {
  const bodyRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const productionHeroId: ProductionStoryHeroId | null =
    fighter.id === "kai" || fighter.id === "jax" ? fighter.id : null;
  const modelPath = productionHeroId ? getModelPath(productionHeroId) : null;
  const [modelStatus, setModelStatus] = useState<ModelStatus>(
    productionHeroId ? "loading" : "procedural"
  );

  useEffect(() => {
    setModelStatus(productionHeroId ? "loading" : "procedural");
  }, [productionHeroId, modelPath]);

  const renderCharacterModel = () => {
    if (productionHeroId) {
      return (
        <ProductionCharacterVisual
          key={productionHeroId}
          fighterId={productionHeroId}
          onReady={() => setModelStatus("ready")}
        />
      );
    }

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
    <div
      className="w-full h-full"
      data-testid="character-preview-3d"
      data-model-source={productionHeroId ? "production-gltf" : "procedural"}
      data-model-status={modelStatus}
      data-model-fighter={productionHeroId ?? fighter.id}
      data-model-path={modelPath ?? ""}
    >
      <Canvas
        camera={{
          position: [0, 1.5, 4],
          fov: 50
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
        <SceneEnvironment mode="sunset" />
        <CinematicPostFX
          grade={fighter.id === "kai-jax" ? "cosmic" : fighter.id === "jax" || fighter.id === "jaxon" ? "ice" : fighter.id === "kai" || fighter.id === "kaison" ? "ember" : "neutral"}
          accent={fighter.accentColor || "#00f2ff"}
          punch={fighter.id === "kai-jax" ? 0.35 : 0.18}
          center={[0.5, 0.44]}
        />
        
        <Suspense fallback={null}>
          <group position={[0, -1, 0]}>
            {renderCharacterModel()}
          </group>
          
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
