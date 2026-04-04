import { useRunner, type CampaignNodeId, isCampaignNodeUnlocked } from "../../lib/stores/useRunner";
import { DISTRICTS, type DistrictRoamMeta } from "../../lib/encounters";
import { useAdventure } from "../../lib/stores/useAdventure";
import { ArrowLeft, MapPin } from "../ui/icons";

const ORDER: CampaignNodeId[] = [
  "district-1",
  "district-2",
  "district-3",
  "district-4",
  "district-5",
];

export default function DistrictSelectScreen() {
  const setGameState = useRunner((s) => s.setGameState);
  const setCampaignCurrentNode = useRunner((s) => s.setCampaignCurrentNode);
  const completed = useRunner((s) => s.campaignCompletedNodes);
  const selectedCharacter = useRunner((s) => s.selectedCharacter);

  const launch = (nodeId: CampaignNodeId, _meta: DistrictRoamMeta) => {
    setCampaignCurrentNode(nodeId);
    useAdventure.getState().startDistrictRoam(nodeId, selectedCharacter || "kai-jax");
    setGameState("adventure");
  };

  return (
    <div
      className="h-screen w-full overflow-auto p-6 text-white"
      style={{ background: "linear-gradient(165deg, #0a0a1a 0%, #1a1530 45%, #0d1520 100%)" }}
    >
      <div className="max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => setGameState("menu")}
          className="mb-6 px-4 py-2.5 rounded-xl border-2 border-slate-600 bg-slate-900/60 text-slate-300 hover:border-cyan-400/60 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-center mb-8">
          <p className="text-cyan-400/90 text-xs font-semibold tracking-[0.25em] uppercase mb-1">Open world</p>
          <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
            District patrol
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Scripted encounters per district — clear all to finish the patrol. First clear grants XP + currency as score (see each district).
          </p>
        </div>

        <div className="space-y-3">
          {ORDER.map((id) => {
            const meta = DISTRICTS[id];
            const unlocked = isCampaignNodeUnlocked(completed, id);
            return (
              <button
                key={id}
                type="button"
                disabled={!unlocked}
                onClick={() => unlocked && launch(id, meta)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex gap-3 ${
                  unlocked
                    ? "bg-slate-900/70 border-slate-600 hover:border-cyan-400/50 hover:bg-slate-800/70"
                    : "bg-slate-950/50 border-slate-800 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-cyan-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white">{meta.name}</div>
                  <div className="text-xs text-slate-400 line-clamp-2">{meta.theme}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {meta.encounters.length} encounters · first clear +{meta.rewards.xp} XP +{meta.rewards.currency} score
                    {!unlocked && " — complete the previous district in Story campaign map first"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
