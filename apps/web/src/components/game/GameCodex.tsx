/**
 * GAME CODEX COMPONENT
 * Comprehensive reference guide integrating all game systems
 */

import React, { useState } from 'react';
import AbilityDisplay from './AbilityDisplay';
import CharacterStatsDisplay from './CharacterStatsDisplay';
import LocationDisplay from './LocationDisplay';
import BossEncounterDisplay from './BossEncounterDisplay';
import { getCharacterData } from '../../lib/characterStats';
import { BookOpen, Users, MapPin, Skull, Zap, Target } from 'lucide-react';

type CodexTab = 'characters' | 'abilities' | 'locations' | 'bosses' | 'mechanics' | 'lore';

interface GameCodexProps {
  initialTab?: CodexTab;
  characterId?: string;
}

export default function GameCodex({ initialTab = 'characters', characterId }: GameCodexProps) {
  const [activeTab, setActiveTab] = useState<CodexTab>(initialTab);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(characterId || 'kai-jax');

  const tabs: Array<{ id: CodexTab; label: string; icon: React.ReactNode }> = [
    { id: 'characters', label: 'Characters', icon: <Users className="h-4 w-4" /> },
    { id: 'abilities', label: 'Abilities', icon: <Zap className="h-4 w-4" /> },
    { id: 'locations', label: 'Locations', icon: <MapPin className="h-4 w-4" /> },
    { id: 'bosses', label: 'Bosses', icon: <Skull className="h-4 w-4" /> },
    { id: 'mechanics', label: 'Mechanics', icon: <Target className="h-4 w-4" /> },
    { id: 'lore', label: 'Lore', icon: <BookOpen className="h-4 w-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col bg-black">
      {/* HEADER */}
      <div className="border-b border-[#7d6136]/55 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl uppercase tracking-[0.08em] text-[#efcf91]">
              Game Codex
            </h1>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#8d806d] mt-1">
              Legends of Kai-Jax: The Memory Hero
            </p>
          </div>
          <BookOpen className="h-8 w-8 text-[#d46cff]" />
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="border-b border-[#7d6136]/55 bg-black/50 backdrop-blur px-5 py-3 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-1 rounded-sm text-xs uppercase tracking-[0.08em] transition ${
              activeTab === tab.id
                ? 'border border-[#efcf91] bg-black/60 text-[#efcf91]'
                : 'border border-[#735a35]/50 bg-black/40 text-[#8d806d] hover:text-[#a79372]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="max-w-6xl mx-auto">
          {/* CHARACTERS TAB */}
          {activeTab === 'characters' && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg uppercase tracking-[0.1em] text-[#efcf91] mb-3">
                  Character Roster
                </h2>
                <p className="text-[10px] uppercase tracking-[0.08em] text-[#8d806d]">
                  Select a character to view their abilities, stats, and relationships
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <div className="space-y-2 border border-[#8b6e3d]/45 bg-black/45 p-3 rounded max-h-96 overflow-y-auto">
                    {['kai-jax', 'jax', 'kaison', 'silver', 'volter'].map((charId) => {
                      const charData = getCharacterData(charId);
                      return (
                        <button
                          key={charId}
                          onClick={() => setSelectedCharacterId(charId)}
                          className={`w-full text-left px-3 py-2 rounded transition flex gap-3 items-center ${
                            selectedCharacterId === charId
                              ? 'border border-[#efcf91] bg-black/60'
                              : 'border border-[#735a35]/50 bg-black/40 hover:bg-black/50'
                          }`}
                        >
                          {charData?.portraitPath && (
                            <img
                              src={charData.portraitPath}
                              alt={charData.displayName}
                              className="w-12 h-12 object-cover rounded-sm flex-shrink-0"
                            />
                          )}
                          <div>
                            <div className="text-xs uppercase tracking-[0.08em] text-[#efcf91]">
                              {charId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </div>
                            <div className="text-[9px] text-[#8f816d]">{charData?.role}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <CharacterStatsDisplay characterId={selectedCharacterId} showLore={true} />
                </div>
              </div>
            </div>
          )}

          {/* ABILITIES TAB */}
          {activeTab === 'abilities' && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg uppercase tracking-[0.1em] text-[#efcf91] mb-3">
                  Combat Abilities
                </h2>
                <p className="text-[10px] uppercase tracking-[0.08em] text-[#8d806d]">
                  Browse all character abilities and power mechanics
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <div className="space-y-2 border border-[#8b6e3d]/45 bg-black/45 p-3 rounded max-h-96 overflow-y-auto">
                    {['kai-jax', 'jax', 'kaison', 'silver', 'volter'].map((charId) => {
                      const charData = getCharacterData(charId);
                      return (
                        <button
                          key={charId}
                          onClick={() => setSelectedCharacterId(charId)}
                          className={`w-full text-left px-3 py-2 rounded transition flex gap-3 items-center ${
                            selectedCharacterId === charId
                              ? 'border border-[#efcf91] bg-black/60'
                              : 'border border-[#735a35]/50 bg-black/40 hover:bg-black/50'
                          }`}
                        >
                          {charData?.portraitPath && (
                            <img
                              src={charData.portraitPath}
                              alt={charData.displayName}
                              className="w-12 h-12 object-cover rounded-sm flex-shrink-0"
                            />
                          )}
                          <div>
                            <div className="text-xs uppercase tracking-[0.08em] text-[#efcf91]">
                              {charData?.displayName}
                            </div>
                            <div className="text-[9px] text-[#8f816d]">{charData?.role}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <AbilityDisplay characterId={selectedCharacterId} compact={false} />
                </div>
              </div>
            </div>
          )}

          {/* LOCATIONS TAB */}
          {activeTab === 'locations' && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg uppercase tracking-[0.1em] text-[#efcf91] mb-3">
                  World Map & Locations
                </h2>
                <p className="text-[10px] uppercase tracking-[0.08em] text-[#8d806d]">
                  Explore the districts and environments of the Raging City
                </p>
              </div>

              <LocationDisplay showGrid={true} />
            </div>
          )}

          {/* BOSSES TAB */}
          {activeTab === 'bosses' && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg uppercase tracking-[0.1em] text-[#efcf91] mb-3">
                  Boss Encounters
                </h2>
                <p className="text-[10px] uppercase tracking-[0.08em] text-[#8d806d]">
                  Learn about the formidable foes you'll face and their mechanics
                </p>
              </div>

              <BossEncounterDisplay showGrid={true} />
            </div>
          )}

          {/* MECHANICS TAB */}
          {activeTab === 'mechanics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg uppercase tracking-[0.1em] text-[#efcf91] mb-3">
                  Game Mechanics
                </h2>
                <p className="text-[10px] uppercase tracking-[0.08em] text-[#8d806d]">
                  Understanding the core systems of Legends of Kai-Jax
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* STAT SYSTEM */}
                <div className="border border-[#8b6e3d]/45 bg-black/45 p-4 rounded">
                  <h3 className="text-sm uppercase tracking-[0.08em] text-[#efcf91] mb-3">
                    Character Stats
                  </h3>
                  <div className="space-y-2 text-[9px] text-[#bbb0a0]">
                    <div>
                      <strong>Health:</strong> Your character's remaining vitality. Reduced to zero = defeat.
                    </div>
                    <div>
                      <strong>Mana:</strong> Resource for casting abilities. Regenerates over time.
                    </div>
                    <div>
                      <strong>Attack:</strong> Determines your damage output per hit.
                    </div>
                    <div>
                      <strong>Defense:</strong> Reduces incoming damage from enemy attacks.
                    </div>
                    <div>
                      <strong>Speed:</strong> Affects attack frequency and dodge capability.
                    </div>
                  </div>
                </div>

                {/* ABILITY TIERS */}
                <div className="border border-[#8b6e3d]/45 bg-black/45 p-4 rounded">
                  <h3 className="text-sm uppercase tracking-[0.08em] text-[#efcf91] mb-3">
                    Ability Tiers
                  </h3>
                  <div className="space-y-2 text-[9px] text-[#bbb0a0]">
                    <div>
                      <strong>Tier 1:</strong> Basic abilities with low cooldown and mana cost.
                    </div>
                    <div>
                      <strong>Tier 2:</strong> Intermediate abilities balancing power and resource cost.
                    </div>
                    <div>
                      <strong>Tier 3:</strong> Advanced abilities with high impact and resource requirements.
                    </div>
                    <div>
                      <strong>Ultimate:</strong> Game-changing powers with long cooldown timers.
                    </div>
                  </div>
                </div>

                {/* THREAT LEVELS */}
                <div className="border border-[#8b6e3d]/45 bg-black/45 p-4 rounded">
                  <h3 className="text-sm uppercase tracking-[0.08em] text-[#efcf91] mb-3">
                    Location Threat Levels
                  </h3>
                  <div className="space-y-2 text-[9px] text-[#bbb0a0]">
                    <div className="flex items-center gap-2">
                      <span style={{ color: '#55e6c1' }}>●</span>
                      <span><strong>Low:</strong> Beginner-friendly encounters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ color: '#ffed4e' }}>●●</span>
                      <span><strong>Medium:</strong> Intermediate challenges</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ color: '#ff8c00' }}>●●●</span>
                      <span><strong>High:</strong> Advanced encounters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ color: '#ff6347' }}>●●●●</span>
                      <span><strong>Extreme:</strong> Endgame challenges</span>
                    </div>
                  </div>
                </div>

                {/* COMBAT FLOW */}
                <div className="border border-[#8b6e3d]/45 bg-black/45 p-4 rounded">
                  <h3 className="text-sm uppercase tracking-[0.08em] text-[#efcf91] mb-3">
                    Combat Flow
                  </h3>
                  <div className="space-y-1 text-[9px] text-[#bbb0a0]">
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Select an ability from your action bar</li>
                      <li>Confirm targeting if applicable</li>
                      <li>Ability resolves and costs mana/cooldown</li>
                      <li>Enemy responds with counterattack</li>
                      <li>Continue until victory or defeat</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LORE TAB */}
          {activeTab === 'lore' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg uppercase tracking-[0.1em] text-[#efcf91] mb-3">
                  Story & Lore
                </h2>
                <p className="text-[10px] uppercase tracking-[0.08em] text-[#8d806d]">
                  The world of Legends of Kai-Jax
                </p>
              </div>

              <div className="border border-[#8b6e3d]/45 bg-black/45 p-4 rounded text-sm text-[#bbb0a0] leading-6 space-y-4">
                <div>
                  <h3 className="text-[#efcf91] uppercase tracking-[0.08em] mb-2 font-bold">
                    The Rift & The Void
                  </h3>
                  <p>
                    Reality itself has begun to tear. A phenomenon known as "The Rift" has emerged, bringing with it an existential threat called The Void. This alien force corrupts everything it touches, spreading across dimensions and consuming worlds.
                  </p>
                </div>

                <div>
                  <h3 className="text-[#efcf91] uppercase tracking-[0.08em] mb-2 font-bold">
                    The Memory Hero
                  </h3>
                  <p>
                    In humanity's darkest hour, two warriors—Jaxon and Kaison—achieve an unprecedented fusion, becoming Kai-Jax: The Memory Hero. This unprecedented fusion grants access to both Speed Incarnate (Jax) and Strategic Blade (Kaison) simultaneously, creating a fighter of unparalleled power.
                  </p>
                </div>

                <div>
                  <h3 className="text-[#efcf91] uppercase tracking-[0.08em] mb-2 font-bold">
                    The Raging City
                  </h3>
                  <p>
                    At the epicenter of the conflict stands the Raging City, divided among powerful factions. The Fang Syndicate, the Anti-Sabertooth Covenant, the Memory Cult, and the Ronin Order all vie for control while the Void gnaws at reality's edges. Only through unity can they hope to survive.
                  </p>
                </div>

                <div>
                  <h3 className="text-[#efcf91] uppercase tracking-[0.08em] mb-2 font-bold">
                    Your Mission
                  </h3>
                  <p>
                    As Kai-Jax or one of the legendary heroes, you must journey through the Raging City, master your abilities, unite the factions, and confront The Rift General before all reality collapses into the Void.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
