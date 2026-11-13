import { describe, expect, it } from "vitest";
import { MUSIC_STEPS, planMusicStep, type MusicMood } from "./AdaptiveMusic";
import { moodFor } from "../lib/musicDirector";
import { normalizeMusicSettings } from "../lib/stores/useMusic";

const MOODS: MusicMood[] = ["title", "explore", "combat", "boss", "victory"];
const bar = (m: MusicMood) => Array.from({ length: MUSIC_STEPS }, (_, i) => planMusicStep(m, i));

describe("adaptive music plan", () => {
  it("every mood produces bass and a valid frequency range", () => {
    for (const m of MOODS) {
      const notes = bar(m).flatMap((p) => [p.bass, p.chime]).filter(Boolean);
      expect(notes.length, m).toBeGreaterThan(0);
      for (const n of notes) {
        expect(n!.freq).toBeGreaterThan(20);
        expect(n!.freq).toBeLessThan(2000);
      }
    }
  });

  it("combat and boss are driven by a kick; calm moods have none", () => {
    const kicks = (m: MusicMood) => bar(m).filter((p) => p.kick !== undefined).length;
    expect(kicks("combat")).toBe(8);
    expect(kicks("boss")).toBe(8);
    for (const m of ["title", "explore", "victory"] as MusicMood[]) expect(kicks(m)).toBe(0);
  });

  it("only the boss mood has hi-hats and a saw bass; chimes belong to calm moods", () => {
    expect(bar("boss").filter((p) => p.hat !== undefined)).toHaveLength(8);
    expect(bar("combat").some((p) => p.hat !== undefined)).toBe(false);
    expect(bar("boss").find((p) => p.bass)!.bass!.type).toBe("sawtooth");
    expect(bar("combat").some((p) => p.chime)).toBe(false);
    expect(bar("explore").filter((p) => p.chime)).toHaveLength(4);
  });

  it("is periodic and tolerates negative steps", () => {
    expect(planMusicStep("combat", 3)).toEqual(planMusicStep("combat", 3 + MUSIC_STEPS * 5));
    expect(() => planMusicStep("title", -7)).not.toThrow();
  });
});

describe("music director mood", () => {
  it("maps screens to moods", () => {
    expect(moodFor("title")).toBe("title");
    expect(moodFor("settings")).toBe("title");
    expect(moodFor("story-hub")).toBe("explore");
    expect(moodFor("mission-select")).toBe("explore");
    expect(moodFor("adventure")).toBe("combat");
    expect(moodFor("mission-complete")).toBe("victory");
  });
  it("switches to boss only for a living phase-2 boss", () => {
    expect(moodFor("adventure", { alive: true, phase: 1 })).toBe("combat");
    expect(moodFor("adventure", { alive: true, phase: 2 })).toBe("boss");
    expect(moodFor("adventure", { alive: false, phase: 2 })).toBe("combat");
    expect(moodFor("story-hub", { alive: true, phase: 2 })).toBe("explore");
  });
  it("sanitizes stored music settings", () => {
    expect(normalizeMusicSettings(null)).toEqual({ adaptive: true, musicVolume: 0.7 });
    expect(normalizeMusicSettings({ adaptive: false, musicVolume: 9 })).toEqual({ adaptive: false, musicVolume: 1 });
    expect(normalizeMusicSettings({ musicVolume: "loud" }).musicVolume).toBe(0.7);
  });
});
