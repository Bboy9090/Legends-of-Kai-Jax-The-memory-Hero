import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAdventure } from "../../../lib/stores/useAdventure";
import { getFighterById } from "../../../lib/characters";
import { useCompanion } from "../../../lib/stores/useCompanion";
import { useRunner } from "../../../lib/stores/useRunner";
import { companionHeroFor, companionStrikeDamage, initialCompanion, stepCompanion } from "../../../lib/companion";
import { getHeroIdentity } from "../../../lib/heroVisualIdentity";
import { MOVES } from "../../../game/combat/moveData";
import { pushDamagePopup } from "../../../lib/stores/useDamagePopups";
import { playSfx } from "../../../lib/sfx";
import OptimizedBeastModel from "../models/OptimizedBeastModel";

/**
 * The AI partner: Jax fights beside Kai (and Kai beside Jax). It follows, engages nearby enemies and
 * strikes for a fraction of the Skill move's damage. Hidden while the brothers are fused, and when the
 * active hero has no partner.
 */
export default function AdventureCompanion() {
  const groupRef = useRef<THREE.Group>(null);
  const wasVisible = useRef(false);
  // Booleans only: React re-renders when the partner, moving or striking flag flips, not every frame.
  const hero = useCompanion((c) => c.hero);
  const striking = useCompanion((c) => c.state.strikeTimer > 0);
  const moving = useCompanion((c) => Math.hypot(c.state.vx, c.state.vz) > 0.4);

  useFrame((_, rawDelta) => {
    const dt = Math.min(0.1, rawDelta);
    const adv = useAdventure.getState();
    const player = adv.player;
    const partner = useRunner.getState().trainingSession ? null : companionHeroFor(player.fighterId);
    if (useCompanion.getState().hero !== partner) useCompanion.setState({ hero: partner });

    const group = groupRef.current;
    if (!partner) {
      wasVisible.current = false;
      if (group) group.visible = false;
      return;
    }

    const playerPos = { x: player.posX, z: player.posZ, rotY: player.rotY };
    // Appearing (mission start, or fusion just ended): stand at the player's side.
    if (!wasVisible.current) {
      useCompanion.setState({ state: initialCompanion(playerPos) });
      wasVisible.current = true;
    }

    if (!adv.isPaused && player.health > 0) {
      const enemies = adv.enemies.filter((e) => !e.isDead).map((e) => ({ id: e.id, x: e.posX, z: e.posZ }));
      const { state, strike } = stepCompanion(useCompanion.getState().state, { dt, player: playerPos, enemies });
      const patch: Partial<ReturnType<typeof useCompanion.getState>> = { state };
      if (strike) {
        const damage = companionStrikeDamage(MOVES.skill.damage);
        for (const id of strike.hitIds) {
          const target = useAdventure.getState().enemies.find((e) => e.id === id && !e.isDead);
          if (!target) continue;
          useAdventure.getState().damageEnemy(id, damage);
          pushDamagePopup({ x: target.posX, y: target.posY + 2.4, z: target.posZ, amount: damage, kind: "normal" });
        }
        playSfx("strike");
        patch.strikes = useCompanion.getState().strikes + 1;
        patch.damageDealt = useCompanion.getState().damageDealt + damage * strike.hitIds.length;
      }
      useCompanion.setState(patch);
    }

    if (group) {
      const s = useCompanion.getState().state;
      group.visible = true;
      group.position.set(s.x, 0, s.z);
      group.rotation.y = s.yaw;
    }
  });

  const fighter = hero ? getFighterById(hero) : null;
  const accent = (hero && getHeroIdentity(hero)?.rimColor) || "#ffffff";

  return (
    <group
      ref={(g) => {
        groupRef.current = g;
        // Test hook, like the exposed stores: lets E2E confirm the partner's model is really in the scene.
        if (typeof window !== "undefined") (window as unknown as { companionObject?: THREE.Group | null }).companionObject = g;
      }}
      name="adventure-companion-root"
      visible={false}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.42, 0.54, 24]} />
        <meshBasicMaterial color={accent} transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {fighter ? (
        <Suspense fallback={null}>
          <OptimizedBeastModel
            beast={fighter}
            isAttacking={striking}
            isMoving={moving}
            isRunning={moving}
            locomotionSpeed={moving ? 6.5 : 0}
            attackType={striking ? "light2" : null}
          />
        </Suspense>
      ) : null}
    </group>
  );
}
