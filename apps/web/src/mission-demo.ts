/**
 * Mission Demo Entry Point
 */

import { MissionScene } from './scenes/MissionScene';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('mission-canvas') as HTMLCanvasElement;
  
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const mission = new MissionScene(canvas);
  mission.start();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  (window as any).mission = mission;

  console.log('Mission demo ready. Press SPACE to start.');
});
