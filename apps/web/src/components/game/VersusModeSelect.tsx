/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * VERSUS MODE SELECTION
 * 1v1 • 2v2 • 3v3 Player vs Player
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, Users, User, Users2 } from 'lucide-react';

interface VersusModeSelectProps {
  onSelectMode: (mode: '1v1' | '2v2' | '3v3') => void;
  onBack: () => void;
}

export default function VersusModeSelect({ onSelectMode, onBack }: VersusModeSelectProps) {
  const [selectedMode, setSelectedMode] = useState<'1v1' | '2v2' | '3v3' | null>(null);

  const modes = [
    {
      id: '1v1' as const,
      name: '1v1 Versus',
      description: 'One-on-one combat. Best of 3 rounds. Player vs Player.',
      icon: User,
      players: 2,
    },
    {
      id: '2v2' as const,
      name: '2v2 Team Battle',
      description: 'Team vs Team. Two fighters per side. Tag team mechanics.',
      icon: Users,
      players: 4,
    },
    {
      id: '3v3' as const,
      name: '3v3 Squad Battle',
      description: 'Squad vs Squad. Three fighters per side. Ultimate team synergy.',
      icon: Users2,
      players: 6,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0a0f] via-blue-950/30 to-[#0a0a0f] text-white p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-8">
          <p className="text-cyan-400/90 text-sm font-semibold tracking-[0.2em] uppercase mb-1">
            Ultimate Entertainment Enterprises presents
          </p>
          <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            VERSUS MODE
          </h1>
          <p className="text-lg text-cyan-300 font-bold">Player vs Player • Test Your Skills</p>
        </div>

        <Button variant="ghost" onClick={onBack} className="mb-6 text-cyan-400 hover:text-cyan-300">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* MODES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`p-6 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                    : 'bg-slate-900/60 border-slate-600 hover:border-cyan-500/50'
                }`}
              >
                <Icon className="w-12 h-12 mx-auto mb-3 text-cyan-400" />
                <h3 className="text-xl font-bold text-white mb-2">{mode.name}</h3>
                <p className="text-sm text-slate-400 mb-3">{mode.description}</p>
                <div className="text-xs text-cyan-400 font-bold">{mode.players} Players</div>
              </button>
            );
          })}
        </div>

        {/* SELECTED MODE DETAILS */}
        {selectedMode && (
          <Card className="bg-slate-900/80 border-2 border-cyan-500/50">
            <CardHeader>
              <CardTitle className="text-xl text-cyan-300">
                {modes.find((m) => m.id === selectedMode)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 text-sm">
                {modes.find((m) => m.id === selectedMode)?.description}
              </p>
              <div>
                <h4 className="text-cyan-400 font-semibold mb-2">Rules</h4>
                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                  {selectedMode === '1v1' && (
                    <>
                      <li>Best of 3 rounds</li>
                      <li>First to 2 wins</li>
                      <li>99 second time limit per round</li>
                    </>
                  )}
                  {selectedMode === '2v2' && (
                    <>
                      <li>Tag team mechanics</li>
                      <li>Switch fighters mid-battle</li>
                      <li>Team health shared</li>
                      <li>Last team standing wins</li>
                    </>
                  )}
                  {selectedMode === '3v3' && (
                    <>
                      <li>Squad battle</li>
                      <li>Full team synergy</li>
                      <li>Fusion mechanics enabled</li>
                      <li>Ultimate team coordination</li>
                    </>
                  )}
                </ul>
              </div>
              <Button
                onClick={() => onSelectMode(selectedMode)}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4"
              >
                Start Battle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
