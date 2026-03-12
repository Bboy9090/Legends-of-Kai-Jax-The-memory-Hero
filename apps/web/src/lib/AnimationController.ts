import * as THREE from "three";

export default class AnimationController {
  model: THREE.Object3D;
  mixer: THREE.AnimationMixer;
  actions: Record<string, THREE.AnimationAction> = {};
  currentAction: THREE.AnimationAction | null = null;
  currentState: string | null = null;

  constructor(model: THREE.Object3D, animations: THREE.AnimationClip[]) {
    this.model = model;
    this.mixer = new THREE.AnimationMixer(model);

    animations.forEach((clip) => {
      this.actions[clip.name] = this.mixer.clipAction(clip);
    });
  }

  play(stateName: string, fadeDuration = 0.2): void {
    if (this.currentState === stateName) return;

    const nextAction = this.actions[stateName];
    if (!nextAction) {
      console.warn(`Animation "${stateName}" not found`);
      return;
    }

    if (this.currentAction) {
      this.currentAction.fadeOut(fadeDuration);
    }

    nextAction.reset().fadeIn(fadeDuration).play();

    this.currentAction = nextAction;
    this.currentState = stateName;
  }

  update(delta: number): void {
    this.mixer.update(delta);
  }
}
