import React, { useRef, useCallback, useEffect } from 'react';
import { useTouchControls } from '../../lib/stores/useTouchControls';

const JOYSTICK_SIZE = 120;
const JOYSTICK_KNOB = 48;
const BUTTON_SIZE = 56;

function VirtualJoystick() {
  const containerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activeTouch = useRef<number | null>(null);

  const updateMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !knobRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    let dx = clientX - cx;
    let dy = clientY - cy;
    const maxR = JOYSTICK_SIZE / 2 - JOYSTICK_KNOB / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }

    knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    useTouchControls.getState().setMove(dx / maxR, dy / maxR);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeTouch.current !== null) return;
    const touch = e.changedTouches[0];
    activeTouch.current = touch.identifier;
    updateMove(touch.clientX, touch.clientY);
  }, [updateMove]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouch.current) {
        updateMove(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
        break;
      }
    }
  }, [updateMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouch.current) {
        activeTouch.current = null;
        if (knobRef.current) knobRef.current.style.transform = 'translate(0px, 0px)';
        useTouchControls.getState().setMove(0, 0);
        break;
      }
    }
  }, []);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        width: JOYSTICK_SIZE,
        height: JOYSTICK_SIZE,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        border: '2px solid rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <div
        ref={knobRef}
        style={{
          width: JOYSTICK_KNOB,
          height: JOYSTICK_KNOB,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(78,205,196,0.7) 0%, rgba(78,205,196,0.3) 100%)',
          border: '2px solid rgba(78,205,196,0.6)',
          boxShadow: '0 0 12px rgba(78,205,196,0.3)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

interface ActionButtonProps {
  label: string;
  color: string;
  actionName: string;
  size?: number;
}

function ActionButton({ label, color, actionName, size = BUTTON_SIZE }: ActionButtonProps) {
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    useTouchControls.getState().setButton(actionName, true);
  }, [actionName]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    useTouchControls.getState().setButton(actionName, false);
  }, [actionName]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}88 0%, ${color}33 100%)`,
        border: `2px solid ${color}aa`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        userSelect: 'none',
        boxShadow: `0 0 8px ${color}44`,
      }}
    >
      <span style={{
        color: '#fff',
        fontSize: size < 50 ? '9px' : '11px',
        fontWeight: 'bold',
        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
        pointerEvents: 'none',
        textAlign: 'center',
        lineHeight: '1.1',
      }}>
        {label}
      </span>
    </div>
  );
}

export default function TouchControls() {
  const showControls = useTouchControls(s => s.showControls);

  useEffect(() => {
    useTouchControls.getState().detectTouch();
  }, []);

  if (!showControls) return null;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 40,
      touchAction: 'none',
    }}>
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 16,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          <ActionButton label="JUMP" color="#44aaff" actionName="jump" size={46} />
          <ActionButton label="DASH" color="#ffaa44" actionName="dodge" size={46} />
          <ActionButton label="RUN" color="#44ff88" actionName="run" size={46} />
        </div>
        <VirtualJoystick />
      </div>

      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 16,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 2 }}>
          <ActionButton label="SPE" color="#00ccff" actionName="special" size={44} />
          <ActionButton label="ULT" color="#cc44ff" actionName="ultimate" size={44} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ActionButton label="LIGHT" color="#ff4444" actionName="lightAttack" />
          <ActionButton label="HEAVY" color="#ff8844" actionName="heavyAttack" />
          <ActionButton label="LAUNCH" color="#aa44ff" actionName="launcher" />
        </div>
      </div>
    </div>
  );
}
