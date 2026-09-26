import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { combatActionBuffer, type BufferedCombatAction } from '../../lib/input/CombatActionBuffer';
import { gameplayInputManager } from '../../lib/input/GameplayInputState';
import { hapticFeedback, isTouchDevice } from '../../lib/touchUtils';

type TouchLevelAction =
  | 'jump'
  | 'dodge'
  | 'traversal'
  | 'traversalModifier'
  | 'interact'
  | 'attackLight'
  | 'attackHeavy'
  | 'attackSpecial'
  | 'attackUltimate';

const COMBAT_ACTIONS: Partial<Record<TouchLevelAction, BufferedCombatAction>> = {
  attackLight: 'attackLight',
  attackHeavy: 'attackHeavy',
  attackSpecial: 'attackSpecial',
  attackUltimate: 'attackUltimate',
  dodge: 'dodge',
};

const ALL_TOUCH_ACTIONS: TouchLevelAction[] = [
  'jump',
  'dodge',
  'traversal',
  'traversalModifier',
  'interact',
  'attackLight',
  'attackHeavy',
  'attackSpecial',
  'attackUltimate',
];

const JOYSTICK_RADIUS = 44;

function clearVerticalSliceTouchState() {
  gameplayInputManager.setTouchJoystick(0, 0, false);
  for (const action of ALL_TOUCH_ACTIONS) {
    gameplayInputManager.setTouchAction(action, false);
  }
  combatActionBuffer.clear();
}

function TouchButton({
  action,
  label,
  testId,
  size = 56,
  style,
  haptic = 'light',
}: {
  action: TouchLevelAction;
  label: string;
  testId: string;
  size?: number;
  style?: CSSProperties;
  haptic?: 'light' | 'medium' | 'heavy';
}) {
  const activePointerRef = useRef<number | null>(null);
  const [pressed, setPressed] = useState(false);

  const release = (event?: ReactPointerEvent<HTMLButtonElement>) => {
    if (event && activePointerRef.current !== event.pointerId) return;
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    activePointerRef.current = null;
    setPressed(false);
    gameplayInputManager.setTouchAction(action, false);
  };

  const press = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (activePointerRef.current !== null) return;
    event.preventDefault();
    activePointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    setPressed(true);
    gameplayInputManager.setTouchAction(action, true);

    const bufferedAction = COMBAT_ACTIONS[action];
    if (bufferedAction) combatActionBuffer.enqueue(bufferedAction);
    hapticFeedback(haptic);
  };

  useEffect(() => () => {
    gameplayInputManager.setTouchAction(action, false);
  }, [action]);

  return (
    <button
      type="button"
      data-testid={testId}
      aria-label={label}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      style={{
        width: size,
        height: size,
        borderRadius: '9999px',
        border: pressed ? '2px solid rgba(255,255,255,0.95)' : '1px solid rgba(255,255,255,0.4)',
        background: pressed ? 'rgba(126,34,206,0.92)' : 'rgba(15,23,42,0.78)',
        color: '#fff',
        fontSize: size <= 48 ? 9 : 10,
        fontWeight: 900,
        letterSpacing: '0.08em',
        boxShadow: pressed ? '0 0 18px rgba(168,85,247,0.6)' : '0 6px 18px rgba(0,0,0,0.35)',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        ...style,
      }}
    >
      {label}
    </button>
  );
}

function MovementJoystick() {
  const baseRef = useRef<HTMLDivElement>(null);
  const activePointerRef = useRef<number | null>(null);
  const [offset, setOffset] = useState<[number, number]>([0, 0]);

  const update = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);
    if (distance > JOYSTICK_RADIUS) {
      dx = (dx / distance) * JOYSTICK_RADIUS;
      dy = (dy / distance) * JOYSTICK_RADIUS;
    }

    setOffset([dx, dy]);
    // Up on the screen is negative Y, matching GameplayInputState's W/forward convention.
    gameplayInputManager.setTouchJoystick(
      dx / JOYSTICK_RADIUS,
      dy / JOYSTICK_RADIUS,
      true
    );
  };

  const release = (event?: ReactPointerEvent<HTMLDivElement>) => {
    if (event && activePointerRef.current !== event.pointerId) return;
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    activePointerRef.current = null;
    setOffset([0, 0]);
    gameplayInputManager.setTouchJoystick(0, 0, false);
  };

  return (
    <div
      ref={baseRef}
      data-testid="slice-touch-joystick"
      onPointerDown={(event) => {
        if (activePointerRef.current !== null) return;
        event.preventDefault();
        activePointerRef.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        update(event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        if (activePointerRef.current !== event.pointerId) return;
        event.preventDefault();
        update(event.clientX, event.clientY);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      style={{
        width: 112,
        height: 112,
        borderRadius: '9999px',
        border: '2px solid rgba(148,163,184,0.35)',
        background: 'rgba(15,23,42,0.58)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: '9999px',
          background: 'rgba(34,211,238,0.62)',
          border: '2px solid rgba(165,243,252,0.9)',
          transform: `translate(${offset[0]}px, ${offset[1]}px)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

export default function VerticalSliceTouchControls() {
  const [touchCapable] = useState(() =>
    typeof window !== 'undefined' && isTouchDevice()
  );

  useEffect(() => {
    if (!touchCapable) return;
    return () => clearVerticalSliceTouchState();
  }, [touchCapable]);

  if (!touchCapable) return null;

  const safeBottom = 'max(18px, env(safe-area-inset-bottom))';
  const safeLeft = 'max(18px, env(safe-area-inset-left))';
  const safeRight = 'max(18px, env(safe-area-inset-right))';

  return (
    <div
      data-testid="vertical-slice-touch-controls"
      className="absolute inset-0 z-50 pointer-events-none"
      aria-label="Vertical slice touch controls"
    >
      <div
        className="absolute pointer-events-auto"
        style={{ left: safeLeft, bottom: safeBottom }}
      >
        <MovementJoystick />
      </div>

      <div
        className="absolute pointer-events-auto"
        style={{ right: safeRight, bottom: safeBottom, width: 206, height: 178 }}
      >
        <TouchButton action="attackLight" label="LIGHT" testId="slice-touch-light" size={64} style={{ position: 'absolute', right: 0, bottom: 0 }} />
        <TouchButton action="attackHeavy" label="HEAVY" testId="slice-touch-heavy" size={58} style={{ position: 'absolute', right: 72, bottom: 4 }} />
        <TouchButton action="attackSpecial" label="SPECIAL" testId="slice-touch-special" size={54} style={{ position: 'absolute', right: 2, bottom: 72 }} />
        <TouchButton action="attackUltimate" label="ULT" testId="slice-touch-ultimate" size={52} haptic="heavy" style={{ position: 'absolute', right: 66, bottom: 82 }} />
        <TouchButton action="dodge" label="DODGE" testId="slice-touch-dodge" size={54} haptic="medium" style={{ position: 'absolute', right: 138, bottom: 12 }} />
      </div>

      <div
        className="absolute pointer-events-auto flex gap-2"
        style={{ right: safeRight, top: 'max(72px, env(safe-area-inset-top))' }}
      >
        <TouchButton action="jump" label="JUMP" testId="slice-touch-jump" size={46} />
        <TouchButton action="traversalModifier" label="RUN" testId="slice-touch-run" size={46} />
        <TouchButton action="traversal" label="TRV" testId="slice-touch-traversal" size={46} />
        <TouchButton action="interact" label="USE" testId="slice-touch-interact" size={46} />
      </div>
    </div>
  );
}
