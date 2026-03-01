/**
 * Routes to Sovereignty (clip-based) or Procedural model based on GLB contents.
 */

import { useGLTF } from "@react-three/drei";
import { hasSovereigntyClips } from "./SovereigntyModelInner";
import SovereigntyModelInner from "./SovereigntyModelInner";
import type { GLBModelConfig } from "./GLBCharacterModel";
import type { SovereigntyInput } from "./SovereigntyModelInner";

interface ModelRouterProps {
  config: GLBModelConfig;
  sovereigntyInput: SovereigntyInput;
  ProceduralInner: React.ComponentType<any>;
  proceduralProps: Record<string, unknown>;
  accentColor: string;
  emotionIntensity: number;
  animTime?: number;
}

/** Loads GLB, checks for sovereignty clips, routes to correct renderer. */
export default function ModelRouter({
  config,
  sovereigntyInput,
  ProceduralInner,
  proceduralProps,
  accentColor,
  emotionIntensity,
  animTime,
}: ModelRouterProps) {
  const { animations } = useGLTF(config.path);
  const useSovereignty = hasSovereigntyClips(animations);

  if (useSovereignty) {
    return (
      <SovereigntyModelInner
        config={config}
        input={sovereigntyInput}
        accentColor={accentColor}
        emotionIntensity={emotionIntensity}
        animTime={animTime}
      />
    );
  }

  return (
    <ProceduralInner
      config={config}
      accentColor={accentColor}
      emotionIntensity={emotionIntensity}
      animTime={animTime}
      {...proceduralProps}
    />
  );
}
