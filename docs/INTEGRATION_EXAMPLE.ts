/**
 * Complete Integration Example
 * Demonstrates how to use all legendary-tier systems together
 */

import {
  MomentumPhysics,
  PoiseSystem,
  FrameCancelSystem,
  VisualJuiceSystem,
  DynamicCamera,
  TacticalAI,
  AIDifficulty,
  AIPersonality,
  CancelType,
  ReactionType,
  ActionType,
} from '@smash-heroes/engine';

import {
  CharacterArchetype,
  LifePath,
  ZodiacSign,
  BaseFighter,
} from '@smash-heroes/characters';

import { ParticleSystem } from '@smash-heroes/engine';

/**
 * Example: Create a Life Path 9 / Virgo character
 * "Disciplined, analytical, and devastatingly efficient"
 */
export class ExampleLegendaryFighter extends BaseFighter {
  private archetype: CharacterArchetype;
  private poiseSystem: PoiseSystem;
  private cancelSystem: FrameCancelSystem;
  private visualJuice: VisualJuiceSystem;

  constructor(
    id: string,
    particleSystem: ParticleSystem
  ) {
    super(id);

    // Create character archetype
    this.archetype = new CharacterArchetype(
      LifePath.NINE_HUMANITARIAN,
      ZodiacSign.VIRGO
    );

    // Apply archetype modifiers to stats
    this.applyArchetypeModifiers();

    // Initialize poise system
    this.poiseSystem = new PoiseSystem();
    this.poiseSystem.initializePoise(
      this.id,
      100 * this.archetype.combatModifiers.defense,
      1.0
    );

    // Initialize frame canceling
    this.cancelSystem = new FrameCancelSystem();
    this.setupCancelWindows();

    // Initialize visual effects
    this.visualJuice = new VisualJuiceSystem(particleSystem);
  }

  /**
   * Apply archetype modifiers to fighter stats
   */
  private applyArchetypeModifiers(): void {
    const mods = this.archetype.combatModifiers;

    // Apply multipliers
    this.stats.attackSpeed = mods.attackSpeed;
    this.stats.walkSpeed *= mods.movementSpeed;
    this.stats.airSpeed *= mods.movementSpeed;
    this.stats.weight = this.stats.weight * mods.defense;

    // Log for debugging
    console.log(`${this.id} archetype: ${this.archetype.personalityTraits.fightingStyle}`);
    console.log(`Special Mechanic: ${this.archetype.personalityTraits.specialMechanic}`);
    console.log(`Strengths: ${this.archetype.personalityTraits.strengths.join(', ')}`);
  }

  /**
   * Setup frame cancel windows for all attacks
   */
  private setupCancelWindows(): void {
    const mods = this.archetype.combatModifiers;

    // Get all attacks from moveset
    const attacks = this.getMoveSet().getAllMoves();

    for (const attack of attacks) {
      // Register with combo extension from archetype
      this.cancelSystem.registerAttackCancelWindows(attack, {
        canHitCancel: true,
        hitCancelAdvantage: Math.floor(mods.comboExtension),
        canWhiffCancel: mods.precision > 1.0, // Precise fighters can cancel whiffs
      });
    }
  }

  /**
   * Override update to include all legendary systems
   */
  override update(deltaTime: number, inputs: any, platforms: any[]): void {
    // Update base fighter
    super.update(deltaTime, inputs, platforms);

    // Update poise regeneration
    this.poiseSystem.update(deltaTime);

    // Handle movement visual effects
    this.handleMovementEffects();

    // Handle attack canceling
    this.handleFrameCanceling(inputs);
  }

  /**
   * Handle movement-based visual effects
   */
  private handleMovementEffects(): void {
    const speed = Math.abs(this.body.velocity.x);

    // Emit dash dust when dashing
    if (this.isDashing) {
      this.visualJuice.emitDashDust(
        this.position,
        this.body.velocity.x > 0 ? 0 : Math.PI
      );
    }

    // Emit jump dust when jumping
    if (this.hasJustJumped) {
      this.visualJuice.emitJumpDust(this.position);
    }

    // Emit landing dust when landing
    if (this.hasJustLanded) {
      const impactSpeed = Math.abs(this.previousVelocity.y);
      this.visualJuice.emitLandingDust(this.position, impactSpeed);
    }

    // Update movement trail
    this.visualJuice.updateTrail(this.id, this.position, speed);
  }

  /**
   * Handle frame canceling during attacks
   */
  private handleFrameCanceling(inputs: any): void {
    if (!this.isAttacking) return;

    const currentAttack = this.currentMove;
    if (!currentAttack) return;

    const attackFrame = this.currentFrame;

    // Check for special cancel
    if (inputs.special) {
      if (this.cancelSystem.canCancel(currentAttack.name, attackFrame, CancelType.SPECIAL)) {
        this.performSpecialCancel();
      }
    }

    // Check for jump cancel
    if (inputs.jump) {
      if (this.cancelSystem.canCancel(currentAttack.name, attackFrame, CancelType.JUMP)) {
        this.performJumpCancel();
      }
    }

    // Check for dash cancel
    if (inputs.dash) {
      if (this.cancelSystem.canCancel(currentAttack.name, attackFrame, CancelType.DASH)) {
        this.performDashCancel();
      }
    }
  }

  /**
   * Handle taking a hit with poise system
   */
  override onHit(hitbox: any, attacker: any): void {
    // Calculate reaction using poise
    const reaction = this.poiseSystem.calculateReaction(
      this.id,
      hitbox,
      attacker.stats.weight
    );

    // Visual effects
    this.visualJuice.emitImpactEffect(
      this.position,
      hitbox.damage,
      hitbox.knockbackAngle
    );

    // Handle reaction
    switch (reaction.type) {
      case ReactionType.SUPER_ARMOR:
        // Tanked it! Play special effect
        this.playTankEffect();
        break;

      case ReactionType.FLINCH:
        // Brief stun
        this.enterFlinchState(reaction.frames);
        break;

      case ReactionType.STAGGER:
        // Medium stun
        this.enterStaggerState(reaction.frames);
        break;

      case ReactionType.LAUNCH:
        // Heavy launch
        this.enterLaunchState(reaction.frames);
        break;
    }

    // Call base implementation for knockback/damage
    super.onHit(hitbox, attacker);
  }

  /**
   * Handle successful parry
   */
  override onParry(): void {
    // Emit parry sparks
    this.visualJuice.emitParrySparks(this.position);

    // Life Path 9 / Virgo gets bonus on perfect timing
    const perfectCounterBonus = this.archetype.combatModifiers.precision;
    this.nextAttackDamageMultiplier = perfectCounterBonus;

    // Call base implementation
    super.onParry();
  }

  /**
   * Get character lore for environmental storytelling
   */
  getBackstory(): string {
    return this.archetype.getBackstoryHook();
  }

  /**
   * Get visual trail for rendering
   */
  getTrail() {
    return this.visualJuice.getTrail(this.id);
  }

  // Placeholder methods (would be implemented in full fighter class)
  private performSpecialCancel() { /* Implementation */ }
  private performJumpCancel() { /* Implementation */ }
  private performDashCancel() { /* Implementation */}
  private playTankEffect() { /* Implementation */ }
  private enterFlinchState(frames: number) { /* Implementation */ }
  private enterStaggerState(frames: number) { /* Implementation */ }
  private enterLaunchState(frames: number) { /* Implementation */ }
}

/**
 * Example: Set up a complete game scene with all systems
 */
export class LegendaryGameScene {
  private physics: MomentumPhysics;
  private camera: DynamicCamera;
  private ai: TacticalAI;
  private fighters: ExampleLegendaryFighter[] = [];

  constructor() {
    // Initialize physics (Variable Gravity already integrated)
    this.physics = new MomentumPhysics();

    // Initialize dynamic camera
    this.camera = new DynamicCamera({
      minZoom: 0.5,
      maxZoom: 2.0,
      baseZoom: 1.0,
    });

    // Initialize AI system
    this.ai = new TacticalAI();
  }

  /**
   * Add a fighter to the scene
   */
  addFighter(fighter: ExampleLegendaryFighter, isAI: boolean = false) {
    this.fighters.push(fighter);

    if (isAI) {
      // Initialize AI with legendary difficulty
      this.ai.initializeAI(
        fighter.id,
        AIDifficulty.LEGENDARY,
        AIPersonality.TACTICAL
      );
    }
  }

  /**
   * Update game loop
   */
  update(deltaTime: number) {
    // Update all fighters
    for (const fighter of this.fighters) {
      // Get inputs (from player or AI)
      const inputs = this.getInputs(fighter);

      // Update fighter (includes all legendary systems)
      fighter.update(deltaTime, inputs, this.platforms);
    }

    // Update dynamic camera
    const cameraFighters = this.fighters.map(f => ({
      id: f.id,
      position: f.position,
      isActive: f.isAlive,
    }));
    this.camera.update(cameraFighters);

    // Apply camera transform to renderer
    const transform = this.camera.getTransform();
    this.applyCamera(transform);
  }

  /**
   * Get inputs for fighter (player or AI)
   */
  private getInputs(fighter: ExampleLegendaryFighter): any {
    // Check if AI-controlled using public method
    if (this.ai.isAIControlled(fighter.id)) {
      // Get opponents
      const opponents = this.fighters.filter(f => f.id !== fighter.id);

      // Get AI action
      const action = this.ai.update(0, fighter as any, opponents as any, []);

      // Convert AI action to inputs
      return this.convertAIActionToInputs(action);
    }

    // Otherwise, get player inputs
    return this.getPlayerInputs();
  }

  /**
   * Convert AI action to input format
   */
  private convertAIActionToInputs(action: any): any {
    const inputs: any = {
      moveX: action.direction.x,
      moveY: action.direction.y,
      jump: false,
      attack: false,
      special: false,
      defend: false,
      dash: false,
    };

    switch (action.type) {
      case ActionType.MOVE:
        inputs.dash = action.modifiers?.includes('dash');
        break;
      case ActionType.ATTACK:
        inputs.attack = true;
        break;
      case ActionType.DEFEND:
        inputs.defend = true;
        break;
      case ActionType.SPECIAL:
        inputs.special = true;
        break;
    }

    return inputs;
  }

  // Placeholder methods
  private platforms: any[] = [];
  private getPlayerInputs(): any { return {}; }
  private applyCamera(transform: any) { /* Implementation */ }
}

/**
 * Example usage
 */
export function initializeLegendaryGame() {
  const particleSystem = new ParticleSystem();
  const scene = new LegendaryGameScene();

  // Create player (Life Path 9 / Virgo - disciplined and efficient)
  const player = new ExampleLegendaryFighter('player', particleSystem);
  scene.addFighter(player, false);

  // Create AI opponent (Life Path 5 / Sagittarius - adventurous and fast)
  const enemy = new ExampleLegendaryFighter('enemy', particleSystem);
  scene.addFighter(enemy, true);

  console.log('Legendary game initialized!');
  console.log(`Player: ${player.getBackstory()}`);
  console.log(`Enemy: ${enemy.getBackstory()}`);

  return scene;
}
