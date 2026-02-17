import { useRunner } from "../../lib/stores/useRunner";
import { getFighterById, FIGHTERS } from "../../lib/characters";
import CharacterPreview3D from "./CharacterPreview3D";
import { useState } from "react";

export default function CustomizationMenu() {
  const setGameState = useRunner((s) => s.setGameState);
  const selectedCharacter = useRunner((s) => s.selectedCharacter);
  const setCharacter = useRunner((s) => s.setCharacter);
  const [previewId, setPreviewId] = useState(selectedCharacter ?? FIGHTERS[0]?.id ?? "kai-jax");
  const fighter = getFighterById(previewId);

  return (
    <div className="min-h-screen w-full p-6 flex flex-col lg:flex-row gap-8 bg-gradient-to-b from-[#07070d] via-purple-950/20 to-[#07070d]">
      <div className="flex-1 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-white">Character Models</h2>
        <p className="text-slate-400 text-sm">
          Preview your 3D character models. Select a fighter to view their model in detail.
        </p>
        <div className="flex flex-wrap gap-2">
          {FIGHTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setPreviewId(f.id);
                setCharacter(f.id);
              }}
              className={`px-4 py-2 rounded-xl border-2 font-medium transition-all ${
                previewId === f.id
                  ? "text-white scale-105"
                  : "bg-slate-800/60 border-slate-600 text-slate-300 hover:border-slate-500"
              }`}
              style={
                previewId === f.id
                  ? {
                      background: `linear-gradient(135deg, ${f.color}, ${f.accentColor}88)`,
                      borderColor: f.accentColor,
                      boxShadow: `0 0 16px ${f.accentColor}40`,
                    }
                  : undefined
              }
            >
              {f.displayName}
            </button>
          ))}
        </div>
        <button
          onClick={() => setGameState("menu")}
          className="self-start px-6 py-3 rounded-xl border-2 border-slate-500 text-white hover:border-slate-400"
        >
          Back
        </button>
      </div>
      {fighter && (
        <div className="w-full lg:w-[340px] h-[280px] rounded-xl overflow-hidden border-2 border-slate-600 bg-black/40 flex-shrink-0">
          <CharacterPreview3D fighter={fighter} />
        </div>
      )}
    </div>
  );
}
