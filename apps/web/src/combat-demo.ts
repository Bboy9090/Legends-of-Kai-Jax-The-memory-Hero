/**
 * Combat Demo Entry Point
 * Minimal HTML page to prove combat exchange
 */

import { CombatDemoScene } from './scenes/CombatDemoScene';
import { installRegistryDebugOverlay } from './debug/RegistryDebugOverlay';

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('combat-canvas') as HTMLCanvasElement;
  
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  // Set canvas size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Create and start demo
  const demo = new CombatDemoScene(canvas);
  demo.start();

  // Registry debug overlay (toggle with ~)
  installRegistryDebugOverlay();

  // Handle window resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  // Expose demo to window for debugging
  (window as any).combatDemo = demo;

  console.log('Combat demo ready. Press J to attack.');
});
