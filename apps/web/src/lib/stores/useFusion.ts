import { create } from "zustand";
import { FUSION, addCharge, initialFusion, stepFusion, toggleFusion, type FusionEvent, type FusionState } from "../fusion";
import { useAdventure } from "./useAdventure";
import { useRunner } from "./useRunner";
import { pushDamagePopup } from "./useDamagePopups";
import { playSfx } from "../sfx";

interface FusionStore extends FusionState {
  /** Last player-facing message, e.g. "FUSION LOCKED (STORY)". */
  notice: { text: string; at: number } | null;
  reset: () => void;
  addCharge: (amount: number) => void;
  fillCharge: () => void;
  tick: (dt: number) => void;
  toggle: () => FusionEvent;
}

const NOTICE: Partial<Record<FusionEvent, string>> = {
  locked: "FUSION LOCKED (STORY)",
  "need-charge": "CHARGE FUSION TO 100%",
  cooldown: "FUSION RECHARGING",
};

export const isFusionUnlocked = () => {
  const r = useRunner.getState();
  return Boolean(r.profiles[r.activeProfileIndex]?.fusionUnlocked);
};

const pick = (s: FusionStore): FusionState => ({ charge: s.charge, timeLeft: s.timeLeft, cooldown: s.cooldown, baseFighterId: s.baseFighterId });

function setFighter(fighterId: string) {
  useAdventure.setState((s) => ({ player: { ...s.player, fighterId } }));
}

export const useFusion = create<FusionStore>((set, get) => ({
  ...initialFusion(),
  notice: null,

  reset: () => {
    const base = get().baseFighterId;
    if (base) setFighter(base);
    set({ ...initialFusion(), notice: null });
  },

  addCharge: (amount) => set(addCharge(pick(get()), amount, isFusionUnlocked())),
  fillCharge: () => set({ charge: 100 }),

  tick: (dt) => {
    const before = pick(get());
    const { state, expired } = stepFusion(before, dt);
    set(state);
    // The step clears baseFighterId when the form ends, so restore from the value captured beforehand.
    if (expired && before.baseFighterId) setFighter(before.baseFighterId);
  },

  toggle: () => {
    const adv = useAdventure.getState();
    const before = pick(get());
    const { state, event } = toggleFusion(before, isFusionUnlocked(), adv.player.fighterId);
    set({ ...state, ...(NOTICE[event] ? { notice: { text: NOTICE[event]!, at: Date.now() } } : {}) });

    if (event === "started") {
      setFighter(FUSION.formId);
      const p = useAdventure.getState().player;
      adv.triggerScreenShake(1.2);
      adv.triggerImpactFlash("#a855f7");
      playSfx("ultimate");
      for (const e of useAdventure.getState().enemies) {
        if (e.isDead) continue;
        const dx = e.posX - p.posX;
        const dz = e.posZ - p.posZ;
        if (Math.hypot(dx, dz) > FUSION.burst.radius) continue;
        useAdventure.getState().damageEnemy(e.id, FUSION.burst.damage, true);
        useAdventure.getState().setEnemyStun(e.id, FUSION.burst.stun);
        pushDamagePopup({ x: e.posX, y: e.posY + 2.4, z: e.posZ, amount: FUSION.burst.damage, kind: "ultimate" });
      }
    } else if (event === "cancelled") {
      setFighter(before.baseFighterId ?? adv.player.fighterId);
    }
    return event;
  },
}));

if (typeof window !== "undefined") (window as unknown as { fusionStore: typeof useFusion }).fusionStore = useFusion;
