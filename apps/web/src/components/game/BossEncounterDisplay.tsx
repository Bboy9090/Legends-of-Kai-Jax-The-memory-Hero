/**
 * BOSS ENCOUNTER DISPLAY COMPONENT
 * Shows boss information, phases, mechanics, and strategies
 */

import { readableOnDark } from '../../lib/contrast';
import React, { useState } from 'react';
import { getBossEncounter, ALL_BOSSES, type BossEncounter } from '../../lib/bossEncounters';
import { AlertTriangle, Zap, Shield, Clock, Skull } from 'lucide-react';

interface BossEncounterDisplayProps {
  bossId?: string;
  showGrid?: boolean;
  compact?: boolean;
}

export default function BossEncounterDisplay({ bossId, showGrid = false, compact = false }: BossEncounterDisplayProps) {
  const [selectedBoss, setSelectedBoss] = useState<BossEncounter | null>(
    bossId ? getBossEncounter(bossId) || null : null
  );
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [expandedMechanic, setExpandedMechanic] = useState<string | null>(null);

  const boss = selectedBoss;

  const getDifficultyColor = (difficulty: number): string => {
    if (difficulty >= 9) return '#ff0000';
    if (difficulty >= 7) return '#ff6347';
    if (difficulty >= 5) return '#ffed4e';
    return '#55e6c1';
  };

  if (compact && bossId && boss) {
    return (
      <div className="border border-[#ff6347]/40 bg-black/45 p-2">
        <div className="flex items-center gap-2 text-xs">
          <Skull className="h-3 w-3" style={{ color: readableOnDark(boss.visualIdentity.primaryColor) }} />
          <span className="uppercase text-[#efcf91]">{boss.name}</span>
          <span className="ml-auto text-[9px]" style={{ color: getDifficultyColor(boss.difficulty) }}>
            ★ {boss.difficulty}/10
          </span>
        </div>
      </div>
    );
  }

  if (!boss && !showGrid) {
    return (
      <div className="text-center text-[#a79372] text-sm">
        Select a boss encounter to view details
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BOSS GRID */}
      {showGrid && (
        <div>
          <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#a48c65]">
            Boss Encounters ({ALL_BOSSES.length})
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ALL_BOSSES.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBoss(b)}
                className={`text-left p-3 border transition ${
                  selectedBoss?.id === b.id
                    ? 'border-[#efcf91] bg-black/60'
                    : 'border-[#8b6e3d]/45 bg-black/45 hover:bg-black/55'
                }`}
                style={{
                  borderColor:
                    selectedBoss?.id === b.id
                      ? b.visualIdentity.primaryColor
                      : '#8b6e3d' + '73',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-[0.1em]" style={{ color: readableOnDark(b.visualIdentity.primaryColor) }}>
                      {b.displayName}
                    </div>
                    <div className="mt-1 text-[9px] text-[#8f816d]">{b.faction}</div>
                    <div className="mt-2 text-[9px] text-[#bbb0a0]">
                      {b.description}
                    </div>
                  </div>
                  <div
                    className="text-lg font-bold"
                    style={{ color: getDifficultyColor(b.difficulty) }}
                    title={`Difficulty: ${b.difficulty}/10`}
                  >
                    ★{b.difficulty}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BOSS DETAILS */}
      {boss && (
        <div>
          <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#a48c65]">
            Encounter Details
          </div>
          <div
            className="border border-[#8b6e3d]/45 bg-black/45 p-4 relative overflow-hidden"
            style={{ borderColor: boss.visualIdentity.primaryColor + '40' }}
          >
            <div
              className="absolute top-0 right-0 w-40 h-40 opacity-5 rounded-full"
              style={{
                backgroundColor: boss.visualIdentity.primaryColor,
              }}
            />
            <div className="relative z-10 space-y-4">
              {/* HEADER */}
              <div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#8d806d]">
                  {boss.faction}
                </div>
                <div
                  className="mt-1 text-2xl uppercase tracking-[0.08em]"
                  style={{ color: readableOnDark(boss.visualIdentity.primaryColor) }}
                >
                  {boss.displayName}
                </div>
                <div className="mt-2 text-[10px] text-[#bbb0a0]">
                  {boss.description}
                </div>
              </div>

              {/* STATS HEADER */}
              <div className="grid grid-cols-5 gap-2 pt-3 border-t border-[#735a35]/50 text-[9px]">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-[#ffed4e]" />
                  <span className="uppercase text-[#8f816d]">Health</span>
                  <span className="text-[#ff6347] font-bold">{boss.maxHealth}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-[#ff6347]" />
                  <span className="uppercase text-[#8f816d]">Attack</span>
                  <span className="text-[#ffed4e] font-bold">{boss.attack}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-[#22d3ee]" />
                  <span className="uppercase text-[#8f816d]">Defense</span>
                  <span className="text-[#22d3ee] font-bold">{boss.defense}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-[#d46cff]" />
                  <span className="uppercase text-[#8f816d]">Speed</span>
                  <span className="text-[#d46cff] font-bold">{boss.speed}</span>
                </div>
                <div
                  className="text-lg font-bold text-center"
                  style={{ color: getDifficultyColor(boss.difficulty) }}
                  title={`Difficulty: ${boss.difficulty}/10`}
                >
                  ★{boss.difficulty}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOSS LORE */}
      {boss && (
        <div>
          <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#a48c65]">
            Lore
          </div>
          <div className="border-l-2 pl-4" style={{ borderColor: boss.visualIdentity.primaryColor + '40' }}>
            <div className="text-sm leading-6 text-[#bbb0a0]">{boss.lore}</div>
          </div>
        </div>
      )}

      {/* PHASES */}
      {boss && boss.phases.length > 0 && (
        <div>
          <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#ff6347]">
            Combat Phases ({boss.phases.length})
          </div>
          <div className="space-y-2">
            {boss.phases.map((phase, index) => (
              <div
                key={phase.id}
                className="border border-[#8b6e3d]/45 bg-black/45 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                  className="w-full px-3 py-2 text-left hover:bg-black/60 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-xs uppercase tracking-[0.08em] text-[#efcf91]">
                        Phase {index + 1}
                      </div>
                      <div className="mt-1 text-[9px] text-[#bbb0a0]">
                        {phase.description}
                      </div>
                    </div>
                    <div className="text-[9px] text-[#8f816d]">
                      Health: ≥{phase.healthThreshold}%
                    </div>
                  </div>
                </button>
                {expandedPhase === phase.id && (
                  <div className="border-t border-[#735a35]/50 px-3 py-2 bg-black/20 text-[9px] space-y-2">
                    <div>
                      <div className="text-[#8f816d] uppercase mb-1">Abilities</div>
                      <div className="flex flex-wrap gap-1">
                        {phase.abilities.map((ability) => (
                          <div
                            key={ability}
                            className="px-2 py-1 bg-black/40 border border-[#735a35]/50 rounded text-[#d6c9b5]"
                          >
                            {ability.replace(/-/g, ' ')}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#8f816d] uppercase mb-1">Attack Pattern</div>
                      <div className="text-[#bbb0a0]">{phase.attackPattern}</div>
                    </div>
                    {phase.specialMechanics.length > 0 && (
                      <div>
                        <div className="text-[#8f816d] uppercase mb-1">Special Mechanics</div>
                        <ul className="space-y-1">
                          {phase.specialMechanics.map((mechanic, i) => (
                            <li key={i} className="text-[#d6c9b5] list-disc list-inside">
                              {mechanic.replace(/-/g, ' ')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MECHANICS */}
      {boss && boss.mechanics.length > 0 && (
        <div>
          <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#ff6347]">
            Special Mechanics
          </div>
          <div className="space-y-2">
            {boss.mechanics.map((mechanic) => (
              <div
                key={mechanic.id}
                className="border border-[#8b6e3d]/45 bg-black/45 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedMechanic(expandedMechanic === mechanic.id ? null : mechanic.id)}
                  className="w-full px-3 py-2 text-left hover:bg-black/60 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-xs uppercase tracking-[0.08em] text-[#efcf91]">
                        {mechanic.name}
                      </div>
                    </div>
                    <div className="text-[9px]" style={{ color: mechanic.damageType === 'void' ? '#d46cff' : '#ffed4e' }}>
                      {mechanic.damageType.toUpperCase()}
                    </div>
                  </div>
                </button>
                {expandedMechanic === mechanic.id && (
                  <div className="border-t border-[#735a35]/50 px-3 py-2 bg-black/20 text-[9px] space-y-2">
                    <div>
                      <div className="text-[#8f816d] uppercase mb-1">Description</div>
                      <div className="text-[#bbb0a0]">{mechanic.description}</div>
                    </div>
                    <div>
                      <div className="text-[#8f816d] uppercase mb-1">Effect</div>
                      <div className="text-[#d6c9b5]">{mechanic.effect}</div>
                    </div>
                    <div>
                      <div className="text-[#8f816d] uppercase mb-1">Triggers</div>
                      <div className="flex flex-wrap gap-1">
                        {mechanic.triggers.map((trigger, i) => (
                          <div key={i} className="px-1 py-0.5 bg-black/40 rounded text-[#8f816d]">
                            {trigger.replace(/-/g, ' ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REWARDS */}
      {boss && boss.rewards && (
        <div>
          <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#55e6c1]">
            Rewards
          </div>
          <div className="border border-[#8b6e3d]/45 bg-black/45 p-3 space-y-2 text-[9px]">
            <div className="flex justify-between">
              <span className="text-[#8f816d]">Experience</span>
              <span className="text-[#55e6c1] font-bold">{boss.rewards.xp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8f816d]">Currency</span>
              <span className="text-[#ffed4e] font-bold">{boss.rewards.currency}</span>
            </div>
            {boss.rewards.loot.length > 0 && (
              <div>
                <span className="text-[#8f816d] uppercase block mb-1">Loot</span>
                <div className="space-y-1">
                  {boss.rewards.loot.map((loot, i) => (
                    <div key={i} className="text-[#d6c9b5] ml-2">
                      • {loot}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {boss.rewards.uniqueDrops.length > 0 && (
              <div className="pt-2 border-t border-[#735a35]/50">
                <span className="text-[#d46cff] uppercase block mb-1">Unique Drops</span>
                <div className="space-y-1">
                  {boss.rewards.uniqueDrops.map((drop, i) => (
                    <div key={i} className="text-[#d46cff] ml-2 font-bold">
                      ✦ {drop}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
