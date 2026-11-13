import { describe, expect, it } from "vitest";
import { contrastRatio, parseHex, readableOnDark } from "./contrast";
import { ALL_BOSSES } from "./bossEncounters";
import { CHARACTER_DATA_MAP } from "./characterStats";

describe("contrast helpers", () => {
  it("parses 3 and 6 digit hex and rejects junk", () => {
    expect(parseHex("#fff")).toEqual([255, 255, 255]);
    expect(parseHex("1a0033")).toEqual([26, 0, 51]);
    expect(parseHex("purple")).toBeNull();
  });

  it("matches the WCAG reference ratios", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 1);
    expect(contrastRatio("#ffffff", "#ffffff")).toBe(1);
  });

  it("leaves already-readable colours alone and lightens dark ones to 4.5:1", () => {
    expect(readableOnDark("#ffed4e")).toBe("#ffed4e");
    const fixed = readableOnDark("#2a0a5e");
    expect(fixed).not.toBe("#2a0a5e");
    expect(contrastRatio(fixed, "#000000")).toBeGreaterThanOrEqual(4.5);
    expect(readableOnDark("#000000")).not.toBe("#000000");
    expect(readableOnDark("not-a-colour")).toBe("#f1f5f9");
  });

  it("keeps the hue family when lightening (blue stays blue-dominant)", () => {
    const [r, g, b] = parseHex(readableOnDark("#10105a"))!;
    expect(b).toBeGreaterThan(r);
    expect(b).toBeGreaterThan(g);
  });

  it("every boss and character identity colour is readable as text once passed through the helper", () => {
    const colours: string[] = [];
    for (const boss of ALL_BOSSES) colours.push(boss.visualIdentity.primaryColor);
    for (const c of Object.values(CHARACTER_DATA_MAP)) colours.push(c.visualIdentity.primaryColor, c.visualIdentity.accentColor);
    expect(colours.length).toBeGreaterThan(10);
    for (const c of colours) expect(contrastRatio(readableOnDark(c, "#05070b"), "#05070b"), c).toBeGreaterThanOrEqual(4.5);
  });
});
