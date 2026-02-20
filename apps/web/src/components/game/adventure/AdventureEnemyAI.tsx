import { useRef, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Clone } from "@react-three/drei";
import { useAdventure, type AdventureEnemy } from "../../../lib/stores/useAdventure";
import { CHARACTER_MODELS } from "../models/GLBCharacterModel";
import { useAudio, isStatueFighter } from "../../../lib/stores/useAudio";
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
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const mixerInit = useRef(false);

  useFrame((state, rawDelta) => {
    if (!groupRef.current) return;
    const delta = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;

    if (innerRef.current && animations.length > 0 && !mixerInit.current) {
      mixerInit.current = true;
      const mixer = new THREE.AnimationMixer(innerRef.current);
      mixerRef.current = mixer;
      const action = mixer.clipAction(animations[0]);
      action.play();
    }
    if (mixerRef.current) mixerRef.current.update(delta);

    groupRef.current.position.set(enemy.posX, enemy.posY, enemy.posZ);
    groupRef.current.rotation.y = enemy.rotY;

    if (innerRef.current) {
      const breathe = Math.sin(t * 2.5 + enemy.posX) * 0.01;
      innerRef.current.position.y = breathe;

      if (enemy.isAttacking) {
        innerRef.current.rotation.x = THREE.MathUtils.lerp(
          innerRef.current.rotation.x, 0.25, delta * 10
        );
      } else if (enemy.isAggro) {
        innerRef.current.rotation.x = THREE.MathUtils.lerp(
          innerRef.current.rotation.x, 0.05, delta * 5
        );
      } else {
        innerRef.current.rotation.x = THREE.MathUtils.lerp(
          innerRef.current.rotation.x, 0, delta * 4
        );
      }
    }

    if (enemy.isDead && groupRef.current) {
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, 0, delta * 3);
    }
  });

  if (enemy.isDead) return null;

  return (
    <group ref={groupRef}>
      <group ref={innerRef} scale={modelScale}>
        <Clone object={scene} castShadow receiveShadow />
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
          }, 300);
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
