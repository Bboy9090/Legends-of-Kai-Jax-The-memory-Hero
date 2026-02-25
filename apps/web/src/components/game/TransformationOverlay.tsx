import { useBattle } from "../../lib/stores/useBattle";

export default function TransformationOverlay() {
  const battlePhase = useBattle((s) => s.battlePhase);

  if (battlePhase !== "transforming") return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
      <div
        className="text-center animate-[fadeScale_2s_ease-out]"
        style={{
          textShadow: "0 0 40px #FFD700, 0 0 80px #FF6B00",
        }}
      >
        <div className="text-5xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300">
          KAI-JAX
        </div>
        <div className="text-2xl sm:text-3xl mt-2 font-bold text-amber-200/90 tracking-[0.3em]">
          AWAKENED
        </div>
      </div>
      <style>{`
        @keyframes fadeScale {
          0% { opacity: 0; transform: scale(1.5); }
          20% { opacity: 1; transform: scale(1.1); }
          80% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
