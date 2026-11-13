/** WCAG contrast helpers, used to keep identity colours legible when they are drawn as text on dark panels. */

export function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

const toHex = (rgb: number[]) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");

export function relativeLuminance([r, g, b]: [number, number, number]): number {
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(a: string, b: string): number {
  const ra = parseHex(a);
  const rb = parseHex(b);
  if (!ra || !rb) return 1;
  const [hi, lo] = [relativeLuminance(ra), relativeLuminance(rb)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Returns `color` unchanged if it already reaches `minRatio` against `background`; otherwise mixes it toward white
 * in small steps (keeping its hue) until it does. Unparseable colours fall back to near-white.
 */
export function readableOnDark(color: string, background = "#000000", minRatio = 4.5): string {
  const rgb = parseHex(color);
  if (!rgb) return "#f1f5f9";
  if (contrastRatio(color, background) >= minRatio) return color.startsWith("#") ? color : "#" + color;
  for (let t = 0.05; t <= 1.0001; t += 0.05) {
    const mixed = toHex(rgb.map((v) => v + (255 - v) * t));
    if (contrastRatio(mixed, background) >= minRatio) return mixed;
  }
  return "#ffffff";
}
