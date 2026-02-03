import { useGame } from "../../lib/stores/useGame";
import { useRunner } from "../../lib/stores/useRunner";
import { useBattle } from "../../lib/stores/useBattle";
import { FIGHTERS, getFighterById } from "../../lib/characters";

export default function CharacterSelect() {
  const start = useGame((s) => s.start);
  const setGameState = useRunner((s) => s.setGameState);
  const setCharacter = useRunner((s) => s.setCharacter);
  const setPlayerFighter = useBattle((s) => s.setPlayerFighter);
  const setOpponentFighter = useBattle((s) => s.setOpponentFighter);

  const pick = (fighterId: string) => {
    setCharacter(fighterId);
    setPlayerFighter(fighterId);
    const others = FIGHTERS.map((f) => f.id).filter((id) => id !== fighterId);
    setOpponentFighter(others[Math.floor(Math.random() * others.length)] ?? fighterId);
    start();
    setGameState("playing");
  };

  return (
    <div className="min-h-screen w-full p-6 bg-gradient-to-b from-[#07070d] via-purple-950/30 to-[#07070d]">
      <h2 className="text-2xl font-bold text-white mb-6">Select Fighter</h2>
      <div className="flex flex-wrap gap-4">
        {FIGHTERS.map((f) => {
          const fighter = getFighterById(f.id);
          if (!fighter) return null;
          return (
            <button
              key={f.id}
              onClick={() => pick(f.id)}
              className="px-6 py-4 rounded-xl border-2 font-bold text-white transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${fighter.color}, ${fighter.accentColor})`,
                borderColor: fighter.accentColor,
              }}
            >
              {fighter.displayName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
