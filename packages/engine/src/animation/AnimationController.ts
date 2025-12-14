export interface Animation {
  name: string;
  frames: number;
  frameDuration: number; // in milliseconds
  loop: boolean;
}

export class AnimationController {
  private animations: Map<string, Animation> = new Map();
  private currentAnimation: Animation | null = null;
  private currentFrame = 0;
  private elapsedTime = 0;
  private playing = false;
  private onCompleteCallback: (() => void) | null = null;

  registerAnimation(animation: Animation): void {
    this.animations.set(animation.name, animation);
  }

  play(name: string, onComplete?: () => void): boolean {
    const animation = this.animations.get(name);
    if (!animation) return false;

    // Don't restart if already playing
    if (this.currentAnimation?.name === name && this.playing) {
      return true;
    }

    this.currentAnimation = animation;
    this.currentFrame = 0;
    this.elapsedTime = 0;
    this.playing = true;
    this.onCompleteCallback = onComplete ?? null;

    return true;
  }

  stop(): void {
    this.playing = false;
    this.currentFrame = 0;
    this.elapsedTime = 0;
  }

  pause(): void {
    this.playing = false;
  }

  resume(): void {
    this.playing = true;
  }

  update(deltaTime: number): void {
    if (!this.playing || !this.currentAnimation) return;

    this.elapsedTime += deltaTime;

    if (this.elapsedTime >= this.currentAnimation.frameDuration) {
      this.elapsedTime -= this.currentAnimation.frameDuration;
      this.currentFrame++;

      if (this.currentFrame >= this.currentAnimation.frames) {
        if (this.currentAnimation.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = this.currentAnimation.frames - 1;
          this.playing = false;
          
          if (this.onCompleteCallback) {
            this.onCompleteCallback();
            this.onCompleteCallback = null;
          }
        }
      }
    }
  }

  getCurrentFrame(): number {
    return this.currentFrame;
  }

  getCurrentAnimation(): Animation | null {
    return this.currentAnimation;
  }

  isPlaying(): boolean {
    return this.playing;
  }

  getProgress(): number {
    if (!this.currentAnimation) return 0;
    return this.currentFrame / this.currentAnimation.frames;
  }
}
