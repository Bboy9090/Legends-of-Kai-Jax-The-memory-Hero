import { beforeEach, describe, expect, it, vi } from 'vitest';

// The runner store persists through localStorage; give vitest's node environment a minimal one.
const memory = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => memory.get(k) ?? null,
  setItem: (k: string, v: string) => void memory.set(k, v),
  removeItem: (k: string) => void memory.delete(k),
});

const { useRunner } = await import('./useRunner');
const { useAudio } = await import('./useAudio');

describe('useRunner.campaignCurrentNode (DistrictSelectScreen / BattleUI contract)', () => {
  beforeEach(() => useRunner.setState({ campaignCurrentNode: null }));

  it('exposes a working setter (the UI used to call an undefined function)', () => {
    expect(typeof useRunner.getState().setCampaignCurrentNode).toBe('function');
    useRunner.getState().setCampaignCurrentNode('district-2');
    expect(useRunner.getState().campaignCurrentNode).toBe('district-2');
    useRunner.getState().setCampaignCurrentNode(null);
    expect(useRunner.getState().campaignCurrentNode).toBeNull();
  });

  it('never leaks between save slots', () => {
    useRunner.getState().setCampaignCurrentNode('district-1');
    useRunner.getState().switchProfile(1);
    expect(useRunner.getState().campaignCurrentNode).toBeNull();
  });

  it('is cleared when the active profile is reset', () => {
    useRunner.getState().switchProfile(0);
    useRunner.getState().setCampaignCurrentNode('district-3');
    useRunner.getState().resetProfile(0);
    expect(useRunner.getState().campaignCurrentNode).toBeNull();
  });

  it('is runtime-only: it is not part of the persisted profile payload', () => {
    useRunner.getState().setCampaignCurrentNode('district-2');
    useRunner.getState().addScore(1); // force a persist write
    const saved = [...memory.values()].join('\n');
    expect(saved).not.toContain('campaignCurrentNode');
  });
});

describe('useAudio.toggleMute (SettingsMenu / BootAccessibilityScreen contract)', () => {
  it('flips isMuted and pauses playing music when muting', () => {
    const bg = { pause: vi.fn() } as unknown as HTMLAudioElement;
    const battle = { pause: vi.fn() } as unknown as HTMLAudioElement;
    useAudio.setState({ isMuted: false, backgroundMusic: bg, battleMusic: battle });
    expect(typeof useAudio.getState().toggleMute).toBe('function');
    useAudio.getState().toggleMute();
    expect(useAudio.getState().isMuted).toBe(true);
    expect(bg.pause).toHaveBeenCalledTimes(1);
    expect(battle.pause).toHaveBeenCalledTimes(1);
    useAudio.getState().toggleMute();
    expect(useAudio.getState().isMuted).toBe(false);
    expect(bg.pause).toHaveBeenCalledTimes(1); // unmuting must not pause again
  });

  it('tolerates a missing music element', () => {
    useAudio.setState({ isMuted: false, backgroundMusic: null, battleMusic: null });
    expect(() => useAudio.getState().toggleMute()).not.toThrow();
  });
});
