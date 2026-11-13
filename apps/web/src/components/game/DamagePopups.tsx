import { Html } from "@react-three/drei";
import { damageNumberStyle } from "../../lib/combatFeedback";
import { useDamagePopups } from "../../lib/stores/useDamagePopups";

const KEYFRAMES = `
@keyframes kj-damage-rise {
  0% { transform: translateY(0) scale(0.6); opacity: 0; }
  12% { transform: translateY(-10px) scale(1.15); opacity: 1; }
  100% { transform: translateY(-64px) scale(1); opacity: 0; }
}`;

export default function DamagePopups() {
  const popups = useDamagePopups((s) => s.popups);
  if (popups.length === 0) return null;

  return (
    <>
      {popups.map((popup) => {
        const style = damageNumberStyle(popup.kind, popup.amount);
        return (
          <Html key={popup.id} position={[popup.x, popup.y, popup.z]} center zIndexRange={[40, 0]} style={{ pointerEvents: "none" }}>
            <style>{KEYFRAMES}</style>
            <div
              data-testid="damage-popup"
              data-kind={popup.kind}
              style={{
                animation: "kj-damage-rise 1.05s ease-out forwards",
                color: style.color,
                fontFamily: "Bebas Neue, Impact, sans-serif",
                fontWeight: 900,
                fontSize: `${Math.round(26 * style.scale)}px`,
                letterSpacing: "0.04em",
                textAlign: "center",
                textShadow: `0 0 8px ${style.glow}, 0 2px 0 rgba(0,0,0,0.85)`,
                whiteSpace: "nowrap",
                userSelect: "none",
              }}
            >
              {style.label && !popup.text ? <div style={{ fontSize: "0.55em", lineHeight: 1 }}>{style.label}</div> : null}
              {popup.text ?? Math.round(popup.amount)}
            </div>
          </Html>
        );
      })}
    </>
  );
}
