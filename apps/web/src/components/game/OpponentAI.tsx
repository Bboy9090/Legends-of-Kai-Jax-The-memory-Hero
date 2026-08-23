import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
import { useDifficulty, type Difficulty } from "../../lib/stores/useDifficulty";
import { useTrainingLab } from "../../lib/stores/useTrainingLab";
import { BEHAVIOR_PROFILES, type AIBehaviorDifficulty } from "../../lib/enemyAIv2";
import { MOVEMENT_TUNING } from "../../game/tuning/movementTuning";
import {
  chooseAttack,
  choosePositionAction,
  createAIRng,
  getFighterAIIdentity,
  shouldPunish,
  type AIAction,
  type AIRandom,
} from "../../game/combat/aiIdentity";

const b = MOVEMENT_TUNING.battle;

function toAIDifficulty(d: Difficulty): AIBehaviorDifficulty {
  return d === "story" ? "easy" : d;
}

export default function OpponentAI() {
  const attackCooldown = useRef(0);
  const decisionTimer = useRef(0);
  const currentAction = useRef<AIAction>("chase");
  const jumpCooldown = useRef(0);
  const punishWindow = useRef(0);
  const rngKeyRef = useRef("");
  const rngRef = useRef<AIRandom>(() => 0.5);
  const difficulty = useDifficulty((s) => s.difficulty);

  useFrame((_, rawDelta) => {
    const state = useBattle.getState();
    if (state.battlePhase !== "fighting") return;
    if (state.hitStop > 0) return;

    const training = useTrainingLab.getState();
    if (training.enabled && training.simulationPaused) return;
    if (state.opponentStaggerTimer > 0 || state.opponentHitStunTimer > 0) return;

    const delta = Math.max(0, rawDelta * state.timeScale);
    const identity = getFighterAIIdentity(state.opponentFighterId, state.opponentPersonality);
    const p = identity.archetype;
    const aiDiff = toAIDifficulty(difficulty);
    const enemyType = p === "stalker" ? "attacker" : p === "titan" ? "tank" : p === "caster" ? "elite" : "grunt";
    const profile = BEHAVIOR_PROFILES[enemyType][aiDiff];
    const decisionInterval = Math.max(0.05, profile.decisionUpdateRate / 1000);

    const rngKey = `${state.opponentFighterId}:${state.totalBattles}:${difficulty}`;
    if (rngKeyRef.current !== rngKey) {
      rngKeyRef.current = rngKey;
      rngRef.current = createAIRng(rngKey);
    }
    const random = rngRef.current;

    attackCooldown.current = Math.max(0, attackCooldown.current - delta);
    jumpCooldown.current = Math.max(0, jumpCooldown.current - delta);
    punishWindow.current = Math.max(0, punishWindow.current - delta);
    decisionTimer.current -= delta;

    const signedDist = state.playerX - state.opponentX;
    const absDist = Math.abs(signedDist);
    const dir = signedDist >= 0 ? 1 : -1;
    const isAtLeftWall = state.opponentX <= b.arenaXMin + b.aiWallMargin;
    const isAtRightWall = state.opponentX >= b.arenaXMax - b.aiWallMargin;

    let velY = state.opponentVelocityY;
    let wantsJump = false;

    const dummyMode = training.enabled ? training.dummyBehavior : "normal";
    if (dummyMode === "idle") {
      velY = Math.max(b.terminalVelocity, velY + b.gravity * delta);
      let newY = state.opponentY + velY * delta;
      let grounded = false;
      if (newY <= b.groundY) { newY = b.groundY; velY = 0; grounded = true; }
      useBattle.setState({
        opponentY: newY,
        opponentVelocityX: 0,
        opponentVelocityY: velY,
        opponentGrounded: grounded,
        opponentFacingRight: state.playerX > state.opponentX,
      });
      return;
    }

    if (dummyMode === "jump") {
      if (state.opponentGrounded && jumpCooldown.current <= 0) {
        velY = b.jumpVelocity;
        jumpCooldown.current = 1.1;
      }
      velY = Math.max(b.terminalVelocity, velY + b.gravity * delta);
      let newY = state.opponentY + velY * delta;
      let grounded = false;
      if (newY <= b.groundY) { newY = b.groundY; velY = 0; grounded = true; }
      useBattle.setState({
        opponentY: newY,
        opponentVelocityX: 0,
        opponentVelocityY: velY,
        opponentGrounded: grounded,
        opponentFacingRight: state.playerX > state.opponentX,
      });
      return;
    }

    if (dummyMode === "attack") {
      useBattle.setState({
        opponentVelocityX: 0,
        opponentFacingRight: state.playerX > state.opponentX,
      });
      if (attackCooldown.current <= 0 && !state.opponentAttacking) {
        state.opponentAttack(chooseAttack(identity, random(), false));
        attackCooldown.current = Math.max(0.35, profile.attackSpacing / 1000);
      }
      return;
    }

    if (decisionTimer.current <= 0) {
      decisionTimer.current = decisionInterval;
      const punish = shouldPunish(identity, random(), state.playerAttacking, state.playerHitStunTimer);
      if (punish && absDist <= identity.punishRange) {
        currentAction.current = "punish";
        punishWindow.current = Math.max(punishWindow.current, 0.32);
      } else {
        currentAction.current = choosePositionAction(identity, {
          distance: absDist,
          opponentHealthRatio: state.opponentHealth / Math.max(1, state.maxHealth),
          playerAttacking: state.playerAttacking,
          playerAttackElapsed: state.playerAttackElapsed,
          playerHitStunTimer: state.playerHitStunTimer,
          opponentGrounded: state.opponentGrounded,
        });
      }

      if (state.opponentGrounded && jumpCooldown.current <= 0 && random() < identity.jumpChance) {
        wantsJump = true;
        jumpCooldown.current = p === "stalker" ? 1.1 : 1.7;
      }
    }

    if (p === "stalker" && !state.opponentGrounded && (isAtLeftWall || isAtRightWall) && jumpCooldown.current <= 0) {
      wantsJump = true;
    }

    let wallKickPush = 0;
    if (wantsJump) {
      if (state.opponentGrounded) {
        velY = b.jumpVelocity * (p === "stalker" ? b.aiStalkerJumpMult : 1);
      } else if (p === "stalker" && (isAtLeftWall || isAtRightWall)) {
        velY = b.jumpVelocity * b.aiStalkerWallKickVerticalMult;
        wallKickPush = isAtLeftWall ? b.aiStalkerWallKickPush : -b.aiStalkerWallKickPush;
        jumpCooldown.current = 1.25;
      }
    }

    velY += b.gravity * delta;
    velY = Math.max(b.terminalVelocity, velY);
    let newY = state.opponentY + velY * delta;
    let grounded = false;
    if (newY <= b.groundY) { newY = b.groundY; velY = 0; grounded = true; }

    const baseMoveSpeed = b.aiBaseMoveSpeed * identity.moveSpeedMult;
    let dx = 0;
    if (currentAction.current === "chase" || currentAction.current === "punish") {
      dx = dir * baseMoveSpeed * (currentAction.current === "punish" ? 1.18 : 1) * delta;
    } else if (currentAction.current === "retreat") {
      dx = -dir * baseMoveSpeed * b.aiRetreatSpeedMult * delta;
    }
    dx += wallKickPush;
    if ((isAtLeftWall && dx < 0) || (isAtRightWall && dx > 0)) dx = 0;

    const newX = Math.max(b.arenaXMin, Math.min(b.arenaXMax, state.opponentX + dx));
    useBattle.setState({
      opponentX: newX,
      opponentY: newY,
      opponentVelocityY: velY,
      opponentGrounded: grounded,
      opponentFacingRight: state.playerX > newX,
    });

    const canAttack = attackCooldown.current <= 0 && !state.opponentAttacking && state.opponentStaggerTimer <= 0 && state.opponentHitStunTimer <= 0;
    if (!canAttack) return;

    const inPunish = currentAction.current === "punish" || punishWindow.current > 0;
    const attackRange = inPunish ? identity.punishRange : identity.attackRange;
    if (absDist > attackRange) return;

    const aggressionGate = inPunish || random() < profile.aggressiveness;
    if (!aggressionGate) {
      attackCooldown.current = Math.max(0.15, (profile.attackSpacing / 1000) * 0.35);
      return;
    }

    state.opponentAttack(chooseAttack(identity, random(), inPunish));
    const baseSpacing = profile.attackSpacing / 1000;
    const identityCadence = p === "stalker" ? 0.82 : p === "titan" ? 1.18 : p === "caster" ? 1.08 : 1;
    const punishCadence = inPunish ? 0.72 : 1;
    attackCooldown.current = Math.max(0.18, baseSpacing * identityCadence * punishCadence + random() * 0.22);
    punishWindow.current = 0;
  });

  return null;
}
