import { Fighter, FighterState, FighterStats, MoveSet, RigidBody, Vector2D, Hitbox } from '@beast-kin/shared';
import { StateMachine } from '@beast-kin/engine';

export abstract class BaseFighter implements Fighter {
  id: string;
  name: string;
  state: FighterState;
  stats: FighterStats;
  physics: RigidBody;
  position: Vector2D;
  facing: 'left' | 'right';
  moveSet: MoveSet;
  hitboxes: Hitbox[];
  currentFrame: number;
  invincible: boolean;
  intangible: boolean;
  
  protected stateMachine: StateMachine;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.state = FighterState.IDLE;
    this.facing = 'right';
    this.currentFrame = 0;
    this.invincible = false;
    this.intangible = false;
    this.hitboxes = [];
    
    // Initialize stats
    const defaultStats = this.getDefaultStats();
    
    // Initialize physics
    this.physics = {
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      mass: defaultStats.weight,
      friction: 0.85,
      restitution: 0,
      isGrounded: false,
      isAirborne: false,
    };
    
    // Ensure stats includes required properties
    this.stats = {
      ...defaultStats,
      id: id, // Ensure id is set
      damage: defaultStats.currentDamage, // Alias for currentDamage
      hitstun: defaultStats.hitstun ?? 0, // Initialize hitstun if not provided
      velocity: this.physics.velocity, // Reference to physics velocity
    };
    
    this.position = this.physics.position;
    
    // Initialize moveset
    this.moveSet = this.createMoveSet();
    
    // Initialize state machine
    this.stateMachine = new StateMachine(FighterState.IDLE);
    this.setupStateMachine();
  }

  protected abstract getDefaultStats(): FighterStats;
  protected abstract createMoveSet(): MoveSet;
  protected abstract setupStateMachine(): void;

  update(deltaTime: number): void {
    this.currentFrame++;
    this.stateMachine.update(deltaTime);
    this.updateHitboxes();
    
    // Sync stats with physics
    this.stats.velocity = this.physics.velocity;
    this.stats.damage = this.stats.currentDamage;
    
    // Decrement hitstun if in hitstun state
    if (this.state === FighterState.HITSTUN && this.stats.hitstun > 0) {
      this.stats.hitstun = Math.max(0, this.stats.hitstun - 1);
      if (this.stats.hitstun === 0) {
        this.changeState(FighterState.IDLE);
      }
    }
  }

  protected updateHitboxes(): void {
    // Update hitbox positions based on fighter position and facing
    this.hitboxes.forEach((hitbox) => {
      const offset = this.facing === 'left' ? -1 : 1;
      hitbox.bounds.x = this.position.x + (hitbox.bounds.x * offset);
      hitbox.bounds.y = this.position.y + hitbox.bounds.y;
    });
  }

  changeState(newState: FighterState): void {
    this.state = newState;
    this.stateMachine.changeState(newState);
  }

  setPosition(position: Vector2D): void {
    this.position = position;
    this.physics.position = position;
  }

  setFacing(facing: 'left' | 'right'): void {
    this.facing = facing;
  }

  takeDamage(damage: number, hitstunFrames: number = 0): void {
    this.stats.currentDamage = Math.min(this.stats.currentDamage + damage, this.stats.maxDamage);
    this.stats.damage = this.stats.currentDamage;
    
    // Apply hitstun if provided
    if (hitstunFrames > 0) {
      this.stats.hitstun = hitstunFrames;
      this.changeState(FighterState.HITSTUN);
    }
  }

  heal(amount: number): void {
    this.stats.currentDamage = Math.max(0, this.stats.currentDamage - amount);
  }

  gainUltimateMeter(amount: number): void {
    this.stats.ultimateMeter = Math.min(100, this.stats.ultimateMeter + amount);
  }

  canUseUltimate(): boolean {
    return this.stats.ultimateMeter >= this.stats.ultimateCost;
  }

  useUltimate(): boolean {
    if (!this.canUseUltimate()) return false;
    
    this.stats.ultimateMeter -= this.stats.ultimateCost;
    return true;
  }

  reset(): void {
    this.stats.currentDamage = 0;
    this.stats.damage = 0;
    this.stats.hitstun = 0;
    this.stats.ultimateMeter = 0;
    this.physics.velocity = { x: 0, y: 0 };
    this.physics.acceleration = { x: 0, y: 0 };
    this.stats.velocity = this.physics.velocity;
    this.state = FighterState.IDLE;
    this.invincible = false;
    this.intangible = false;
    this.currentFrame = 0;
  }
}
