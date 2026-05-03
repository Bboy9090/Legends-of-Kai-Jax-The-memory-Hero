import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getUEEMissionById } from "../uee_missions";
import { getStoryMissionById } from "../story_missions";
import { useRunner, type CampaignNodeId } from "./useRunner";
import { getDistrictMeta } from "../encounters";

export type MissionSource = "uee" | "story";

export type BattleAttackType = "punch" | "kick" | "special" | "ultimate";

export type MissionObjectiveKind =
  | { kind: "winMatch" }
  | { kind: "landHits"; count: number; attackType?: BattleAttackType }
  | { kind: "reachCombo"; count: number }
  | { kind: "useMove"; count: number; move: "special" | "ultimate" }
  | { kind: "surviveSeconds"; seconds: number };

export interface MissionObjectiveRuntime {
  id: string;
  label: string;
  kind: MissionObjectiveKind;
  progress: number;
  target: number;
  completed: boolean;
  optional?: boolean;
}

export interface ActiveMissionMeta {
  source: MissionSource;
  id: string;
  title: string;
  description: string;
  arenaId?: string;
}

export interface MissionRewardSummary {
  xp: number;
  currency: number;
  loot: string[];
  totalPoints: number; // xp + currency (used for runner score)
  granted: boolean;
}

type MissionResult = "success" | "fail" | null;

const STORAGE_KEY = "MK_MISSIONS_V1";
const ROAM_DISTRICT_KEY = "MK_ROAM_DISTRICTS_V1";

const KNOWN_ARENAS = new Set([
  "mushroom-plains",
  "green-valley",
  "rainbow-castle",
  "lava-fortress",
  "space-station",
  "jungle-ruins",
]);

const DEFAULT_ARENA_ID = "mushroom-plains";

const ARENA_MAP: Record<string, string> = {
  // UEE
  bronx_streets: "space-station",
  memory_nexus: "space-station",
  beast_colosseum: "rainbow-castle",
  rift_arena: "lava-fortress",
  rooftop_battlefield: "space-station",

  // Story
  cross_point_arena: "rainbow-castle",
  emerald_frontier: "green-valley",
  nexus_haven: "mushroom-plains",
  rift_citadel: "lava-fortress",
  void_tower: "space-station",
  skyforge_plateau: "jungle-ruins",
  archipelago: "mushroom-plains",
  jungle_temple: "jungle-ruins",
  divine_realm: "rainbow-castle",
  ashen_expanse: "lava-fortress",
};

function toPlayableArenaId(rawArenaId?: string): string {
  const candidate = rawArenaId ? (ARENA_MAP[rawArenaId] ?? rawArenaId) : DEFAULT_ARENA_ID;
  return KNOWN_ARENAS.has(candidate) ? candidate : DEFAULT_ARENA_ID;
}

function keyFor(source: MissionSource, id: string) {
  return `${source}:${id}`;
}

function safeLoadCompleted(): string[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === "string");
  } catch {
    return [];
  }
}

function safeSaveCompleted(keys: string[]) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // ignore
  }
}

function safeLoadRoamDistricts(): string[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(ROAM_DISTRICT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === "string");
  } catch {
    return [];
  }
}

function safeSaveRoamDistricts(keys: string[]) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ROAM_DISTRICT_KEY, JSON.stringify(keys));
  } catch {
    // ignore
  }
}

function objective(
  id: string,
  label: string,
  kind: MissionObjectiveKind,
  target: number,
  optional?: boolean
): MissionObjectiveRuntime {
  return { id, label, kind, progress: 0, target, completed: false, optional };
}

function getUEEObjectives(ueeId: string): MissionObjectiveRuntime[] {
  // 10 UEE missions (uee-1 .. uee-10) → typed objectives we track in battle
  switch (ueeId) {
    case "uee-1":
      return [
        objective("punches", "Land 10 punches", { kind: "landHits", count: 10, attackType: "punch" }, 10),
        objective("kicks", "Land 5 kicks", { kind: "landHits", count: 5, attackType: "kick" }, 5),
        objective("win", "Win the match", { kind: "winMatch" }, 1),
      ];
    case "uee-2":
      return [
        objective("combo5", "Reach a 5-hit combo", { kind: "reachCombo", count: 5 }, 5),
        objective("survive30", "Survive 30 seconds", { kind: "surviveSeconds", seconds: 30 }, 30),
        objective("win", "Win the match", { kind: "winMatch" }, 1),
      ];
    case "uee-3":
      return [
        objective("survive40", "Survive 40 seconds", { kind: "surviveSeconds", seconds: 40 }, 40),
        objective("combo8", "Reach an 8-hit combo", { kind: "reachCombo", count: 8 }, 8),
        objective("win", "Win the match", { kind: "winMatch" }, 1),
      ];
    case "uee-4":
      return [
        objective("survive60", "Survive 60 seconds", { kind: "surviveSeconds", seconds: 60 }, 60),
        objective("special1", "Use 1 special", { kind: "useMove", count: 1, move: "special" }, 1),
        objective("win", "Win the match", { kind: "winMatch" }, 1),
      ];
    case "uee-5":
      return [
        objective("combo10", "Reach a 10-hit combo", { kind: "reachCombo", count: 10 }, 10),
        objective("special2", "Use 2 specials", { kind: "useMove", count: 2, move: "special" }, 2),
        objective("win", "Win the match", { kind: "winMatch" }, 1),
      ];
    case "uee-6":
      return [
        objective("win", "Win the match", { kind: "winMatch" }, 1),
        objective("combo6", "Reach a 6-hit combo", { kind: "reachCombo", count: 6 }, 6),
        objective("special1", "Use 1 special", { kind: "useMove", count: 1, move: "special" }, 1),
      ];
    case "uee-7":
      return [
        objective("survive45", "Survive 45 seconds", { kind: "surviveSeconds", seconds: 45 }, 45),
        objective("combo7", "Reach a 7-hit combo", { kind: "reachCombo", count: 7 }, 7),
        objective("win", "Win the match", { kind: "winMatch" }, 1),
      ];
    case "uee-8":
      return [
        objective("combo15", "Reach a 15-hit combo", { kind: "reachCombo", count: 15 }, 15),
        objective("special2", "Use 2 specials", { kind: "useMove", count: 2, move: "special" }, 2),
        objective("win", "Win the match", { kind: "winMatch" }, 1),
      ];
    case "uee-9":
      return [
        objective("survive75", "Survive 75 seconds", { kind: "surviveSeconds", seconds: 75 }, 75),
        objective("ultimate1", "Use 1 ultimate", { kind: "useMove", count: 1, move: "ultimate" }, 1),
        objective("win", "Win the match", { kind: "winMatch" }, 1),
      ];
    case "uee-10":
      return [
        objective("combo12", "Reach a 12-hit combo", { kind: "reachCombo", count: 12 }, 12),
        objective("ultimate1", "Use 1 ultimate", { kind: "useMove", count: 1, move: "ultimate" }, 1),
        objective("win", "Win the match", { kind: "winMatch" }, 1),
      ];
    default:
      return [objective("win", "Win the match", { kind: "winMatch" }, 1)];
  }
}

function getStoryObjectives(storyId: string): MissionObjectiveRuntime[] {
  // Pattern: story_act[1-3]_m[1-18]
  const match = storyId.match(/story_act(\d)_m(\d+)/);
  if (!match) return [objective("win", "Win the match", { kind: "winMatch" }, 1)];
  
  const act = parseInt(match[1]);
  const num = parseInt(match[2]);
  const globalChapter = (act - 1) * 18 + num;

  // 📈 LOGIC SCALING: Objectives get harder as the chapter count increases
  const baseHits = 5 + Math.floor(globalChapter * 0.4);
  const baseCombo = 3 + Math.floor(globalChapter / 6);
  const baseSurvival = 30 + (act * 15);

  // Specific Boss Chapters (End of Acts or Mid-Act Generals)
  if (num === 18 || num === 10 || globalChapter >= 50) {
    return [
      objective("win", "Defeat the Boss", { kind: "winMatch" }, 1),
      objective("ultimate", "Use Ultimate Finisher", { kind: "useMove", count: 1, move: "ultimate" }, 1),
      objective("combo", `Reach ${baseCombo + 5} combo`, { kind: "reachCombo", count: baseCombo + 5 }, baseCombo + 5)
    ];
  }

  // Act-Specific Scaling Themes
  if (act === 1) {
    // Act I: Learning the basics
    return [
      objective("win", "Win the match", { kind: "winMatch" }, 1),
      objective("hits", `Land ${baseHits} hits`, { kind: "landHits", count: baseHits }, baseHits),
      num % 3 === 0 ? objective("special", "Use Special", { kind: "useMove", count: 1, move: "special" }, 1) : null
    ].filter(Boolean) as MissionObjectiveRuntime[];
  } else if (act === 2) {
    // Act II: Survival & Tactics
    return [
      objective("win", "Win the match", { kind: "winMatch" }, 1),
      objective("survival", `Survive ${baseSurvival}s`, { kind: "surviveSeconds", seconds: baseSurvival }, baseSurvival),
      objective("combo", `Reach ${baseCombo} combo`, { kind: "reachCombo", count: baseCombo }, baseCombo)
    ];
  } else {
    // Act III: Mastery & Fusion
    return [
      objective("win", "Liberate the arena", { kind: "winMatch" }, 1),
      objective("ultimate", "Use Ultimate", { kind: "useMove", count: 1, move: "ultimate" }, 1),
      objective("hits_heavy", `Land ${baseHits + 10} hits`, { kind: "landHits", count: baseHits + 10 }, baseHits + 10)
    ];
  }
}

function resolveMissionMeta(source: MissionSource, id: string): ActiveMissionMeta | null {
  if (source === "uee") {
    const m = getUEEMissionById(id);
    if (!m) return null;
    const arenaRaw = m.arena ?? m.arenaId;
    return { source, id: m.id, title: m.name, description: m.description, arenaId: toPlayableArenaId(arenaRaw) };
  }
  const m = getStoryMissionById(id);
  if (!m) return null;
  const arenaRaw = m.arena ?? m.arenaId;
  return { source, id: m.id, title: m.name, description: m.description, arenaId: toPlayableArenaId(arenaRaw) };
}

function resolveObjectives(source: MissionSource, id: string): MissionObjectiveRuntime[] {
  if (source === "uee") return getUEEObjectives(id);
  // Act I typed, everything else falls back to win-match only for now.
  return getActIStoryObjectives(id);
}

function resolveRewards(source: MissionSource, id: string): { xp: number; currency: number; loot: string[] } | null {
  if (source === "uee") {
    const m = getUEEMissionById(id);
    if (!m) return null;
    return { xp: m.rewards.xp, currency: m.rewards.currency, loot: m.rewards.loot };
  }
  const m = getStoryMissionById(id);
  if (!m) return null;
  return { xp: m.rewards.xp, currency: m.rewards.currency, loot: m.rewards.loot };
}

function recomputeCompletion(objs: MissionObjectiveRuntime[]): MissionObjectiveRuntime[] {
  return objs.map((o) => ({
    ...o,
    completed: o.completed || o.progress >= o.target,
  }));
}

interface MissionsState {
  active: ActiveMissionMeta | null;
  objectives: MissionObjectiveRuntime[];
  result: MissionResult;
  completedKeys: string[];
  /** District patrol clears (roam:<districtId>) */
  completedRoamDistrictKeys: string[];
  lastReward: MissionRewardSummary | null;

  // lifecycle
  startMission: (source: MissionSource, id: string) => void;
  abandonMission: () => void;
  completeMission: (success: boolean) => void;
  /** Grant one-time score + persist when a district patrol is fully cleared */
  completeDistrictRoam: (districtId: CampaignNodeId) => void;

  // battle hooks
  recordHit: (attackType: BattleAttackType) => void;
  recordMove: (move: "special" | "ultimate") => void;
  recordCombo: (comboCount: number) => void;
  tickSurvival: (deltaSeconds: number) => void;
  recordBattleEnd: (winner: "player" | "opponent") => void;
}

export const useMissions = create<MissionsState>()(
  subscribeWithSelector((set, get) => ({
    active: null,
    objectives: [],
    result: null,
    completedKeys: typeof window !== "undefined" ? safeLoadCompleted() : [],
    completedRoamDistrictKeys: typeof window !== "undefined" ? safeLoadRoamDistricts() : [],
    lastReward: null,

    startMission: (source, id) => {
      const meta = resolveMissionMeta(source, id);
      if (!meta) return;
      const objs = resolveObjectives(source, id);
      set({
        active: meta,
        objectives: objs,
        result: null,
        lastReward: null,
      });
    },

    abandonMission: () => set({ active: null, objectives: [], result: null, lastReward: null }),

    completeDistrictRoam: (districtId) => {
      const meta = getDistrictMeta(districtId);
      if (!meta) return;
      const k = `roam:${districtId}`;
      const prev = get().completedRoamDistrictKeys;
      if (prev.includes(k)) {
        const totalPoints = meta.rewards.xp + meta.rewards.currency;
        set({
          lastReward: {
            xp: meta.rewards.xp,
            currency: meta.rewards.currency,
            loot: [],
            totalPoints,
            granted: false,
          },
        });
        return;
      }
      const totalPoints = meta.rewards.xp + meta.rewards.currency;
      if (totalPoints > 0) {
        useRunner.getState().addScore(totalPoints);
      }
      const next = [...prev, k];
      safeSaveRoamDistricts(next);
      set({
        completedRoamDistrictKeys: next,
        lastReward: {
          xp: meta.rewards.xp,
          currency: meta.rewards.currency,
          loot: [`Memory shard — ${meta.name}`],
          totalPoints,
          granted: true,
        },
      });
    },

    completeMission: (success) => {
      const active = get().active;
      if (!active) return;
      if (!success) {
        set({ result: "fail", lastReward: null });
        return;
      }
      const k = keyFor(active.source, active.id);
      const prev = get().completedKeys;
      if (!prev.includes(k)) {
        const reward = resolveRewards(active.source, active.id);
        const totalPoints = (reward?.xp ?? 0) + (reward?.currency ?? 0);
        if (totalPoints > 0) {
          // Treat mission XP/currency as score rewards (no wallet system yet).
          useRunner.getState().addScore(totalPoints);
        }
        const next = [...prev, k];
        safeSaveCompleted(next);
        set({
          completedKeys: next,
          result: "success",
          lastReward: reward
            ? { ...reward, totalPoints, granted: true }
            : { xp: 0, currency: 0, loot: [], totalPoints: 0, granted: true },
        });
      } else {
        const reward = resolveRewards(active.source, active.id);
        const totalPoints = (reward?.xp ?? 0) + (reward?.currency ?? 0);
        set({
          result: "success",
          lastReward: reward
            ? { ...reward, totalPoints, granted: false }
            : { xp: 0, currency: 0, loot: [], totalPoints: 0, granted: false },
        });
      }
    },

    recordHit: (attackType) => {
      const active = get().active;
      if (!active) return;
      const updated = get()
        .objectives.map((o) => {
          if (o.completed) return o;
          if (o.kind.kind !== "landHits") return o;
          if (o.kind.attackType && o.kind.attackType !== attackType) return o;
          return { ...o, progress: Math.min(o.target, o.progress + 1) };
        });
      set({ objectives: recomputeCompletion(updated) });
    },

    recordMove: (move) => {
      const active = get().active;
      if (!active) return;
      const updated = get()
        .objectives.map((o) => {
          if (o.completed) return o;
          if (o.kind.kind !== "useMove") return o;
          if (o.kind.move !== move) return o;
          return { ...o, progress: Math.min(o.target, o.progress + 1) };
        });
      set({ objectives: recomputeCompletion(updated) });
    },

    recordCombo: (comboCount) => {
      const active = get().active;
      if (!active) return;
      const updated = get()
        .objectives.map((o) => {
          if (o.completed) return o;
          if (o.kind.kind !== "reachCombo") return o;
          return { ...o, progress: Math.min(o.target, Math.max(o.progress, comboCount)) };
        });
      set({ objectives: recomputeCompletion(updated) });
    },

    tickSurvival: (deltaSeconds) => {
      const active = get().active;
      if (!active) return;
      const updated = get()
        .objectives.map((o) => {
          if (o.completed) return o;
          if (o.kind.kind !== "surviveSeconds") return o;
          return { ...o, progress: Math.min(o.target, o.progress + deltaSeconds) };
        });
      set({ objectives: recomputeCompletion(updated) });
    },

    recordBattleEnd: (winner) => {
      const active = get().active;
      if (!active) return;
      // Resolve win objectives + decide mission completion.
      const updated = recomputeCompletion(
        get().objectives.map((o) => {
          if (o.completed) return o;
          if (o.kind.kind !== "winMatch") return o;
          return { ...o, progress: winner === "player" ? 1 : 0 };
        })
      );
      set({ objectives: updated });

      const required = updated.filter((o) => !o.optional);
      const success = winner === "player" && required.every((o) => o.completed);
      get().completeMission(success);
    },
  }))
);

