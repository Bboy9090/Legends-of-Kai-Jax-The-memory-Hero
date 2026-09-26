import { describe, expect, it } from 'vitest';
import { CombatActionBuffer } from './CombatActionBuffer';

describe('CombatActionBuffer', () => {
  it('preserves queued combat actions until consumed', () => {
    const buffer = new CombatActionBuffer(false);

    buffer.enqueue('attackLight');
    buffer.enqueue('dodge');

    expect(buffer.consume('attackLight')).toBe(true);
    expect(buffer.consume('attackLight')).toBe(false);
    expect(buffer.consume('dodge')).toBe(true);
  });

  it('rejects combat actions while suppressed and clears latent input', () => {
    const buffer = new CombatActionBuffer(false);

    buffer.enqueue('attackHeavy');
    expect(buffer.pending('attackHeavy')).toBe(1);

    buffer.setSuppressed(true);
    expect(buffer.pending('attackHeavy')).toBe(0);
    expect(buffer.isSuppressed()).toBe(true);

    buffer.enqueue('attackUltimate');
    buffer.enqueue('dodge');
    expect(buffer.pending('attackUltimate')).toBe(0);
    expect(buffer.pending('dodge')).toBe(0);

    buffer.setSuppressed(false);
    buffer.enqueue('attackUltimate');
    expect(buffer.pending('attackUltimate')).toBe(1);
  });

  it('caps repeated presses and clears deterministically', () => {
    const buffer = new CombatActionBuffer(false);

    for (let i = 0; i < 10; i += 1) buffer.enqueue('attackSpecial');
    expect(buffer.pending('attackSpecial')).toBe(3);

    expect(buffer.consume('attackSpecial')).toBe(true);
    expect(buffer.pending('attackSpecial')).toBe(2);

    buffer.clear('attackSpecial');
    expect(buffer.pending('attackSpecial')).toBe(0);

    buffer.enqueue('attackLight');
    buffer.enqueue('dodge');
    buffer.clear();

    expect(buffer.pending('attackLight')).toBe(0);
    expect(buffer.pending('dodge')).toBe(0);
  });
});
