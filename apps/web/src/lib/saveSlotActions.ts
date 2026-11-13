/** Bridges the pure save-slot model to the live stores, and runs the autosave. */
import { useRunner, type ProfileData } from "./stores/useRunner";
import { useHeroRoster } from "./stores/useHeroRoster";
import { createEnvelope, readSlot, writeSlot, type SaveEnvelope, type SaveSlotId } from "./saveSlots";

export function currentProfile(): ProfileData {
  const s = useRunner.getState();
  return {
    totalScore: s.totalScore,
    campaignCompletedNodes: s.campaignCompletedNodes,
    completedStoryMissionIds: s.completedStoryMissionIds,
    storyLoot: s.storyLoot,
    completedRoamDistrictIds: s.completedRoamDistrictIds,
    unlockedUpgrades: s.unlockedUpgrades,
    lastPlayedTitle: s.profiles[s.activeProfileIndex]?.lastPlayedTitle ?? null,
    fusionUnlocked: s.profiles[s.activeProfileIndex]?.fusionUnlocked === true,
  };
}

export const snapshotCurrent = (slotId: SaveSlotId): SaveEnvelope =>
  createEnvelope(slotId, currentProfile(), useHeroRoster.getState().unlockedHeroIds);

export const saveCurrentToSlot = (slotId: SaveSlotId): boolean => writeSlot(snapshotCurrent(slotId));

/** Replaces the active profile and the hero roster with the envelope's contents. */
export function applyEnvelope(env: SaveEnvelope): void {
  useRunner.getState().restoreActiveProfile(env.profile);
  useHeroRoster.getState().restoreRoster(env.unlockedHeroIds);
}

export function loadSlotIntoGame(slotId: SaveSlotId): boolean {
  const env = readSlot(slotId);
  if (!env) return false;
  applyEnvelope(env);
  return true;
}

/** Writes the `autosave` slot shortly after progress changes (missions cleared, score, loot). */
export function startAutosave(delayMs = 1500): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const key = (s: ReturnType<typeof useRunner.getState>) => `${s.activeProfileIndex}|${s.completedStoryMissionIds.length}|${s.totalScore}|${s.storyLoot.length}`;
  let last = key(useRunner.getState());
  const unsub = useRunner.subscribe((s) => {
    const next = key(s);
    if (next === last) return;
    last = next;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void saveCurrentToSlot("autosave"), delayMs);
  });
  return () => {
    unsub();
    if (timer) clearTimeout(timer);
  };
}
