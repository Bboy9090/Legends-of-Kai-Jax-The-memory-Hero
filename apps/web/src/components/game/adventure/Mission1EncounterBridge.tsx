import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAdventure } from '../../../lib/stores/useAdventure';
import { Mission1AdventureSession } from '../../../game/combat/Mission1AdventureSession';
import { isMission1Id } from '../../../game/combat/mission1Identity';

export function Mission1EncounterBridge() {
  const sessionRef = useRef<Mission1AdventureSession | null>(null);
  const missionId = useAdventure((state) => state.missionId);

  useEffect(() => {
    if (!missionId || !isMission1Id(missionId)) return;
    const session = new Mission1AdventureSession(missionId);
    sessionRef.current = session;
    const testApi = {
      getWave: () => session.director.getCurrentWave(),
      getEnemies: () => session.director.getEnemies(),
      getPlayer: () => ({ ...useAdventure.getState().player }),
      getAdventureEnemies: () => useAdventure.getState().enemies.map((enemy) => ({ ...enemy })),
      getBossPhase: () => session.director.getEnemies()
        .find((enemy) => enemy.type === 'VOID_STALKER_PRIME')?.bossPhase ?? null,
      applyDamage: (id: string, damage: number, heavy = false) => session.applyDamage(id, damage, heavy),
      isMissionCompleted: () => session.director.isMissionCompleted(),
      getSaveState: () => session.director.getSaveState(),
    };
    if ((import.meta.env.DEV || import.meta.env.VITE_KJ_TEST_HOOK === '1') && typeof window !== 'undefined') {
      (window as any).__KJ_MISSION1_TEST__ = testApi;
    }
    return () => {
      session.dispose();
      if (sessionRef.current === session) sessionRef.current = null;
      if (typeof window !== 'undefined' && (window as any).__KJ_MISSION1_TEST__ === testApi) {
        delete (window as any).__KJ_MISSION1_TEST__;
      }
    };
  }, [missionId]);

  useFrame((_, delta) => sessionRef.current?.tick(delta));
  return null;
}

export default Mission1EncounterBridge;
