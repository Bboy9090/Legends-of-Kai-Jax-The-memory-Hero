export class SoundPool {
  private pool: HTMLAudioElement[] = [];
  private poolSize: number;
  private currentIndex = 0;

  constructor(audioSrc: string, poolSize = 5) {
    this.poolSize = poolSize;
    
    for (let i = 0; i < poolSize; i++) {
      const audio = new Audio(audioSrc);
      audio.preload = 'auto';
      this.pool.push(audio);
    }
  }

  play(volume = 1.0): void {
    const audio = this.pool[this.currentIndex];
    
    if (audio) {
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Ignore errors from auto-play restrictions
      });
    }

    this.currentIndex = (this.currentIndex + 1) % this.poolSize;
  }

  stop(): void {
    this.pool.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
}
