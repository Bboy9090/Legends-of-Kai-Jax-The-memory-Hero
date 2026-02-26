import { useState } from "react";
import { useRunner, UNLOCKABLE_ARENAS, isArenaUnlocked } from "../../lib/stores/useRunner";
import { getArenaById } from "../../lib/arenas";
import { ArrowLeft, Store, Zap, Sparkles } from "../ui/icons";

export type XpItemType = "skin" | "upgrade";

export const XP_PURCHASABLE_ITEMS: {
  id: string;
  label: string;
  cost: number;
  description: string;
  type: XpItemType;
}[] = [
  { id: "comboWindow", label: "Combo Window Upgrade", cost: 200, description: "Extends combo timer from 2.3s to 2.5s for easier follow-ups.", type: "upgrade" },
  { id: "kai-inferno", label: "Kai Inferno Skin", cost: 500, description: "Alternate skin for Kai.", type: "skin" },
  { id: "jax-crystal", label: "Jax Crystal Skin", cost: 500, description: "Alternate skin for Jax.", type: "skin" },
];

function WalletBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-600">
      <span className="text-slate-400 text-xs font-medium">{label}</span>
      <span className="text-cyan-300 font-bold tabular-nums">{value.toLocaleString()}</span>
    </div>
  );
}

export default function ShopView() {
  const { setGameState, currency, xp, unlockedArenas, unlockedSkins, unlockedUpgrades, unlockArena, unlockWithXp } = useRunner();
  const [activeTab, setActiveTab] = useState<"arenas" | "xp">("arenas");

  const isXpItemUnlocked = (id: string, type: XpItemType) =>
    type === "skin" ? unlockedSkins.includes(id) : unlockedUpgrades.includes(id);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#07070d] via-purple-950/30 to-[#07070d] text-white p-6 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setGameState("menu")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-600 bg-slate-900/60 hover:border-cyan-400/60 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-300" />
            <span className="font-bold">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <WalletBadge label="XP" value={xp} />
            <WalletBadge label="Gold" value={currency} />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Store className="w-8 h-8 text-amber-400" />
          <h1 className="text-3xl font-black text-white tracking-tight">Unlocks</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("arenas")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === "arenas" ? "bg-amber-500/80 text-slate-900" : "bg-slate-800/80 border border-slate-600 hover:border-slate-500"
            }`}
          >
            <Store className="w-4 h-4" />
            Arenas
          </button>
          <button
            onClick={() => setActiveTab("xp")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === "xp" ? "bg-cyan-500/80 text-slate-900" : "bg-slate-800/80 border border-slate-600 hover:border-slate-500"
            }`}
          >
            <Zap className="w-4 h-4" />
            XP Upgrades
          </button>
        </div>

        {activeTab === "arenas" && (
          <>
        <p className="text-slate-400 text-sm mb-6">
          Spend gold to unlock new arenas. Earn gold by completing missions in Story Mode or UEE.
        </p>

        <div className="space-y-4">
          {UNLOCKABLE_ARENAS.map(({ id, cost }) => {
            const arena = getArenaById(id);
            const unlocked = isArenaUnlocked(unlockedArenas, id);
            const canAfford = currency >= cost;

            return (
              <div
                key={id}
                className={`rounded-xl border-2 p-4 transition-all flex items-center justify-between gap-4 ${
                  unlocked
                    ? "bg-green-900/20 border-green-500/50"
                    : "bg-slate-900/60 border-slate-600"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{arena?.displayName ?? id}</h3>
                    {unlocked && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/30 text-green-300 font-semibold">
                        OWNED
                      </span>
                    )}
                  </div>
                  {arena && (
                    <p className="text-xs text-slate-400 mt-1 truncate">{arena.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {unlocked ? (
                    <span className="text-green-400 font-medium text-sm">Unlocked</span>
                  ) : (
                    <>
                      <span className="text-amber-300 font-bold">{cost} Gold</span>
                      <button
                        onClick={() => unlockArena(id, cost)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                          canAfford
                            ? "bg-amber-500/80 hover:bg-amber-500 text-slate-900"
                            : "bg-slate-700 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        Unlock
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
          </>
        )}

        {activeTab === "xp" && (
          <>
        <p className="text-slate-400 text-sm mb-6">
          Spend XP to unlock upgrades and skins. Earn XP by completing missions.
        </p>
        <div className="space-y-4">
          {XP_PURCHASABLE_ITEMS.map(({ id, label, cost, description, type }) => {
            const unlocked = isXpItemUnlocked(id, type);
            const canAfford = xp >= cost;

            return (
              <div
                key={id}
                className={`rounded-xl border-2 p-4 transition-all flex items-center justify-between gap-4 ${
                  unlocked
                    ? "bg-green-900/20 border-green-500/50"
                    : "bg-slate-900/60 border-slate-600"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <h3 className="font-bold text-white">{label}</h3>
                    {unlocked && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/30 text-green-300 font-semibold">
                        OWNED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{description}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {unlocked ? (
                    <span className="text-green-400 font-medium text-sm">Unlocked</span>
                  ) : (
                    <>
                      <span className="text-cyan-300 font-bold">{cost} XP</span>
                      <button
                        onClick={() => unlockWithXp(id, cost)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                          canAfford
                            ? "bg-cyan-500/80 hover:bg-cyan-500 text-slate-900"
                            : "bg-slate-700 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        Unlock
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
          </>
        )}
      </div>
    </div>
  );
}
