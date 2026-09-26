import { afterEach, describe, expect, it, vi } from 'vitest';
import { hapticFeedback } from './touchUtils';

describe('hapticFeedback browser fallback', () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

  afterEach(() => {
    if (originalDescriptor) {
      Object.defineProperty(globalThis, 'navigator', originalDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, 'navigator');
    }
    vi.restoreAllMocks();
  });

  it('returns unsupported when vibration is unavailable', () => {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {},
    });

    expect(hapticFeedback('light')).toBe('unsupported');
  });

  it('maps feedback strengths to deterministic vibration patterns', () => {
    const vibrate = vi.fn(() => true);
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { vibrate },
    });

    expect(hapticFeedback('light')).toBe('vibration');
    expect(hapticFeedback('medium')).toBe('vibration');
    expect(hapticFeedback('heavy')).toBe('vibration');

    expect(vibrate).toHaveBeenNthCalledWith(1, [10]);
    expect(vibrate).toHaveBeenNthCalledWith(2, [20]);
    expect(vibrate).toHaveBeenNthCalledWith(3, [40]);
  });

  it('never throws gameplay input when the browser vibration API fails', () => {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        vibrate: vi.fn(() => {
          throw new Error('device vibration unavailable');
        }),
      },
    });

    expect(() => hapticFeedback('heavy')).not.toThrow();
    expect(hapticFeedback('heavy')).toBe('failed');
  });
});
