export interface IScene {
  load(): Promise<void>;
  unload(): void;
  update(deltaTime: number): void;
  render(alpha: number): void;
  onEnter?(): void;
  onExit?(): void;
}

export class SceneManager {
  private scenes: Map<string, IScene> = new Map();
  private currentScene: IScene | null = null;
  private currentSceneKey: string | null = null;
  private isTransitioning = false;

  registerScene(key: string, scene: IScene): void {
    this.scenes.set(key, scene);
  }

  unregisterScene(key: string): void {
    if (this.currentSceneKey === key) {
      console.warn(`Cannot unregister active scene: ${key}`);
      return;
    }
    this.scenes.delete(key);
  }

  async switchTo(key: string): Promise<void> {
    if (this.isTransitioning) {
      console.warn('Scene transition already in progress');
      return;
    }

    const nextScene = this.scenes.get(key);
    if (!nextScene) {
      throw new Error(`Scene not found: ${key}`);
    }

    if (this.currentSceneKey === key) {
      console.warn(`Already in scene: ${key}`);
      return;
    }

    this.isTransitioning = true;

    try {
      // Exit current scene
      if (this.currentScene) {
        if (this.currentScene.onExit) {
          this.currentScene.onExit();
        }
        this.currentScene.unload();
      }

      // Load and enter new scene
      await nextScene.load();
      
      this.currentScene = nextScene;
      this.currentSceneKey = key;
      
      if (nextScene.onEnter) {
        nextScene.onEnter();
      }
    } finally {
      this.isTransitioning = false;
    }
  }

  update(deltaTime: number): void {
    if (this.currentScene && !this.isTransitioning) {
      this.currentScene.update(deltaTime);
    }
  }

  render(alpha: number): void {
    if (this.currentScene && !this.isTransitioning) {
      this.currentScene.render(alpha);
    }
  }

  getCurrentSceneKey(): string | null {
    return this.currentSceneKey;
  }

  getScene(key: string): IScene | undefined {
    return this.scenes.get(key);
  }

  hasScene(key: string): boolean {
    return this.scenes.has(key);
  }
}
