/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES
 * In-battle taunts, smirks, and encouragement.
 * Fighters taunt each other, smirk on hit, and encourage one another.
 */

import { useBattle } from '../../lib/stores/useBattle';
import { getFighterById } from '../../lib/characters';

export default function BattleBanter() {
  const { battleBanter, battlePhase, playerFighterId, opponentFighterId } = useBattle();
  const playerFighter = getFighterById(playerFighterId);
  const opponentFighter = getFighterById(opponentFighterId);

  if (battlePhase !== 'fighting' || !battleBanter) {
    return null;
  }

  const isPlayer = battleBanter.source === 'player';
  const fighter = isPlayer ? playerFighter : opponentFighter;
  if (!fighter) return null;

  const typeStyles = {
    taunt: 'bg-amber-500/90 border-amber-300 text-black',
    smirk: 'bg-cyan-500/90 border-cyan-300 text-black',
    encourage: 'bg-green-500/90 border-green-300 text-white',
  };
  const style = typeStyles[battleBanter.type] || typeStyles.taunt;

  return (
    <div
      className={`fixed left-1/2 top-[22%] -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-300`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`px-5 py-3 rounded-xl border-2 shadow-lg backdrop-blur-sm max-w-md text-center ${style}`}
      >
        <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-0.5">
          {fighter.name} — {battleBanter.type}
        </p>
        <p className="text-lg font-black leading-tight">{battleBanter.text}</p>
      </div>
    </div>
  );
}
