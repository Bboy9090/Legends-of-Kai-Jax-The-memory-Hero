/**
 * CHARACTER STATS DISPLAY COMPONENT
 * Shows character statistics, lore, and detailed information
 */

import { readableOnDark } from '../../lib/contrast';
import React from 'react';
import { getCharacterData } from '../../lib/characterStats';
import { Heart, Zap, Shield, Flame } from 'lucide-react';

interface CharacterStatsDisplayProps {
  characterId: string;
  showLore?: boolean;
}

export default function CharacterStatsDisplay({ characterId, showLore = true }: CharacterStatsDisplayProps) {
  const characterData = getCharacterData(characterId);

  if (!characterData) {
    return (
      <div className="text-center text-[#a79372] text-sm">
        Character not found
      </div>
    );
  }

  const { stats, bio, lore, faction, role, rarity, relationships } = characterData;
  const maxStats = Math.max(stats.attack, stats.defense, stats.speed, 100);

  return (
    <div className="space-y-6">
      {/* CHARACTER HEADER WITH PORTRAIT */}
      <div
        className="border border-[#8b6e3d]/45 bg-gradient-to-r from-black/50 to-black/20 p-4 relative overflow-hidden"
        style={{
          borderColor: characterData.visualIdentity.primaryColor + '40',
        }}
      >
        <div className="absolute top-0 right-0 w-24 h-24 opacity-10" style={{
          backgroundImage: `radial-gradient(circle, ${characterData.visualIdentity.primaryColor}, transparent)`,
        }} />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-[0.28em] text-[#8d806d]">
                {faction}
              </div>
              <div className="mt-1 text-2xl uppercase tracking-[0.08em]" style={{
                color: readableOnDark(characterData.visualIdentity.primaryColor),
              }}>
                {characterData.displayName}
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <div className="inline-block px-2 py-1 bg-black/40 border border-[#735a35]/50 rounded">
                <div className="text-[9px] uppercase tracking-[0.1em]" style={{
                  color: readableOnDark(characterData.visualIdentity.accentColor),
                }}>
                  {rarity}
                </div>
              </div>
              {characterData.portraitPath && (
                <img
                  src={characterData.portraitPath}
                  alt={characterData.displayName}
                  className="w-28 h-28 object-cover rounded-sm border border-[#8b6e3d]/50"
                  style={{ borderColor: characterData.visualIdentity.primaryColor + '60' }}
                />
              )}
            </div>
          </div>
          <div className="text-[11px] text-[#bbb0a0]">{bio}</div>
          <div className="mt-2 flex flex-wrap gap-2 text-[9px]">
            <div className="bg-black/30 px-2 py-1 rounded text-[#a79372]">{role}</div>
            {characterData.visualIdentity.visualThemes.slice(0, 2).map((theme, i) => (
              <div key={i} className="bg-black/30 px-2 py-1 rounded text-[#8f816d]">
                {theme}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STATS BARS */}
      <div>
        <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#a48c65]">
          Combat Stats
        </div>
        <div className="space-y-3">
          {[
            { label: 'Health', value: stats.health, max: stats.maxHealth, icon: Heart, color: '#ff6347' },
            { label: 'Mana', value: stats.mana, max: stats.maxMana, icon: Zap, color: '#5aaeff' },
            { label: 'Attack', value: stats.attack, max: maxStats, icon: Flame, color: '#ffed4e' },
            { label: 'Defense', value: stats.defense, max: maxStats, icon: Shield, color: '#22d3ee' },
            { label: 'Speed', value: stats.speed, max: maxStats, icon: Zap, color: '#d46cff' },
          ].map((stat) => {
            const percentage = (stat.value / stat.max) * 100;
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-24 text-[9px]">
                  <Icon className="h-3 w-3" style={{ color: stat.color }} />
                  <span className="uppercase text-[#8d806d]">{stat.label}</span>
                </div>
                <div className="flex-1 h-4 bg-black/50 border border-[#735a35]/50 rounded-sm overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: stat.color + '80',
                    }}
                  />
                </div>
                <div className="w-12 text-right text-[9px] text-[#bbb0a0]">
                  {stat.value}/{stat.max}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SPECIAL STATS */}
      <div>
        <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#a48c65]">
          Special Attributes
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="border border-[#8b6e3d]/45 bg-black/45 p-2">
            <div className="text-[9px] uppercase text-[#8f816d]">Crit Chance</div>
            <div className="mt-1 text-xs text-[#d6c9b5]">{stats.critChance}%</div>
          </div>
          <div className="border border-[#8b6e3d]/45 bg-black/45 p-2">
            <div className="text-[9px] uppercase text-[#8f816d]">Crit Damage</div>
            <div className="mt-1 text-xs text-[#d6c9b5]">{stats.critDamage}%</div>
          </div>
          <div className="border border-[#8b6e3d]/45 bg-black/45 p-2">
            <div className="text-[9px] uppercase text-[#8f816d]">Lifesteal</div>
            <div className="mt-1 text-xs text-[#d6c9b5]">{stats.lifesteal}%</div>
          </div>
        </div>
      </div>

      {/* ELEMENTAL RESISTANCE */}
      <div>
        <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#a48c65]">
          Elemental Resistance
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Object.entries(stats.elementalResistance).map(([element, resistance]) => (
            <div key={element} className="border border-[#8b6e3d]/45 bg-black/45 p-2">
              <div className="text-[9px] uppercase text-[#8f816d]">{element}</div>
              <div className="mt-1 text-xs text-[#d6c9b5]">{resistance}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* LORE SECTION */}
      {showLore && (
        <div className="border-t border-[#7d6136]/55 pt-4">
          <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#a48c65]">
            Lore & Background
          </div>
          <div className="border border-[#8b6e3d]/45 bg-black/45 p-4">
            <div className="text-sm leading-6 text-[#bbb0a0]">{lore}</div>
          </div>
        </div>
      )}

      {/* RELATIONSHIPS */}
      {relationships.length > 0 && (
        <div>
          <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#a48c65]">
            Known Associates
          </div>
          <div className="space-y-2">
            {relationships.map((rel) => (
              <div key={rel.characterId} className="border border-[#8b6e3d]/45 bg-black/45 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs uppercase tracking-[0.08em] text-[#efcf91]">
                      {rel.characterId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </div>
                    <div className="mt-1 text-[10px] text-[#8f816d]">{rel.type.toUpperCase()}</div>
                  </div>
                  <div className="text-[9px] text-[#bbb0a0] text-right">
                    {rel.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
