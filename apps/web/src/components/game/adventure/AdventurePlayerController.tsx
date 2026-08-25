import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAdventure } from "../../../lib/stores/useAdventure";
import { useAudio, isStatueFighter } from "../../../lib/stores/useAudio";
import { useTouchInput } from "../../../lib/stores/useTouchInput";
import { CombatState } from "../../../game/combat/stateEnums";
import { MOVES } from "../../../game/combat/moveData";
import { getMoveFrameTime } from "../../../game/combat/frameTiming";
import { DODGE, STAMINA_CONFIG, COMBO_CONFIG } from "../../../game/tuning/adventureTuning";
import { getAutoTarget } from "../../../game/combat/targeting";
import * as THREE from "three";
import { MOVEMENT_TUNING } from "../../../game/tuning/movementTuning";
import { moveTowards } from "../../../game/movement/movementMath";

const adv = MOVEMENT_TUNING.adventure;
const WALK_SPEED = adv.walkSpeed;
const RUN_SPEED = adv.runSpeed;
const TURN_SPEED = adv.turnSpeed;
const MOVE_ACCEL = adv.moveAccel;
const MOVE_DECEL = adv.moveDecel;
const MISSION_BOUNDARY = 32;
const PLAYER_HIT_RANGE = 4.0;
const GAMEPAD_DEADZONE = 0.18;

const _camDir = new THREE.Vector3();
const _camRight = new THREE.Vector3();
const _moveDir = new THREE.Vector3();
const _worldUp = new THREE.Vector3(0, 1, 0);

function firstConnectedGamepad(): Gamepad | null {
  if (typeof navigator === "undefined" || typeof navigator.getGamepads !== "function") return null;
  const pads = navigator.getGamepads();
  for (const pad of pads) if (pad?.connected) return pad;
  return null;
}

export default function AdventurePlayerController() {
  const keysRef = useRef<Record<string, boolean>>({});
  const prevKeysRef = useRef<Record<string, boolean>>({});
  const prevPadButtonsRef = useRef<boolean[]>([]);
  const attackTimerRef = useRef(0);
  const stoneStepTimer = useRef(0);
  const dodgeDirRef = useRef({ x: 0, z: 0 });
  const attackHitRef = useRef(false);
  const velSmoothRef = useRef({ x: 0, z: 0 });

  useEffect(() => {
    const keys = keysRef.current;
    const handleDown = (e: KeyboardEvent) => { keys[e.code] = true; };
    const handleUp = (e: KeyboardEvent) => { keys[e.code] = false; };
    const clearHeld = () => {
      Object.keys(keys).forEach((key) => { keys[key] = false; });
      prevKeysRef.current = {};
      prevPadButtonsRef.current = [];
      velSmoothRef.current = { x: 0, z: 0 };
      useTouchInput.getState().releaseJoystick();
      useTouchInput.setState({ pendingAttacks: [] });
      const s = useAdventure.getState();
      s.setPlayerVelocity(0, 0);
      s.setPlayerMoving(false, false);
    };
    const onVisibility = () => { if (document.hidden) clearHeld(); };
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    window.addEventListener("blur", clearHeld);
    window.addEventListener("gamepadconnected", clearHeld);
    window.addEventListener("gamepaddisconnected", clearHeld);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
      window.removeEventListener("blur", clearHeld);
      window.removeEventListener("gamepadconnected", clearHeld);
      window.removeEventListener("gamepaddisconnected", clearHeld);
      document.removeEventListener("visibilitychange", onVisibility);
      clearHeld();
    };
  }, []);

  useFrame((state, rawDelta) => {
    const store = useAdventure.getState();
    if (store.isPaused) return;

    const p = store.player;
    const delta = Math.min(rawDelta, 0.05) * p.timeScale;
    const keys = keysRef.current;
    const prev = prevKeysRef.current;
    const justPressed = (code: string) => keys[code] && !prev[code];

    const pad = firstConnectedGamepad();
    const padPressed = (index: number) => !!pad?.buttons[index]?.pressed;
    const padJustPressed = (index: number) => padPressed(index) && !prevPadButtonsRef.current[index];
    const rawPadX = pad?.axes?.[0] ?? 0;
    const rawPadY = pad?.axes?.[1] ?? 0;
    const padX = Math.abs(rawPadX) >= GAMEPAD_DEADZONE ? rawPadX : 0;
    const padY = Math.abs(rawPadY) >= GAMEPAD_DEADZONE ? rawPadY : 0;

    const rememberInputs = () => {
      prevKeysRef.current = { ...keys };
      prevPadButtonsRef.current = pad ? pad.buttons.map((button) => button.pressed) : [];
    };

    if (p.hitStopTimer > 0) {
      store.setHitStopTimer(Math.max(0, p.hitStopTimer - rawDelta));
      rememberInputs();
      return;
    }

    if (p.screenShake > 0) store.triggerScreenShake(Math.max(0, p.screenShake - delta * 8));

    const touch = useTouchInput.getState();
    const touchAttacks = touch.consumeAttacks();

    if (p.staminaRegenDelay > 0) store.setStaminaRegenDelay(Math.max(0, p.staminaRegenDelay - delta));
    if (p.invulnTimer > 0) store.setInvulnTimer(Math.max(0, p.invulnTimer - delta));

    if (p.hitStunTimer > 0) {
      store.setHitStunTimer(Math.max(0, p.hitStunTimer - delta));
      if (p.hitStunTimer - delta <= 0) store.setCombatState(CombatState.FREE);
      rememberInputs();
      return;
    }

    if (p.combatState === CombatState.DODGING) {
      const newDodge = p.dodgeTimer - delta;
      if (newDodge <= 0) {
        store.setDodgeTimer(0);
        store.setCombatState(CombatState.FREE);
      } else {
        store.setDodgeTimer(newDodge);
        const dodgeSpeed = DODGE.distance / DODGE.duration;
        const newX = p.posX + dodgeDirRef.current.x * dodgeSpeed * delta;
        const newZ = p.posZ + dodgeDirRef.current.z * dodgeSpeed * delta;
        store.setPlayerPos(
          THREE.MathUtils.clamp(newX, -MISSION_BOUNDARY, MISSION_BOUNDARY),
          0,
          THREE.MathUtils.clamp(newZ, -MISSION_BOUNDARY, MISSION_BOUNDARY),
        );
      }
      rememberInputs();
      return;
    }

    const enemies = store.enemies;
    const targetId = getAutoTarget(p.posX, p.posZ, p.rotY, enemies);
    store.setAutoTargetId(targetId);

    const isRunning = keys["ShiftLeft"] || keys["ShiftRight"] || padPressed(10);
    const moveSpeed = isRunning ? RUN_SPEED : WALK_SPEED;

    let inputX = 0;
    let inputZ = 0;
    if (keys["KeyW"] || keys["ArrowUp"] || padPressed(12)) inputZ -= 1;
    if (keys["KeyS"] || keys["ArrowDown"] || padPressed(13)) inputZ += 1;
    if (keys["KeyA"] || keys["ArrowLeft"] || padPressed(14)) inputX -= 1;
    if (keys["KeyD"] || keys["ArrowRight"] || padPressed(15)) inputX += 1;
    inputX += padX;
    inputZ += padY;
    if (touch.isJoystickActive) { inputX += touch.joystickX; inputZ += touch.joystickY; }

    const inputLen = Math.sqrt(inputX * inputX + inputZ * inputZ);
    const hasInput = inputLen > 0.01;
    if (hasInput) { inputX /= inputLen; inputZ /= inputLen; }

    let worldX = 0;
    let worldZ = 0;
    if (hasInput) {
      state.camera.getWorldDirection(_camDir);
      _camDir.y = 0;
      _camDir.normalize();
      _camRight.crossVectors(_camDir, _worldUp).normalize();
      _moveDir.set(0, 0, 0);
      _moveDir.addScaledVector(_camRight, inputX);
      _moveDir.addScaledVector(_camDir, -inputZ);
      _moveDir.normalize();
      worldX = _moveDir.x;
      worldZ = _moveDir.z;
    }

    if (p.combatState === CombatState.ATTACKING) {
      attackTimerRef.current = Math.max(0, attackTimerRef.current - delta);
      if (attackTimerRef.current <= 0) {
        store.clearAttack();
        store.setComboTimer(COMBO_CONFIG.resetTime);
        attackHitRef.current = false;
      } else if (!attackHitRef.current) {
        const currentMove = p.attackType ? MOVES[p.attackType] : null;
        if (currentMove) {
          const timing = getMoveFrameTime(currentMove);
          const elapsed = timing.totalTime - attackTimerRef.current;
          if (elapsed >= timing.startupTime && elapsed < timing.startupTime + timing.activeTime) {
            attackHitRef.current = true;
            enemies.forEach((enemy) => {
              if (enemy.isDead) return;
              const dx = p.posX - enemy.posX;
              const dz = p.posZ - enemy.posZ;
              const dist = Math.sqrt(dx * dx + dz * dz);
              if (dist <= PLAYER_HIT_RANGE) {
                store.damageEnemy(enemy.id, currentMove.damage);
                if (isStatueFighter(enemy.fighterId)) useAudio.getState().playStoneHit();
                store.setHitStopTimer(currentMove.hitStopFrames / 60);
                if (currentMove.hitStopFrames >= 6) {
                  store.triggerScreenShake(currentMove.hitStopFrames * 0.12);
                  store.triggerTimeScale(0.3, 0.08);
                  store.triggerImpactFlash("#ffffff");
                }
              }
            });
          }
        }
      }

      const currentMove = p.attackType ? MOVES[p.attackType] : null;
      if (currentMove && currentMove.cancelAt > 0) {
        const timing = getMoveFrameTime(currentMove);
        const elapsed = timing.totalTime - attackTimerRef.current;
        if (elapsed >= timing.cancelTime && (justPressed("KeyJ") || justPressed("KeyX") || padJustPressed(2) || touchAttacks.includes("attack"))) {
          const nextStep = p.comboStep + 1;
          const moveKey = `light${nextStep + 1}`;
          if (nextStep < COMBO_CONFIG.maxChain && MOVES[moveKey] && store.useStamina(MOVES[moveKey].staminaCost)) {
            const move = MOVES[moveKey];
            store.playerAttack(moveKey as any);
            attackTimerRef.current = getMoveFrameTime(move).totalTime;
            attackHitRef.current = false;
            store.setComboStep(nextStep);
            store.setSuperArmor(!!move.superArmor);
            if (targetId) {
              const target = enemies.find((e) => e.id === targetId);
              if (target) store.setPlayerRot(Math.atan2(target.posX - p.posX, target.posZ - p.posZ));
            }
          }
        }
      }
      rememberInputs();
      return;
    }

    const exhausted = p.stamina < STAMINA_CONFIG.exhaustedThreshold;
    const wantDodge = justPressed("Space") || padJustPressed(0) || padJustPressed(5) || touchAttacks.includes("dodge");
    if (wantDodge && !exhausted && store.useStamina(DODGE.staminaCost)) {
      velSmoothRef.current = { x: 0, z: 0 };
      store.setPlayerVelocity(0, 0);
      store.setCombatState(CombatState.DODGING);
      store.setDodgeTimer(DODGE.duration);
      store.setInvulnTimer(DODGE.iFrames / 60);
      dodgeDirRef.current = hasInput ? { x: worldX, z: worldZ } : { x: -Math.sin(p.rotY), z: -Math.cos(p.rotY) };
      rememberInputs();
      return;
    }

    let attackInput: string | null = null;
    if (justPressed("KeyJ") || justPressed("KeyX") || padJustPressed(2) || touchAttacks.includes("attack")) attackInput = "light1";
    else if (justPressed("KeyK") || justPressed("KeyZ") || padJustPressed(3) || touchAttacks.includes("heavy")) attackInput = "heavy";
    else if (justPressed("KeyL") || justPressed("KeyC") || padJustPressed(1) || touchAttacks.includes("skill")) attackInput = "skill";

    if (attackInput && !exhausted) {
      const moveData = MOVES[attackInput];
      if (moveData && store.useStamina(moveData.staminaCost)) {
        store.playerAttack(attackInput as any);
        attackTimerRef.current = getMoveFrameTime(moveData).totalTime;
        attackHitRef.current = false;
        store.setComboStep(0);
        store.setSuperArmor(!!moveData.superArmor);
        if (targetId) {
          const target = enemies.find((e) => e.id === targetId);
          if (target) store.setPlayerRot(Math.atan2(target.posX - p.posX, target.posZ - p.posZ));
        }
        if (isStatueFighter(p.fighterId)) useAudio.getState().playStoneAttack();
        rememberInputs();
        return;
      }
    }

    const targetVx = worldX * moveSpeed;
    const targetVz = worldZ * moveSpeed;
    let svx = moveTowards(velSmoothRef.current.x, targetVx, (hasInput ? MOVE_ACCEL : MOVE_DECEL) * delta);
    let svz = moveTowards(velSmoothRef.current.z, targetVz, (hasInput ? MOVE_ACCEL : MOVE_DECEL) * delta);
    if (!hasInput) {
      if (Math.abs(svx) < 0.05) svx = 0;
      if (Math.abs(svz) < 0.05) svz = 0;
    }
    const cap = moveSpeed + 0.01;
    const vlen = Math.sqrt(svx * svx + svz * svz);
    if (vlen > cap && vlen > 0) { svx = (svx / vlen) * cap; svz = (svz / vlen) * cap; }
    velSmoothRef.current = { x: svx, z: svz };
    store.setPlayerVelocity(svx, svz);
    store.setPlayerMoving(hasInput || vlen > 0.15, (hasInput && isRunning) || (isRunning && vlen > 0.15));

    if (hasInput && isStatueFighter(p.fighterId)) {
      stoneStepTimer.current += delta;
      const stepInterval = isRunning ? 0.3 : 0.5;
      if (stoneStepTimer.current >= stepInterval) { stoneStepTimer.current = 0; useAudio.getState().playStoneMove(); }
    } else stoneStepTimer.current = 0;

    if (isRunning && hasInput) store.useStamina(15 * delta);
    if (p.staminaRegenDelay <= 0 && p.combatState === CombatState.FREE) store.regenStamina(STAMINA_CONFIG.regenRate * delta);

    if (hasInput) {
      const targetRot = Math.atan2(worldX, worldZ);
      let diff = targetRot - p.rotY;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      store.setPlayerRot(p.rotY + diff * Math.min(1, TURN_SPEED * delta));
    }

    const newX = p.posX + svx * delta;
    const newZ = p.posZ + svz * delta;
    store.setPlayerPos(
      THREE.MathUtils.clamp(newX, -MISSION_BOUNDARY, MISSION_BOUNDARY),
      0,
      THREE.MathUtils.clamp(newZ, -MISSION_BOUNDARY, MISSION_BOUNDARY),
    );

    const aliveForCombat = store.enemies.filter((e) => !e.isDead);
    const enemyNearby = aliveForCombat.some((e) => {
      const dx = newX - e.posX;
      const dz = newZ - e.posZ;
      return dx * dx + dz * dz < 12 * 12;
    });
    store.setPlayerCombat(enemyNearby || p.isAttacking || p.hitStunTimer > 0 || p.combatState !== CombatState.FREE);

    if (p.comboTimer > 0) {
      const newTimer = p.comboTimer - delta;
      if (newTimer <= 0) { store.setComboTimer(0); store.setComboStep(0); }
      else store.setComboTimer(newTimer);
    }

    if (justPressed("Escape") || justPressed("KeyP") || padJustPressed(9)) store.togglePause();
    rememberInputs();
  });

  return null;
}
