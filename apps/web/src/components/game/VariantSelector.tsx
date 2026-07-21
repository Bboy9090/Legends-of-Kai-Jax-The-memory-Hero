/**
 * Variant Selector Component
 * Lets the player choose an unlocked skin variant for a fighter
 */

import React from 'react';
import {
  getVariantsForFighter,
  isVariantUnlocked,
  type CharacterVariant,
} from '../../lib/characterVariants';

const RARITY_COLORS: Record<CharacterVariant['rarity'], string> = {
  default: '#94a3b8',
  rare: '#38bdf8',
  epic: '#a78bfa',
  legendary: '#fbbf24',
};

interface VariantSelectorProps {
  fighterId: string;
  selectedVariantId: string;
  onSelect: (variantId: string) => void;
  playerProgress: {
    characterLevel: number;
    completedMissions: string[];
    completedQuests: string[];
  };
}

export default function VariantSelector({
  fighterId,
  selectedVariantId,
  onSelect,
  playerProgress,
}: VariantSelectorProps) {
  const variants = getVariantsForFighter(fighterId);

  if (variants.length <= 1) return null;

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Variants</h4>
      <div className="flex gap-2 flex-wrap">
        {variants.map((variant) => {
          const unlocked = isVariantUnlocked(variant, playerProgress);
          const isSelected = variant.id === selectedVariantId;
          const rarityColor = RARITY_COLORS[variant.rarity];

          return (
            <button
              key={variant.id}
              onClick={() => unlocked && onSelect(variant.id)}
              disabled={!unlocked}
              title={unlocked ? variant.description : variant.unlockCondition.description}
              className={`relative min-w-[44px] min-h-[44px] px-3 py-2 rounded-lg border-2 text-left transition-all ${
                isSelected ? 'scale-[1.03]' : unlocked ? 'hover:scale-[1.02]' : 'opacity-50'
              }`}
              style={{
                borderColor: isSelected ? variant.accentColor : `${rarityColor}44`,
                background: isSelected ? `${variant.accentColor}22` : 'rgba(15,23,42,0.6)',
              }}
            >
              <div
                className="text-xs font-bold"
                style={{ color: unlocked ? variant.accentColor : '#64748b' }}
              >
                {variant.name}
              </div>
              <div className="text-[9px] uppercase tracking-wider" style={{ color: rarityColor }}>
                {variant.rarity}
              </div>
              {!unlocked && (
                <div className="text-[9px] text-slate-500 mt-0.5">
                  🔒 {variant.unlockCondition.description}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
