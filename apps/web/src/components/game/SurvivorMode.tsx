/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * SURVIVOR MODE
 * Last beast standing. Battle royale style.
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, Skull, Play } from 'lucide-react';

interface SurvivorModeProps {
  onStartSurvivor: (playerCount: 4 | 6 | 8) => void;
  onBack: () => void;
}

export default function SurvivorMode({ onStartSurvivor, onBack }: SurvivorModeProps) {
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<4 | 6 | 8>(8);

  const playerCounts = [
    { count: 4 as const, name: '4 Players', description: 'Quick matches' },
    { count: 6 as const, name: '6 Players', description: 'Medium battles' },
    { count: 8 as const, name: '8 Players', description: 'Epic showdowns' },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0a0f] via-purple-950/30 to-[#0a0a0f] text-white p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-8">
          <p className="text-purple-400/90 text-sm font-semibold tracking-[0.2em] uppercase mb-1">
            Ultimate Entertainment Enterprises presents
          </p>
          <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-2">
            SURVIVOR MODE
          </h1>
          <p className="text-lg text-purple-300 font-bold">Last Beast Standing • Battle Royale</p>
        </div>

        <Button variant="ghost" onClick={onBack} className="mb-6 text-purple-400 hover:text-purple-300">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* PLAYER COUNT SELECTOR */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {playerCounts.map((pc) => {
            const isSelected = selectedPlayerCount === pc.count;

            return (
              <button
                key={pc.count}
                onClick={() => setSelectedPlayerCount(pc.count)}
                className={`p-6 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'bg-purple-500/20 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                    : 'bg-slate-900/60 border-slate-600 hover:border-purple-500/50'
                }`}
              >
                <h3 className="text-xl font-bold text-white mb-2">{pc.name}</h3>
                <p className="text-sm text-slate-400">{pc.description}</p>
              </button>
            );
          })}
        </div>

        {/* SURVIVOR INFO */}
        <Card className="bg-slate-900/80 border-2 border-purple-500/50 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-purple-300 flex items-center gap-2">
              <Skull className="w-5 h-5" />
              How Survivor Mode Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-purple-400 font-semibold mb-2">Rules</h4>
              <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                <li>Last beast standing wins</li>
                <li>One life per player</li>
                <li>Free-for-all combat</li>
                <li>Battle royale style</li>
                <li>Last one alive takes all</li>
              </ul>
            </div>
            <div>
              <h4 className="text-purple-400 font-semibold mb-2">Rewards</h4>
              <p className="text-sm text-slate-300">
                Winner takes all: XP, currency, and exclusive Survivor loot. Higher player counts =
                bigger rewards.
              </p>
            </div>
            <Button
              onClick={() => onStartSurvivor(selectedPlayerCount)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Survivor ({selectedPlayerCount} Players)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
