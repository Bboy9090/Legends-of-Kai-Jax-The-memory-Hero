/**
 * ABILITY DISPLAY COMPONENT
 * Shows character abilities, power matrices, and ability details
 */

import React, { useState } from 'react';
import { getCharacterPowerMatrix, getCharacterAbilities, type Ability } from '../../lib/abilitySystems';
import { getCharacterData } from '../../lib/characterStats';
import { Zap, Shield, Sparkles, Wind } from 'lucide-react';

interface AbilityDisplayProps {
  characterId: string;
  compact?: boolean;
}

const getAbilityIcon = (element: string) => {
  switch (element) {
    case 'Lightning':
      return <Zap className="h-5 w-5" />;
    case 'Memory':
      return <Sparkles className="h-5 w-5" />;
    case 'Wind':
      return <Wind className="h-5 w-5" />;
    default:
      return <Shield className="h-5 w-5" />;
  }
};

const getElementColor = (element: string): string => {
  switch (element) {
    case 'Lightning':
      return '#5aaeff';
    case 'Memory':
      return '#00f2ff';
    case 'Wind':
      return '#22d3ee';
    case 'Fire':
      return '#ff6347';
    case 'Primal':
      return '#ffa500';
    default:
      return '#a9a9a9';
  }
};

export default function AbilityDisplay({ characterId, compact = false }: AbilityDisplayProps) {
  const [selectedAbility, setSelectedAbility] = useState<Ability | null>(null);
  const powerMatrix = getCharacterPowerMatrix(characterId);
  const characterData = getCharacterData(characterId);
  const abilities = getCharacterAbilities(characterId);

  if (!powerMatrix || !abilities.length) {
    return (
      <div className="text-center text-[#a79372] text-sm">
        No abilities available for this character
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="text-[10px] uppercase tracking-[0.28em] text-[#a48c65]">
          Abilities ({abilities.length})
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {abilities.map((ability) => (
            <button
              key={ability.id}
              onClick={() => setSelectedAbility(ability)}
              className="flex flex-col items-center gap-1 rounded border border-[#735a35]/50 bg-black/40 p-2 text-center hover:bg-black/60 transition"
            >
              <div
                style={{ color: getElementColor(ability.element) }}
                className="flex items-center gap-1"
              >
                {getAbilityIcon(ability.element)}
              </div>
              <div className="text-[8px] uppercase tracking-[0.1em] text-[#efcf91]">
                {ability.name.split(' ')[0]}
              </div>
              <div className="text-[7px] text-[#8d806d]">Cd: {ability.cooldown}s</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ABILITIES GRID */}
      <div>
        <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#a48c65]">
          Combat Abilities
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {abilities.map((ability) => (
            <button
              key={ability.id}
              onClick={() => setSelectedAbility(ability)}
              className="border border-[#8b6e3d]/45 bg-black/45 p-4 text-left transition hover:bg-black/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-[0.12em] text-[#efcf91] flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: getElementColor(ability.element) }}
                    />
                    {ability.name}
                  </div>
                  <div className="mt-1 text-[11px] text-[#bbb0a0] leading-5">
                    {ability.description}
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[9px]">
                <div>
                  <div className="text-[#8f816d]">Tier</div>
                  <div className="mt-0.5 text-[#d6c9b5]">{ability.tier}</div>
                </div>
                <div>
                  <div className="text-[#8f816d]">Cooldown</div>
                  <div className="mt-0.5 text-[#d6c9b5]">{ability.cooldown}s</div>
                </div>
                <div>
                  <div className="text-[#8f816d]">Damage</div>
                  <div className="mt-0.5 text-[#d6c9b5]">{ability.damage}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* PASSIVE ABILITIES */}
      {powerMatrix.passives.length > 0 && (
        <div>
          <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#a48c65]">
            Passive Abilities
          </div>
          <div className="space-y-2">
            {powerMatrix.passives.map((passive) => (
              <div key={passive.id} className="border border-[#8b6e3d]/45 bg-black/45 p-3">
                <div className="text-xs uppercase tracking-[0.12em] text-[#efcf91]">
                  {passive.name}
                </div>
                <div className="mt-1 text-[11px] text-[#bbb0a0]">{passive.description}</div>
                <div className="mt-2 text-[10px] text-[#d6c9b5] font-mono">
                  Effect: {passive.effect}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ULTIMATE ABILITY */}
      {powerMatrix.ultimate && (
        <div>
          <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#d46cff]">
            Ultimate Ability
          </div>
          <div className="border border-[#d46cff]/50 bg-black/40 p-4">
            <div className="text-xs uppercase tracking-[0.12em] text-[#d46cff]">
              {powerMatrix.ultimate.name}
            </div>
            <div className="mt-2 text-sm text-[#bbb0a0]">
              {powerMatrix.ultimate.description}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[9px]">
              <div>
                <div className="text-[#8f816d]">Damage</div>
                <div className="mt-0.5 text-[#d6c9b5]">{powerMatrix.ultimate.damage}</div>
              </div>
              <div>
                <div className="text-[#8f816d]">Duration</div>
                <div className="mt-0.5 text-[#d6c9b5]">{powerMatrix.ultimate.duration}s</div>
              </div>
              <div>
                <div className="text-[#8f816d]">Cooldown</div>
                <div className="mt-0.5 text-[#d6c9b5]">{powerMatrix.ultimate.cooldown}s</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SELECTED ABILITY DETAIL */}
      {selectedAbility && (
        <div className="border-t border-[#7d6136]/55 pt-4">
          <div className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#a48c65]">
            Ability Details
          </div>
          <div className="border border-[#8b6e3d]/45 bg-black/45 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-10 w-10 rounded flex items-center justify-center"
                style={{ backgroundColor: getElementColor(selectedAbility.element) + '20' }}
              >
                {getAbilityIcon(selectedAbility.element)}
              </div>
              <div>
                <div className="text-sm uppercase tracking-[0.08em] text-[#efcf91]">
                  {selectedAbility.name}
                </div>
                <div className="text-[9px] text-[#8f816d]">{selectedAbility.element}</div>
              </div>
            </div>
            <div className="text-sm text-[#bbb0a0] mb-4">{selectedAbility.description}</div>
            <div className="grid grid-cols-2 gap-3 text-[9px]">
              <div className="border border-[#735a35]/50 bg-black/20 p-2">
                <div className="text-[#8f816d]">Cooldown</div>
                <div className="mt-1 text-[#d6c9b5]">{selectedAbility.cooldown}s</div>
              </div>
              <div className="border border-[#735a35]/50 bg-black/20 p-2">
                <div className="text-[#8f816d]">Mana Cost</div>
                <div className="mt-1 text-[#d6c9b5]">{selectedAbility.manaCost}</div>
              </div>
              <div className="border border-[#735a35]/50 bg-black/20 p-2">
                <div className="text-[#8f816d]">Damage</div>
                <div className="mt-1 text-[#d6c9b5]">{selectedAbility.damage}</div>
              </div>
              <div className="border border-[#735a35]/50 bg-black/20 p-2">
                <div className="text-[#8f816d]">Tier</div>
                <div className="mt-1 text-[#d6c9b5]">Tier {selectedAbility.tier}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
