import { useRunner } from "../../lib/stores/useRunner";
import { PLAYABLE_FIGHTERS } from "../../lib/characters";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ArrowLeft } from "lucide-react";

const FIGHTER_SUMMARY: Readonly<Record<string, string>> = Object.freeze({
  kaijax: "The Memory Hero",
  jaxon: "Shadow Speed Blitzer",
  kaison: "Tactical Blade Specialist",
});

export default function CustomizationMenu() {
  const setGameState = useRunner((state) => state.setGameState);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900 text-white">
      <header className="bg-black/40 border-b-4 border-cyan-400 p-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Gold Slice Fighters
            </h1>
            <p className="text-gray-300 mt-1">
              Release-validated fighters available in this production slice.
            </p>
          </div>
          <Button
            onClick={() => setGameState("menu")}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 text-white font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 pb-8 sm:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLAYABLE_FIGHTERS.map((fighter) => (
            <Card
              key={fighter.id}
              className="bg-gray-800/55 border-2"
              style={{ borderColor: fighter.accentColor }}
            >
              <CardContent className="p-5 text-center">
                <div
                  className="w-24 h-24 mx-auto mb-4 flex items-center justify-center shadow-lg"
                  style={{
                    backgroundColor: fighter.color,
                    clipPath: "polygon(25% 6%, 75% 6%, 96% 50%, 75% 94%, 25% 94%, 4% 50%)",
                    boxShadow: `0 0 20px ${fighter.accentColor}`,
                  }}
                >
                  <span className="text-sm font-black tracking-widest text-white/95">
                    {fighter.displayName.slice(0, 3)}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white">{fighter.displayName}</h2>
                <p className="text-sm text-cyan-100/80 mt-1">
                  {FIGHTER_SUMMARY[fighter.id] ?? "Gold Slice Fighter"}
                </p>
                <div className="mt-3 text-[11px] uppercase tracking-widest text-white/55">
                  {fighter.role ?? "fighter"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-black/40 border-4 border-yellow-400 mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-2xl font-bold text-yellow-300 mb-2">Validated Roster</h3>
            <p className="text-5xl font-bold text-white mb-3">
              {PLAYABLE_FIGHTERS.length}
            </p>
            <p className="text-gray-300">
              Additional historical roster entries stay hidden until their gameplay,
              assets, and provenance clear production gates.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
