import {
  FIGHTER_STATE,
  STATE_TRANSITIONS,
  MOVE_DATA,
  TAIL_MOVE_DATA,
  MOVEMENT_DATA,
  FRAME_CONSTANTS,
  getMovePhase,
  canCancel,
  getTotalFrames,
  MOVE_PHASE,
  type FighterStateType,
  type MovePhaseType,
  type MoveData,
  type TailMoveData,
  type HitboxData,
  type Vector3,
} from './FrameDataEngine';

export interface BufferedInput {
  action: string;
  type: string;
  age: number;
  consumed: boolean;
}

export class InputBuffer {
  size: number;
  buffer: BufferedInput[];

  constructor(size: number = FRAME_CONSTANTS.INPUT_BUFFER_FRAMES) {
    this.size = size;
    this.buffer = [];
  }

  push(input: { action: string; type: string }): void {
    this.buffer.push({
      ...input,
      age: 0,
      consumed: false,
    });
    while (this.buffer.length > this.size * 2) {
      this.buffer.shift();
    }
  }

  has(action: string, maxAge: number = this.size): boolean {
    return this.buffer.some(
      (input) => input.action === action && input.age <= maxAge && !input.consumed
    );
  }

  consume(action: string): boolean {
    const input = this.buffer.find(
      (i) => i.action === action && !i.consumed
    );
    if (input) {
      input.consumed = true;
      return true;
    }
    return false;
  }

  tick(): void {
    for (const input of this.buffer) {
      input.age++;
    }
    this.buffer = this.buffer.filter((i) => i.age <= this.size * 2);
  }

  clear(): void {
    this.buffer = [];
  }
}

export interface BoundingBox3D {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
}

export class Hitbox {
  owner: CharacterController | null;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  width: number;
  height: number;
  depth: number;
  active: boolean;
  damage: number;
  hitstun: number;
  blockstun: number;
  knockback: Vector3;
  hitstop: number;

  constructor(owner: CharacterController | null, data: HitboxData & Partial<{
    damage: number;
    hitstun: number;
    blockstun: number;
    knockback: { x: number; y: number; z?: number };
    hitstopOnHit: number;
    depth: number;
    offsetZ: number;
  }>) {
    this.owner = owner;
    this.offsetX = data.offsetX || 0;
    this.offsetY = data.offsetY || 0;
    this.offsetZ = data.offsetZ || 0;
    this.width = data.width || 60;
    this.height = data.height || 60;
    this.depth = data.depth || data.width || 60;
    this.active = false;
    this.damage = data.damage || 0;
    this.hitstun = data.hitstun || 0;
    this.blockstun = data.blockstun || 0;
    this.knockback = {
      x: data.knockback?.x || 0,
      y: data.knockback?.y || 0,
      z: data.knockback?.z || 0,
    };
    this.hitstop = data.hitstopOnHit || 0;
  }

  getWorldBounds(ownerX: number, ownerY: number, ownerZ: number, ownerWidth: number, facing: number): BoundingBox3D {
    const x = facing > 0
      ? ownerX + ownerWidth + this.offsetX
      : ownerX - this.width - this.offsetX;
    const y = ownerY + this.offsetY;
    const z = ownerZ + this.offsetZ - this.depth / 2;

    return {
      x,
      y,
      z,
      width: this.width,
      height: this.height,
      depth: this.depth,
    };
  }

  static intersects(a: BoundingBox3D, b: BoundingBox3D): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y &&
      a.z < b.z + b.depth &&
      a.z + a.depth > b.z
    );
  }
}

export interface InputState {
  pressed: string[];
  held: Record<string, boolean>;
}

export interface CharacterControllerConfig {
  id?: string;
  isPlayer?: boolean;
  x?: number;
  y?: number;
  z?: number;
  facing?: number;
  width?: number;
  height?: number;
  depth?: number;
  maxHealth?: number;
  onStateChange?: (prev: FighterStateType, next: FighterStateType) => void;
  onHit?: (hitbox: Hitbox, blocked: boolean) => void;
  onDamage?: (damage: number, hitbox: Hitbox, blocked: boolean) => void;
  debug?: boolean;
}

export interface Bounds3D {
  left: number;
  right: number;
  front?: number;
  back?: number;
}

export interface DebugInfo {
  state: FighterStateType;
  stateFrame: number;
  move: string | null;
  moveFrame: number;
  movePhase: MovePhaseType;
  health: number;
  meter: number;
  stunFrames: number;
  invincible: boolean;
  grounded: boolean;
  velocity: { x: string; y: string; z: string };
}

export class CharacterController {
  id: string;
  isPlayer: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  facing: number;
  grounded: boolean;
  width: number;
  height: number;
  depth: number;
  maxHealth: number;
  health: number;
  state: FighterStateType;
  stateFrame: number;
  previousState: FighterStateType | null;
  currentMove: MoveData | null;
  currentMoveId: string | null;
  moveFrame: number;
  movePhase: MovePhaseType;
  hitConnected: boolean;
  stunFrames: number;
  invincibleFrames: number;
  hitbox: Hitbox | null;
  comboCount: number;
  inputBuffer: InputBuffer;
  heldInputs: Record<string, boolean>;
  meter: number;
  maxMeter: number;
  onStateChange: ((prev: FighterStateType, next: FighterStateType) => void) | null;
  onHit: ((hitbox: Hitbox, blocked: boolean) => void) | null;
  onDamage: ((damage: number, hitbox: Hitbox, blocked: boolean) => void) | null;
  debug: boolean;

  constructor(config: CharacterControllerConfig = {}) {
    this.id = config.id || 'fighter';
    this.isPlayer = config.isPlayer || false;
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.z = config.z || 0;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.facing = config.facing || 1;
    this.grounded = true;
    this.width = config.width || 60;
    this.height = config.height || 120;
    this.depth = config.depth || 60;
    this.maxHealth = config.maxHealth || 100;
    this.health = this.maxHealth;
    this.state = FIGHTER_STATE.IDLE;
    this.stateFrame = 0;
    this.previousState = null;
    this.currentMove = null;
    this.currentMoveId = null;
    this.moveFrame = 0;
    this.movePhase = MOVE_PHASE.IDLE;
    this.hitConnected = false;
    this.stunFrames = 0;
    this.invincibleFrames = 0;
    this.hitbox = null;
    this.comboCount = 0;
    this.inputBuffer = new InputBuffer();
    this.heldInputs = {};
    this.meter = 0;
    this.maxMeter = 100;
    this.onStateChange = config.onStateChange || null;
    this.onHit = config.onHit || null;
    this.onDamage = config.onDamage || null;
    this.debug = config.debug || false;
  }

  setState(newState: FighterStateType): boolean {
    const allowed = STATE_TRANSITIONS[this.state]?.[newState];

    if (!allowed && newState !== this.state) {
      if (this.debug) {
        console.log(`[${this.id}] Blocked transition: ${this.state} → ${newState}`);
      }
      return false;
    }

    if (newState !== this.state) {
      this.previousState = this.state;
      this.state = newState;
      this.stateFrame = 0;

      if (this.onStateChange) {
        this.onStateChange(this.previousState, newState);
      }

      if (this.debug) {
        console.log(`[${this.id}] State: ${this.previousState} → ${newState}`);
      }
    }

    return true;
  }

  canAct(): boolean {
    const actableStates: FighterStateType[] = [
      FIGHTER_STATE.IDLE,
      FIGHTER_STATE.WALKING,
      FIGHTER_STATE.RUNNING,
      FIGHTER_STATE.RISING,
      FIGHTER_STATE.FALLING,
    ];
    return actableStates.includes(this.state);
  }

  isCommitted(): boolean {
    const committedStates: FighterStateType[] = [
      FIGHTER_STATE.JUMP_SQUAT,
      FIGHTER_STATE.ATTACKING,
      FIGHTER_STATE.TAIL_ACTION,
      FIGHTER_STATE.DASHING,
      FIGHTER_STATE.HITSTUN,
      FIGHTER_STATE.KNOCKDOWN,
      FIGHTER_STATE.WAKEUP,
    ];
    return committedStates.includes(this.state);
  }

  startMove(moveId: string): boolean {
    const moveData = MOVE_DATA[moveId] || TAIL_MOVE_DATA[moveId];
    if (!moveData) {
      console.warn(`Unknown move: ${moveId}`);
      return false;
    }

    if (!this.canStartMove(moveData)) {
      return false;
    }

    this.currentMoveId = moveId;
    this.currentMove = moveData as MoveData;
    this.moveFrame = 0;
    this.movePhase = MOVE_PHASE.STARTUP;
    this.hitConnected = false;

    if (moveData.hitbox) {
      this.hitbox = new Hitbox(this, {
        ...moveData.hitbox,
        damage: moveData.damage,
        hitstun: moveData.hitstun,
        blockstun: moveData.blockstun,
        knockback: moveData.knockback,
        hitstopOnHit: moveData.hitstopOnHit,
      });
    }

    const isTailMove = moveId in TAIL_MOVE_DATA;
    this.setState(isTailMove ? FIGHTER_STATE.TAIL_ACTION : FIGHTER_STATE.ATTACKING);

    if ('meterCost' in moveData && (moveData as TailMoveData).meterCost) {
      this.meter -= (moveData as TailMoveData).meterCost;
    }

    if (this.debug) {
      console.log(`[${this.id}] Started move: ${moveId} (${moveData.startup}s/${moveData.active}a/${moveData.recovery}r)`);
    }

    return true;
  }

  canStartMove(moveData: MoveData | TailMoveData): boolean {
    if ('airOnly' in moveData && moveData.airOnly && this.grounded) {
      return false;
    }

    if ('groundOnly' in moveData && moveData.groundOnly && !this.grounded) {
      return false;
    }

    if ('meterCost' in moveData && (moveData as TailMoveData).meterCost && this.meter < (moveData as TailMoveData).meterCost) {
      return false;
    }

    if (this.state === FIGHTER_STATE.ATTACKING || this.state === FIGHTER_STATE.TAIL_ACTION) {
      return this.canCancelCurrentMove(moveData);
    }

    return this.canAct();
  }

  canCancelCurrentMove(newMove: MoveData | TailMoveData): boolean {
    if (!this.currentMove) return false;

    if (!canCancel(this.currentMove, this.moveFrame, this.hitConnected)) {
      return false;
    }

    let newMoveId: string | undefined;
    newMoveId = Object.keys(MOVE_DATA).find((k) => MOVE_DATA[k] === newMove) ||
                Object.keys(TAIL_MOVE_DATA).find((k) => TAIL_MOVE_DATA[k] === newMove);

    if (
      !this.currentMove.cancelInto?.includes(newMoveId || '') &&
      !this.currentMove.cancelInto?.includes('special')
    ) {
      return false;
    }

    return true;
  }

  updateMove(): void {
    if (!this.currentMove) return;

    this.moveFrame++;
    const move = this.currentMove;

    this.movePhase = getMovePhase(move, this.moveFrame);

    if (this.hitbox) {
      this.hitbox.active = this.movePhase === MOVE_PHASE.ACTIVE;
    }

    if (move.movementProfile) {
      for (const profile of move.movementProfile) {
        if (this.moveFrame === profile.frame) {
          this.vx = profile.vx * this.facing;
          if (profile.vy !== undefined) {
            this.vy = profile.vy;
          }
          if (profile.vz !== undefined) {
            this.vz = profile.vz;
          }
        }
      }
    }

    if ('invincibleFrames' in move && move.invincibleFrames) {
      const invFrames = (move as unknown as { invincibleFrames: { start: number; end: number } }).invincibleFrames;
      if (this.moveFrame >= invFrames.start && this.moveFrame < invFrames.end) {
        this.invincibleFrames = 1;
      }
    }

    if (this.moveFrame >= getTotalFrames(move)) {
      this.endMove();
    }
  }

  endMove(): void {
    if (this.debug && this.currentMoveId) {
      console.log(`[${this.id}] Ended move: ${this.currentMoveId}`);
    }

    this.currentMove = null;
    this.currentMoveId = null;
    this.moveFrame = 0;
    this.movePhase = MOVE_PHASE.IDLE;
    this.hitbox = null;
    this.hitConnected = false;

    if (this.grounded) {
      this.setState(FIGHTER_STATE.IDLE);
    } else {
      this.setState(FIGHTER_STATE.FALLING);
    }
  }

  receiveHit(hitbox: Hitbox, blocked: boolean = false): void {
    if (this.invincibleFrames > 0) return;

    if (blocked) {
      this.stunFrames = hitbox.blockstun;
      this.vx = hitbox.knockback.x * 0.3 * -this.facing;
      this.vz = hitbox.knockback.z * 0.3 * -this.facing;
      this.setState(FIGHTER_STATE.BLOCK_STUNNED);

      if (this.onDamage) {
        this.onDamage(0, hitbox, true);
      }
    } else {
      this.health -= hitbox.damage;
      this.stunFrames = hitbox.hitstun;
      this.vx = hitbox.knockback.x * (hitbox.owner?.facing || 1);
      this.vy = hitbox.knockback.y;
      this.vz = hitbox.knockback.z * (hitbox.owner?.facing || 1);

      this.currentMove = null;
      this.currentMoveId = null;
      this.hitbox = null;

      if (this.health <= 0) {
        this.setState(FIGHTER_STATE.KNOCKDOWN);
        this.stunFrames = 60;
      } else {
        this.setState(FIGHTER_STATE.HITSTUN);
      }

      this.comboCount = 0;

      if (this.onDamage) {
        this.onDamage(hitbox.damage, hitbox, false);
      }
    }

    if (this.debug) {
      console.log(`[${this.id}] ${blocked ? 'Blocked' : 'Hit'} for ${hitbox.damage} damage, ${this.stunFrames}f stun`);
    }
  }

  confirmHit(blocked: boolean): void {
    this.hitConnected = true;

    if (!blocked) {
      this.comboCount++;
      this.meter = Math.min(this.maxMeter, this.meter + 8);
    } else {
      this.meter = Math.min(this.maxMeter, this.meter + 3);
    }
  }

  processInput(inputState: InputState): void {
    this.heldInputs = { ...inputState.held };

    for (const action of inputState.pressed) {
      this.inputBuffer.push({ action, type: 'press' });
    }

    if (this.stunFrames > 0) return;
    if (this.state === FIGHTER_STATE.KNOCKDOWN) return;
    if (this.state === FIGHTER_STATE.WAKEUP) return;

    if (this.inputBuffer.has('ATTACK_LIGHT')) {
      if (this.tryAttack('light_1')) {
        this.inputBuffer.consume('ATTACK_LIGHT');
        return;
      }
    }

    if (this.inputBuffer.has('ATTACK_HEAVY')) {
      if (this.tryAttack('heavy_1')) {
        this.inputBuffer.consume('ATTACK_HEAVY');
        return;
      }
    }

    if (this.inputBuffer.has('ATTACK_SPECIAL')) {
      if (this.tryTailAbility()) {
        this.inputBuffer.consume('ATTACK_SPECIAL');
        return;
      }
    }

    if (this.heldInputs.BLOCK && this.canAct()) {
      this.setState(FIGHTER_STATE.BLOCKING);
      this.vx *= 0.3;
      this.vz *= 0.3;
      return;
    }

    if (this.state === FIGHTER_STATE.BLOCKING && !this.heldInputs.BLOCK) {
      this.setState(FIGHTER_STATE.IDLE);
    }

    if (this.inputBuffer.has('JUMP') && this.grounded && this.canAct()) {
      this.setState(FIGHTER_STATE.JUMP_SQUAT);
      this.inputBuffer.consume('JUMP');
      return;
    }

    if (this.inputBuffer.has('DASH') && this.canAct()) {
      this.startDash();
      this.inputBuffer.consume('DASH');
      return;
    }

    if (this.canAct() && this.grounded) {
      const moveX = (this.heldInputs.RIGHT ? 1 : 0) - (this.heldInputs.LEFT ? 1 : 0);
      const moveZ = (this.heldInputs.DOWN ? 1 : 0) - (this.heldInputs.UP ? 1 : 0);

      if (moveX !== 0 || moveZ !== 0) {
        if (moveX !== 0) {
          this.facing = moveX;
        }
        const isRunning = !!this.heldInputs.RUN;
        const speed = isRunning ? MOVEMENT_DATA.run_speed : MOVEMENT_DATA.walk_speed;
        this.vx = moveX * speed;
        this.vz = moveZ * speed;
        this.setState(isRunning ? FIGHTER_STATE.RUNNING : FIGHTER_STATE.WALKING);
      } else {
        this.setState(FIGHTER_STATE.IDLE);
      }
    }
  }

  tryAttack(moveId: string): boolean {
    if (this.state === FIGHTER_STATE.ATTACKING && this.currentMove) {
      const chainMove = this.getChainMove(moveId);
      if (chainMove) {
        return this.startMove(chainMove);
      }
    }

    if (this.canAct()) {
      return this.startMove(moveId);
    }

    return false;
  }

  getChainMove(baseMove: string): string {
    if (!this.currentMove) return baseMove;

    const cancelList = this.currentMove.cancelInto || [];

    if (baseMove === 'light_1') {
      if (this.currentMoveId === 'light_1' && cancelList.includes('light_2')) {
        return 'light_2';
      }
      if (this.currentMoveId === 'light_2' && cancelList.includes('light_3')) {
        return 'light_3';
      }
    }

    if (baseMove === 'heavy_1') {
      if (this.currentMoveId === 'heavy_1' && cancelList.includes('heavy_2')) {
        return 'heavy_2';
      }
    }

    return baseMove;
  }

  tryTailAbility(): boolean {
    return false;
  }

  startDash(): void {
    this.setState(FIGHTER_STATE.DASHING);
    this.vx = MOVEMENT_DATA.dash_speed * this.facing;
    this.stateFrame = 0;
    this.invincibleFrames = MOVEMENT_DATA.dash_invincible_end - MOVEMENT_DATA.dash_invincible_start;
  }

  applyPhysics(groundY: number): void {
    if (!this.grounded) {
      this.vy = Math.min(this.vy + MOVEMENT_DATA.gravity, MOVEMENT_DATA.max_fall_speed);
    }

    this.x += this.vx;
    this.y += this.vy;
    this.z += this.vz;

    if (this.y + this.height >= groundY) {
      this.y = groundY - this.height;
      this.vy = 0;

      if (!this.grounded) {
        this.grounded = true;
        this.onLand();
      }
    } else {
      this.grounded = false;
    }

    if (this.grounded && this.state !== FIGHTER_STATE.WALKING && this.state !== FIGHTER_STATE.RUNNING) {
      this.vx *= MOVEMENT_DATA.ground_friction;
      this.vz *= MOVEMENT_DATA.ground_friction;
    }
    if (!this.grounded) {
      this.vx *= MOVEMENT_DATA.air_friction;
      this.vz *= MOVEMENT_DATA.air_friction;
    }
  }

  onLand(): void {
    if (this.state === FIGHTER_STATE.FALLING || this.state === FIGHTER_STATE.RISING) {
      this.setState(FIGHTER_STATE.LANDING);
      this.stateFrame = 0;
    }
  }

  update(groundY: number, bounds?: Bounds3D): void {
    this.inputBuffer.tick();

    if (this.invincibleFrames > 0) {
      this.invincibleFrames--;
    }

    if (this.stunFrames > 0) {
      this.stunFrames--;

      if (this.stunFrames <= 0) {
        if (this.state === FIGHTER_STATE.KNOCKDOWN) {
          this.setState(FIGHTER_STATE.WAKEUP);
          this.invincibleFrames = FRAME_CONSTANTS.WAKEUP_FRAMES;
        } else if (this.state === FIGHTER_STATE.BLOCK_STUNNED) {
          this.setState(FIGHTER_STATE.BLOCKING);
        } else {
          this.setState(FIGHTER_STATE.IDLE);
        }
      }
    }

    switch (this.state) {
      case FIGHTER_STATE.JUMP_SQUAT:
        this.stateFrame++;
        if (this.stateFrame >= MOVEMENT_DATA.jump_squat) {
          this.vy = MOVEMENT_DATA.jump_force;
          this.grounded = false;
          this.setState(FIGHTER_STATE.RISING);
        }
        break;

      case FIGHTER_STATE.RISING:
        if (this.vy >= 0) {
          this.setState(FIGHTER_STATE.FALLING);
        }
        break;

      case FIGHTER_STATE.LANDING:
        this.stateFrame++;
        if (this.stateFrame >= 3) {
          this.setState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.DASHING:
        this.stateFrame++;
        if (this.stateFrame >= MOVEMENT_DATA.dash_frames) {
          this.vx *= 0.5;
          this.vz *= 0.5;
          this.setState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.WAKEUP:
        this.stateFrame++;
        if (this.stateFrame >= FRAME_CONSTANTS.WAKEUP_FRAMES) {
          this.setState(FIGHTER_STATE.IDLE);
        }
        break;

      case FIGHTER_STATE.ATTACKING:
      case FIGHTER_STATE.TAIL_ACTION:
        this.updateMove();
        break;
    }

    this.stateFrame++;

    this.applyPhysics(groundY);

    if (bounds) {
      this.x = Math.max(bounds.left, Math.min(this.x, bounds.right - this.width));
      if (bounds.front !== undefined && bounds.back !== undefined) {
        this.z = Math.max(bounds.front, Math.min(this.z, bounds.back - this.depth));
      }
    }

    this.meter = Math.min(this.maxMeter, this.meter + 0.1);
  }

  getHurtbox(): BoundingBox3D {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      width: this.width,
      height: this.height,
      depth: this.depth,
    };
  }

  getActiveHitbox(): BoundingBox3D | null {
    if (!this.hitbox?.active) return null;
    return this.hitbox.getWorldBounds(this.x, this.y, this.z, this.width, this.facing);
  }

  isInvincible(): boolean {
    return this.invincibleFrames > 0;
  }

  getDebugInfo(): DebugInfo {
    return {
      state: this.state,
      stateFrame: this.stateFrame,
      move: this.currentMoveId,
      moveFrame: this.moveFrame,
      movePhase: this.movePhase,
      health: this.health,
      meter: this.meter,
      stunFrames: this.stunFrames,
      invincible: this.invincibleFrames > 0,
      grounded: this.grounded,
      velocity: { x: this.vx.toFixed(1), y: this.vy.toFixed(1), z: this.vz.toFixed(1) },
    };
  }
}
