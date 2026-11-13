import { useEffect, useRef, useState } from "react";
import { useAdventure } from "../../lib/stores/useAdventure";
import { pushDamagePopup } from "../../lib/stores/useDamagePopups";
import { playSfx } from "../../lib/sfx";
import { useFusion } from "../../lib/stores/useFusion";
import { useCombo } from "../../lib/stores/useCombo";
import { PARRY } from "../../lib/parry";
import {
  COUNTER_DAMAGE_MULTIPLIER,
  PHASE_ROAR_SEC,
  createBossEncounterState,
  stepBossEncounter,
  type BossConfig,
  type BossEncounterState,
} from "../../lib/bossPhases";

export interface BossHudState {
  name: string;
  hp: number;
  maxHp: number;
  phase: 1 | 2;
  roar: boolean;
  heavy: "locked" | "cooldown" | "telegraph" | "counter";
  /** 0..1 progress through the heavy telegraph (fills as impact nears). */
  telegraphProgress: number;
  /** 0..1 remaining time in the counter window. */
  counterRemaining: number;
  dead: boolean;
}

const POST_HIT_INVULN_SEC = 0.42;

/**
 * Drives the two-phase boss encounter from a fixed 33ms timer.
 * At 50% HP the boss roars and unlocks a heavy attack with a 1.2s warning; after the
 * heavy lands or whiffs, a counter window opens in which the boss is stunned and takes extra damage.
 */
export function useBossEncounter(config: BossConfig | undefined, active: boolean): BossHudState | null {
  const [hud, setHud] = useState<BossHudState | null>(null);
  const stateRef = useRef<BossEncounterState>(createBossEncounterState());
  const lastHpRef = useRef<number | null>(null);

  useEffect(() => {
    if (!config || !active) {
      setHud(null);
      return;
    }
    stateRef.current = createBossEncounterState();
    lastHpRef.current = null;

    // A fixed timer, not requestAnimationFrame: boss thresholds, timers and the HUD must not slow down
    // or stall when rendering is slow (low-end phones, software GPUs).
    let last = performance.now();
    let lastHudMs = 0;

    const tick = () => {
      const now = performance.now();
      // Follow wall-clock time so the 1.2s warning is 1.2s on slow GPUs too; the cap only guards against
      // a backgrounded tab handing us a multi-second delta. Paused frames still advance `last`.
      const dt = Math.min(0.5, (now - last) / 1000);
      last = now;

      const adv = useAdventure.getState();
      if (adv.isPaused) return;
      const boss = adv.enemies.find((e) => e.bossKey === config.missionId);
      if (!boss) return;

      if (boss.isDead) {
        if (now - lastHudMs > 100) setHud((h) => (h ? { ...h, hp: 0, dead: true, heavy: "locked" } : h));
        return;
      }

      const player = adv.player;
      const dx = player.posX - boss.posX;
      const dz = player.posZ - boss.posZ;
      const prev = stateRef.current;

      // Counter window: bonus damage on top of whatever the player just dealt.
      if (prev.heavy === "counter" && lastHpRef.current !== null && boss.health < lastHpRef.current) {
        const extra = Math.round((lastHpRef.current - boss.health) * (COUNTER_DAMAGE_MULTIPLIER - 1));
        if (extra > 0) {
          adv.damageEnemy(boss.id, extra);
          pushDamagePopup({ x: boss.posX, y: boss.posY + 3, z: boss.posZ, amount: extra, kind: "critical" });
        }
      }

      const { state, events } = stepBossEncounter(prev, config, {
        dt,
        hpPct: boss.health / boss.maxHealth,
        playerDistance: Math.sqrt(dx * dx + dz * dz),
        playerInvulnerable: player.invulnTimer > 0,
        bossAggro: boss.isAggro,
      });
      stateRef.current = state;

      for (const event of events) {
        switch (event) {
          case "roar":
            playSfx("bossRoar");
            adv.triggerScreenShake(1.4);
            adv.triggerImpactFlash(config.aura.color);
            useAdventure.setState((s) => ({ enemies: s.enemies.map((e) => (e.id === boss.id ? { ...e, bossPhase: 2 } : e)) }));
            break;
          case "telegraphStart":
            playSfx("castT2");
            adv.setEnemyAIState(boss.id, "telegraph");
            useAdventure.setState((s) => ({ enemies: s.enemies.map((e) => (e.id === boss.id ? { ...e, bossStage: "telegraph" } : e)) }));
            break;
          case "heavyHit": {
            adv.damagePlayer(config.heavy.damage);
            adv.setInvulnTimer(POST_HIT_INVULN_SEC);
            adv.triggerScreenShake(1.2);
            adv.triggerImpactFlash("#ff2b2b");
            playSfx("hitHeavy");
            pushDamagePopup({ x: player.posX, y: player.posY + 2.4, z: player.posZ, amount: config.heavy.damage, kind: "elemental" });
            break;
          }
          case "heavyWhiff":
            playSfx("whoosh");
            adv.triggerScreenShake(0.6);
            // A dodge timed into the opening of the window is a parry: bigger reward, combo stays alive.
            if (player.parryTimer > 0) {
              useFusion.getState().addCharge(PARRY.fusionCharge);
              useCombo.getState().parry();
              pushDamagePopup({ x: player.posX, y: player.posY + 2.4, z: player.posZ, amount: 0, kind: "critical", text: "PARRY!" });
              playSfx("block");
            }
            break;
          case "counterOpen":
            adv.setEnemyAIState(boss.id, "stun");
            useAdventure.setState((s) => ({ enemies: s.enemies.map((e) => (e.id === boss.id ? { ...e, bossStage: "counter" } : e)) }));
            break;
          case "counterClose":
            adv.setEnemyAIState(boss.id, "chase");
            useAdventure.setState((s) => ({ enemies: s.enemies.map((e) => (e.id === boss.id ? { ...e, bossStage: null } : e)) }));
            break;
          default:
            break;
        }
      }

      // Hold the boss in place for the roar, the heavy wind-up and the counter window.
      if (state.roarRemaining > 0 || state.heavy === "telegraph" || state.heavy === "counter") {
        adv.setEnemyStun(boss.id, 0.25);
        adv.setEnemyAttacking(boss.id, false);
      }

      lastHpRef.current = useAdventure.getState().enemies.find((e) => e.id === boss.id)?.health ?? boss.health;

      if (now - lastHudMs > 90) {
        lastHudMs = now;
        const telegraphProgress = state.heavy === "telegraph" ? 1 - state.timer / config.heavy.telegraphSec : 0;
        const counterTotal = state.heavy === "counter" ? Math.max(config.heavy.counterOnHitSec, config.heavy.counterOnWhiffSec) : 1;
        setHud({
          name: config.displayName,
          hp: Math.max(0, boss.health),
          maxHp: boss.maxHealth,
          phase: state.phase,
          roar: state.roarRemaining > 0,
          heavy: state.heavy,
          telegraphProgress,
          counterRemaining: state.heavy === "counter" ? Math.min(1, state.timer / counterTotal) : 0,
          dead: false,
        });
      }
    };

    const timer = setInterval(tick, 33);
    return () => clearInterval(timer);
  }, [config, active]);

  return hud;
}

/** Boss health bar, phase banner, 1.2s heavy-attack warning and counter-window prompt. */
export function BossEncounterHUD({ hud }: { hud: BossHudState | null }) {
  if (!hud) return null;
  const pct = Math.max(0, Math.min(100, (hud.hp / hud.maxHp) * 100));
  const warning = hud.heavy === "telegraph";
  const counter = hud.heavy === "counter";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[17.5rem] z-40 flex flex-col items-center gap-2 px-3 sm:top-[7.5rem]"
      style={{ marginTop: "env(safe-area-inset-top)", paddingLeft: "max(0.75rem, env(safe-area-inset-left))", paddingRight: "max(0.75rem, env(safe-area-inset-right))" }}
      data-testid="boss-hud"
      data-phase={hud.phase}
      data-heavy={hud.heavy}
    >
      <div className="w-full max-w-xl">
        <div className="mb-1 flex items-baseline justify-between text-[10px] uppercase tracking-[0.25em] text-[#e9d7ad]">
          <span className="truncate font-bold" data-testid="boss-name">{hud.name}</span>
          <span className="tabular-nums" data-testid="boss-hp-text">{Math.ceil(hud.hp)} / {hud.maxHp}</span>
        </div>
        <div className="relative h-3 border border-[#7d6136] bg-black/70">
          <div className="h-full transition-[width] duration-150" style={{ width: `${pct}%`, background: hud.phase === 2 ? "linear-gradient(90deg,#3b0a0a,var(--kj-bad))" : "linear-gradient(90deg,#0b2a1a,var(--kj-good))" }} />
          <div className="absolute inset-y-0 left-1/2 w-px bg-[#f5e6bd]/70" aria-hidden="true" />
        </div>
        <div className="mt-1 text-center text-[9px] uppercase tracking-[0.35em] text-[#b39a6a]">Phase {hud.phase}</div>
      </div>

      {hud.roar ? (
        <div className="animate-pulse text-center text-xl font-black uppercase tracking-[0.3em] text-red-400 drop-shadow-[0_0_14px_rgba(239,68,68,0.9)]" data-testid="boss-roar" style={{ animationDuration: `${PHASE_ROAR_SEC / 3}s` }}>
          Phase 2 · Enraged
        </div>
      ) : null}

      {warning ? (
        <div className="w-full max-w-sm text-center" data-testid="boss-heavy-warning">
          <div className="animate-pulse text-sm font-black uppercase tracking-[0.35em] text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.9)]">⚠ Heavy attack · dodge!</div>
          <div className="mt-1 h-2 border border-red-500/80 bg-black/60">
            <div className="h-full" style={{ width: `${Math.round(hud.telegraphProgress * 100)}%`, background: "var(--kj-bad)" }} />
          </div>
        </div>
      ) : null}

      {counter ? (
        <div className="w-full max-w-sm text-center" data-testid="boss-counter-window">
          <div className="text-sm font-black uppercase tracking-[0.35em] text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]">Counter! +50% damage</div>
          <div className="mt-1 h-2 border border-cyan-300/80 bg-black/60">
            <div className="h-full bg-cyan-300" style={{ width: `${Math.round(hud.counterRemaining * 100)}%` }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
