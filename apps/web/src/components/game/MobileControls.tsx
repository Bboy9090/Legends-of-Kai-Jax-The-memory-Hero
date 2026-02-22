import { useRef, useEffect, useCallback } from "react";
import { useTouchInput } from "../../lib/stores/useTouchInput";

const JOYSTICK_SIZE = 150;
const JOYSTICK_KNOB = 60;
const DEAD_ZONE = 0.12;

export default function MobileControls() {
  const isTouchDevice = useTouchInput((s) => s.isTouchDevice);
  const setJoystick = useTouchInput((s) => s.setJoystick);
  const releaseJoystick = useTouchInput((s) => s.releaseJoystick);
  const queueAttack = useTouchInput((s) => s.queueAttack);
  const setIsTouchDevice = useTouchInput((s) => s.setIsTouchDevice);

  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const originRef = useRef({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const check = () => {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);
    };
    check();
    window.addEventListener("touchstart", () => setIsTouchDevice(true), { once: true });
  }, [setIsTouchDevice]);

  const handleJoystickStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.changedTouches[0];
      if (!touch || !joystickRef.current) return;
      touchIdRef.current = touch.identifier;
      const rect = joystickRef.current.getBoundingClientRect();
      originRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    },
    []
  );

  const handleJoystickMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (touchIdRef.current === null) return;
      const touch = Array.from(e.touches).find(
        (t) => t.identifier === touchIdRef.current
      );
      if (!touch) return;

      const dx = touch.clientX - originRef.current.x;
      const dy = touch.clientY - originRef.current.y;
      const maxR = JOYSTICK_SIZE / 2 - JOYSTICK_KNOB / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clamped = Math.min(dist, maxR);
      const angle = Math.atan2(dy, dx);
      const cx = Math.cos(angle) * clamped;
      const cy = Math.sin(angle) * clamped;

      if (knobRef.current) {
        knobRef.current.style.transform = `translate(${cx}px, ${cy}px)`;
      }

      let nx = cx / maxR;
      let ny = cy / maxR;
      if (Math.abs(nx) < DEAD_ZONE) nx = 0;
      if (Math.abs(ny) < DEAD_ZONE) ny = 0;
      setJoystick(nx, ny, true);
    },
    [setJoystick]
  );

  const handleJoystickEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      touchIdRef.current = null;
      if (knobRef.current) {
        knobRef.current.style.transform = "translate(0px, 0px)";
      }
      releaseJoystick();
    },
    [releaseJoystick]
  );

  const attackBtn = useCallback(
    (type: string) => (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      queueAttack(type);
    },
    [queueAttack]
  );

  if (!isTouchDevice) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999, touchAction: "none" }}
    >
      {/* Virtual Joystick — Left Side */}
      <div
        ref={joystickRef}
        className="pointer-events-auto absolute"
        style={{
          left: 24,
          bottom: 40,
          width: JOYSTICK_SIZE,
          height: JOYSTICK_SIZE,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)",
          border: "2px solid rgba(255,255,255,0.15)",
          touchAction: "none",
        }}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
      >
        <div
          ref={knobRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            marginLeft: -JOYSTICK_KNOB / 2,
            marginTop: -JOYSTICK_KNOB / 2,
            width: JOYSTICK_KNOB,
            height: JOYSTICK_KNOB,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,242,255,0.55) 0%, rgba(0,242,255,0.15) 100%)",
            border: "2px solid rgba(0,242,255,0.4)",
            boxShadow: "0 0 16px rgba(0,242,255,0.25)",
            transition: "transform 0.05s ease-out",
          }}
        />
      </div>

      {/* Action Buttons — Right Side (4-button layout) */}
      <div
        className="pointer-events-auto absolute"
        style={{ right: 20, bottom: 32, touchAction: "none" }}
      >
        {/* Top row: Skill (cooldown) */}
        <div className="flex justify-center mb-3">
          <button
            className="rounded-full flex items-center justify-center select-none active:scale-90 transition-transform border-2 w-16 h-16 border-yellow-400/50"
            style={{
              background: "radial-gradient(circle, rgba(234,179,8,0.35) 0%, rgba(234,179,8,0.1) 100%)",
              boxShadow: "0 0 12px rgba(234,179,8,0.2)",
            }}
            onTouchStart={attackBtn("skill")}
          >
            <span className="text-yellow-300 text-xs font-black tracking-wider">SKILL</span>
          </button>
        </div>

        {/* Middle row: Heavy + Dodge */}
        <div className="flex gap-4 mb-3">
          <button
            className="rounded-full flex items-center justify-center select-none active:scale-90 transition-transform border-2 w-[70px] h-[70px] border-orange-400/50"
            style={{
              background: "radial-gradient(circle, rgba(249,115,22,0.4) 0%, rgba(249,115,22,0.1) 100%)",
              boxShadow: "0 0 14px rgba(249,115,22,0.25)",
            }}
            onTouchStart={attackBtn("heavy")}
          >
            <span className="text-orange-200 text-sm font-black">HEAVY</span>
          </button>
          <button
            className="rounded-full flex items-center justify-center select-none active:scale-90 transition-transform border-2 w-[70px] h-[70px] border-green-400/50"
            style={{
              background: "radial-gradient(circle, rgba(34,197,94,0.35) 0%, rgba(34,197,94,0.1) 100%)",
              boxShadow: "0 0 14px rgba(34,197,94,0.2)",
            }}
            onTouchStart={attackBtn("dodge")}
          >
            <span className="text-green-200 text-sm font-black">DODGE</span>
          </button>
        </div>

        {/* Bottom row: Attack (primary, biggest button) */}
        <div className="flex justify-center">
          <button
            className="rounded-full flex items-center justify-center select-none active:scale-90 transition-transform border-2 w-[88px] h-[88px] border-cyan-400/60"
            style={{
              background: "radial-gradient(circle, rgba(0,242,255,0.4) 0%, rgba(0,242,255,0.1) 100%)",
              boxShadow: "0 0 20px rgba(0,242,255,0.3)",
            }}
            onTouchStart={attackBtn("attack")}
          >
            <span className="text-cyan-100 text-base font-black tracking-wide">ATK</span>
          </button>
        </div>
      </div>
    </div>
  );
}
