/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * GAUNTLET MODE
 * Endless waves. Survive as long as you can.
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, Flame, Play } from 'lucide-react';

interface GauntletModeProps {
  onStartGauntlet: (difficulty: 'easy' | 'medium' | 'hard' | 'extreme') => void;
  onBack: () => void;
}

export default function GauntletMode({ onStartGauntlet, onBack }: GauntletModeProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    'easy' | 'medium' | 'hard' | 'extreme'
  >('medium');

  const difficulties = [
    { id: 'easy' as const, name: 'Easy', color: 'green', waves: '10-20', description: 'Perfect for beginners' },
    { id: 'medium' as const, name: 'Medium', color: 'blue', waves: '20-40', description: 'Balanced challenge' },
    { id: 'hard' as const, name: 'Hard', color: 'orange', waves: '40-60', description: 'For experienced warriors' },
    { id: 'extreme' as const, name: 'Extreme', color: 'red', waves: '60+', description: 'Only for legends' },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0a0f] via-red-950/30 to-[#0a0a0f] text-white p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-8">
          <p className="text-red-400/90 text-sm font-semibold tracking-[0.2em] uppercase mb-1">
            Ultimate Entertainment Enterprises presents
          </p>
          <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent mb-2">
            GAUNTLET MODE
          </h1>
          <p className="text-lg text-red-300 font-bold">Endless Waves • Survive as Long as You Can</p>
        </div>

        <Button variant="ghost" onClick={onBack} className="mb-6 text-red-400 hover:text-red-300">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* DIFFICULTY SELECTOR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {difficulties.map((diff) => {
            const isSelected = selectedDifficulty === diff.id;
            const colorClasses = {
              green: 'bg-green-600/20 border-green-400',
              blue: 'bg-blue-600/20 border-blue-400',
              orange: 'bg-orange-600/20 border-orange-400',
              red: 'bg-red-600/20 border-red-400',
            };

            return (
              <button
                key={diff.id}
                onClick={() => setSelectedDifficulty(diff.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? `${colorClasses[diff.color]} shadow-[0_0_20px_rgba(255,0,0,0.4)]`
                    : 'bg-slate-900/60 border-slate-600 hover:border-red-500/50'
                }`}
              >
                <h3 className="text-xl font-bold text-white mb-1">{diff.name}</h3>
                <p className="text-sm text-slate-400 mb-2">{diff.description}</p>
                <p className="text-xs text-red-400 font-bold">{diff.waves} Waves</p>
              </button>
            );
          })}
        </div>

        {/* GAUNTLET INFO */}
        <Card className="bg-slate-900/80 border-2 border-red-500/50 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-red-300 flex items-center gap-2">
              <Flame className="w-5 h-5" />
              How Gauntlet Mode Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-red-400 font-semibold mb-2">Rules</h4>
              <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                <li>Endless waves of enemies</li>
                <li>Difficulty increases each wave</li>
                <li>Survive as long as you can</li>
                <li>Rewards scale with wave number</li>
                <li>Team up with up to 3 other players</li>
              </ul>
            </div>
            <div>
              <h4 className="text-red-400 font-semibold mb-2">Rewards</h4>
              <p className="text-sm text-slate-300">
                XP and currency scale with waves completed. Special loot drops every 10 waves.
              </p>
            </div>
            <Button
              onClick={() => onStartGauntlet(selectedDifficulty)}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-4"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Gauntlet ({selectedDifficulty.toUpperCase()})
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
