import { useRunner } from "../../lib/stores/useRunner";
import { useBeastPreset, type BeastPresetKind } from "../../lib/stores/useBeastPreset";
import { getFighterById } from "../../lib/characters";
import CharacterPreview3D from "./CharacterPreview3D";

const PRESET_OPTIONS: { value: BeastPresetKind; label: string }[] = [
  { value: "auto", label: "Auto (from character)" },
  { value: "wolf", label: "Wolf" },
  { value: "fox", label: "Fox" },
  { value: "cat", label: "Cat" },
  { value: "dragon", label: "Dragon" },
  { value: "bird", label: "Bird" },
];

export default function CustomizationMenu() {
  const setGameState = useRunner((s) => s.setGameState);
  const { preset, setPreset } = useBeastPreset();
  const selectedCharacter = useRunner((s) => s.selectedCharacter);
  const fighter = getFighterById(selectedCharacter ?? "jaxon");

  return (
    <div className="min-h-screen w-full p-6 flex flex-col lg:flex-row gap-8 bg-gradient-to-b from-[#07070d] via-purple-950/20 to-[#07070d]">
      <div className="flex-1 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-white">Layered Character Design</h2>
        <p className="text-slate-400 text-sm">
          Choose a beast silhouette. This design is used in battle, missions, and character select.
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPreset(value)}
              className={`px-4 py-2 rounded-xl border-2 font-medium transition-all ${
                preset === value
                  ? "bg-cyan-500/30 border-cyan-400 text-cyan-100"
                  : "bg-slate-800/60 border-slate-600 text-slate-300 hover:border-slate-500"
              }`}
            >
              {label}
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
          <CharacterPreview3D fighter={fighter} preset={preset} />
        </div>
      )}
    </div>
  );
}
