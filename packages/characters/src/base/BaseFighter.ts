import { Fighter, FighterState, FighterStats, MoveSet, RigidBody, Vector2D, Hitbox } from '@smash-heroes/shared';
import { StateMachine } from '@smash-heroes/engine';

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
    this.stats = this.getDefaultStats();
    
    // Initialize physics
    this.physics = {
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      mass: this.stats.weight,
      friction: 0.85,
      restitution: 0,
      isGrounded: false,
      isAirborne: false,
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

  takeDamage(damage: number): void {
    this.stats.currentDamage = Math.min(this.stats.currentDamage + damage, this.stats.maxDamage);
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
    this.stats.ultimateMeter = 0;
    this.physics.velocity = { x: 0, y: 0 };
    this.physics.acceleration = { x: 0, y: 0 };
    this.state = FighterState.IDLE;
    this.invincible = false;
    this.intangible = false;
    this.currentFrame = 0;
  }
}
