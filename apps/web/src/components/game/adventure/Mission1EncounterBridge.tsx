import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAdventure } from '../../../lib/stores/useAdventure';
import { EncounterDirector } from '../../../game/combat/EncounterDirector';
import { useRunner } from '../../../lib/stores/useRunner';
import { useMissions } from '../../../lib/stores/useMissions';
import * as THREE from 'three';

const MISSION_1_IDS = new Set(['story_act1_m1', 'm1', 'story_1']);

export function Mission1EncounterBridge() {
  const directorRef = useRef<EncounterDirector | null>(null);
  const completionIssuedRef = useRef(false);
  const activeMissionId = useRunner((s) => s.activeStoryMissionId);

  useEffect(() => {
    completionIssuedRef.current = false;

    if (activeMissionId && MISSION_1_IDS.has(activeMissionId)) {
      console.log('[Mission1EncounterBridge] Instantiating EncounterDirector for Mission 1');
      directorRef.current = new EncounterDirector();

      const missions = useMissions.getState();
      if (!missions.active || missions.active.id !== activeMissionId || missions.active.source !== 'story') {
        missions.startMission('story', activeMissionId);
      }

      if ((import.meta.env.DEV || import.meta.env.VITE_KJ_TEST_HOOK === '1') && typeof window !== 'undefined') {
        (window as any).__KJ_MISSION1_TEST__ = {
          getWave: () => directorRef.current?.getCurrentWave() ?? null,
          getEnemies: () => directorRef.current?.getEnemies() ?? [],
          getBossPhase: () => {
            const boss = directorRef.current
              ?.getEnemies()
              .find((enemy) => enemy.type === 'VOID_STALKER_PRIME');
            return boss?.bossPhase ?? null;
          },
          applyDamage: (enemyId: string, damage: number, isHeavyAttack = false) =>
            directorRef.current?.applyDamageToEnemy(enemyId, damage, isHeavyAttack) ?? null,
          isMissionCompleted: () => directorRef.current?.isMissionCompleted() ?? false,
          getSaveState: () => directorRef.current?.getSaveState() ?? null,
        };
      }
    } else {
      directorRef.current = null;
    }

    return () => {
      if (directorRef.current) {
        console.log('[Mission1EncounterBridge] Cleaning up EncounterDirector on unmount');
        directorRef.current = null;
      }
      if (typeof window !== 'undefined' && (window as any).__KJ_MISSION1_TEST__) {
        delete (window as any).__KJ_MISSION1_TEST__;
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

    // Trigger the real mission-completion path exactly once when the director wins.
    if (directorRef.current.isMissionCompleted() && !completionIssuedRef.current) {
      completionIssuedRef.current = true;
      console.log('[Mission1EncounterBridge] Mission 1 Victory Triggered!');
      useAdventure.setState({ districtCompleted: true });

      if (activeMissionId && MISSION_1_IDS.has(activeMissionId)) {
        const missions = useMissions.getState();
        if (!missions.active || missions.active.id !== activeMissionId || missions.active.source !== 'story') {
          missions.startMission('story', activeMissionId);
        }
        useMissions.getState().completeMission(true);
      }
    }
  });

  return null;
}

export default Mission1EncounterBridge;
