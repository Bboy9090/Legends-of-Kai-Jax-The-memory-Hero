import { useRef, Suspense, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { useAdventure, type AdventureEnemy } from "../../../lib/stores/useAdventure";
import { CHARACTER_MODELS } from "../models/GLBCharacterModel";
import { useAudio, isStatueFighter } from "../../../lib/stores/useAudio";
import {
  findLimbs, captureBaseRotations, hasAnyLimb, createAnimState,
  animateIdle, animateAggroWalk, animateEnemyAttack, animateHitReaction,
  animateDeath, resetAttackPhase, triggerHit,
  type LimbRefs, type LimbBaseRotations, type AnimState,
} from "../../../lib/animationUtils";
import * as THREE from "three";

const AGGRO_RANGE = 15;
const ATTACK_RANGE = 2.5;
const ENEMY_SPEED = 3;
const ATTACK_INTERVAL = 1.5;
const ENEMY_DAMAGE = 8;

interface EnemyMeshProps {
  enemy: AdventureEnemy;
}

function EnemyMesh({ enemy }: EnemyMeshProps) {
  const config = CHARACTER_MODELS[enemy.fighterId];
  const modelPath = config?.path || "/models/stylized-beast.glb";
  const modelScale = (config?.scale || 2.5) * 0.85;

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

  useFrame((state, rawDelta) => {
    if (!groupRef.current || !innerRef.current) return;
    const delta = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;
    const anim = animRef.current;

    if (!initialized.current && innerRef.current) {
      initialized.current = true;

      const bbox = new THREE.Box3().setFromObject(innerRef.current);
      const minY = bbox.min.y;
      if (minY < -0.05) {
        yOffset.current = -minY;
      }

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
    }
    prevHealth.current = enemy.health;

    if (enemy.isDead) {
      animateDeath(groupRef.current, innerRef.current, anim, delta);
      return;
    }

    groupRef.current.position.set(enemy.posX, enemy.posY + yOffset.current, enemy.posZ);
    groupRef.current.rotation.y = enemy.rotY;
    groupRef.current.scale.set(1, 1, 1);

    const limbs = limbsRef.current;
    const bases = basesRef.current;
    const hasL = hasAnyLimb(limbs);
    const seed = enemy.posX * 7 + enemy.posZ * 3;

    if (enemy.isAttacking) {
      animateEnemyAttack(innerRef.current, hasL ? limbs : null, bases, anim, delta, t, attackVariant.current);
    } else if (enemy.isAggro) {
      resetAttackPhase(anim, innerRef.current, delta);
      animateAggroWalk(innerRef.current, hasL ? limbs : null, bases, anim, delta, t);
    } else {
      resetAttackPhase(anim, innerRef.current, delta);
      anim.walkCycle = 0;
      animateIdle(innerRef.current, hasL ? limbs : null, bases, t, delta, seed);
    }

    animateHitReaction(innerRef.current, anim, delta, t);
  });

  if (enemy.isDead && animRef.current.deathProgress >= 1) return null;

  return (
    <group ref={groupRef}>
      <group ref={innerRef} scale={modelScale}>
        <primitive object={clonedScene} castShadow receiveShadow />
      </group>
      <pointLight
        position={[0, 1.5, 0]}
        color="#ff3333"
        intensity={enemy.isAggro ? 0.5 : 0.15}
        distance={3}
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

    const { player, enemies } = adv;

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      const dx = player.posX - enemy.posX;
      const dz = player.posZ - enemy.posZ;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < AGGRO_RANGE && !enemy.isAggro) {
        adv.setEnemyAggro(enemy.id, true);
      }

      if (!enemy.isAggro) return;

      const targetRot = Math.atan2(dx, dz);
      const newRot = THREE.MathUtils.lerp(enemy.rotY, targetRot, 5 * delta);

      if (dist > ATTACK_RANGE) {
        const moveX = Math.sin(targetRot) * ENEMY_SPEED * delta;
        const moveZ = Math.cos(targetRot) * ENEMY_SPEED * delta;
        adv.setEnemyPos(
          enemy.id,
          enemy.posX + moveX,
          enemy.posY,
          enemy.posZ + moveZ
        );
        adv.setEnemyAttacking(enemy.id, false);
      } else {
        if (!attackTimers.current[enemy.id]) attackTimers.current[enemy.id] = 0;
        attackTimers.current[enemy.id] += delta;

        if (attackTimers.current[enemy.id] >= ATTACK_INTERVAL) {
          attackTimers.current[enemy.id] = 0;
          adv.setEnemyAttacking(enemy.id, true);
          adv.damagePlayer(ENEMY_DAMAGE);
          if (isStatueFighter(enemy.fighterId)) useAudio.getState().playStoneAttack();
          setTimeout(() => {
            useAdventure.getState().setEnemyAttacking(enemy.id, false);
          }, 400);
        }
      }

      useAdventure.setState((s) => ({
        enemies: s.enemies.map((e) =>
          e.id === enemy.id ? { ...e, rotY: newRot } : e
        ),
      }));
    });

    if (player.isAttacking && player.attackCooldown > 0) {
      enemies.forEach((enemy) => {
        if (enemy.isDead) return;
        const dx = player.posX - enemy.posX;
        const dz = player.posZ - enemy.posZ;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 3.5) {
          const dmgMap: Record<string, number> = {
            punch: 12,
            kick: 15,
            special: 25,
            ultimate: 40,
          };
          adv.damageEnemy(enemy.id, dmgMap[player.attackType || "punch"] || 10);
          if (isStatueFighter(enemy.fighterId)) useAudio.getState().playStoneHit();
        }
      });
    }
  });

  const enemies = useAdventure((s) => s.enemies);

  return (
    <>
      {enemies.map((enemy) => (
        <Suspense key={enemy.id} fallback={null}>
          <EnemyMesh enemy={enemy} />
        </Suspense>
      ))}
    </>
  );
}
