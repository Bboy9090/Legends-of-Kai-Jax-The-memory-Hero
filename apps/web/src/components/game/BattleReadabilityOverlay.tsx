import { Html } from "@react-three/drei";
import { useBattle } from "../../lib/stores/useBattle";
import { getFighterById } from "../../lib/characters";

export default function BattleReadabilityOverlay() {
  const playerId = useBattle((s) => s.playerFighterId);
  const opponentId = useBattle((s) => s.opponentFighterId);
  const playerX = useBattle((s) => s.playerX);
  const opponentX = useBattle((s) => s.opponentX);
  const phase = useBattle((s) => s.battlePhase);

  if (phase !== "fighting" && phase !== "transforming") return null;

  const player = getFighterById(playerId);
  const opponent = getFighterById(opponentId);
  const separation = Math.abs(playerX - opponentX);
  const stretched = separation > 11;
  const playerAtWall = Math.abs(playerX) > 9.2;
  const opponentAtWall = Math.abs(opponentX) > 9.2;

  return (
    <Html fullscreen style={{ pointerEvents: "none" }}>
      <div className="absolute inset-0 text-white select-none">
        <div className="absolute top-24 left-4 sm:left-8 flex flex-col items-start gap-1">
          <div className="rounded-full border border-cyan-300/60 bg-cyan-950/80 px-3 py-1 text-[11px] font-black tracking-[0.22em] text-cyan-200 shadow-lg">
            YOU
          </div>
          <div className="max-w-[40vw] truncate rounded bg-black/65 px-2 py-1 text-xs font-bold text-white/90">
            {player?.displayName ?? playerId}
          </div>
          {playerAtWall && (
            <div className="rounded bg-amber-500/85 px-2 py-1 text-[10px] font-black tracking-widest text-black">
              WALL
            </div>
          )}
        </div>

        <div className="absolute top-24 right-4 sm:right-8 flex flex-col items-end gap-1">
          <div className="rounded-full border border-red-300/60 bg-red-950/80 px-3 py-1 text-[11px] font-black tracking-[0.22em] text-red-200 shadow-lg">
            CPU
          </div>
          <div className="max-w-[40vw] truncate rounded bg-black/65 px-2 py-1 text-xs font-bold text-white/90">
            {opponent?.displayName ?? opponentId}
          </div>
          {opponentAtWall && (
            <div className="rounded bg-amber-500/85 px-2 py-1 text-[10px] font-black tracking-widest text-black">
              WALL
            </div>
          )}
        </div>

        {stretched && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/70 px-4 py-2 text-center text-[10px] font-black tracking-[0.18em] text-white/80">
            FIGHTERS SPREAD — CAMERA WIDENING
          </div>
        )}
      </div>
    </Html>
  );
}
