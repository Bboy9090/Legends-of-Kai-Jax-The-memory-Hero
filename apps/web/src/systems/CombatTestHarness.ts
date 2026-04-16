/**
 * Combat Test Harness
 * Validates kai_light_jab execution end-to-end
 */

import { FighterEntity } from './FighterEntity';

export class CombatTestHarness {
  private attacker: FighterEntity;
  private defender: FighterEntity;
  private frameCount: number = 0;
  private running: boolean = false;

  constructor() {
    // Spawn attacker (Kai)
    this.attacker = new FighterEntity('kai', 0, 0, 100);

    // Spawn defender (dummy)
    this.defender = new FighterEntity('dummy', 2.0, 0, 100); // 2 units away
  }

  /**
   * Initialize test
   */
  public async init(): Promise<void> {
    console.log('=== COMBAT TEST HARNESS INITIALIZING ===');
    
    // Load kai_light_jab into attacker
    await this.attacker.loadMove('kai_light_jab');
    
    console.log('=== INITIALIZATION COMPLETE ===');
    console.log(`Attacker: ${this.attacker.getState().id} at (${this.attacker.getState().x}, ${this.attacker.getState().y})`);
    console.log(`Defender: ${this.defender.getState().id} at (${this.defender.getState().x}, ${this.defender.getState().y})`);
  }

  /**
   * Execute test sequence
   */
  public start(): void {
    console.log('\n=== STARTING COMBAT TEST ===');
    this.running = true;
    this.frameCount = 0;

    // Execute kai_light_jab on frame 10
    setTimeout(() => {
      if (!this.running) return;
      console.log(`\n[Frame ${this.frameCount}] Executing kai_light_jab...`);
      this.attacker.executeMove('kai_light_jab');
    }, 160); // ~10 frames at 60fps
  }

  /**
   * Update simulation
   */
  public update(deltaTime: number): void {
    if (!this.running) return;

    this.frameCount++;

    // Update both fighters
    this.attacker.update(deltaTime);
    this.defender.update(deltaTime);

    // Check for hits
    const didHit = this.attacker.checkHitAgainst(this.defender);

    if (didHit) {
      console.log(`\n✅ [Frame ${this.frameCount}] HIT CONFIRMED!`);
      console.log(`Attacker HP: ${this.attacker.getState().hp}`);
      console.log(`Defender HP: ${this.defender.getState().hp}`);
      console.log(`Defender velocity: (${this.defender.getState().velocityX.toFixed(2)}, ${this.defender.getState().velocityY.toFixed(2)})`);
    }

    // Log every 10 frames
    if (this.frameCount % 10 === 0) {
      const attackerState = this.attacker.getState();
      const defenderState = this.defender.getState();
      
      console.log(`\n[Frame ${this.frameCount}]`);
      console.log(`  Attacker: busy=${this.attacker.isBusy()}, pos=(${attackerState.x.toFixed(2)}, ${attackerState.y.toFixed(2)})`);
      console.log(`  Defender: HP=${defenderState.hp}, pos=(${defenderState.x.toFixed(2)}, ${defenderState.y.toFixed(2)})`);
    }

    // Stop after 120 frames (~2 seconds)
    if (this.frameCount >= 120) {
      this.stop();
    }
  }

  /**
   * Stop test
   */
  public stop(): void {
    if (!this.running) return;

    this.running = false;
    console.log('\n=== TEST COMPLETE ===');
    console.log(`Total frames: ${this.frameCount}`);
    console.log(`Attacker final HP: ${this.attacker.getState().hp}`);
    console.log(`Defender final HP: ${this.defender.getState().hp}`);
    
    const damage = this.defender.getState().maxHP - this.defender.getState().hp;
    console.log(`\nDamage dealt: ${damage}`);
    
    if (damage > 0) {
      console.log('✅ COMBAT EXCHANGE SUCCESSFUL');
    } else {
      console.log('❌ NO DAMAGE DEALT');
    }
  }

  /**
   * Get test results
   */
  public getResults(): {
    success: boolean;
    damageDealt: number;
    frameCount: number;
  } {
    const damage = this.defender.getState().maxHP - this.defender.getState().hp;
    
    return {
      success: damage > 0,
      damageDealt: damage,
      frameCount: this.frameCount,
    };
  }
}

/**
 * Run standalone test
 */
export async function runCombatTest(): Promise<void> {
  const harness = new CombatTestHarness();
  await harness.init();
  harness.start();

  // Simulate 60fps update loop
  const fps = 60;
  const frameTime = 1 / fps;
  
  const interval = setInterval(() => {
    harness.update(frameTime);
    
    const results = harness.getResults();
    if (results.frameCount >= 120) {
      clearInterval(interval);
    }
  }, 1000 / fps);
}
