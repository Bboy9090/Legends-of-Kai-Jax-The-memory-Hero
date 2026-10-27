import { describe, expect, it } from 'vitest';
import { evaluateCancelTransition, type CancelState } from './cancelTransition';
import { framesToSeconds } from './frameTiming';

const base: CancelState = { currentMove: 'light1', elapsedSeconds: framesToSeconds(10), attacking: true, dodging: false, guardBroken: false, hitstun: false, stamina: 20 };

describe('pure cancel transition evaluator', () => {
  it('allows the two authored light-chain edges at their exact frames', () => {
    expect(evaluateCancelTransition(base, 'light2')).toEqual({ allowed: true });
    expect(evaluateCancelTransition({ ...base, currentMove: 'light2', elapsedSeconds: framesToSeconds(11) }, 'light3')).toEqual({ allowed: true });
  });
  it('rejects frames before cancel boundaries', () => {
    expect(evaluateCancelTransition({ ...base, elapsedSeconds: framesToSeconds(9) }, 'light2')).toEqual({ allowed: false, reason: 'too_early' });
    expect(evaluateCancelTransition({ ...base, currentMove: 'light2', elapsedSeconds: framesToSeconds(10) }, 'light3')).toEqual({ allowed: false, reason: 'too_early' });
  });
  it.each(['dodging', 'guardBroken', 'hitstun'] as const)('rejects %s', key => {
    expect(evaluateCancelTransition({ ...base, [key]: true }, 'light2')).toEqual({ allowed: false, reason: 'state_locked' });
  });
  it('rejects a non-attacking source', () => {
    expect(evaluateCancelTransition({ ...base, attacking: false }, 'light2')).toEqual({ allowed: false, reason: 'state_locked' });
  });
  it('rejects invalid routes', () => {
    expect(evaluateCancelTransition(base, 'heavy')).toEqual({ allowed: false, reason: 'invalid_route' });
    expect(evaluateCancelTransition({ ...base, currentMove: 'light3' }, 'light1')).toEqual({ allowed: false, reason: 'invalid_route' });
  });
  it('requires the next move stamina cost without mutating inputs', () => {
    const frozen = Object.freeze({ ...base, stamina: 3 });
    expect(evaluateCancelTransition(frozen, 'light2')).toEqual({ allowed: false, reason: 'insufficient_stamina' });
    expect(frozen.stamina).toBe(3);
    expect(evaluateCancelTransition({ ...base, stamina: 4 }, 'light2')).toEqual({ allowed: true });
  });
  it('rejects nonfinite timing and stamina', () => {
    expect(evaluateCancelTransition({ ...base, elapsedSeconds: NaN }, 'light2').allowed).toBe(false);
    expect(evaluateCancelTransition({ ...base, stamina: NaN }, 'light2').allowed).toBe(false);
  });
});
