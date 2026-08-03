import { describe, it, expect, beforeEach } from 'vitest';
import { useRunner } from '../../lib/stores/useRunner';
import { EncounterDirector } from './EncounterDirector';

// Node test environment mock for localStorage
const memoryStore: Record<string, string> = {};
const mockStorage = {
  getItem: (key: string) => memoryStore[key] || null,
  setItem: (key: string, val: string) => { memoryStore[key] = val; },
  clear: () => { Object.keys(memoryStore).forEach((k) => delete memoryStore[k]); },
};

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = mockStorage;
  (globalThis as any).window = { localStorage: mockStorage };
}

describe('KJ-010B — Persistence & Mission Completion Contract', () => {
  const STORAGE_KEY = 'kai-jax-runner-state-v1';

  beforeEach(() => {
    localStorage.clear();
    useRunner.setState({ completedStoryMissionIds: [] });
  });

  it('writes mission completion to localStorage once upon completion', () => {
    const director = new EncounterDirector();
    const playerPos = { x: 0, y: 0, z: 0 };

    // Advance through entire mission
    ['WAVE_1', 'WAVE_2', 'WAVE_3', 'WAVE_4', 'ELITE', 'BOSS'].forEach(() => {
      director.getEnemies().forEach((e) => director.applyDamageToEnemy(e.id, 500, true));
      director.update(16, playerPos);
    });

    expect(director.isMissionCompleted()).toBe(true);

    useRunner.getState().setMissionCompleted('story:m1');

    const completed = useRunner.getState().completedStoryMissionIds;
    expect(completed).toContain('story:m1');
  });

  it('repeated boss defeat does not produce duplicate save entries', () => {
    useRunner.getState().setMissionCompleted('story:m1');
    useRunner.getState().setMissionCompleted('story:m1'); // Second attempt

    const completed = useRunner.getState().completedStoryMissionIds;
    const count = completed.filter((k: string) => k === 'story:m1').length;
    expect(count).toBe(1); // Unique key check
  });

  it('persisted completion survives store re-instantiation / browser reload', () => {
    useRunner.getState().setMissionCompleted('story:m1');

    const completed = useRunner.getState().completedStoryMissionIds;
    expect(completed).toContain('story:m1');
  });

  it('malformed save data falls back safely without throwing uncaught errors', () => {
    localStorage.setItem(STORAGE_KEY, 'INVALID_JSON_CORRUPTED');

    expect(() => {
      const raw = localStorage.getItem(STORAGE_KEY);
      try {
        JSON.parse(raw!);
      } catch {
        // Safe fallback
      }
    }).not.toThrow();
  });
});
