import { useBattle } from "../../lib/stores/useBattle";
import { useSettings, getColorblindAccent } from "../../lib/stores/useSettings";

/** Maps world X (-10..10) to screen percent (left 20% .. right 80%) */
function worldXToPercent(x: number): number {
  return 20 + ((x + 10) / 20) * 60;
}

export default function DamageNumbers() {
  const damageNumbers = useBattle((s) => s.damageNumbers);
  const colorblindMode = useSettings((s) => s.colorblindMode);
  const playerColor = getColorblindAccent("#00f2ff", "player", colorblindMode);
  const opponentColor = getColorblindAccent("#ef4444", "opponent", colorblindMode);
  // isPlayerHit = damage to player (opponent dealt) -> opponent color
  // !isPlayerHit = damage to opponent (player dealt) -> player color
  const getColor = (isPlayerHit: boolean) => (isPlayerHit ? opponentColor : playerColor);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {damageNumbers.map((d) => {
        const isLegendary = d.amount >= 60;
        const isBig = d.amount >= 40;
        const size = isLegendary ? "clamp(2.5rem, 7vw, 4rem)" : isBig ? "clamp(2rem, 5vw, 3.2rem)" : "clamp(1.5rem, 4vw, 2.5rem)";
        return (
          <div
            key={d.id}
            className={`absolute font-black text-center ${isLegendary ? "animate-damage-float-legendary" : isBig ? "animate-damage-float-big" : "animate-damage-float"}`}
            style={{
              left: `${worldXToPercent(d.x)}%`,
              top: "38%",
              transform: "translate(-50%, 0)",
              color: colorblindMode === "off" ? (d.isPlayerHit ? "#ff6b6b" : isLegendary ? "#FFE066" : "#ffd93d") : getColor(d.isPlayerHit),
              textShadow: isLegendary
                ? "0 0 24px currentColor, 0 0 48px currentColor, 0 0 72px rgba(255,224,102,0.6), 0 2px 8px rgba(0,0,0,0.9)"
                : isBig
                  ? "0 0 20px currentColor, 0 0 40px currentColor, 0 2px 6px rgba(0,0,0,0.9)"
                  : "0 0 12px currentColor, 0 2px 4px rgba(0,0,0,0.8), 0 0 24px rgba(255,100,100,0.6)",
              fontSize: size,
            }}
          >
            {d.amount}
          </div>
        );
      })}
      <style>{`
        @keyframes damageFloat {
          0% { opacity: 1; transform: translate(-50%, 0) scale(0.9); }
          100% { opacity: 0; transform: translate(-50%, -90px) scale(1.2); }
        }
        @keyframes damageFloatBig {
          0% { opacity: 1; transform: translate(-50%, 0) scale(0.9); }
          100% { opacity: 0; transform: translate(-50%, -90px) scale(1.3); }
        }
        @keyframes damageFloatLegendary {
          0% { opacity: 1; transform: translate(-50%, 0) scale(0.8); }
          20% { transform: translate(-50%, -15px) scale(1.4); }
          100% { opacity: 0; transform: translate(-50%, -110px) scale(1.5); }
        }
        .animate-damage-float {
          animation: damageFloat 1s ease-out forwards;
        }
        .animate-damage-float-big {
          animation: damageFloatBig 1s ease-out forwards;
        }
        .animate-damage-float-legendary {
          animation: damageFloatLegendary 1.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
