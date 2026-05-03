import { useRef, Suspense, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Clone, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  findLimbs,
  captureBaseRotations,
  createAnimState,
  animateIdle,
  animateWalk,
  animatePunch,
  animateKick,
  animateSpecial,
  animateUltimate,
  hasAnyLimb,
  type LimbRefs,
  type LimbBaseRotations,
  type AnimState,
} from "../../../lib/animationUtils";
import {
  MODEL_REGISTRY,
  getModelConfig,
  PRELOAD_MODEL_IDS,
  type GLBModelConfig,
} from "../../../assets/modelRegistry";

// Re-export for any legacy callers that still import from this module
export type { GLBModelConfig };
export { MODEL_REGISTRY as CHARACTER_MODELS };

interface GLBCharacterModelProps {
  fighterId: string;
  animTime?: number;
  isAttacking?: boolean;
  isMoving?: boolean;
  isRunning?: boolean;
  attackType?: "punch" | "kick" | "special" | "ultimate" | null;
  velocityX?: number;
  velocityY?: number;
  isGrounded?: boolean;
  isJumping?: boolean;
  emotionIntensity?: number;
  accentColor?: string;
  isInvulnerable?: boolean;
  hitAnim?: number;
}

function GLBModelFallback() {
  return null;
}

const TARGET_HEIGHT = 3.5;

function GLBModelInner({
  config,
  animTime,
  isAttacking,
  isMoving,
  isRunning = false,
  attackType,
  velocityX = 0,
  velocityY: _velocityY = 0,
  isGrounded = true,
  isJumping = false,
  emotionIntensity,
  accentColor,
  isInvulnerable = false,
  hitAnim = 0,
  fighterId,
}: {
  config: GLBModelConfig;
  animTime: number;
  isAttacking: boolean;
  isMoving: boolean;
  isRunning?: boolean;
  attackType?: "punch" | "kick" | "special" | "ultimate" | null;
  velocityX?: number;
  velocityY?: number;
  isGrounded?: boolean;
  isJumping?: boolean;
  emotionIntensity: number;
  accentColor: string;
  isInvulnerable?: boolean;
  hitAnim?: number;
  fighterId: string;
}) {
  const outerRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(config.path);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const landSquash = useRef(0);
  const wasGrounded = useRef(true);

  const cloneRef = useRef<THREE.Group>(null);
  const setupDone = useRef(false);
  const frameCount = useRef(0);
  const normalizedScale = useRef(config.scale);

  const limbsRef = useRef<LimbRefs | null>(null);
  const basesRef = useRef<LimbBaseRotations | null>(null);
  const animStateRef = useRef<AnimState>(createAnimState());
  const wasAttacking = useRef(false);

  // Animation Selector State
  const [activeClipName, setActiveClipName] = useState<string>("none");
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Keybind for debug toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "[") setShowDebug(prev => !prev);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Initialize Mixer and Clips
  useEffect(() => {
    if (cloneRef.current && animations.length > 0) {
      const mixer = new THREE.AnimationMixer(cloneRef.current);
      mixerRef.current = mixer;
      
      const actions: Record<string, THREE.AnimationAction> = {};
      animations.forEach(clip => {
        actions[clip.name.toLowerCase()] = mixer.clipAction(clip);
      });
      actionsRef.current = actions;

      return () => {
        mixer.stopAllAction();
        mixerRef.current = null;
      };
    }
  }, [animations]);

  useFrame((state, delta) => {
    if (!innerRef.current || !cloneRef.current) return;
    const t = animTime || state.clock.elapsedTime;

    // 1. Update Mixer
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    // 2. Setup Limbs and Scale (Once)
    frameCount.current++;
    if (!setupDone.current && frameCount.current > 3) {
      // CRITICAL: Ensure the model is in its rest pose before capturing base rotations
      // This prevents clips (like walk/run) from polluting the base state.
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current.update(0);
      }
      
      // Reset all bone rotations in the clone to rest pose
      cloneRef.current.traverse((obj) => {
        if ((obj as THREE.Bone).isBone) {
          obj.rotation.set(0, 0, 0);
        }
      });
      cloneRef.current.updateMatrixWorld(true);

      const bbox = new THREE.Box3().setFromObject(cloneRef.current);
      const modelHeight = bbox.max.y - bbox.min.y;
      if (modelHeight > 0.01) {
        normalizedScale.current = (TARGET_HEIGHT / modelHeight) * config.scale;
      }
      if (bbox.min.y < -0.05 && outerRef.current) {
        outerRef.current.position.y = -bbox.min.y * (normalizedScale.current / config.scale);
      }

      const limbs = findLimbs(cloneRef.current);
      limbsRef.current = hasAnyLimb(limbs) ? limbs : null;
      if (limbsRef.current) {
        basesRef.current = captureBaseRotations(limbsRef.current);
      }
      
      setupDone.current = true;
    }

    // 3. Animation State Selection
    let nextClip = "none";
    if (!isAttacking) {
      if (isMoving) {
        if (isRunning && (actionsRef.current["run"] || actionsRef.current["running"])) {
          nextClip = actionsRef.current["run"] ? "run" : "running";
        } else if (actionsRef.current["walk"] || actionsRef.current["walking"] || actionsRef.current["armature|walking_man|baselayer"]) {
          nextClip = actionsRef.current["walk"] ? "walk" : actionsRef.current["walking"] ? "walking" : "armature|walking_man|baselayer";
        }
      } else {
        if (actionsRef.current["idle"]) nextClip = "idle";
      }
    }

    // Transition Clips
    if (nextClip !== activeClipName) {
      const prevAction = currentActionRef.current;
      const nextAction = actionsRef.current[nextClip];

      if (nextAction) {
        if (prevAction) prevAction.fadeOut(0.3);
        nextAction.reset().fadeIn(0.3).play();
        currentActionRef.current = nextAction;
        setActiveClipName(nextClip);
      } else if (prevAction) {
        prevAction.fadeOut(0.3);
        currentActionRef.current = null;
        setActiveClipName("none");
      }
    }

    // 4. Procedural Layering
    const sc = normalizedScale.current;
    if (!wasGrounded.current && isGrounded) landSquash.current = 1;
    wasGrounded.current = isGrounded;
    landSquash.current = THREE.MathUtils.lerp(landSquash.current, 0, delta * 8);

    const squashY = 1 - landSquash.current * 0.2;
    const squashXZ = 1 + landSquash.current * 0.1;
    innerRef.current.scale.set(sc * squashXZ, sc * squashY, sc * squashXZ);

    if (hitAnim > 0) {
      innerRef.current.rotation.z = Math.sin(t * 22) * 0.08 * hitAnim;
    }
    innerRef.current.visible = isInvulnerable ? Math.sin(t * 30) > 0 : true;

    const limbs = limbsRef.current;
    const bases = basesRef.current;
    const anim = animStateRef.current;

    // Attack State Handling
    if (isAttacking) {
      // If we have clips, we fade them out during attack so they don't fight procedural pose
      if (currentActionRef.current) {
        currentActionRef.current.weight = THREE.MathUtils.lerp(currentActionRef.current.weight, 0, delta * 10);
      }

      if (!wasAttacking.current) {
        anim.attackPhase = 0;
        anim.comboStep = (anim.comboStep + 1) % 8;
      }
      wasAttacking.current = true;
      
      // Procedural Combat
      if (attackType === "punch") animatePunch(innerRef.current, limbs, bases, anim, delta, t);
      else if (attackType === "kick") animateKick(innerRef.current, limbs, bases, anim, delta);
      else if (attackType === "special") animateSpecial(innerRef.current, limbs, bases, anim, delta);
      else if (attackType === "ultimate") animateUltimate(innerRef.current, limbs, bases, anim, delta);
      else animatePunch(innerRef.current, limbs, bases, anim, delta, t);
      
    } else {
      wasAttacking.current = false;
      if (currentActionRef.current) {
        currentActionRef.current.weight = THREE.MathUtils.lerp(currentActionRef.current.weight, 1, delta * 5);
      }

      // If no clip is driving this state, use procedural locomotion
      if (activeClipName === "none") {
        if (isMoving) animateWalk(innerRef.current, limbs, bases, anim, delta, isRunning);
        else animateIdle(innerRef.current, limbs, bases, t, delta);
      }
    }

    if (!isGrounded) {
      innerRef.current.rotation.x = THREE.MathUtils.lerp(innerRef.current.rotation.x, isJumping ? -0.15 : 0.1, delta * 6);
    }
  });

  const debugLimbStatus = useMemo(() => {
    if (!limbsRef.current) return "No limbs detected";
    const found = Object.entries(limbsRef.current).filter(([_, v]) => v !== null);
    return `${found.length}/21 bones found`;
  }, [limbsRef.current]);

  return (
    <group ref={outerRef}>
      <group
        ref={innerRef}
        position={config.position}
        rotation={config.rotation ? [config.rotation[0], config.rotation[1], config.rotation[2]] : undefined}
        scale={normalizedScale.current}
      >
        <group ref={cloneRef}>
          <Clone object={scene} castShadow receiveShadow />
        </group>
        <pointLight
          position={[0, 1.5, 0.5]}
          color={accentColor}
          intensity={emotionIntensity * 0.5}
          distance={3}
          decay={2}
        />
        
        {showDebug && (
          <Html position={[0, 4, 0]} center>
            <div style={{
              background: 'rgba(0,0,0,0.9)',
              color: '#00f2ff',
              padding: '12px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '11px',
              width: '240px',
              border: '2px solid #00f2ff',
              pointerEvents: 'none',
              boxShadow: '0 0 15px #00f2ff'
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>ANIMATION DEBUG</div>
              <div>ID: {fighterId}</div>
              <div>GLB: {config.path.split('/').pop()}</div>
              <div style={{ color: activeClipName !== 'none' ? '#00ff00' : '#ffaa00' }}>
                CLIP: {activeClipName}
              </div>
              <div style={{ color: limbsRef.current ? '#00ff00' : '#ff0000' }}>
                RIG: {debugLimbStatus}
              </div>
              <hr style={{ borderColor: '#333', margin: '8px 0' }}/>
              <div>Moving: {isMoving ? "YES" : "NO"}</div>
              <div>Running: {isRunning ? "YES" : "NO"}</div>
              <div>Attacking: {isAttacking ? "YES" : "NO"}</div>
              <div>Type: {attackType || "none"}</div>
              <hr style={{ borderColor: '#333', margin: '8px 0' }}/>
              <div style={{ color: '#fff' }}>LIMBS FOUND:</div>
              <div style={{ fontSize: '9px', opacity: 0.8 }}>
                {limbsRef.current ? Object.entries(limbsRef.current)
                  .filter(([_, v]) => v !== null)
                  .map(([k]) => k)
                  .join(', ') : "NONE"}
              </div>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

export default function GLBCharacterModel(props: GLBCharacterModelProps) {
  const {
    fighterId,
    animTime = 0,
    isAttacking = false,
    isMoving = false,
    isRunning = false,
    attackType = null,
    velocityX = 0,
    velocityY = 0,
    isGrounded = true,
    isJumping = false,
    emotionIntensity = 0.5,
    accentColor = "#00f2ff",
    isInvulnerable = false,
    hitAnim = 0,
  } = props;

  const config = getModelConfig(fighterId);
  if (!config) return null;

  return (
    <Suspense fallback={<GLBModelFallback />}>
      <GLBModelInner
        config={config}
        animTime={animTime}
        isAttacking={isAttacking}
        isMoving={isMoving}
        isRunning={isRunning}
        attackType={attackType}
        velocityX={velocityX}
        velocityY={velocityY}
        isGrounded={isGrounded}
        isJumping={isJumping}
        emotionIntensity={emotionIntensity}
        accentColor={accentColor}
        isInvulnerable={isInvulnerable}
        hitAnim={hitAnim}
        fighterId={fighterId}
      />
    </Suspense>
  );
}

PRELOAD_MODEL_IDS.forEach((id) => {
  const cfg = MODEL_REGISTRY[id];
  if (cfg) {
    try {
      useGLTF.preload(cfg.path);
    } catch (_e) {}
  }
});
