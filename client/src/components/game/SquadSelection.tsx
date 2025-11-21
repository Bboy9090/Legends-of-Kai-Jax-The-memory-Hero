import { useState } from 'react';
import { useSquad } from '../../lib/stores/useSquad';
import { useWorldState } from '../../lib/stores/useWorldState';
import { useRunner } from '../../lib/stores/useRunner';
import { FIGHTERS } from '../../lib/characters';
import { CHARACTER_BIOS, getBioForHero } from '../../lib/characterBios';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Check, X, Zap, Crown, ArrowLeft } from 'lucide-react';

export default function SquadSelection() {
  const { squad, setSquad, synergyBonus, calculateSynergy } = useSquad();
  const { recruitedHeroes } = useWorldState();
  const { setGameState } = useRunner();
  const [selectedSlots, setSelectedSlots] = useState<(string | null)[]>([...squad]);
  const [currentSlot, setCurrentSlot] = useState<0 | 1 | 2>(0);

  const handleSelectHero = (heroId: string) => {
    const newSlots = [...selectedSlots];
    newSlots[currentSlot] = heroId;
    setSelectedSlots(newSlots);
    
    // Auto-advance to next slot
    if (currentSlot < 2) {
      setCurrentSlot((currentSlot + 1) as 0 | 1 | 2);
    }
  };

  const handleConfirm = () => {
    if (selectedSlots[0] && selectedSlots[1] && selectedSlots[2]) {
      setSquad(selectedSlots[0], selectedSlots[1], selectedSlots[2]);
      calculateSynergy();
      setGameState("nexus-haven");
    }
  };

  const handleCancel = () => {
    setSelectedSlots([...squad]);
    setGameState("nexus-haven");
  };

  const availableHeroes = FIGHTERS.filter(f => recruitedHeroes.includes(f.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-6 bg-slate-800 bg-opacity-90 border-cyan-500 border-2 relative">
          <CardHeader>
            <Button
              onClick={() => setGameState("nexus-haven")}
              className="absolute top-4 left-4 bg-red-600 hover:bg-red-700 text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <CardTitle className="text-3xl text-cyan-400 flex items-center justify-center gap-3">
              <Crown className="w-8 h-8" />
              Assemble Your Squad
            </CardTitle>
            <p className="text-white mt-2 text-center">Choose 3 heroes to battle together. Squad synergy unlocks bonus power!</p>
          </CardHeader>
        </Card>

        {/* Squad Slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[0, 1, 2].map((slot) => {
            const heroId = selectedSlots[slot];
            const hero = heroId ? FIGHTERS.find(f => f.id === heroId) : null;
            const bio = heroId ? getBioForHero(heroId) : null;
            const isActive = currentSlot === slot;

            return (
              <Card 
                key={slot}
                className={`cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-cyan-600 border-cyan-300 border-4 scale-105 shadow-2xl' 
                    : 'bg-slate-800 border-slate-600 border-2 hover:border-cyan-500'
                }`}
                onClick={() => setCurrentSlot(slot as 0 | 1 | 2)}
              >
                <CardHeader className="p-4">
                  <CardTitle className={`text-lg ${isActive ? 'text-white' : 'text-cyan-400'}`}>
                    Position {slot + 1} {slot === 0 && '(Leader)'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {hero && bio ? (
                    <div>
                      <div 
                        className="w-full h-32 rounded-lg mb-3 flex items-center justify-center text-white font-black text-4xl"
                        style={{ backgroundColor: hero.color }}
                      >
                        {hero.name[0]}
                      </div>
                      <h3 className="text-white font-bold text-xl">{hero.displayName}</h3>
                      <p className="text-cyan-200 text-sm">{bio.title}</p>
                      <p className="text-slate-300 text-xs mt-2">{bio.specialty}</p>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center">
                      <p className="text-slate-400 text-center">
                        Click a hero below to select
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Synergy Display */}
        {selectedSlots[0] && selectedSlots[1] && selectedSlots[2] && (
          <Card className="mb-6 bg-gradient-to-r from-purple-900 to-pink-900 border-purple-400 border-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <span className="text-white font-bold text-lg">Team Synergy Bonus</span>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-black text-3xl">+{synergyBonus}%</p>
                  <p className="text-purple-200 text-sm">Power Boost</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Heroes */}
        <Card className="bg-slate-800 bg-opacity-90 border-blue-500 border-2">
          <CardHeader>
            <CardTitle className="text-blue-400">
              Available Heroes ({availableHeroes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableHeroes.map((hero) => {
                const bio = getBioForHero(hero.id);
                const isSelected = selectedSlots.includes(hero.id);

                return (
                  <div
                    key={hero.id}
                    className={`relative cursor-pointer rounded-lg p-3 transition-all ${
                      isSelected 
                        ? 'bg-green-600 border-green-400 border-2' 
                        : 'bg-slate-700 border-slate-600 border hover:border-cyan-400'
                    }`}
                    onClick={() => !isSelected && handleSelectHero(hero.id)}
                  >
                    {isSelected && (
                      <div className="absolute top-1 right-1">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div 
                      className="w-full h-20 rounded mb-2 flex items-center justify-center text-white font-black text-2xl"
                      style={{ backgroundColor: hero.color }}
                    >
                      {hero.name[0]}
                    </div>
                    <p className="text-white font-bold text-sm text-center">{hero.displayName}</p>
                    {bio && (
                      <p className="text-cyan-300 text-xs text-center mt-1 truncate">{bio.specialty.split(',')[0]}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <Button
            onClick={handleConfirm}
            disabled={!selectedSlots[0] || !selectedSlots[1] || !selectedSlots[2]}
            className="flex-1 py-6 text-xl font-black bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 disabled:opacity-50"
          >
            <Check className="w-6 h-6 mr-2" />
            Confirm Squad
          </Button>
          <Button
            onClick={handleCancel}
            className="px-8 py-6 text-xl font-black bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
          >
            <X className="w-6 h-6 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
