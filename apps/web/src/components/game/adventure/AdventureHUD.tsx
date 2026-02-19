import { useAdventure } from "../../../lib/stores/useAdventure";
import { useRunner } from "../../../lib/stores/useRunner";

function HealthBar({
  current,
  max,
  color,
  label,
}: {
  current: number;
  max: number;
  color: string;
  label: string;
}) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-slate-400 w-6">{label}</span>
      <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
      <span className="text-xs font-mono text-slate-300 w-12 text-right">
        {Math.ceil(current)}
      </span>
    </div>
  );
}

export default function AdventureHUD() {
  const player = useAdventure((s) => s.player);
  const enemies = useAdventure((s) => s.enemies);
  const waveCount = useAdventure((s) => s.waveCount);
  const enemiesDefeated = useAdventure((s) => s.enemiesDefeated);
  const isPaused = useAdventure((s) => s.isPaused);
  const setGameState = useRunner((s) => s.setGameState);

  const aliveEnemies = enemies.filter((e) => !e.isDead).length;

  if (isPaused) {
    return (
      <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-black text-white tracking-tight">
            PAUSED
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => useAdventure.getState().togglePause()}
              className="block w-48 mx-auto px-6 py-3 rounded-xl bg-cyan-500/20 border-2 border-cyan-400 text-cyan-100 font-bold hover:bg-cyan-500/30 transition-all"
            >
              Resume
            </button>
            <button
              onClick={() => {
                useAdventure.getState().reset();
                setGameState("menu");
              }}
              className="block w-48 mx-auto px-6 py-3 rounded-xl bg-slate-700/60 border-2 border-slate-500 text-slate-200 font-bold hover:bg-slate-600/60 transition-all"
            >
              Quit to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      <div className="absolute top-4 left-4 right-4 pointer-events-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="w-64 space-y-1 bg-black/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
            <HealthBar
              current={player.health}
              max={player.maxHealth}
              color="#22d3ee"
              label="HP"
            />
            <HealthBar
              current={player.stamina}
              max={player.maxStamina}
              color="#a855f7"
              label="SP"
            />
          </div>

          <div className="flex items-center gap-4 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-700/50">
            <div className="text-center">
              <div className="text-xs text-slate-400">Wave</div>
              <div className="text-lg font-black text-cyan-300">{waveCount}</div>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center">
              <div className="text-xs text-slate-400">Enemies</div>
              <div className="text-lg font-black text-red-400">{aliveEnemies}</div>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center">
              <div className="text-xs text-slate-400">KOs</div>
              <div className="text-lg font-black text-green-400">{enemiesDefeated}</div>
            </div>
          </div>
        </div>
      </div>

      {player.combo > 1 && (
        <div className="absolute top-1/4 right-8 text-right">
          <div
            className="text-5xl font-black text-transparent bg-clip-text animate-pulse"
            style={{
              backgroundImage: "linear-gradient(135deg, #00f2ff, #7f00ff)",
            }}
          >
            {player.combo}x
          </div>
          <div className="text-sm font-bold text-cyan-300 tracking-widest">
            COMBO
          </div>
        </div>
      )}

      {player.isAttacking && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="text-2xl font-black text-white uppercase tracking-wider animate-ping opacity-60">
            {player.attackType}!
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-0 right-0 text-center">
        <div className="inline-flex gap-3 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-700/50 text-slate-400 text-xs">
          <span>WASD move</span>
          <span className="text-slate-600">|</span>
          <span>Shift run</span>
          <span className="text-slate-600">|</span>
          <span>J punch</span>
          <span className="text-slate-600">|</span>
          <span>K kick</span>
          <span className="text-slate-600">|</span>
          <span>L special</span>
          <span className="text-slate-600">|</span>
          <span>R ultimate</span>
          <span className="text-slate-600">|</span>
          <span>Esc pause</span>
        </div>
      </div>
    </div>
  );
}
