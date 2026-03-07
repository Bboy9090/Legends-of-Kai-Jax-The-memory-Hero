import { useRef, Suspense, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { useAdventure, type AdventureEnemy } from "../../../lib/stores/useAdventure";
import { useDifficulty, getMoveSpeedMultiplier, getAttackCooldownMultiplier } from "../../../lib/stores/useDifficulty";
import { CHARACTER_MODELS } from "../models/GLBCharacterModel";
import { useAudio, isStatueFighter } from "../../../lib/stores/useAudio";
import { ENEMY_TIERS } from "../../../lib/combatSystems";
import {
  findLimbs, captureBaseRotations, hasAnyLimb, createAnimState,
  animateIdle, animateAggroWalk, animateEnemyAttack, animateHitReaction,
  animateDeath, resetAttackPhase, triggerHit,
  type LimbRefs, type LimbBaseRotations, type AnimState,
} from "../../../lib/animationUtils";
import * as THREE from "three";

interface EnemyMeshProps {
  enemy: AdventureEnemy;
}

function TelegraphRing({ enemy }: { enemy: AdventureEnemy }) {
  if (enemy.aiState !== "telegraph" || enemy.isDead) return null;
  const progress = Math.min(1, enemy.telegraphTimer / (ENEMY_TIERS[enemy.tier]?.telegraphDuration || 0.8));
  return (
    <mesh
      position={[enemy.posX, 0.05, enemy.posZ]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[0.5, 0.5 + progress * 2.5, 32]} />
      <meshBasicMaterial
        color="#ff2222"
        transparent
        opacity={0.4 + progress * 0.4}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

const ENEMY_TARGET_HEIGHTS: Record<string, number> = {
  minion1: 2.4,
  minion2: 2.8,
  boss1: 4.0,
  boss2: 5.0,
};

function EnemyMesh({ enemy }: EnemyMeshProps) {
  const config = CHARACTER_MODELS[enemy.fighterId];
<<<<<<< HEAD
  const modelPath = config?.path || "/models/stylized-beast.glb";
=======
  const villainFallbacks = ["/models/hyenaratvbill.glb", "/models/drone.glb", "/models/granite_colossus.glb"];
  const fallbackIdx = enemy.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % villainFallbacks.length;
  const modelPath = config?.path || villainFallbacks[fallbackIdx];
  const modelScale = (config?.scale || 2.5) * 0.85;
>>>>>>> 778c90f5e6d65bdc8f6e6696352c9e7e53c21c28

  const { scene, animations } = useGLTF(modelPath);
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const limbsRef = useRef<LimbRefs | null>(null);
  const basesRef = useRef<LimbBaseRotations | null>(null);
  const animRef = useRef<AnimState>(createAnimState());
  const initialized = useRef(false);
  const prevHealth = useRef(enemy.health);
  const attackVariant = useRef(0);
  const yOffset = useRef(0);
  const flashRef = useRef(0);
  const normalizedScale = useRef(config?.scale || 2.5);

  useFrame((state, rawDelta) => {
    if (!groupRef.current || !innerRef.current) return;
    const delta = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;
    const anim = animRef.current;

    if (!initialized.current && innerRef.current) {
      initialized.current = true;
      const bbox = new THREE.Box3().setFromObject(innerRef.current);
      const modelHeight = bbox.max.y - bbox.min.y;
      const targetH = ENEMY_TARGET_HEIGHTS[enemy.tier] || 2.6;
      if (modelHeight > 0.01) {
        normalizedScale.current = targetH / modelHeight;
      }
      const minY = bbox.min.y;
      if (minY < -0.05) yOffset.current = -minY * normalizedScale.current;
      limbsRef.current = findLimbs(clonedScene);
      basesRef.current = captureBaseRotations(limbsRef.current);
      const hasProceduralLimbs = hasAnyLimb(limbsRef.current);
      if (animations.length > 0 && !hasProceduralLimbs) {
        const mixer = new THREE.AnimationMixer(clonedScene);
        mixerRef.current = mixer;
        const action = mixer.clipAction(animations[0]);
        action.play();
      }
    }

    if (mixerRef.current) mixerRef.current.update(delta);

    if (enemy.health < prevHealth.current) {
      triggerHit(anim);
      attackVariant.current++;
      flashRef.current = 0.2;
    }
    prevHealth.current = enemy.health;

    if (flashRef.current > 0) flashRef.current = Math.max(0, flashRef.current - delta);

    if (enemy.isDead) {
      animateDeath(groupRef.current, innerRef.current, anim, delta);
      return;
    }

    groupRef.current.position.set(enemy.posX, enemy.posY + yOffset.current, enemy.posZ);
    groupRef.current.rotation.y = enemy.rotY;

    const sc = enemy.aiState === "telegraph" ? 1 + Math.sin(t * 20) * 0.04 : 1;
    groupRef.current.scale.set(sc, sc, sc);

    const limbs = limbsRef.current;
    const bases = basesRef.current;
    const hasL = hasAnyLimb(limbs);
    const seed = enemy.posX * 7 + enemy.posZ * 3;

    if (enemy.isAttacking) {
      animateEnemyAttack(innerRef.current, hasL ? limbs : null, bases, anim, delta, t, attackVariant.current);
    } else if (enemy.aiState === "chase" || enemy.aiState === "retreat" || enemy.aiState === "patrol") {
      resetAttackPhase(anim, innerRef.current, delta);
      animateAggroWalk(innerRef.current, hasL ? limbs : null, bases, anim, delta, t);
    } else if (enemy.aiState === "telegraph") {
      resetAttackPhase(anim, innerRef.current, delta);
      animateIdle(innerRef.current, hasL ? limbs : null, bases, t, delta, seed);
    } else {
      resetAttackPhase(anim, innerRef.current, delta);
      anim.walkCycle = 0;
      animateIdle(innerRef.current, hasL ? limbs : null, bases, t, delta, seed);
    }

    animateHitReaction(innerRef.current, anim, delta, t);
  });

  if (enemy.isDead && animRef.current.deathProgress >= 1) return null;

  const isTelegraphing = enemy.aiState === "telegraph";

  return (
    <group ref={groupRef}>
      <group ref={innerRef} scale={normalizedScale.current}>
        <primitive object={clonedScene} castShadow receiveShadow />
      </group>
      <pointLight
        position={[0, 1.5, 0]}
        color={isTelegraphing ? "#ff4444" : enemy.isAggro ? "#ff3333" : "#883333"}
        intensity={isTelegraphing ? 1.5 : enemy.isAggro ? 0.5 : 0.15}
        distance={isTelegraphing ? 6 : 3}
        decay={2}
      />
    </group>
  );
}

export default function AdventureEnemyAI() {
  const attackTimers = useRef<Record<string, number>>({});

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const adv = useAdventure.getState();
    if (adv.isPaused) return;

    const difficulty = useDifficulty.getState().difficulty;
    const speedMult = getMoveSpeedMultiplier(difficulty);
    const cooldownMult = getAttackCooldownMultiplier(difficulty);

    const { player, enemies } = adv;

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      if (enemy.stunTimer > 0) {
        adv.setEnemyStun(enemy.id, Math.max(0, enemy.stunTimer - delta));
        return;
      }

      const tierConfig = ENEMY_TIERS[enemy.tier] || ENEMY_TIERS.minion1;
      const dx = player.posX - enemy.posX;
      const dz = player.posZ - enemy.posZ;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < tierConfig.aggroRange && !enemy.isAggro) {
        adv.setEnemyAggro(enemy.id, true);
      }

      const healthPct = enemy.health / enemy.maxHealth;

      if (enemy.aiState === "retreat" && healthPct <= tierConfig.retreatThreshold) {
        const fleeX = -dx / (dist || 1);
        const fleeZ = -dz / (dist || 1);
        const speed = tierConfig.speed * speedMult;
        const moveX = fleeX * speed * 1.3 * delta;
        const moveZ = fleeZ * speed * 1.3 * delta;
        adv.setEnemyPos(enemy.id, enemy.posX + moveX, enemy.posY, enemy.posZ + moveZ);
        const fleeRot = Math.atan2(-dx, -dz);
        useAdventure.setState((s) => ({
          enemies: s.enemies.map((e) =>
            e.id === enemy.id ? { ...e, rotY: THREE.MathUtils.lerp(e.rotY, fleeRot, 5 * delta) } : e
          ),
        }));
        return;
      }

      if (enemy.aiState === "idle" || enemy.aiState === "patrol") {
        if (!enemy.isAggro) {
          const ptx = enemy.patrolTargetX;
          const ptz = enemy.patrolTargetZ;
          const pdx = ptx - enemy.posX;
          const pdz = ptz - enemy.posZ;
          const pdist = Math.sqrt(pdx * pdx + pdz * pdz);
          if (pdist > 1) {
            const angle = Math.atan2(pdx, pdz);
            const speed = tierConfig.speed * 0.4 * speedMult;
            adv.setEnemyPos(
              enemy.id,
              enemy.posX + Math.sin(angle) * speed * delta,
              enemy.posY,
              enemy.posZ + Math.cos(angle) * speed * delta
            );
            useAdventure.setState((s) => ({
              enemies: s.enemies.map((e) =>
                e.id === enemy.id ? { ...e, rotY: THREE.MathUtils.lerp(e.rotY, angle, 3 * delta), aiState: "patrol" } : e
              ),
            }));
          } else {
            const newPtx = enemy.posX + (Math.random() - 0.5) * 16;
            const newPtz = enemy.posZ + (Math.random() - 0.5) * 16;
            useAdventure.setState((s) => ({
              enemies: s.enemies.map((e) =>
                e.id === enemy.id ? { ...e, patrolTargetX: newPtx, patrolTargetZ: newPtz, aiState: "idle" } : e
              ),
            }));
          }
          return;
        }
      }

      if (!enemy.isAggro) return;

      const targetRot = Math.atan2(dx, dz);
      const newRot = THREE.MathUtils.lerp(enemy.rotY, targetRot, 5 * delta);

      if (enemy.aiState === "telegraph") {
        const newTimer = enemy.telegraphTimer + delta;
        adv.setEnemyTelegraph(enemy.id, newTimer);
        useAdventure.setState((s) => ({
          enemies: s.enemies.map((e) =>
            e.id === enemy.id ? { ...e, rotY: newRot } : e
          ),
        }));
        if (newTimer >= tierConfig.telegraphDuration) {
          adv.setEnemyAIState(enemy.id, "attack");
          adv.setEnemyAttacking(enemy.id, true);
          adv.setEnemyTelegraph(enemy.id, 0);
          if (dist < tierConfig.attackRange + 1) {
            adv.damagePlayer(tierConfig.damage);
          }
          if (isStatueFighter(enemy.fighterId)) useAudio.getState().playStoneAttack();
          setTimeout(() => {
            const state = useAdventure.getState();
            const e = state.enemies.find((en) => en.id === enemy.id);
            if (e && !e.isDead) {
              state.setEnemyAttacking(enemy.id, false);
              state.setEnemyAIState(enemy.id, "chase");
            }
          }, 500);
        }
        return;
      }

      if (dist > tierConfig.attackRange) {
        const speed = tierConfig.speed * speedMult;
        const moveX = Math.sin(targetRot) * speed * delta;
        const moveZ = Math.cos(targetRot) * speed * delta;
        adv.setEnemyPos(enemy.id, enemy.posX + moveX, enemy.posY, enemy.posZ + moveZ);
        adv.setEnemyAttacking(enemy.id, false);
        adv.setEnemyAIState(enemy.id, "chase");
      } else {
        if (!attackTimers.current[enemy.id]) attackTimers.current[enemy.id] = 0;
        attackTimers.current[enemy.id] += delta;

        const attackInterval = tierConfig.attackInterval * cooldownMult;
        if (attackTimers.current[enemy.id] >= attackInterval) {
          attackTimers.current[enemy.id] = 0;
          adv.setEnemyAIState(enemy.id, "telegraph");
          adv.setEnemyTelegraph(enemy.id, 0);
        }
      }

      useAdventure.setState((s) => ({
        enemies: s.enemies.map((e) =>
          e.id === enemy.id ? { ...e, rotY: newRot } : e
        ),
      }));
    });
  });

  const enemies = useAdventure((s) => s.enemies);

  return (
    <>
      {enemies.map((enemy) => (
        <Suspense key={enemy.id} fallback={null}>
          <EnemyMesh enemy={enemy} />
          <TelegraphRing enemy={enemy} />
        </Suspense>
      ))}
    </>
  );
}
