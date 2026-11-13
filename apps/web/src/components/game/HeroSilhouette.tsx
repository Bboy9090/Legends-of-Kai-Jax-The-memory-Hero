import { useId } from "react";
import { getHeroIdentity, type HeroAttachment, type HeroHeadgear, type HeroMood, type HeroVisualIdentity } from "../../lib/heroVisualIdentity";

interface HeroSilhouetteProps {
  heroId: string;
  mood?: HeroMood;
  /** "portrait" crops to head and shoulders for dialogue; "full" shows the whole figure. */
  view?: "full" | "portrait";
  className?: string;
  locked?: boolean;
}

const BUILD = {
  slim: { w: 24, s: 1.0 },
  medium: { w: 30, s: 1.0 },
  broad: { w: 40, s: 1.0 },
  small: { w: 24, s: 0.76 },
  towering: { w: 42, s: 1.1 },
} as const;

function Headgear({ kind, c, rim }: { kind: HeroHeadgear; c: string; rim: string }) {
  const stroke = { stroke: rim, strokeWidth: 1.2, strokeLinejoin: "round" as const };
  switch (kind) {
    case "spikeMane":
      return <g fill={c} {...stroke}>{[-26, -16, -7, 3, 13, 23].map((a, i) => <path key={i} d={`M${60 + a * 0.5} 34 L${60 + a * 1.1} ${10 + (i % 2) * 6} L${60 + a * 0.5 + 7} 34 Z`} />)}</g>;
    case "stormMane":
      return <g fill={c} {...stroke}><path d="M42 40 C30 22 40 6 56 12 C48 18 52 26 60 26 C68 26 72 18 64 12 C80 6 90 22 78 40 C88 52 84 70 76 82 C80 64 72 54 60 52 C48 54 40 64 44 82 C36 70 32 52 42 40Z" /><path d="M86 18 l-8 14 h7 l-9 16" fill="none" stroke="#bfdbfe" strokeWidth={1.6} /></g>;
    case "fusionMane":
      return <g {...stroke}><path d="M40 40 C28 20 42 4 58 12 C50 20 54 28 60 28 C66 28 70 20 62 12 C78 4 92 20 80 40 C90 54 86 72 78 84 C82 64 72 54 60 52 C48 54 38 64 42 84 C34 72 30 54 40 40Z" fill={c} /><path d="M46 20 q-6 -12 4 -18 q-2 10 6 14Z M74 20 q6 -12 -4 -18 q2 10 -6 14Z" fill="#ff7a1a" stroke="none" /></g>;
    case "foxEars":
      return <g fill={c} {...stroke}><path d="M44 36 L40 8 L56 30Z" /><path d="M76 36 L80 8 L64 30Z" /></g>;
    case "hood":
      return <path d="M42 46 C40 18 80 18 78 46 C78 56 72 62 60 62 C48 62 42 56 42 46Z" fill={c} {...stroke} />;
    case "wildCat":
      return <g fill={c} {...stroke}><circle cx="46" cy="30" r="7" /><circle cx="74" cy="30" r="7" /></g>;
    case "tigerMane":
      return <g fill={c} {...stroke}><circle cx="60" cy="44" r="24" /><path d="M42 30 l8 6 M78 30 l-8 6 M38 46 l9 0 M82 46 l-9 0" stroke="#1c1917" strokeWidth={2.2} fill="none" /></g>;
    case "lionMane":
      return <g fill={c} {...stroke}>{Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <circle key={i} cx={60 + Math.cos(a) * 21} cy={44 + Math.sin(a) * 21} r="8" />; })}</g>;
    case "crown":
      return <g fill={c} {...stroke}><path d="M44 30 L48 12 L55 24 L60 8 L65 24 L72 12 L76 30Z" /></g>;
    case "veil":
      return <path d="M44 36 C44 14 76 14 76 36 L88 120 C70 110 50 110 32 120Z" fill={c} fillOpacity={0.55} {...stroke} />;
    case "leaves":
      return <g fill={c} {...stroke}><ellipse cx="46" cy="26" rx="9" ry="5" transform="rotate(-30 46 26)" /><ellipse cx="60" cy="18" rx="9" ry="5" /><ellipse cx="74" cy="26" rx="9" ry="5" transform="rotate(30 74 26)" /></g>;
    case "tuft":
      return <path d="M52 32 C50 18 58 10 60 2 C62 10 70 18 68 32 C64 26 56 26 52 32Z" fill={c} {...stroke} />;
    case "visor":
      return <g><rect x="44" y="38" width="32" height="8" rx="4" fill={c} {...stroke} /><rect x="46" y="40" width="28" height="3" rx="1.5" fill="#ecfeff" opacity={0.9} /></g>;
    case "halo":
      return <ellipse cx="60" cy="18" rx="17" ry="5" fill="none" stroke={c} strokeWidth={3} style={{ filter: `drop-shadow(0 0 4px ${rim})` }} />;
  }
}

function Attachment({ kind, c, a, rim, back }: { kind: HeroAttachment; c: string; a: string; rim: string; back: boolean }) {
  const line = { fill: "none", stroke: c, strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const glow = { filter: `drop-shadow(0 0 3px ${rim})` };
  switch (kind) {
    case "spiderLimbs":
      return back ? (
        <g {...line} style={glow}>
          <path d="M44 74 L18 52 L6 78 L12 98" /><path d="M44 84 L14 80 L8 104" />
          <path d="M76 74 L102 52 L114 78 L108 98" /><path d="M76 84 L106 80 L112 104" />
          <path d="M12 98 l-3 6 M108 98 l3 6" stroke={a} strokeWidth={2.4} />
        </g>
      ) : null;
    case "stormTails":
      return back ? <g {...line} style={glow}><path d="M70 108 C98 108 104 82 92 66" /><path d="M70 112 C104 120 112 96 106 84" strokeWidth={2.2} /><path d="M96 70 l-6 8 h6 l-6 9" stroke={a} strokeWidth={1.6} /></g> : null;
    case "fusionTails":
      return back ? <g {...line} style={glow}><path d="M70 108 C98 108 104 82 92 64" stroke="#ff7a1a" /><path d="M66 112 C92 128 114 104 104 84" stroke="#3b82f6" /><path d="M64 112 C64 140 98 142 110 118" stroke="#a855f7" /></g> : null;
    case "webBlades":
      return back ? null : <g {...line} strokeWidth={2.4} style={glow}><path d="M30 100 l-16 -26" stroke={a} /><path d="M90 100 l16 -26" stroke={a} /><path d="M18 62 L60 90 L102 62 M26 54 L60 82 L94 54" strokeWidth={1} opacity={0.7} /></g>;
    case "hourglass":
      return back ? null : <g style={glow}><path d="M84 76 h16 l-8 14 l8 14 h-16 l8 -14Z" fill={a} stroke={rim} strokeWidth={1.2} /></g>;
    case "voltClaws":
      return back ? null : <g {...line} strokeWidth={2.6} style={glow}><path d="M26 104 l-8 10 M30 108 l-4 12 M34 108 l0 12" stroke={a} /><path d="M94 104 l8 10 M90 108 l4 12 M86 108 l0 12" stroke={a} /><path d="M96 56 l-8 14 h7 l-9 16" stroke="#fef08a" strokeWidth={1.8} /></g>;
    case "tower":
      return back ? null : <g style={glow}><path d="M14 66 h26 v44 q0 12 -13 18 q-13 -6 -13 -18Z" fill={c} stroke={rim} strokeWidth={1.6} /><path d="M27 72 v50 M18 86 h18" stroke={a} strokeWidth={1.6} /></g>;
    case "scales":
      return back ? null : <g {...line} strokeWidth={2} style={glow}><path d="M96 56 v40 M84 64 h24" stroke={a} /><path d="M84 64 l-6 12 h12Z M108 64 l-6 12 h12Z" fill={c} /></g>;
    case "prophecyScroll":
      return back ? null : <g style={glow}><rect x="88" y="64" width="14" height="40" rx="6" fill={a} stroke={rim} strokeWidth={1.2} /><path d="M91 74 h8 M91 82 h8 M91 90 h8" stroke="#3b0764" strokeWidth={1.2} /></g>;
    case "timeRing":
      return <g fill="none" stroke={c} strokeWidth={2.4} style={glow}><ellipse cx="60" cy="92" rx="34" ry="9" />{Array.from({ length: 8 }, (_, i) => <line key={i} x1={60 + Math.cos((i / 8) * 6.283) * 31} y1={92 + Math.sin((i / 8) * 6.283) * 8} x2={60 + Math.cos((i / 8) * 6.283) * 36} y2={92 + Math.sin((i / 8) * 6.283) * 10} stroke={a} />)}</g>;
    case "moonThreads":
      return back ? null : <g style={glow}><path d="M94 40 a14 14 0 1 0 8 22 a11 11 0 1 1 -8 -22Z" fill={a} stroke={rim} strokeWidth={1.2} /><path d="M40 70 q-20 20 -24 50 M46 74 q-12 24 -14 50" {...line} strokeWidth={1.2} opacity={0.8} /></g>;
    case "sealRing":
      return back ? null : <g style={glow}><circle cx="60" cy="86" r="11" fill="none" stroke={a} strokeWidth={2.4} /><path d="M60 78 v16 M52 86 h16" stroke={c} strokeWidth={2} /></g>;
    case "vines":
      return back ? null : <g {...line} strokeWidth={2.4} style={glow}><path d="M34 70 q-10 18 4 30 q12 12 -2 30" stroke="#16a34a" /><path d="M86 66 q10 18 -4 30 q-12 12 2 34" stroke="#16a34a" /><ellipse cx="32" cy="104" rx="6" ry="3" fill={a} stroke="none" /></g>;
    case "emberSpark":
      return back ? null : <g style={glow}><path d="M92 92 c-6 -8 2 -12 0 -22 c8 6 12 16 4 26Z" fill={a} stroke={rim} strokeWidth={1} /><circle cx="104" cy="70" r="2" fill={a} /><circle cx="86" cy="62" r="1.6" fill={a} /></g>;
    case "burrowClaws":
      return back ? null : <g {...line} strokeWidth={3.2} style={glow}><path d="M24 108 l-12 12 M30 112 l-8 16 M36 112 l-2 18" stroke={a} /><path d="M96 108 l12 12 M90 112 l8 16 M84 112 l2 18" stroke={a} /></g>;
    case "shadeBlade":
      return back ? <g style={glow}><path d="M24 40 L96 120" stroke={c} strokeWidth={5} strokeLinecap="round" /><path d="M24 40 L96 120" stroke={a} strokeWidth={1.4} strokeLinecap="round" /></g> : null;
  }
}

function Face({ mood, accent }: { mood: HeroMood; accent: string }) {
  switch (mood) {
    case "determined":
      return <g><path d="M48 40 l9 3 M72 40 l-9 3" stroke={accent} strokeWidth={2.2} strokeLinecap="round" /><path d="M50 45 h6 M64 45 h6" stroke={accent} strokeWidth={2.4} strokeLinecap="round" /><path d="M54 55 h12" stroke="#e5e7eb" strokeWidth={1.6} strokeLinecap="round" /></g>;
    case "hit":
      return <g><path d="M49 41 l7 4 l-7 4 M71 41 l-7 4 l7 4" stroke={accent} strokeWidth={2} fill="none" strokeLinecap="round" /><path d="M52 57 q4 -4 8 -2 q4 2 8 -2" stroke="#fca5a5" strokeWidth={1.6} fill="none" /></g>;
    case "triumphant":
      return <g><path d="M48 46 q4 -6 8 0 M64 46 q4 -6 8 0" stroke={accent} strokeWidth={2.2} fill="none" strokeLinecap="round" /><path d="M52 53 q8 9 16 0" stroke="#fde68a" strokeWidth={2} fill="none" strokeLinecap="round" /></g>;
    default:
      return <g><rect x="49" y="42" width="7" height="4" rx="2" fill={accent} /><rect x="64" y="42" width="7" height="4" rx="2" fill={accent} /><path d="M54 55 h12" stroke="#9ca3af" strokeWidth={1.4} strokeLinecap="round" /></g>;
  }
}

function AuraArt({ id, ident, mood }: { id: string; ident: HeroVisualIdentity; mood: HeroMood }) {
  const boost = mood === "triumphant" ? 1.35 : mood === "hit" ? 0.5 : 1;
  const a = Math.min(1, ident.aura.intensity * 0.42 * boost);
  const { kind } = ident.aura;
  const c = ident.primaryColor;
  return (
    <g>
      <circle cx="60" cy="86" r="62" fill={`url(#${id}-aura)`} opacity={a} />
      {kind === "storm" || kind === "static" ? <path d="M18 40 l10 -14 l-2 12 l12 -10 M92 30 l12 12 l-12 4 l10 12" stroke={ident.accentColor} strokeWidth={1.6} fill="none" opacity={a + 0.2} /> : null}
      {kind === "fusion" ? <g fill="none" strokeWidth={2.4} opacity={a + 0.2}><path d="M16 120 C4 80 20 40 40 28" stroke="#ff7a1a" /><path d="M104 120 C116 80 100 40 80 28" stroke="#3b82f6" /><path d="M30 150 C60 130 90 130 100 150" stroke="#a855f7" /></g> : null}
      {kind === "ember" ? <g fill={ident.accentColor} opacity={a + 0.3}>{[[20, 60], [100, 50], [30, 100], [96, 110], [60, 14]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2 + (i % 2)} />)}</g> : null}
      {kind === "time" ? <circle cx="60" cy="86" r="52" fill="none" stroke={ident.accentColor} strokeWidth={1.2} strokeDasharray="2 6" opacity={a + 0.2} /> : null}
      {kind === "void" || kind === "shade" ? <circle cx="60" cy="86" r="44" fill="none" stroke={c} strokeWidth={2} opacity={a + 0.1} /> : null}
      {kind === "ward" || kind === "law" ? <circle cx="60" cy="86" r="50" fill="none" stroke={ident.accentColor} strokeWidth={1.6} opacity={a + 0.2} /> : null}
      {kind === "venom" ? <g fill="none" stroke={ident.accentColor} strokeWidth={1.2} opacity={a + 0.2}><path d="M14 90 L60 40 L106 90 M26 110 L60 70 L94 110" /></g> : null}
    </g>
  );
}

export default function HeroSilhouette({ heroId, mood = "neutral", view = "full", className, locked = false }: HeroSilhouetteProps) {
  const uid = useId().replace(/:/g, "");
  const ident = getHeroIdentity(heroId);
  if (!ident) return null;
  const { w, s } = BUILD[ident.build];
  const body = locked ? "#14141c" : "#0b0c12";
  const rim = locked ? "#6b7280" : ident.rimColor;
  const viewBox = view === "portrait" ? "28 4 64 76" : "0 0 120 160";

  return (
    <svg
      viewBox={viewBox}
      className={className}
      role="img"
      aria-label={`${ident.displayName} silhouette, ${mood}`}
      data-testid={`hero-silhouette-${ident.id}`}
      data-mood={mood}
      data-attachment={ident.attachment}
      data-headgear={ident.headgear}
      style={mood === "hit" ? { filter: "saturate(1.4) brightness(1.1)" } : undefined}
    >
      <defs>
        <radialGradient id={`${uid}-aura`}>
          <stop offset="0%" stopColor={locked ? "#4b5563" : ident.primaryColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={locked ? "#4b5563" : ident.primaryColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      <AuraArt id={uid} ident={locked ? { ...ident, aura: { ...ident.aura, intensity: 0.4 } } : ident} mood={mood} />

      <g transform={`translate(60 150) scale(${s}) translate(-60 -150)`} style={{ filter: `drop-shadow(0 0 3px ${rim})` }}>
        <Attachment kind={ident.attachment} c={ident.primaryColor} a={ident.accentColor} rim={rim} back />
        <path d={`M${60 - w} 66 Q60 56 ${60 + w} 66 L${60 + w * 0.7} 104 L${60 + w * 0.45} 150 H${60 + 6} V112 H${60 - 6} V150 H${60 - w * 0.45} L${60 - w * 0.7} 104Z`} fill={body} stroke={rim} strokeWidth={1.6} strokeLinejoin="round" />
        <path d={`M${60 - w * 0.55} 74 L60 98 L${60 + w * 0.55} 74`} fill="none" stroke={ident.accentColor} strokeWidth={1.4} opacity={locked ? 0.2 : 0.8} />
        <Headgear kind={ident.headgear} c={locked ? "#1f2937" : ident.primaryColor} rim={rim} />
        <ellipse cx="60" cy="44" rx="15" ry="17" fill={body} stroke={rim} strokeWidth={1.6} />
        {locked ? null : <Face mood={mood} accent={ident.accentColor} />}
        <Attachment kind={ident.attachment} c={ident.primaryColor} a={ident.accentColor} rim={rim} back={false} />
      </g>
    </svg>
  );
}
