import { beforeEach, describe, expect, it } from "vitest";
import { SaveManager } from "./SaveManager";

const memoryStore: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null,
  setItem: (key: string, value: string) => { memoryStore[key] = String(value); },
  removeItem: (key: string) => { delete memoryStore[key]; },
  clear: () => { Object.keys(memoryStore).forEach((key) => delete memoryStore[key]); },
};

if (typeof globalThis.localStorage === "undefined") {
  Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, configurable: true });
}

describe("SaveManager release durability", () => {
  const key = "MEMORY_KING_SLOT_1";

  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trips a complete save", () => {
    const manager = new SaveManager();
    expect(manager.save("chapter_2", "CP_C", 42, 73, { x: 8, y: -3 }, ["fang"])).toBe(true);

    const loaded = manager.load();
    expect(loaded).toMatchObject({
      chapterId: "chapter_2",
      checkpoint: "CP_C",
      resonance: 42,
      health: 73,
      position: { x: 8, y: -3 },
      inventory: ["fang"],
      version: "1.0.0",
    });
  });

  it("preserves legitimate zero health and zero resonance when migrating", () => {
    localStorage.setItem(key, JSON.stringify({
      chapterId: "chapter_zero",
      checkpoint: "CP_B",
      resonance: 0,
      health: 0,
      inventory: [],
      timestamp: 0,
      version: "0.9.0",
    }));

    const loaded = new SaveManager().load();
    expect(loaded?.resonance).toBe(0);
    expect(loaded?.health).toBe(0);
    expect(loaded?.timestamp).toBe(0);
    expect(loaded?.version).toBe("1.0.0");
  });

  it("fails closed on malformed JSON instead of throwing", () => {
    localStorage.setItem(key, "{not-valid-json");
    expect(() => new SaveManager().load()).not.toThrow();
    expect(new SaveManager().load()).toBeNull();
  });

  it("deleteSave removes the persisted slot", () => {
    const manager = new SaveManager();
    expect(manager.save("chapter_1")).toBe(true);
    expect(manager.hasSave()).toBe(true);
    expect(manager.deleteSave()).toBe(true);
    expect(manager.hasSave()).toBe(false);
    expect(manager.load()).toBeNull();
  });

  it("checkpoint updates preserve health, resonance, position, and inventory", () => {
    const manager = new SaveManager();
    manager.save("chapter_4", "CP_A", 55, 61, { x: 2, y: 9 }, ["key", "map"]);

    expect(manager.updateCheckpoint("CP_D")).toBe(true);
    expect(manager.load()).toMatchObject({
      chapterId: "chapter_4",
      checkpoint: "CP_D",
      resonance: 55,
      health: 61,
      position: { x: 2, y: 9 },
      inventory: ["key", "map"],
    });
  });

  it("position updates preserve chapter and combat-state fields", () => {
    const manager = new SaveManager();
    manager.save("chapter_5", "CP_B", 12, 88, { x: 0, y: 0 }, ["token"]);

    expect(manager.updatePosition({ x: 100, y: -20 })).toBe(true);
    expect(manager.load()).toMatchObject({
      chapterId: "chapter_5",
      checkpoint: "CP_B",
      resonance: 12,
      health: 88,
      position: { x: 100, y: -20 },
      inventory: ["token"],
    });
  });
});
