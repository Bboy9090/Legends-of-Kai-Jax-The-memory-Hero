import type { StoryDialogue } from "./story_missions";

/** Roughly two lines of dialogue-box text at phone width. */
export const MAX_BEAT_CHARS = 84;
/** Phone-width dialogue boxes fit about 32 characters per line, so beats are shorter there. */
export const PHONE_BEAT_CHARS = 62;

function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?…]+(?:[.!?…]+["')\]]*|$)\s*/g);
  return (parts ?? [text]).map((p) => p.trim()).filter(Boolean);
}

/** Break an over-long sentence at the nearest comma/dash/space before the limit. */
function chop(sentence: string, max: number): string[] {
  const out: string[] = [];
  let rest = sentence;
  while (rest.length > max) {
    const window = rest.slice(0, max + 1);
    let cut = Math.max(window.lastIndexOf(", "), window.lastIndexOf(" — "), window.lastIndexOf("; "));
    if (cut < max * 0.4) cut = window.lastIndexOf(" ");
    if (cut <= 0) cut = max;
    out.push(rest.slice(0, cut + (rest[cut] === "," || rest[cut] === ";" ? 1 : 0)).trim());
    rest = rest.slice(cut + 1).trim();
  }
  if (rest) out.push(rest);
  return out;
}

/** Split one line of speech into punchy beats of at most `max` characters (about two lines). */
export function splitIntoBeats(text: string, max = MAX_BEAT_CHARS): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return [clean];

  const beats: string[] = [];
  let current = "";
  for (const sentence of splitSentences(clean).flatMap((s) => (s.length > max ? chop(s, max) : [s]))) {
    if (!current) current = sentence;
    else if (current.length + 1 + sentence.length <= max) current += ` ${sentence}`;
    else {
      beats.push(current);
      current = sentence;
    }
  }
  if (current) beats.push(current);
  return beats;
}

/** Expand every authored line into beats that keep the speaker, side and emotion. */
export function expandDialogue(lines: StoryDialogue[], max = MAX_BEAT_CHARS): StoryDialogue[] {
  return lines.flatMap((line) => splitIntoBeats(line.text, max).map((text) => ({ ...line, text })));
}
