import { useRunner, type CampaignNodeId, isCampaignNodeUnlocked } from "../../lib/stores/useRunner";
import { DISTRICTS, type DistrictRoamMeta } from "../../lib/encounters";
import { useAdventure } from "../../lib/stores/useAdventure";
import { ASHBLOCK_TAGLINE } from "../../game/world/zones/AshblockHeights/AshblockHeightsNarrative";
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
      className="kj-vision-shell kj-vision-city-vignette h-screen w-full overflow-auto p-6 text-white"
      style={{ backgroundColor: "#05070b" }}
    >
      <div className="max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => setGameState("menu")}
          className="kj-vision-button mb-6 flex items-center gap-2 px-4 py-2.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-center mb-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#a68e68]">Open World</p>
          <h1 className="kj-vision-title text-3xl font-black">
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
                    ? "kj-vision-panel hover:border-[#c69b55]"
                    : "kj-vision-panel opacity-45 cursor-not-allowed"
                }`}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-[#8d6d3c] bg-black/45">
                  <MapPin className="w-5 h-5 text-[#e4bd73]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white">{meta.name}</div>
                  <div className="text-xs text-slate-400 line-clamp-2">
                    {id === "district-1" ? `${meta.theme} — ${ASHBLOCK_TAGLINE}` : meta.theme}
                  </div>
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
