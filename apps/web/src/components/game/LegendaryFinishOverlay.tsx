import { useBattle } from "../../lib/stores/useBattle";

export default function LegendaryFinishOverlay() {
  const battlePhase = useBattle((s) => s.battlePhase);
  const winner = useBattle((s) => s.winner);
  const legendaryFinish = useBattle((s) => s.legendaryFinish);

  if (battlePhase !== "ko" || winner !== "player" || !legendaryFinish) return null;

  return (
    <div
      className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
      style={{ animation: "legendaryPulse 0.5s ease-out" }}
    >
      <div
        className="text-[clamp(3rem,12vw,8rem)] font-black tracking-[0.2em] uppercase opacity-90"
        style={{
          background: "linear-gradient(180deg, #FFE066 0%, #FFD700 40%, #B8860B 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textShadow: "0 0 80px rgba(255,224,102,0.8), 0 0 120px rgba(255,215,0,0.5)",
          filter: "drop-shadow(0 0 30px rgba(255,215,0,0.9))",
        }}
      >
        LEGENDARY
      </div>
      <style>{`
        @keyframes legendaryPulse {
          0% { opacity: 0; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1.1); }
          60% { transform: scale(1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
