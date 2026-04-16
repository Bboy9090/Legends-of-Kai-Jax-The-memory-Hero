/**
 * Character definitions for playable fighters.
 * Each character has a distinct moveset, color, and base stats.
 */

export type CharacterId = 'kai' | 'jax';

export interface CharacterSpec {
  id: CharacterId;
  name: string;
  color: number;
  hp: number;
  moveSpeed: number;
  moveIds: string[]; // Ordered by [J, K, L, I, U, O] key bindings
  moveLabels: string[];
}

export const CHARACTERS: Record<CharacterId, CharacterSpec> = {
  kai: {
    id: 'kai',
    name: 'Kai — The Memory King',
    color: 0x00d9ff,
    hp: 100,
    moveSpeed: 4.0,
    moveIds: [
      'kai_light_jab',
      'kai_heavy_punch',
      'kai_uppercut',
      'kai_sweep',
      'kai_grab',
      'kai_combo_chain',
    ],
    moveLabels: [
      'Light Jab (4 dmg)',
      'Heavy Punch (12 dmg)',
      'Uppercut (10 dmg, launches)',
      'Sweep (6 dmg, low)',
      'Grab (8 dmg, breaks shield)',
      'Combo Chain (3 hits: 3+4+6)',
    ],
  },
  jax: {
    id: 'jax',
    name: 'Jax — Prime Striker',
    color: 0xffd700,
    hp: 85,
    moveSpeed: 5.2,
    moveIds: [
      'jax_quick_jab',
      'jax_dash_strike',
      'kai_uppercut', // shared launch
      'jax_spin_kick',
      'jax_flash_grab',
      'kai_combo_chain', // shared combo placeholder
    ],
    moveLabels: [
      'Quick Jab (3 dmg, fast)',
      'Dash Strike (8 dmg)',
      'Uppercut (10 dmg, launches)',
      'Spin Kick (2x4 dmg, both sides)',
      'Flash Grab (6 dmg, breaks shield)',
      'Combo Chain (3 hits)',
    ],
  },
};
