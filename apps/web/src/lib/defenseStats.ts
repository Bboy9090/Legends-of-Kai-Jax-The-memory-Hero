/**
 * Defense statistics for tuning the parry window: every enemy strike that reaches the player is recorded as a
 * parry, evade or hit, with how long after the dodge press it landed. Pure functions; persistence lives in
 * stores/useDefenseStats.ts. Nothing leaves the device.
 */
import type { ParryTiming } from "./parry";

export type DefenseOutcome = "parry" | "evade" | "hit";

/** Upper edges (seconds after the dodge press) of the timing histogram buckets; the last one is the i-frame end. */
export const DELAY_BUCKETS = [0.05, 0.1, 0.15, 0.2, 0.267] as const;

export interface TimingCounters {
  parry: number;
  evade: number;
  /** Hits where the player had pressed dodge shortly before (too early to cover the strike). */
  hitMistimed: number;
  /** Hits with no recent dodge attempt. */
  hitNoDodge: number;
  /** Dodges pressed. */
  dodges: number;
  /** Parry/evade counts by delay bucket since the press: [0-50ms, 50-100, 100-150, 150-200, 200-267]. */
  delayHistogram: number[];
}

export interface DefenseStats {
  version: 1;
  startedAt: string;
  byTiming: Record<ParryTiming, TimingCounters>;
}

export const emptyCounters = (): TimingCounters => ({ parry: 0, evade: 0, hitMistimed: 0, hitNoDodge: 0, dodges: 0, delayHistogram: DELAY_BUCKETS.map(() => 0) });

export const emptyStats = (now = new Date()): DefenseStats => ({
  version: 1,
  startedAt: now.toISOString(),
  byTiming: { standard: emptyCounters(), generous: emptyCounters() },
});

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);

function normalizeCounters(raw: unknown): TimingCounters {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const hist = Array.isArray(o.delayHistogram) ? o.delayHistogram : [];
  return {
    parry: num(o.parry),
    evade: num(o.evade),
    hitMistimed: num(o.hitMistimed),
    hitNoDodge: num(o.hitNoDodge),
    dodges: num(o.dodges),
    delayHistogram: DELAY_BUCKETS.map((_, i) => num(hist[i])),
  };
}

/** Accepts anything stored (older version, hand-edited, corrupt) and returns valid stats. */
export function normalizeStats(raw: unknown): DefenseStats {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const by = (o.byTiming && typeof o.byTiming === "object" ? o.byTiming : {}) as Record<string, unknown>;
  const started = typeof o.startedAt === "string" && !Number.isNaN(Date.parse(o.startedAt)) ? o.startedAt : new Date().toISOString();
  return { version: 1, startedAt: started, byTiming: { standard: normalizeCounters(by.standard), generous: normalizeCounters(by.generous) } };
}

export function bucketIndex(delaySeconds: number): number {
  for (let i = 0; i < DELAY_BUCKETS.length; i++) if (delaySeconds <= DELAY_BUCKETS[i]) return i;
  return DELAY_BUCKETS.length - 1;
}

/** How long a press can precede a hit and still be reported as "mistimed" rather than "no dodge". */
export const MISTIMED_WITHIN = 0.6;

export function recordDodge(s: DefenseStats, timing: ParryTiming): DefenseStats {
  const c = s.byTiming[timing];
  return { ...s, byTiming: { ...s.byTiming, [timing]: { ...c, dodges: c.dodges + 1 } } };
}

export interface DefenseEvent {
  outcome: DefenseOutcome;
  timing: ParryTiming;
  /** Seconds between the dodge press and the strike, when a dodge was pressed. */
  delay?: number | null;
}

export function recordStrike(s: DefenseStats, e: DefenseEvent): DefenseStats {
  const c = { ...s.byTiming[e.timing], delayHistogram: [...s.byTiming[e.timing].delayHistogram] };
  if (e.outcome === "parry" || e.outcome === "evade") {
    c[e.outcome] += 1;
    if (typeof e.delay === "number" && Number.isFinite(e.delay) && e.delay >= 0) c.delayHistogram[bucketIndex(e.delay)] += 1;
  } else if (typeof e.delay === "number" && e.delay >= 0 && e.delay <= MISTIMED_WITHIN) c.hitMistimed += 1;
  else c.hitNoDodge += 1;
  return { ...s, byTiming: { ...s.byTiming, [e.timing]: c } };
}

export interface StatsSummary {
  strikes: number;
  parry: number;
  evade: number;
  hit: number;
  parryPct: number;
  evadePct: number;
  hitPct: number;
  /** Of the strikes where the player tried to dodge, the share that were parried. */
  parryOfAttemptedPct: number;
  mistimedPct: number;
}

const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 1000) / 10 : 0);

export function summarize(c: TimingCounters): StatsSummary {
  const hit = c.hitMistimed + c.hitNoDodge;
  const strikes = c.parry + c.evade + hit;
  const attempted = c.parry + c.evade + c.hitMistimed;
  return {
    strikes,
    parry: c.parry,
    evade: c.evade,
    hit,
    parryPct: pct(c.parry, strikes),
    evadePct: pct(c.evade, strikes),
    hitPct: pct(hit, strikes),
    parryOfAttemptedPct: pct(c.parry, attempted),
    mistimedPct: pct(c.hitMistimed, attempted),
  };
}
