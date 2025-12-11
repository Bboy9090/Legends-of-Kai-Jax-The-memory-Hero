export enum AssetType {
  IMAGE = 'image',
  AUDIO = 'audio',
  JSON = 'json',
  TEXT = 'text',
}

export interface AssetManifest {
  key: string;
  url: string;
  type: AssetType;
}

export type Asset = HTMLImageElement | AudioBuffer | object | string;

export class AssetLoader {
  private assets: Map<string, Asset> = new Map();
  private loading: Map<string, Promise<Asset>> = new Map();
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize audio context lazily
    if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
      this.audioContext = new (AudioContext || (window as any).webkitAudioContext)();
    }
  }

  async load(manifest: AssetManifest[]): Promise<void> {
    const promises = manifest.map((item) => this.loadAsset(item));
    await Promise.all(promises);
  }

  private async loadAsset(manifest: AssetManifest): Promise<Asset> {
    // Check cache first
    if (this.assets.has(manifest.key)) {
      return this.assets.get(manifest.key)!;
    }

    // Check if already loading
    if (this.loading.has(manifest.key)) {
      return this.loading.get(manifest.key)!;
    }

    // Start loading
    const promise = this.fetchAsset(manifest);
    this.loading.set(manifest.key, promise);

    try {
      const asset = await promise;
      this.assets.set(manifest.key, asset);
      return asset;
    } finally {
      this.loading.delete(manifest.key);
    }
  }

  private async fetchAsset(manifest: AssetManifest): Promise<Asset> {
    switch (manifest.type) {
      case AssetType.IMAGE:
        return this.loadImage(manifest.url);
      case AssetType.AUDIO:
        return this.loadAudio(manifest.url);
      case AssetType.JSON:
        return this.loadJson(manifest.url);
      case AssetType.TEXT:
        return this.loadText(manifest.url);
      default:
        throw new Error(`Unknown asset type: ${manifest.type}`);
    }
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  private async loadAudio(url: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('AudioContext not available');
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load audio: ${url}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return this.audioContext.decodeAudioData(arrayBuffer);
  }

  private async loadJson(url: string): Promise<object> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${url}`);
    }
    return response.json();
  }

  private async loadText(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load text: ${url}`);
    }
    return response.text();
  }

  get<T extends Asset>(key: string): T | undefined {
    return this.assets.get(key) as T | undefined;
  }

  has(key: string): boolean {
    return this.assets.has(key);
  }

  unload(key: string): void {
    this.assets.delete(key);
  }

  unloadAll(): void {
    this.assets.clear();
  }

  getLoadProgress(): { loaded: number; total: number } {
    const total = this.assets.size + this.loading.size;
    const loaded = this.assets.size;
    return { loaded, total };
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }
}
