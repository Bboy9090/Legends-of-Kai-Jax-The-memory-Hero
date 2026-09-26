import { describe, expect, it } from 'vitest';
import { GameplayPulseBuffer } from './GameplayPulseBuffer';

describe('GameplayPulseBuffer', () => {
  it('preserves short one-shot pulses until consumed', () => {
    const buffer = new GameplayPulseBuffer(false);

    buffer.enqueue('jump');
    buffer.enqueue('traversal');
    buffer.enqueue('interact');

    expect(buffer.consume('jump')).toBe(true);
    expect(buffer.consume('jump')).toBe(false);
    expect(buffer.consume('traversal')).toBe(true);
    expect(buffer.consume('interact')).toBe(true);
  });

  it('caps repeated pulses and clears deterministically', () => {
    const buffer = new GameplayPulseBuffer(false);

    for (let i = 0; i < 10; i += 1) buffer.enqueue('traversal');
    expect(buffer.pending('traversal')).toBe(3);

    expect(buffer.consume('traversal')).toBe(true);
    expect(buffer.pending('traversal')).toBe(2);

    buffer.clear('traversal');
    expect(buffer.pending('traversal')).toBe(0);

    buffer.enqueue('jump');
    buffer.enqueue('interact');
    buffer.clear();

    expect(buffer.pending('jump')).toBe(0);
    expect(buffer.pending('interact')).toBe(0);
  });
});
