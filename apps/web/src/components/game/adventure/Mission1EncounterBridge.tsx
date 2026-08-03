import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAdventure } from '../../../lib/stores/useAdventure';
import { EncounterDirector } from '../../../game/combat/EncounterDirector';
import { useRunner } from '../../../lib/stores/useRunner';
import * as THREE from 'three';

export function Mission1EncounterBridge() {
  const directorRef = useRef<EncounterDirector | null>(null);
  const activeMissionId = useRunner((s) => s.activeStoryMissionId);

  useEffect(() => {
    // Instantiate EncounterDirector once when entering Mission 1
    if (activeMissionId === 'm1' || activeMissionId === 'story_1') {
      console.log('[Mission1EncounterBridge] Instantiating EncounterDirector for Mission 1');
      directorRef.current = new EncounterDirector();
    }

    return () => {
      if (directorRef.current) {
        console.log('[Mission1EncounterBridge] Cleaning up EncounterDirector on unmount');
        directorRef.current = null;
      }
    };
  }, [activeMissionId]);

  useFrame((_, rawDelta) => {
    if (!directorRef.current) return;
    const deltaMs = Math.min(rawDelta, 0.05) * 1000;

    const adv = useAdventure.getState();
    const playerPos = {
      x: adv.player.posX,
      y: adv.player.posY,
      z: adv.player.posZ,
    };
    const isPlayerDodging = adv.player.invulnTimer > 0;

    // Tick the deterministic EncounterDirector state machine
    directorRef.current.update(deltaMs, playerPos, isPlayerDodging);

    const runtimeEnemies = directorRef.current.getEnemies();

    // Map EncounterDirector state into useAdventure store for rendering & HUD
    useAdventure.setState((state) => ({
      enemies: runtimeEnemies.map((e) => ({
        id: e.id,
        fighterId: e.type.toLowerCase(),
        tier: e.type === 'BOSS' || e.type === 'VOID_STALKER_PRIME' ? 'boss2' : e.type === 'BRUTE' || e.type === 'CORRUPTION_BRUTE' ? 'boss1' : 'minion1',
        posX: e.position.x,
        posY: e.position.y,
        posZ: e.position.z,
        rotY: 0,
        health: e.stats.currentHealth,
        maxHealth: e.stats.maxHealth,
        isAggro: e.currentState !== 'IDLE',
        isAttacking: e.currentState === 'ATTACK',
        isDead: e.isDead,
        aiState: e.currentState.toLowerCase() as any,
        telegraphTimer: e.stateTimerMs / 1000,
        patrolTargetX: e.position.x,
        patrolTargetZ: e.position.z,
        stunTimer: e.isStaggered ? e.stats.staggerDurationMs / 1000 : 0,
      })),
    }));

    // Trigger victory save hook if completed
    if (directorRef.current.isMissionCompleted() && !adv.districtCompleted) {
      console.log('[Mission1EncounterBridge] Mission 1 Victory Triggered!');
      useAdventure.setState({ districtCompleted: true });
    }
  });

  return null;
}

export default Mission1EncounterBridge;
