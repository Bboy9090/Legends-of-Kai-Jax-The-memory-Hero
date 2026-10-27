import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CombatState } from './stateEnums';
import { getMoveFrameTime } from './frameTiming';
import { MOVES } from './moveData';

let frame: ((state: any, delta: number) => void) | undefined;
let cleanup: (() => void) | undefined;
vi.mock('@react-three/fiber', () => ({ useFrame: (fn: typeof frame) => { frame = fn; } }));
vi.mock('react', () => ({
  useRef: (value: unknown) => ({ current: value }),
  useEffect: (fn: () => (() => void) | undefined) => { cleanup = fn(); },
}));

import AdventurePlayerController from '../../components/game/adventure/AdventurePlayerController';
import { useAdventure } from '../../lib/stores/useAdventure';
import { useTouchInput } from '../../lib/stores/useTouchInput';
const initial = useAdventure.getState();
const touchInitial = useTouchInput.getState();
const camera = { camera: { getWorldDirection: (v: any) => v.set(0, 0, -1) } };
const press = (code: string) => { const event = new Event('keydown'); Object.defineProperty(event, 'code', { value: code }); (globalThis.window as any).dispatchEvent(event); };

beforeEach(() => {
  const win = new EventTarget() as any;
  win.addEventListener = win.addEventListener.bind(win);
  win.removeEventListener = win.removeEventListener.bind(win);
  win.dispatchEvent = win.dispatchEvent.bind(win);
  Object.defineProperty(globalThis, 'window', { value: win, configurable: true });
  Object.defineProperty(globalThis, 'document', { value: new EventTarget(), configurable: true });
  Object.defineProperty(globalThis, 'navigator', { value: { getGamepads: () => [] }, configurable: true });
  useAdventure.setState({ ...initial, isPaused: false, enemies: [], player: { ...initial.player, stamina: 0, combatState: CombatState.FREE, timeScale: 1 } });
  useTouchInput.setState({ ...touchInitial, pendingAttacks: [] });
  frame = undefined; cleanup = undefined;
  AdventurePlayerController();
});
afterEach(() => { cleanup?.(); useAdventure.setState(initial, true); useTouchInput.setState(touchInitial, true); });

describe('adventure live controller cancel gates', () => {
  it('denies exhausted light-chain cancel without mutating combat state', () => {
    useAdventure.setState(s => ({ player: { ...s.player, combatState: CombatState.ATTACKING, attackType: 'light1', comboStep: 0, stamina: 0 } }));
    // Establish the controller's attack timer through an initial permitted attack.
    useAdventure.setState(s => ({ player: { ...s.player, combatState: CombatState.FREE, stamina: 20 } }));
    press('KeyJ'); frame?.(camera, 0.001);
    expect(useAdventure.getState().player.attackType).toBe('light1');
    useAdventure.setState(s => ({ player: { ...s.player, stamina: 0 } }));
    frame?.(camera, getMoveFrameTime(MOVES.light1).cancelTime);
    press('KeyX');
    const before = useAdventure.getState().player;
    frame?.(camera, 0.001);
    const after = useAdventure.getState().player;
    expect(after.comboStep).toBe(before.comboStep);
    expect(after.stamina).toBe(0);
    expect(after.attackType).toBe('light1');
    expect(after.combatState).toBe(CombatState.ATTACKING);
  });

  it('preserves an attack key pressed during hitstop until the first resumed frame', () => {
    useAdventure.setState(s => ({ player: { ...s.player, stamina: 20, hitStopTimer: 0.05 } }));
    press('KeyJ');
    frame?.(camera, 0.03);
    expect(useAdventure.getState().player.attackType).toBeNull();
    frame?.(camera, 0.03);
    expect(useAdventure.getState().player.attackType).toBeNull();
    frame?.(camera, 0.001);
    expect(useAdventure.getState().player.attackType).toBe('light1');
  });
  const beginLight1 = () => {
    useAdventure.setState(s => ({ player: { ...s.player, stamina: 20 } }));
    press('KeyJ'); frame?.(camera, 0.001);
    expect(useAdventure.getState().player.attackType).toBe('light1');
    frame?.(camera, 0.05);
    frame?.(camera, 0.05);
    frame?.(camera, 0.05);
    frame?.(camera, 0.02);
  };

  it('replays punch pressed during hitstop into light2 and debits exactly once', () => {
    beginLight1();
    useAdventure.setState(s => ({ player: { ...s.player, hitStopTimer: 0.05 } }));
    press('KeyX');
    frame?.(camera, 0.03); frame?.(camera, 0.03);
    expect(useAdventure.getState().player.comboStep).toBe(0);
    frame?.(camera, 0.001);
    expect(useAdventure.getState().player).toMatchObject({ attackType: 'light2', comboStep: 1, stamina: 12 });
  });

  it('gamepad punch continues light1 into light2 using the same stamina gate', () => {
    beginLight1();
    let pressed = false;
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
      getGamepads: () => [{ connected: true, buttons: Array.from({ length: 18 }, (_, i) => ({ pressed: i === 2 && pressed })), axes: [0, 0] }],
    } });
    frame?.(camera, 0.001); pressed = true;
    frame?.(camera, 0.001);
    expect(useAdventure.getState().player).toMatchObject({ attackType: 'light2', comboStep: 1, stamina: 12 });
  });

  it('touch punch continues light1 into light2 using the same stamina gate', () => {
    beginLight1();
    useTouchInput.getState().queueAttack('attack');
    frame?.(camera, 0.001);
    expect(useAdventure.getState().player).toMatchObject({ attackType: 'light2', comboStep: 1, stamina: 12 });
  });

  it('gamepad and touch cancel denial leave original move unchanged when exhausted', () => {
    for (const mode of ['touch', 'gamepad'] as const) {
      cleanup?.();
      useAdventure.setState({ ...initial, isPaused: false, enemies: [], player: { ...initial.player, stamina: 0, combatState: CombatState.FREE, timeScale: 1 } });
      useTouchInput.setState({ ...touchInitial, pendingAttacks: [] });
      AdventurePlayerController();
      beginLight1();
      useAdventure.setState(s => ({ player: { ...s.player, stamina: 0 } }));
      if (mode === 'touch') useTouchInput.getState().queueAttack('attack');
      else Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
        getGamepads: () => [{ connected: true, buttons: Array.from({ length: 18 }, (_, i) => ({ pressed: i === 2 })), axes: [0, 0] }],
      } });
      frame?.(camera, 0.001);
      expect(useAdventure.getState().player).toMatchObject({ attackType: 'light1', comboStep: 0, stamina: 0 });
    }
  });

});
