/**
 * DIALOGUE SYSTEM — Context-Aware Character Barks
 * 
 * Purpose: Characters don't repeat the same line twice
 * System: Dynamically modifies dialogue based on:
 *   - Dread Meter (0-100%)
 *   - Resonance (0-100%)
 *   - Player choices (narrative flags)
 *   - Chapter progression
 * 
 * Aesthetic: Bronx Grit vibe
 *   - High Dread: Short, breathless, urgent
 *   - High Resonance: Confident, echoing the legends
 * 
 * Example:
 *   Base: "I won't back down."
 *   Dread 80%+: "*breathing heavily* ...won't... back down..."
 *   Resonance 80%+: "I carry the Legends within me. I will NOT back down."
 */

import { eventBus } from '../core/EventBus';

export type DialogueContext = 'PRE_FIGHT' | 'MID_FIGHT' | 'VICTORY' | 'DEFEAT' | 'BOSS_INTRO' | 'POWER_UNLOCK';

export interface DialogueLine {
  base: string;
  dreadModifier?: {
    threshold: number; // 0-100
    text: string;
  };
  resonanceModifier?: {
    threshold: number;
    text: string;
  };
  narrativeModifier?: {
    flag: string;
    text: string;
  };
}

export interface CharacterDialogue {
  characterId: string;
  context: DialogueContext;
  lines: DialogueLine[];
  emotion?: 'calm' | 'confident' | 'desperate' | 'triumphant';
  voiceFilter?: string; // 'none' | 'breathless' | 'echo' | 'distorted'
}

class DialogueSystem {
  private static instance: DialogueSystem;
  private dialogueDatabase: Map<string, CharacterDialogue[]> = new Map();
  private currentDread: number = 0;
  private currentResonance: number = 0;
  private globalFlags: Set<string> = new Set();
  private dialogueHistory: Set<string> = new Set(); // Prevent repeats

  private constructor() {
    this.initializeDialogue();
    this.subscribeToGameEvents();
  }

  public static getInstance(): DialogueSystem {
    if (!DialogueSystem.instance) {
      DialogueSystem.instance = new DialogueSystem();
    }
    return DialogueSystem.instance;
  }

  /**
   * Initialize all character dialogue (Books 1-3 focus)
   */
  private initializeDialogue(): void {
    // KAI-JAX DIALOGUE
    this.dialogueDatabase.set('kai-jax', [
      {
        characterId: 'kai-jax',
        context: 'PRE_FIGHT',
        emotion: 'calm',
        lines: [
          {
            base: 'I feel the strength of my father within me.',
            resonanceModifier: {
              threshold: 70,
              text: 'The Legends flow through my core. I am ready.',
            },
            narrativeModifier: {
              flag: 'MERGER_COMPLETE',
              text: 'Kaison... Jaxon... we are one. Let us show them the truth.',
            },
          },
          {
            base: 'One more victory. One more step.',
            dreadModifier: {
              threshold: 60,
              text: 'One... more... *breathe*... victory...',
            },
          },
        ],
      },
      {
        characterId: 'kai-jax',
        context: 'MID_FIGHT',
        emotion: 'confident',
        lines: [
          {
            base: 'I can feel their technique.',
            resonanceModifier: {
              threshold: 80,
              text: 'The Legends guide my hands. I see every move.',
            },
          },
          {
            base: 'Not yet.',
            dreadModifier: {
              threshold: 80,
              text: '*gasp* ...not... yet...',
            },
          },
        ],
      },
      {
        characterId: 'kai-jax',
        context: 'VICTORY',
        emotion: 'triumphant',
        lines: [
          {
            base: 'That was the strength they gave me.',
            narrativeModifier: {
              flag: 'LEGEND_POWER_UNLOCK',
              text: 'That was the FULL strength of the Legends. And I am just beginning.',
            },
          },
        ],
      },
      {
        characterId: 'kai-jax',
        context: 'BOSS_INTRO',
        emotion: 'calm',
        lines: [
          {
            base: 'The Bloodward taught me to stand.',
            resonanceModifier: {
              threshold: 75,
              text: 'My father\'s sacrifice made me unbreakable. And I honor that.',
            },
          },
        ],
      },
    ]);

    // BORYX ZENITH DIALOGUE
    this.dialogueDatabase.set('boryx-zenith', [
      {
        characterId: 'boryx-zenith',
        context: 'PRE_FIGHT',
        emotion: 'calm',
        lines: [
          {
            base: 'Guardian Kings do not yield.',
            resonanceModifier: {
              threshold: 70,
              text: 'Guardian Kings do not yield. We ENDURE.',
            },
          },
          {
            base: 'My shield is my pride.',
            dreadModifier: {
              threshold: 70,
              text: '*grips shield tightly* My shield... my honor...',
            },
          },
        ],
      },
      {
        characterId: 'boryx-zenith',
        context: 'MID_FIGHT',
        emotion: 'confident',
        lines: [
          {
            base: 'You cannot break what was forged in fire.',
            resonanceModifier: {
              threshold: 80,
              text: 'You cannot break what the LEGENDS forged. I am unstoppable.',
            },
          },
        ],
      },
    ]);

    // UMBRA-FLUX DIALOGUE
    this.dialogueDatabase.set('umbra-flux', [
      {
        characterId: 'umbra-flux',
        context: 'PRE_FIGHT',
        emotion: 'confident',
        lines: [
          {
            base: 'Speed is elegance. Elegance is power.',
            resonanceModifier: {
              threshold: 75,
              text: 'I AM speed. I am the velocity that reshapes the world.',
            },
          },
        ],
      },
      {
        characterId: 'umbra-flux',
        context: 'VICTORY',
        emotion: 'triumphant',
        lines: [
          {
            base: 'Too slow.',
            resonanceModifier: {
              threshold: 80,
              text: 'You were never fast enough to touch me. The gap is eternal.',
            },
          },
        ],
      },
    ]);

    // SENTINEL VOX DIALOGUE
    this.dialogueDatabase.set('sentinel-vox', [
      {
        characterId: 'sentinel-vox',
        context: 'PRE_FIGHT',
        emotion: 'calm',
        lines: [
          {
            base: 'The Kitsune teaches wisdom through struggle.',
            resonanceModifier: {
              threshold: 70,
              text: 'Nine tails hold nine wisdoms. I will teach them all.',
            },
          },
        ],
      },
    ]);

    // LUNARA SOLIS DIALOGUE
    this.dialogueDatabase.set('lunara-solis', [
      {
        characterId: 'lunara-solis',
        context: 'PRE_FIGHT',
        emotion: 'calm',
        lines: [
          {
            base: 'Queens rise where others fall.',
            resonanceModifier: {
              threshold: 75,
              text: 'I am the Light that was promised. Witness your Wise Queen.',
            },
          },
        ],
      },
    ]);

    // CHRONOS SERE DIALOGUE
    this.dialogueDatabase.set('chronos-sere', [
      {
        characterId: 'chronos-sere',
        context: 'BOSS_INTRO',
        emotion: 'calm',
        lines: [
          {
            base: 'Time flows through all things. Let me show you.',
            resonanceModifier: {
              threshold: 80,
              text: 'I AM the flow of time itself. Your future is already written.',
            },
          },
        ],
      },
      {
        characterId: 'chronos-sere',
        context: 'MID_FIGHT',
        emotion: 'confident',
        lines: [
          {
            base: 'I see what comes next.',
            dreadModifier: {
              threshold: 70,
              text: 'I see your defeat. It... already... happened...',
            },
          },
        ],
      },
    ]);
  }

  /**
   * Subscribe to game events
   */
  private subscribeToGameEvents(): void {
    eventBus.on('dread_change', (data) => {
      this.currentDread = data.dreadLevel;
    });

    eventBus.on('resonance_change', (data) => {
      this.currentResonance = data.resonance;
    });

    eventBus.on('chapter_unlocked', (data) => {
      this.globalFlags.add(data.chapterId);
    });
  }

  /**
   * Get contextual dialogue for character
   */
  public getDialogue(
    characterId: string,
    context: DialogueContext
  ): string {
    const dialogueSet = this.dialogueDatabase.get(characterId);
    if (!dialogueSet) {
      console.warn(`[DialogueSystem] No dialogue found for ${characterId}`);
      return '';
    }

    // Find matching context
    const contextDialogue = dialogueSet.find(d => d.context === context);
    if (!contextDialogue) {
      console.warn(`[DialogueSystem] No ${context} dialogue for ${characterId}`);
      return '';
    }

    // Pick a line that hasn't been used recently
    let selectedLine: DialogueLine | undefined;
    for (const line of contextDialogue.lines) {
      const lineHash = `${characterId}-${context}-${line.base}`;
      if (!this.dialogueHistory.has(lineHash)) {
        selectedLine = line;
        this.dialogueHistory.add(lineHash);
        break;
      }
    }

    // Fallback to any line if all have been used
    if (!selectedLine) {
      selectedLine = contextDialogue.lines[0];
    }

    return this.applyModifiers(selectedLine, contextDialogue.voiceFilter);
  }

  /**
   * Apply dread/resonance modifiers to dialogue
   */
  private applyModifiers(line: DialogueLine, voiceFilter?: string): string {
    let text = line.base;

    // Apply resonance modifier (high resonance = confident)
    if (line.resonanceModifier && this.currentResonance >= line.resonanceModifier.threshold) {
      text = line.resonanceModifier.text;
    }

    // Apply dread modifier (high dread = desperate)
    if (line.dreadModifier && this.currentDread >= line.dreadModifier.threshold) {
      text = line.dreadModifier.text;
    }

    // Apply narrative modifier (story flags change dialogue)
    if (line.narrativeModifier && this.globalFlags.has(line.narrativeModifier.flag)) {
      text = line.narrativeModifier.text;
    }

    // Apply voice filter
    if (voiceFilter === 'breathless' && this.currentDread > 60) {
      text = text.split(' ').join(' *breathe* ');
    } else if (voiceFilter === 'echo' && this.currentResonance > 70) {
      text = text.toUpperCase();
    } else if (voiceFilter === 'distorted' && this.currentDread > 80) {
      text = text.replace(/a/g, 'ā').replace(/e/g, 'ē');
    }

    return text;
  }

  /**
   * Get lore fragment for artifact/item
   */
  public getLoreFragment(artifactId: string): { title: string; text: string; relatedBook: number } | null {
    const loreFragments: { [key: string]: any } = {
      'boryn-pendant': {
        title: 'The Bloodward\'s Pendant',
        text: 'A relic of Boryn\'s covenant. It still pulses with the rhythm of his sacrifice.',
        relatedBook: 1,
      },
      'echo-crystal': {
        title: 'Echo Crystal',
        text: 'Within this stone lives the memory of Kaison and Jaxon. A reminder of the merger.',
        relatedBook: 2,
      },
      'convergence-seal': {
        title: 'Convergence Seal',
        text: 'The mark of the first Legacy Convergence. It carries the weight of six warriors.',
        relatedBook: 3,
      },
    };

    return loreFragments[artifactId] || null;
  }

  /**
   * Get character relationship/bond dialogue
   */
  public getBondDialogue(character1Id: string, character2Id: string): string {
    const bonds: { [key: string]: string } = {
      'kai-jax-boryx-zenith': 'The son honors the father\'s legacy. Guardian and Memory, united.',
      'kai-jax-umbra-flux': 'Two sides of the same coin. Velocity and Stability, forever rivals.',
      'boryx-zenith-umbra-flux': 'The shield and the blade. Patience and velocity, complementary.',
    };

    const key = [character1Id, character2Id].sort().join('-');
    return bonds[key] || 'Two warriors, bound by the Aeterna.';
  }

  /**
   * Clear old dialogue history to prevent stale checks
   */
  public clearDialogueHistory(): void {
    this.dialogueHistory.clear();
  }

  /**
   * Get current dialogue state (for debugging)
   */
  public getState() {
    return {
      currentDread: this.currentDread,
      currentResonance: this.currentResonance,
      globalFlags: Array.from(this.globalFlags),
      dialogueHistorySize: this.dialogueHistory.size,
    };
  }
}

export const dialogueSystem = DialogueSystem.getInstance();
