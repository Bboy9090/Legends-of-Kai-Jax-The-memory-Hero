import { describe, it, expect, beforeEach } from 'vitest';
import { useTouchInput } from '../../lib/stores/useTouchInput';
import { useAdventure } from '../../lib/stores/useAdventure';
import { EncounterDirector } from './EncounterDirector';

describe('KJ-009F — Lifecycle, Leak & Mobile Touch Tests', () => {
  beforeEach(() => {
    useTouchInput.getState().releaseJoystick();
    useTouchInput.getState().consumeAttacks();
    useAdventure.setState({ isPaused: false });
  });

  it('joystick clears state when released or on pointercancel', () => {
    useTouchInput.getState().setJoystick(0.8, -0.6, true);
    expect(useTouchInput.getState().isJoystickActive).toBe(true);

    useTouchInput.getState().releaseJoystick();
    expect(useTouchInput.getState().isJoystickActive).toBe(false);
    expect(useTouchInput.getState().joystickX).toBe(0);
    expect(useTouchInput.getState().joystickY).toBe(0);
  });

  it('queued attack buttons are consumed atomically without double-firing', () => {
    useTouchInput.getState().queueAttack('attack');
    const consumed1 = useTouchInput.getState().consumeAttacks();
    expect(consumed1).toEqual(['attack']);

    const consumed2 = useTouchInput.getState().consumeAttacks();
    expect(consumed2).toEqual([]);
  });

  it('pausing adventure mode freezes game state', () => {
    const adv = useAdventure.getState();
    expect(adv.isPaused).toBe(false);

    useAdventure.getState().togglePause();
    expect(useAdventure.getState().isPaused).toBe(true);
  });

  it('restarting mission clears enemies and instantiates exactly one EncounterDirector', () => {
    const director = new EncounterDirector();
    expect(director.getCurrentWave()).toBe('WAVE_1');

    director.restart();
    expect(director.getCurrentWave()).toBe('WAVE_1');
    expect(director.getEnemies().length).toBe(2);
  });
});
