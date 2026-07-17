import { useEffect, useRef, useState } from "react";
import { useAdventure } from "../../../lib/stores/useAdventure";
import { useTouchInput } from "../../../lib/stores/useTouchInput";
import { isTouchDevice, hapticFeedback } from "../../../lib/touchUtils";

/**
 * On-screen touch controls for Adventure Mode (Training Arena + Story
 * Missions). This is the ONLY UI that writes into `useTouchInput` -
 * AdventurePlayerController already reads joystickX/Y, isJoystickActive,
 * and consumeAttacks() every frame; this component just drives those
 * existing setters. No new combat mechanics - every action here maps to
 * an input AdventurePlayerController already handles from the keyboard
 * (WASD movement, J attack, K heavy, L skill, Space dodge, Esc pause).
 */

const JOYSTICK_RADIUS = 44;

function releaseAllTouchInput() {
  useTouchInput.getState().releaseJoystick();
  useTouchInput.getState().consumeAttacks();
}

function Joystick() {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const base = baseRef.current;
    if (!base) return;

    const setKnobOffset = (dx: number, dy: number) => {
      const knob = knobRef.current;
      if (knob) knob.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const updateFromTouch = (touch: Touch) => {
      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let dx = touch.clientX - centerX;
      let dy = touch.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > JOYSTICK_RADIUS) {
        dx = (dx / dist) * JOYSTICK_RADIUS;
        dy = (dy / dist) * JOYSTICK_RADIUS;
      }
      setKnobOffset(dx, dy);
      useTouchInput.getState().setJoystick(dx / JOYSTICK_RADIUS, dy / JOYSTICK_RADIUS, true);
    };

    const release = () => {
      touchIdRef.current = null;
      setActive(false);
      setKnobOffset(0, 0);
      useTouchInput.getState().releaseJoystick();
    };

    const onStart = (e: TouchEvent) => {
      if (touchIdRef.current !== null) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      e.preventDefault();
      touchIdRef.current = touch.identifier;
      setActive(true);
      updateFromTouch(touch);
    };

    const onMove = (e: TouchEvent) => {
      if (touchIdRef.current === null) return;
      const touch = Array.from(e.touches).find((t) => t.identifier === touchIdRef.current);
      if (!touch) return;
      e.preventDefault();
      updateFromTouch(touch);
    };

    const onEnd = (e: TouchEvent) => {
      if (touchIdRef.current === null) return;
      const ended = Array.from(e.changedTouches).some((t) => t.identifier === touchIdRef.current);
      if (!ended) return;
      e.preventDefault();
      release();
    };

    base.addEventListener("touchstart", onStart, { passive: false });
    base.addEventListener("touchmove", onMove, { passive: false });
    base.addEventListener("touchend", onEnd, { passive: false });
    base.addEventListener("touchcancel", onEnd, { passive: false });

    return () => {
      base.removeEventListener("touchstart", onStart);
      base.removeEventListener("touchmove", onMove);
      base.removeEventListener("touchend", onEnd);
      base.removeEventListener("touchcancel", onEnd);
      release();
    };
  }, []);

  return (
    <div
      ref={baseRef}
      data-testid="touch-joystick"
      className="pointer-events-auto touch-none select-none rounded-full flex items-center justify-center"
      style={{
        width: 112,
        height: 112,
        background: "rgba(255,255,255,0.08)",
        border: `2px solid rgba(255,255,255,${active ? 0.5 : 0.25})`,
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      <div
        ref={knobRef}
        className="rounded-full"
        style={{
          width: 52,
          height: 52,
          background: `rgba(0,217,255,${active ? 0.55 : 0.35})`,
          border: "2px solid rgba(0,217,255,0.8)",
          transition: active ? "none" : "transform 120ms ease-out",
        }}
      />
    </div>
  );
}

function TouchButton({
  action,
  label,
  size = 64,
  color,
  haptic = "light",
  style,
}: {
  action: "attack" | "heavy" | "skill" | "dodge";
  label: string;
  size?: number;
  color: string;
  haptic?: "light" | "medium" | "heavy";
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const touchIdRef = useRef<number | null>(null);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      if (touchIdRef.current !== null) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      e.preventDefault();
      touchIdRef.current = touch.identifier;
      setPressed(true);
      useTouchInput.getState().queueAttack(action);
      hapticFeedback(haptic);
    };

    const onEnd = (e: TouchEvent) => {
      if (touchIdRef.current === null) return;
      const ended = Array.from(e.changedTouches).some((t) => t.identifier === touchIdRef.current);
      if (!ended) return;
      e.preventDefault();
      touchIdRef.current = null;
      setPressed(false);
    };

    el.addEventListener("touchstart", onStart, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: false });
    el.addEventListener("touchcancel", onEnd, { passive: false });

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
      touchIdRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);

  return (
    <button
      ref={ref}
      type="button"
      data-testid={`touch-${action}`}
      aria-label={label}
      className="pointer-events-auto touch-none select-none rounded-full font-black text-white flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: color,
        opacity: pressed ? 0.75 : 0.92,
        transform: pressed ? "scale(0.93)" : "scale(1)",
        border: "3px solid rgba(255,255,255,0.35)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
        transition: "transform 80ms ease-out, opacity 80ms ease-out",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        ...style,
      }}
    >
      <span style={{ fontSize: size >= 60 ? 13 : 11 }}>{label}</span>
    </button>
  );
}

function PauseButton() {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onStart = (e: TouchEvent) => {
      e.preventDefault();
      useAdventure.getState().togglePause();
      hapticFeedback("light");
    };
    el.addEventListener("touchstart", onStart, { passive: false });
    return () => el.removeEventListener("touchstart", onStart);
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      data-testid="touch-pause"
      aria-label="Pause"
      className="pointer-events-auto touch-none select-none rounded-full flex items-center justify-center"
      style={{
        width: 44,
        height: 44,
        background: "rgba(0,0,0,0.55)",
        border: "2px solid rgba(255,255,255,0.3)",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      <span style={{ fontSize: 16, color: "white" }}>❚❚</span>
    </button>
  );
}

export default function AdventureTouchControls() {
  const isPaused = useAdventure((s) => s.isPaused);
  const [touchCapable] = useState(() => isTouchDevice());

  // Safety net: whenever this whole control set unmounts (leaving
  // Adventure Mode entirely), make sure no touch input is left "stuck" on.
  useEffect(() => {
    return () => releaseAllTouchInput();
  }, []);

  // Safety net: a backgrounded tab may never deliver touchend/touchcancel
  // for an in-progress drag or press.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) releaseAllTouchInput();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (!touchCapable) return null;
  // While paused, unmount the interactive layer entirely so it can't sit
  // under (or leak input past) the pause overlay - each control's own
  // cleanup below releases any touch it was mid-tracking.
  if (isPaused) return null;

  const safeBottom = "calc(1rem + env(safe-area-inset-bottom))";
  const safeLeft = "calc(1rem + env(safe-area-inset-left))";
  const safeRight = "calc(1rem + env(safe-area-inset-right))";
  const safeTop = "calc(4.75rem + env(safe-area-inset-top))";

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <div className="absolute" style={{ left: safeLeft, bottom: safeBottom }}>
        <Joystick />
      </div>

      <div
        className="absolute"
        style={{ right: safeRight, bottom: safeBottom, width: 190, height: 150 }}
      >
        <TouchButton
          action="attack"
          label="ATK"
          size={68}
          color="rgba(220,38,38,0.85)"
          style={{ position: "absolute", right: 0, bottom: 0 }}
        />
        <TouchButton
          action="heavy"
          label="HEAVY"
          size={58}
          color="rgba(234,88,12,0.85)"
          style={{ position: "absolute", right: 78, bottom: 6 }}
        />
        <TouchButton
          action="skill"
          label="SKILL"
          size={54}
          color="rgba(168,85,247,0.85)"
          style={{ position: "absolute", right: 8, bottom: 92 }}
        />
        <TouchButton
          action="dodge"
          label="DODGE"
          size={54}
          haptic="medium"
          color="rgba(34,197,94,0.85)"
          style={{ position: "absolute", right: 100, bottom: 92 }}
        />
      </div>

      <div className="absolute" style={{ right: safeRight, top: safeTop }}>
        <PauseButton />
      </div>
    </div>
  );
}
