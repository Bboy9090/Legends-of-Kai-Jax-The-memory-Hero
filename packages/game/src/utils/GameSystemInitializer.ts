// System Integration Helper
// Path: packages/game/src/utils/GameSystemInitializer.ts

import * as THREE from 'three';
import { CombatSystem } from '@game/systems/CombatSystem';
import { AnimationStateMachine } from '@game/systems/AnimationStateMachine';
import { AudioSystem } from '@game/systems/AudioSystem';
import { VFXCoordinator } from '@game/systems/VFXCoordinator';
import { MatchStateManager } from '@game/managers/MatchStateManager';
import { PerformanceProfiler } from '@game/debug/PerformanceProfiler';
import { EventBus } from '@game/core/EventBus';

interface GameSystems {
  combat: CombatSystem;
  animations: Map<string, AnimationStateMachine>;
  audio: AudioSystem;
  vfx: VFXCoordinator;
  matchState: MatchStateManager;
  profiler: PerformanceProfiler;
  eventBus: EventBus;
}

interface GameSystemsConfig {
  scene: THREE.Scene;
  camera: THREE.Camera;
  eventBus: EventBus;
  p1Id: string;
  p2Id: string;
  matchDuration?: number;
  enableDebug?: boolean;
}

/**
 * One-line initialization for all game systems
 * Handles all setup, event wiring, and returns ready-to-use systems
 */
export function initializeGameSystems(config: GameSystemsConfig): GameSystems {
  const {
    scene,
    camera,
    eventBus,
    p1Id,
    p2Id,
    matchDuration = 180,
    enableDebug = false,
  } = config;

  // Initialize systems
  const combat = new CombatSystem(eventBus);
  const audio = new AudioSystem(eventBus);
  const vfx = new VFXCoordinator(scene, camera, eventBus);
  const matchState = new MatchStateManager(p1Id, p2Id, matchDuration, eventBus);
  const profiler = new PerformanceProfiler();

  // Initialize animations (empty map, to be populated by caller)
  const animations = new Map<string, AnimationStateMachine>();

  // Setup cross-system event wiring
  setupEventWiring(eventBus, { combat, audio, vfx, matchState });

  // Enable debug mode if requested
  if (enableDebug) {
    enableDebugMode(eventBus, profiler);
  }

  return {
    combat,
    animations,
    audio,
    vfx,
    matchState,
    profiler,
    eventBus,
  };
}

/**
 * Wire all event connections between systems
 */
function setupEventWiring(
  eventBus: EventBus,
  systems: any
): void {
  // Combat → Match State (damage/knockback)
  eventBus.subscribe('character:hit', (data) => {
    // Match state handles HP/resonance update
    // (Already wired in MatchStateManager constructor)
  });

  // Combat → Audio (hit sounds)
  eventBus.subscribe('attack:landed', (data) => {
    eventBus.emit('audio:play_sfx', {
      name: 'hit_impact',
      volume: Math.min(1, data.damage / 50),
      pitch: 1 + Math.random() * 0.2,
    });
  });

  // Combat → VFX (hit effects)
  eventBus.subscribe('attack:landed', (data) => {
    eventBus.emit('vfx:hit_effect', {
      position: data.hitPosition,
      damage: data.damage,
      type: 'impact',
    });
  });

  // Character movement → Audio (step sounds)
  eventBus.subscribe('character:move', (data) => {
    if (data.speed > 5) {
      eventBus.emit('audio:play_sfx', {
        name: 'step',
        volume: 0.3,
        pitch: 0.9 + Math.random() * 0.2,
      });
    }
  });

  // Jump → Audio
  eventBus.subscribe('jump:performed', (data) => {
    eventBus.emit('audio:play_sfx', {
      name: 'jump',
      volume: 0.6,
      pitch: 1,
    });
  });

  // Match end → Audio + VFX
  eventBus.subscribe('match:ended', (data) => {
    const sfxName = data.winnerId ? 'victory' : 'defeat';
    eventBus.emit('audio:play_sfx', {
      name: sfxName,
      volume: 0.8,
      pitch: 1,
    });

    if (data.winnerId) {
      eventBus.emit('vfx:victory_effect', {
        position: data.position,
      });
    }
  });
}

/**
 * Enable debug visualization and logging
 */
function enableDebugMode(eventBus: EventBus, profiler: PerformanceProfiler): void {
  // Add performance widget to screen
  const widget = profiler.createHtmlWidget();
  document.body.appendChild(widget);

  // Log all events
  const eventCounts = new Map<string, number>();
  const originalEmit = eventBus.emit.bind(eventBus);

  eventBus.emit = function (eventName: string, data: any) {
    const count = (eventCounts.get(eventName) || 0) + 1;
    eventCounts.set(eventName, count);
    return originalEmit(eventName, data);
  };

  // Log debug info every 5 seconds
  setInterval(() => {
    console.group('[Game Systems Debug]');
    console.log('Events this period:', Array.from(eventCounts.entries()));
    console.log('Performance:', profiler.getFrameMetrics());
    console.groupEnd();
    eventCounts.clear();
  }, 5000);

  console.log('[Debug Mode] Enabled. Check performance widget (top-right)');
}

/**
 * Cleanup/dispose all systems
 */
export function disposeGameSystems(systems: GameSystems): void {
  // Audio context cleanup
  if (systems.audio) {
    // Audio cleanup (would implement resume/suspend logic)
  }

  // VFX cleanup
  if (systems.vfx) {
    systems.vfx.clear();
  }

  // Animation cleanup
  for (const anim of systems.animations.values()) {
    anim.reset();
  }

  // Reset profiler
  systems.profiler.reset();

  console.log('[Game Systems] Disposed');
}

/**
 * Helper to create character animation state machine
 */
export function createCharacterAnimations(
  character: THREE.Group,
  scene: THREE.Scene,
  eventBus: EventBus
): AnimationStateMachine {
  // Create mixer
  const mixer = new THREE.AnimationMixer(character);

  // Create state machine
  const stateMachine = new AnimationStateMachine(character, mixer, eventBus);

  // Add to scene (mixer update will be handled in game loop)
  return stateMachine;
}
