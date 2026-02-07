import { useRunner, isCampaignNodeUnlocked, type CampaignNodeId } from "../../lib/stores/useRunner";
import { useGame } from "../../lib/stores/useGame";
import { useBattle } from "../../lib/stores/useBattle";
import { FIGHTERS } from "../../lib/characters";
import { MapPin, Swords, Skull, ChevronRight } from "../ui/icons";

const NODES: { id: CampaignNodeId; label: string; boss?: boolean; hint?: string }[] = [
  { id: "start", label: "City Gate", hint: "Begin your journey." },
  { id: "district-1", label: "Outskirts", hint: "Waves of enforcers." },
  { id: "district-2", label: "Market Quarter", hint: "Clear the block." },
  { id: "district-3", label: "Docks", hint: "Objectives here." },
  { id: "mid-boss", label: "Tower of Trials", boss: true, hint: "First major boss." },
  { id: "district-4", label: "Inner City", hint: "Push toward the core." },
  { id: "district-5", label: "Citadel Approach", hint: "Almost there." },
  { id: "final-boss", label: "The Memory Throne", boss: true, hint: "The Big Bad awaits." },
];

function pickRandomOpponent(excludeId: string): string {
  const ids = FIGHTERS.map((f) => f.id).filter((id) => id !== excludeId);
  return ids[Math.floor(Math.random() * ids.length)] || excludeId;
}

export default function CampaignMap() {
  const { setGameState, campaignCompletedNodes, setCampaignCurrentNode, selectedCharacter } = useRunner();
  const start = useGame((s) => s.start);
  const { setArena, setPlayerFighter, setOpponentFighter } = useBattle();

  const startNode = (nodeId: CampaignNodeId) => {
    setCampaignCurrentNode(nodeId);
    const characterId = selectedCharacter ?? FIGHTERS[0]?.id ?? "jaxon";
    setPlayerFighter(characterId);
    setOpponentFighter(pickRandomOpponent(characterId));
    setArena(nodeId === "final-boss" ? "green-valley" : "mushroom-plains");
    start();
    setGameState("playing");
  };

  return (
    <div
      className="min-h-screen w-full p-6 overflow-auto text-white"
      style={{ background: "linear-gradient(160deg, #0a0a1a 0%, #1a0a2e 50%, #0d0d1a 100%)" }}
    >
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setGameState("menu")}
          className="mb-6 px-4 py-2.5 rounded-xl border-2 border-slate-600 bg-slate-900/60 text-slate-300 hover:border-cyan-400/60 hover:bg-slate-800/60 transition-all"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-black tracking-tight mb-1">Campaign</h1>
        <p className="text-slate-400 mb-2">
          Fight through the city: waves of enemies, objectives, and bosses. Reach the Memory Throne and face the Big Bad.
        </p>
        <div className="mb-8 flex items-center gap-2 text-sm">
          <span className="text-slate-500">Progress</span>
          <div className="flex-1 h-2 max-w-[200px] bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${(campaignCompletedNodes.length / NODES.length) * 100}%` }}
            />
          </div>
          <span className="text-cyan-300 font-bold tabular-nums">{campaignCompletedNodes.length} / {NODES.length}</span>
        </div>

        <div className="space-y-2">
          {NODES.map((node, index) => {
            const completed = campaignCompletedNodes.includes(node.id);
            const unlocked = isCampaignNodeUnlocked(campaignCompletedNodes, node.id);
            const isLast = index === NODES.length - 1;

            return (
              <div key={node.id} className="flex items-center gap-4">
                <button
                  onClick={() => unlocked && startNode(node.id)}
                  disabled={!unlocked}
                  className={`flex-1 text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 active:scale-[0.99] ${
                    completed
                      ? "bg-green-900/30 border-green-500/60 text-green-200 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                      : unlocked
                        ? "bg-slate-800/60 border-cyan-500/50 text-white hover:border-cyan-400 hover:bg-slate-700/60 hover:shadow-[0_0_24px_rgba(34,211,238,0.15)]"
                        : "bg-slate-900/40 border-slate-700 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 border border-slate-600">
                    {node.boss ? (
                      <Skull className="w-5 h-5 text-amber-400" />
                    ) : (
                      <MapPin className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold flex items-center gap-2">
                      {node.label}
                      {node.boss && (
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-500/30 text-amber-300">BOSS</span>
                      )}
                      {completed && <span className="text-green-400">✓</span>}
                    </div>
                    {node.hint && <div className="text-xs text-slate-400 mt-0.5">{node.hint}</div>}
                  </div>
                  {unlocked && !completed && (
                    <Swords className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  )}
                </button>
                {!isLast && (
                  <ChevronRight className="w-5 h-5 text-slate-600 flex-shrink-0" aria-hidden />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
