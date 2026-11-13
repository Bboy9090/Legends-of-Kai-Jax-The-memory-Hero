import { describe, expect, it } from "vitest";
import { ALL_STORY_MISSIONS } from "./story_missions";
import { MODEL_REGISTRY } from "../assets/modelRegistry";
import {
  BOSS_CONFIG_MAP,
  PHASE_ROAR_SEC,
  createBossEncounterState,
  getBossConfig,
  stepBossEncounter,
  type BossEvent,
  type BossStepInput,
} from "./bossPhases";

const bossMissions = ALL_STORY_MISSIONS.filter((m) => m.bossId);
const config = BOSS_CONFIG_MAP["story_act5_m25"];
const base: BossStepInput = { dt: 0.1, hpPct: 1, playerDistance: 2, playerInvulnerable: false, bossAggro: true };

function run(seconds: number, input: Partial<BossStepInput>, from = createBossEncounterState()) {
  let state = from;
  const events: BossEvent[] = [];
  for (let t = 0; t < seconds; t += 0.1) {
    const out = stepBossEncounter(state, config, { ...base, ...input });
    state = out.state;
    events.push(...out.events);
  }
  return { state, events };
}

describe("BOSS_CONFIG_MAP", () => {
  it("covers every boss mission in Acts 1-9 and nothing else", () => {
    expect(Object.keys(BOSS_CONFIG_MAP).sort()).toEqual(bossMissions.map((m) => m.id).sort());
    expect(bossMissions.length).toBe(18);
  });

  it("uses each mission's own boss model, and every model is registered", () => {
    for (const m of bossMissions) {
      expect(BOSS_CONFIG_MAP[m.id].fighterId, m.id).toBe(m.bossId);
      expect((MODEL_REGISTRY as Record<string, unknown>)[m.bossId!], m.bossId).toBeDefined();
    }
  });

  it("scales HP progressively from 600 in Act 1 to 4,500 in Act 9", () => {
    const hps = bossMissions.map((m) => BOSS_CONFIG_MAP[m.id].maxHealth);
    expect(hps[0]).toBe(600);
    expect(hps[hps.length - 1]).toBe(4500);
    for (let i = 1; i < hps.length; i++) expect(hps[i], bossMissions[i].id).toBeGreaterThanOrEqual(hps[i - 1]);
  });

  it("gives reused boss models distinct scale, tint and aura per mission", () => {
    const byModel = new Map<string, string[]>();
    for (const m of bossMissions) byModel.set(m.bossId!, [...(byModel.get(m.bossId!) ?? []), m.id]);
    for (const [model, ids] of byModel) {
      if (ids.length < 2) continue;
      const looks = ids.map((id) => `${BOSS_CONFIG_MAP[id].scale}|${BOSS_CONFIG_MAP[id].tint}`);
      expect(new Set(looks).size, model).toBe(ids.length);
    }
  });

  it("warns for 1.2 seconds before every heavy attack", () => {
    for (const cfg of Object.values(BOSS_CONFIG_MAP)) expect(cfg.heavy.telegraphSec).toBe(1.2);
  });

  it("falls back to a difficulty-scaled config for unconfigured boss missions", () => {
    const fallback = getBossConfig("story_unknown", "rift-drone", 6);
    expect(fallback?.maxHealth).toBe(1100);
    expect(getBossConfig("story_unknown")).toBeUndefined();
  });
});

describe("stepBossEncounter", () => {
  it("stays in phase 1 with no heavy attack above 50% HP", () => {
    const { state, events } = run(30, { hpPct: 0.9 });
    expect(state.phase).toBe(1);
    expect(state.heavy).toBe("locked");
    expect(events).toEqual([]);
  });

  it("roars exactly once when HP crosses 50% and unlocks the heavy attack", () => {
    const { state, events } = run(0.1, { hpPct: 0.5 });
    expect(events).toEqual(["roar"]);
    expect(state.phase).toBe(2);
    expect(state.roarRemaining).toBeCloseTo(PHASE_ROAR_SEC);
    expect(run(5, { hpPct: 0.4 }, state).events.filter((e) => e === "roar")).toEqual([]);
  });

  it("does not trigger phase 2 on a dead boss", () => {
    expect(run(1, { hpPct: 0 }).state.phase).toBe(1);
  });

  it("telegraphs for 1.2s, then resolves the heavy attack", () => {
    let state = run(0.1, { hpPct: 0.45 }).state;
    let telegraphAt = -1;
    let impactAt = -1;
    for (let t = 0; t < 10; t += 0.01) {
      const out = stepBossEncounter(state, config, { ...base, hpPct: 0.45, dt: 0.01 });
      state = out.state;
      if (out.events.includes("telegraphStart")) telegraphAt = t;
      if (out.events.includes("heavyImpact")) { impactAt = t; break; }
    }
    expect(telegraphAt).toBeGreaterThan(0);
    expect(impactAt - telegraphAt).toBeGreaterThanOrEqual(1.19);
    expect(impactAt - telegraphAt).toBeLessThanOrEqual(1.23);
  });

  it("hits a player in range without i-frames and opens the short counter window", () => {
    const { events, state } = run(8, { hpPct: 0.4, playerDistance: 2 });
    expect(events).toContain("heavyHit");
    expect(events).toContain("counterOpen");
    expect(state.phase).toBe(2);
  });

  it("whiffs against a dodging player and opens the longer counter window", () => {
    const dodge = run(8, { hpPct: 0.4, playerInvulnerable: true });
    expect(dodge.events).toContain("heavyWhiff");
    expect(dodge.events).not.toContain("heavyHit");
    const far = run(8, { hpPct: 0.4, playerDistance: config.heavy.radius + 5 });
    expect(far.events).toContain("heavyWhiff");

    let state = run(0.1, { hpPct: 0.4 }).state;
    let windowSec = 0;
    let open = false;
    for (let t = 0; t < 12; t += 0.01) {
      const out = stepBossEncounter(state, config, { ...base, hpPct: 0.4, dt: 0.01, playerInvulnerable: true });
      state = out.state;
      if (out.events.includes("counterOpen")) open = true;
      if (open) windowSec += 0.01;
      if (out.events.includes("counterClose")) break;
    }
    expect(windowSec).toBeGreaterThanOrEqual(config.heavy.counterOnWhiffSec - 0.05);
    expect(config.heavy.counterOnWhiffSec).toBeGreaterThan(config.heavy.counterOnHitSec);
  });

  it("closes the counter window and cycles back to a cooldown", () => {
    const { events } = run(14, { hpPct: 0.4 });
    expect(events).toContain("counterClose");
    expect(events.filter((e) => e === "telegraphStart").length).toBeGreaterThanOrEqual(2);
  });

  it("never starts a heavy attack while the boss is not aggroed", () => {
    expect(run(20, { hpPct: 0.4, bossAggro: false }).events).not.toContain("telegraphStart");
  });
});
