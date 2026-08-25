import { useRef, Suspense, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { useAdventure, type AdventureEnemy } from "../../../lib/stores/useAdventure";
import { getModelConfig } from "../../../assets/modelRegistry";
import { useAudio, isStatueFighter } from "../../../lib/stores/useAudio";
import { ENEMY_TIERS } from "../../../game/tuning/enemyTuning";
import {
  findLimbs,
  captureBaseRotations,
  hasAnyLimb,
  createAnimState,
  animateIdle,
  animateAggroWalk,
  animateEnemyAttack,
  animateHitReaction,
  animateDeath,
  resetAttackPhase,
  triggerHit,
  type LimbRefs,
  type LimbBaseRotations,
  type AnimState,
} from "../../../lib/animationUtils";
import * as THREE from "three";

interface EnemyMeshProps {
  enemy: AdventureEnemy;
}

const MAX_SIMULTANEOUS_THREATS = 2;
const ATTACK_RECOVERY_SEC = 0.48;

function TelegraphRing({ enemy }: { enemy: AdventureEnemy }) {
  if (enemy.aiState !== "telegraph" || enemy.isDead) return null;
  const cfg = ENEMY_TIERS[enemy.tier] || ENEMY_TIERS.minion1;
  const progress = Math.min(1, enemy.telegraphTimer / Math.max(0.01, cfg.telegraphDuration));
  const isBoss = enemy.tier === "boss1" || enemy.tier === "boss2";
  const outer = (isBoss ? 3.4 : 2.7) - progress * 0.25;

  return (
    <group position={[enemy.posX, 0.06, enemy.posZ]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <ringGeometry args={[0.65, outer, 40]} />
        <meshBasicMaterial
          color={isBoss ? "#ff9a1f" : "#ff2f2f"}
          transparent
          opacity={0.18 + progress * 0.42}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <ringGeometry args={[Math.max(0.55, outer - 0.18), outer, 40]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.28 + progress * 0.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

const ENEMY_TARGET_HEIGHTS: Record<string, number> = {
  minion1: 2.4,
  minion2: 2.8,
  boss1: 4.0,
  boss2: 5.0,
};

function EnemyMesh({ enemy }: EnemyMeshProps) {
  const config = getModelConfig(enemy.fighterId);
  const modelPath = config?.path || "/models/stylized-beast.glb";
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

    if (!initialized.current) {
      initialized.current = true;
      const bbox = new THREE.Box3().setFromObject(innerRef.current);
      const modelHeight = bbox.max.y - bbox.min.y;
      const targetH = ENEMY_TARGET_HEIGHTS[enemy.tier] || 2.6;
      if (modelHeight > 0.01) normalizedScale.current = targetH / modelHeight;
      if (bbox.min.y < -0.05) yOffset.current = -bbox.min.y * normalizedScale.current;
      limbsRef.current = findLimbs(clonedScene);
      basesRef.current = captureBaseRotations(limbsRef.current);
      if (animations.length > 0 && !hasAnyLimb(limbsRef.current)) {
        const mixer = new THREE.AnimationMixer(clonedScene);
        mixerRef.current = mixer;
        mixer.clipAction(animations[0]).play();
      }
    }

    mixerRef.current?.update(delta);

    if (enemy.health < prevHealth.current) {
      triggerHit(anim);
      attackVariant.current += 1;
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
    const pulse = enemy.aiState === "telegraph" ? 1 + Math.sin(t * 18) * 0.035 : 1;
    groupRef.current.scale.setScalar(pulse);

    const limbs = limbsRef.current;
    const bases = basesRef.current;
    const proceduralLimbs = hasAnyLimb(limbs);
    const seed = enemy.posX * 7 + enemy.posZ * 3;

    if (enemy.isAttacking) {
      animateEnemyAttack(innerRef.current, proceduralLimbs ? limbs : null, bases, anim, delta, t, attackVariant.current);
    } else if (enemy.aiState === "chase" || enemy.aiState === "retreat" || enemy.aiState === "patrol") {
      resetAttackPhase(anim, innerRef.current, delta);
      animateAggroWalk(innerRef.current, proceduralLimbs ? limbs : null, bases, anim, delta, t);
    } else {
      resetAttackPhase(anim, innerRef.current, delta);
      if (enemy.aiState !== "telegraph") anim.walkCycle = 0;
      animateIdle(innerRef.current, proceduralLimbs ? limbs : null, bases, t, delta, seed);
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
        color={isTelegraphing ? "#ff4433" : enemy.isAggro ? "#ff3333" : "#883333"}
        intensity={isTelegraphing ? 1.35 : enemy.isAggro ? 0.42 : 0.12}
        distance={isTelegraphing ? 6 : 3}
        decay={2}
      />
    </group>
  );
}

export default function AdventureEnemyAI() {
  const attackTimers = useRef<Record<string, number>>({});
  const recoveryTimers = useRef<Record<string, number>>({});

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const adv = useAdventure.getState();
    if (adv.isPaused) return;

    const { player, enemies } = adv;
    let activeThreats = enemies.filter(
      (e) => !e.isDead && (e.aiState === "telegraph" || e.aiState === "attack" || e.isAttacking),
    ).length;

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      recoveryTimers.current[enemy.id] = Math.max(0, (recoveryTimers.current[enemy.id] || 0) - delta);

      if (enemy.stunTimer > 0) {
        adv.setEnemyStun(enemy.id, Math.max(0, enemy.stunTimer - delta));
        adv.setEnemyAttacking(enemy.id, false);
        return;
      }

      const tierConfig = ENEMY_TIERS[enemy.tier] || ENEMY_TIERS.minion1;
      const dx = player.posX - enemy.posX;
      const dz = player.posZ - enemy.posZ;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < tierConfig.aggroRange && !enemy.isAggro) adv.setEnemyAggro(enemy.id, true);
      const healthPct = enemy.health / enemy.maxHealth;

      if (enemy.aiState === "retreat" && healthPct <= tierConfig.retreatThreshold) {
        const fleeX = -dx / (dist || 1);
        const fleeZ = -dz / (dist || 1);
        adv.setEnemyPos(
          enemy.id,
          enemy.posX + fleeX * tierConfig.speed * 1.15 * delta,
          enemy.posY,
          enemy.posZ + fleeZ * tierConfig.speed * 1.15 * delta,
        );
        const fleeRot = Math.atan2(-dx, -dz);
        useAdventure.setState((s) => ({
          enemies: s.enemies.map((e) =>
            e.id === enemy.id ? { ...e, rotY: THREE.MathUtils.lerp(e.rotY, fleeRot, 5 * delta) } : e,
          ),
        }));
        return;
      }

      if ((enemy.aiState === "idle" || enemy.aiState === "patrol") && !enemy.isAggro) {
        const pdx = enemy.patrolTargetX - enemy.posX;
        const pdz = enemy.patrolTargetZ - enemy.posZ;
        const pdist = Math.sqrt(pdx * pdx + pdz * pdz);
        if (pdist > 1) {
          const angle = Math.atan2(pdx, pdz);
          const speed = tierConfig.speed * 0.32;
          adv.setEnemyPos(
            enemy.id,
            enemy.posX + Math.sin(angle) * speed * delta,
            enemy.posY,
            enemy.posZ + Math.cos(angle) * speed * delta,
          );
          useAdventure.setState((s) => ({
            enemies: s.enemies.map((e) =>
              e.id === enemy.id
                ? { ...e, rotY: THREE.MathUtils.lerp(e.rotY, angle, 3 * delta), aiState: "patrol" }
                : e,
            ),
          }));
        } else {
          const newPtx = enemy.posX + (Math.random() - 0.5) * 10;
          const newPtz = enemy.posZ + (Math.random() - 0.5) * 10;
          useAdventure.setState((s) => ({
            enemies: s.enemies.map((e) =>
              e.id === enemy.id ? { ...e, patrolTargetX: newPtx, patrolTargetZ: newPtz, aiState: "idle" } : e,
            ),
          }));
        }
        return;
      }

      if (!enemy.isAggro) return;
      const targetRot = Math.atan2(dx, dz);
      const newRot = THREE.MathUtils.lerp(enemy.rotY, targetRot, 6 * delta);

      if (enemy.aiState === "telegraph") {
        const newTimer = enemy.telegraphTimer + delta;
        adv.setEnemyTelegraph(enemy.id, newTimer);
        useAdventure.setState((s) => ({
          enemies: s.enemies.map((e) => (e.id === enemy.id ? { ...e, rotY: newRot } : e)),
        }));

        if (newTimer >= tierConfig.telegraphDuration) {
          adv.setEnemyTelegraph(enemy.id, 0);

          // Escaping the visible threat radius must earn a real whiff.
          if (dist > tierConfig.attackRange) {
            adv.setEnemyAttacking(enemy.id, false);
            adv.setEnemyAIState(enemy.id, "chase");
            recoveryTimers.current[enemy.id] = ATTACK_RECOVERY_SEC * 0.75;
            activeThreats = Math.max(0, activeThreats - 1);
            return;
          }

          adv.setEnemyAIState(enemy.id, "attack");
          adv.setEnemyAttacking(enemy.id, true);
          adv.damagePlayer(tierConfig.damage);
          if (isStatueFighter(enemy.fighterId)) useAudio.getState().playStoneAttack();

          window.setTimeout(() => {
            const state = useAdventure.getState();
            const e = state.enemies.find((en) => en.id === enemy.id);
            if (e && !e.isDead) {
              state.setEnemyAttacking(enemy.id, false);
              state.setEnemyAIState(enemy.id, "chase");
              recoveryTimers.current[enemy.id] = ATTACK_RECOVERY_SEC;
            }
          }, 420);
        }
        return;
      }

      if (enemy.aiState === "attack" || enemy.isAttacking) {
        useAdventure.setState((s) => ({
          enemies: s.enemies.map((e) => (e.id === enemy.id ? { ...e, rotY: newRot } : e)),
        }));
        return;
      }

      if (dist > tierConfig.attackRange) {
        const moveX = Math.sin(targetRot) * tierConfig.speed * delta;
        const moveZ = Math.cos(targetRot) * tierConfig.speed * delta;
        adv.setEnemyPos(enemy.id, enemy.posX + moveX, enemy.posY, enemy.posZ + moveZ);
        adv.setEnemyAttacking(enemy.id, false);
        adv.setEnemyAIState(enemy.id, "chase");
      } else {
        attackTimers.current[enemy.id] = (attackTimers.current[enemy.id] || 0) + delta;

        const canClaimThreatSlot = activeThreats < MAX_SIMULTANEOUS_THREATS;
        if (
          attackTimers.current[enemy.id] >= tierConfig.attackInterval &&
          recoveryTimers.current[enemy.id] <= 0 &&
          canClaimThreatSlot
        ) {
          attackTimers.current[enemy.id] = 0;
          adv.setEnemyAIState(enemy.id, "telegraph");
          adv.setEnemyTelegraph(enemy.id, 0);
          activeThreats += 1;
        }
      }

      useAdventure.setState((s) => ({
        enemies: s.enemies.map((e) => (e.id === enemy.id ? { ...e, rotY: newRot } : e)),
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
