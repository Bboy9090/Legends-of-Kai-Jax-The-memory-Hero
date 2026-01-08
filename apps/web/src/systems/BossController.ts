/**
 * THE AETERNA COVENANT - BOSS CONTROLLER
 * 
 * Rift-Beast AI. Malakor the Silencer with 3-phase rage logic.
 * Telegraph windows for all attacks. The void approaches.
 */

import { bus } from '../core/EventBus';
import { Events } from '../core/EventBus';

export enum BossPhase {
  PHASE_1 = 1,  // 500-350 HP: Standard attacks
  PHASE_2 = 2,  // 350-150 HP: Rage mode, faster attacks
  PHASE_3 = 3   // 150-0 HP: Desperation, erasure attacks
}

export interface BossAttack {
  name: string;
  damage: number;
  telegraphFrames: number;
  activeFrames: number;
  cooldown: number;
  range: number;
  hitbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class BossController {
  public phase: BossPhase = BossPhase.PHASE_1;
  public hp: number = 500;
  public maxHp: number = 500;
  public position: { x: number; y: number } = { x: 0, y: 0 };
  public velocity: { x: number; y: number } = { x: 0, y: 0 };
  
  private attackCooldown: number = 0;
  private currentAttack: BossAttack | null = null;
  private attackTimer: number = 0;
  private rageLevel: number = 0; // 0-100, increases in phase 2-3

  // Attack patterns
  private attacks: { [key in BossPhase]: BossAttack[] } = {
    [BossPhase.PHASE_1]: [
      {
        name: 'Void Slash',
        damage: 15,
        telegraphFrames: 30,
        activeFrames: 8,
        cooldown: 60,
        range: 150,
        hitbox: { x: 0, y: 0, width: 80, height: 100 }
      },
      {
        name: 'Shadow Burst',
        damage: 20,
        telegraphFrames: 45,
        activeFrames: 12,
        cooldown: 90,
        range: 200,
        hitbox: { x: 0, y: 0, width: 120, height: 120 }
      }
    ],
    [BossPhase.PHASE_2]: [
      {
        name: 'Rage Combo',
        damage: 25,
        telegraphFrames: 20,
        activeFrames: 10,
        cooldown: 45,
        range: 180,
        hitbox: { x: 0, y: 0, width: 100, height: 100 }
      },
      {
        name: 'Void Wave',
        damage: 30,
        telegraphFrames: 35,
        activeFrames: 15,
        cooldown: 75,
        range: 250,
        hitbox: { x: 0, y: 0, width: 150, height: 80 }
      }
    ],
    [BossPhase.PHASE_3]: [
      {
        name: 'Erasure',
        damage: 40,
        telegraphFrames: 60,
        activeFrames: 20,
        cooldown: 120,
        range: 300,
        hitbox: { x: 0, y: 0, width: 200, height: 200 }
      },
      {
        name: 'Silence',
        damage: 50,
        telegraphFrames: 90,
        activeFrames: 30,
        cooldown: 180,
        range: 400,
        hitbox: { x: 0, y: 0, width: 300, height: 300 }
      }
    ]
  };

  /**
   * Update boss AI (call every frame)
   */
  update(deltaTime: number, playerPos: { x: number; y: number }): void {
    // Update phase based on HP
    this.updatePhase();

    // Update attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime * 60; // Convert to frames
    }

    // Update current attack
    if (this.currentAttack) {
      this.attackTimer -= deltaTime * 60;
      
      if (this.attackTimer <= 0) {
        // Attack finished
        this.currentAttack = null;
        this.attackCooldown = this.getCurrentPhaseAttacks()[0]?.cooldown || 60;
      }
    }

    // Try to attack if cooldown ready
    if (!this.currentAttack && this.attackCooldown <= 0) {
      const distance = this.getDistanceToPlayer(playerPos);
      const availableAttacks = this.getCurrentPhaseAttacks().filter(
        attack => distance <= attack.range
      );

      if (availableAttacks.length > 0) {
        const attack = this.selectAttack(availableAttacks);
        this.executeAttack(attack, playerPos);
      }
    }

    // Update rage level in phase 2-3
    if (this.phase >= BossPhase.PHASE_2) {
      this.rageLevel = Math.min(100, this.rageLevel + deltaTime * 10);
    }
  }

  /**
   * Update boss phase based on HP
   */
  private updatePhase(): void {
    const previousPhase = this.phase;

    if (this.hp <= 0) {
      // Boss defeated
      bus.emit('BOSS_DEFEATED', { phase: this.phase });
      return;
    } else if (this.hp < 150) {
      this.phase = BossPhase.PHASE_3;
    } else if (this.hp < 350) {
      this.phase = BossPhase.PHASE_2;
    } else {
      this.phase = BossPhase.PHASE_1;
    }

    // Emit phase change
    if (previousPhase !== this.phase) {
      bus.emit(Events.BOSS_PHASE_CHANGE, {
        from: previousPhase,
        to: this.phase,
        hp: this.hp
      });
    }
  }

  /**
   * Execute an attack
   */
  private executeAttack(attack: BossAttack, playerPos: { x: number; y: number }): void {
    this.currentAttack = attack;
    this.attackTimer = attack.telegraphFrames + attack.activeFrames;
    this.attackCooldown = attack.cooldown;

    // Position hitbox relative to boss
    const hitbox = {
      ...attack.hitbox,
      x: this.position.x + attack.hitbox.x,
      y: this.position.y + attack.hitbox.y
    };

    // Emit telegraph
    bus.emit('BOSS_ATTACK_TELEGRAPH', {
      attack: attack.name,
      frames: attack.telegraphFrames,
      hitbox
    });

    // After telegraph, emit active
    setTimeout(() => {
      if (this.currentAttack === attack) {
        bus.emit('BOSS_ATTACK_ACTIVE', {
          attack: attack.name,
          damage: attack.damage,
          hitbox
        });
      }
    }, (attack.telegraphFrames / 60) * 1000);
  }

  /**
   * Select attack from available options
   */
  private selectAttack(attacks: BossAttack[]): BossAttack {
    // In phase 3, prefer Erasure
    if (this.phase === BossPhase.PHASE_3) {
      const erasure = attacks.find(a => a.name === 'Erasure');
      if (erasure && Math.random() > 0.3) {
        return erasure;
      }
    }

    // Random selection weighted by phase
    return attacks[Math.floor(Math.random() * attacks.length)];
  }

  /**
   * Get attacks for current phase
   */
  private getCurrentPhaseAttacks(): BossAttack[] {
    return this.attacks[this.phase] || [];
  }

  /**
   * Calculate distance to player
   */
  private getDistanceToPlayer(playerPos: { x: number; y: number }): number {
    const dx = playerPos.x - this.position.x;
    const dy = playerPos.y - this.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Take damage
   */
  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
    bus.emit(Events.ENEMY_HIT, { damage: amount, hp: this.hp, maxHp: this.maxHp });
    
    if (this.hp <= 0) {
      bus.emit('BOSS_DEFEATED', { phase: this.phase });
    }
  }

  /**
   * Get current attack (for hit detection)
   */
  getCurrentAttack(): BossAttack | null {
    return this.currentAttack;
  }

  /**
   * Check if attack is in active window
   */
  isAttackActive(): boolean {
    if (!this.currentAttack) return false;
    const totalFrames = this.currentAttack.telegraphFrames + this.currentAttack.activeFrames;
    const activeStart = this.currentAttack.telegraphFrames;
    const currentFrame = totalFrames - this.attackTimer;
    return currentFrame >= activeStart && currentFrame < activeStart + this.currentAttack.activeFrames;
  }

  /**
   * Reset boss
   */
  reset(): void {
    this.phase = BossPhase.PHASE_1;
    this.hp = this.maxHp;
    this.attackCooldown = 0;
    this.currentAttack = null;
    this.attackTimer = 0;
    this.rageLevel = 0;
  }
}
