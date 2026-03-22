import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAdventure } from "../../../lib/stores/useAdventure";
import { useAudio, isStatueFighter } from "../../../lib/stores/useAudio";
import { useTouchInput } from "../../../lib/stores/useTouchInput";
import {
  CombatState, MOVES, DODGE, STAMINA_CONFIG, COMBO_CONFIG,
  getAutoTarget, getMoveFrameTime,
} from "../../../lib/combatSystems";
import * as THREE from "three";

const WALK_SPEED = 5;
const RUN_SPEED = 10;
const TURN_SPEED = 8;

const _camDir = new THREE.Vector3();
const _camRight = new THREE.Vector3();
const _moveDir = new THREE.Vector3();

export default function AdventurePlayerController() {
  const keysRef = useRef<Record<string, boolean>>({});
  const prevKeysRef = useRef<Record<string, boolean>>({});
  const attackTimerRef = useRef(0);
  const stoneStepTimer = useRef(0);
  const dodgeDirRef = useRef({ x: 0, z: 0 });
  const attackHitRef = useRef(false);

  useEffect(() => {
    const keys = keysRef.current;
    const handleDown = (e: KeyboardEvent) => { keys[e.code] = true; };
    const handleUp = (e: KeyboardEvent) => { keys[e.code] = false; };
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
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

    if (p.hitStopTimer > 0) {
      store.setHitStopTimer(Math.max(0, p.hitStopTimer - rawDelta));
      prevKeysRef.current = { ...keys };
      return;
    }

    if (p.screenShake > 0) {
      store.triggerScreenShake(Math.max(0, p.screenShake - delta * 8));
    }

    const touch = useTouchInput.getState();
    const touchAttacks = touch.consumeAttacks();

    if (p.staminaRegenDelay > 0) {
      store.setStaminaRegenDelay(Math.max(0, p.staminaRegenDelay - delta));
    }

    if (p.invulnTimer > 0) {
      store.setInvulnTimer(Math.max(0, p.invulnTimer - delta));
    }

    if (p.hitStunTimer > 0) {
      store.setHitStunTimer(Math.max(0, p.hitStunTimer - delta));
      if (p.hitStunTimer - delta <= 0) {
        store.setCombatState(CombatState.FREE);
      }
      prevKeysRef.current = { ...keys };
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
        const boundary = 45;
        store.setPlayerPos(
          THREE.MathUtils.clamp(newX, -boundary, boundary),
          0,
          THREE.MathUtils.clamp(newZ, -boundary, boundary)
        );
      }
      prevKeysRef.current = { ...keys };
      return;
    }

    const enemies = store.enemies;
    const targetId = getAutoTarget(p.posX, p.posZ, p.rotY, enemies);
    store.setAutoTargetId(targetId);

    const isRunning = keys["ShiftLeft"] || keys["ShiftRight"];
    const moveSpeed = isRunning ? RUN_SPEED : WALK_SPEED;

    let inputX = 0;
    let inputZ = 0;
    if (keys["KeyW"] || keys["ArrowUp"]) inputZ -= 1;
    if (keys["KeyS"] || keys["ArrowDown"]) inputZ += 1;
    if (keys["KeyA"] || keys["ArrowLeft"]) inputX -= 1;
    if (keys["KeyD"] || keys["ArrowRight"]) inputX += 1;

    if (touch.isJoystickActive) {
      inputX += touch.joystickX;
      inputZ += touch.joystickY;
    }

    const inputLen = Math.sqrt(inputX * inputX + inputZ * inputZ);
    const hasInput = inputLen > 0.01;
    if (hasInput) { inputX /= inputLen; inputZ /= inputLen; }

    let worldX = 0;
    let worldZ = 0;

    if (hasInput) {
      state.camera.getWorldDirection(_camDir);
      _camDir.y = 0;
      _camDir.normalize();
      _camRight.crossVectors(_camDir, new THREE.Vector3(0, 1, 0)).normalize();
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
          const elapsed = (timing.totalTime - attackTimerRef.current);
          if (elapsed >= timing.startupTime && elapsed < timing.startupTime + timing.activeTime) {
            attackHitRef.current = true;
            enemies.forEach((enemy) => {
              if (enemy.isDead) return;
              const dx = p.posX - enemy.posX;
              const dz = p.posZ - enemy.posZ;
              const dist = Math.sqrt(dx * dx + dz * dz);
              if (dist < 3.5) {
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
        if (elapsed >= timing.cancelTime) {
          let nextAttack: string | null = null;
          if (justPressed("KeyJ") || justPressed("KeyX") || touchAttacks.includes("attack")) {
            const nextStep = p.comboStep + 1;
            if (nextStep < COMBO_CONFIG.maxChain) {
              const moveKey = `light${nextStep + 1}`;
              if (MOVES[moveKey] && store.useStamina(MOVES[moveKey].staminaCost)) {
                nextAttack = moveKey;
                store.setComboStep(nextStep);
              }
            }
          }
          if (nextAttack) {
            const move = MOVES[nextAttack];
            const timing = getMoveFrameTime(move);
            store.playerAttack(nextAttack as any);
            attackTimerRef.current = timing.totalTime;
            attackHitRef.current = false;
            store.setSuperArmor(!!move.superArmor);
            if (targetId) {
              const target = enemies.find((e) => e.id === targetId);
              if (target) {
                const dx = target.posX - p.posX;
                const dz = target.posZ - p.posZ;
                store.setPlayerRot(Math.atan2(dx, dz));
              }
            }
          }
        }
      }

      prevKeysRef.current = { ...keys };
      return;
    }

    const exhausted = p.stamina < STAMINA_CONFIG.exhaustedThreshold;

    const wantDodge = justPressed("Space") || touchAttacks.includes("dodge");
    if (wantDodge && !exhausted && store.useStamina(DODGE.staminaCost)) {
      store.setCombatState(CombatState.DODGING);
      store.setDodgeTimer(DODGE.duration);
      store.setInvulnTimer(DODGE.iFrames / 60);
      dodgeDirRef.current = hasInput
        ? { x: worldX, z: worldZ }
        : { x: -Math.sin(p.rotY), z: -Math.cos(p.rotY) };
      prevKeysRef.current = { ...keys };
      return;
    }

    let attackInput: string | null = null;
    if (justPressed("KeyJ") || justPressed("KeyX") || touchAttacks.includes("attack")) {
      attackInput = "light1";
    } else if (justPressed("KeyK") || justPressed("KeyZ") || touchAttacks.includes("heavy")) {
      attackInput = "heavy";
    } else if (justPressed("KeyL") || justPressed("KeyC") || touchAttacks.includes("skill")) {
      attackInput = "skill";
    }

    if (attackInput && !exhausted) {
      const moveData = MOVES[attackInput];
      if (moveData && store.useStamina(moveData.staminaCost)) {
        const timing = getMoveFrameTime(moveData);
        store.playerAttack(attackInput as any);
        attackTimerRef.current = timing.totalTime;
        attackHitRef.current = false;
        store.setComboStep(attackInput === "light1" ? 0 : 0);
        store.setSuperArmor(!!moveData.superArmor);

        if (targetId) {
          const target = enemies.find((e) => e.id === targetId);
          if (target) {
            const dx = target.posX - p.posX;
            const dz = target.posZ - p.posZ;
            store.setPlayerRot(Math.atan2(dx, dz));
          }
        }
        if (isStatueFighter(p.fighterId)) useAudio.getState().playStoneAttack();
        prevKeysRef.current = { ...keys };
        return;
      }
    }

    const vx = worldX * moveSpeed;
    const vz = worldZ * moveSpeed;
    store.setPlayerVelocity(vx, vz);
    store.setPlayerMoving(hasInput, hasInput && isRunning);

    if (hasInput && isStatueFighter(p.fighterId)) {
      stoneStepTimer.current += delta;
      const stepInterval = isRunning ? 0.3 : 0.5;
      if (stoneStepTimer.current >= stepInterval) {
        stoneStepTimer.current = 0;
        useAudio.getState().playStoneMove();
      }
    } else {
      stoneStepTimer.current = 0;
    }

    if (isRunning && hasInput) {
      store.useStamina(15 * delta);
    }

    if (p.staminaRegenDelay <= 0 && p.combatState === CombatState.FREE) {
      store.regenStamina(STAMINA_CONFIG.regenRate * delta);
    }

    if (hasInput) {
      const targetRot = Math.atan2(worldX, worldZ);
      const currentRot = p.rotY;
      let diff = targetRot - currentRot;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      const newRot = currentRot + diff * Math.min(1, TURN_SPEED * delta);
      store.setPlayerRot(newRot);
    }

    const newX = p.posX + vx * delta;
    const newZ = p.posZ + vz * delta;
    const boundary = 45;
    store.setPlayerPos(
      THREE.MathUtils.clamp(newX, -boundary, boundary),
      0,
      THREE.MathUtils.clamp(newZ, -boundary, boundary)
    );

    if (p.comboTimer > 0) {
      const newTimer = p.comboTimer - delta;
      if (newTimer <= 0) {
        store.setComboTimer(0);
        store.setComboStep(0);
      } else {
        store.setComboTimer(newTimer);
      }
    }

    if (justPressed("Escape") || justPressed("KeyP")) {
      store.togglePause();
    }

    prevKeysRef.current = { ...keys };
  });

  return null;
}
