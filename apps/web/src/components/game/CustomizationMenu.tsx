import { useRunner } from "../../lib/stores/useRunner";

export default function CustomizationMenu() {
  const setGameState = useRunner((s) => s.setGameState);

  return (
    <div className="min-h-screen w-full p-6 flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold text-white">Customization</h2>
      <button
        onClick={() => setGameState("menu")}
        className="px-6 py-3 rounded-xl border-2 border-slate-500 text-white"
      >
        Back
      </button>
    </div>
  );
}
