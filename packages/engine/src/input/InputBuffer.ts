import { InputState, InputAction } from '@smash-heroes/shared';

export class InputBuffer {
  private buffer: InputState[] = [];
  private maxSize: number;

  constructor(maxSize = 6) {
    this.maxSize = maxSize;
  }

  addInput(input: InputState): void {
    this.buffer.push(input);
    
    // Keep buffer size limited
    while (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
  }

  getRecentInputs(count = this.maxSize): InputState[] {
    return this.buffer.slice(-count);
  }

  hasInput(action: InputAction, withinFrames = this.maxSize): boolean {
    const recentInputs = this.getRecentInputs(withinFrames);
    return recentInputs.some((input) => input.action === action && input.pressed);
  }

  getLastInput(action: InputAction): InputState | undefined {
    for (let i = this.buffer.length - 1; i >= 0; i--) {
      const input = this.buffer[i];
      if (input && input.action === action) {
        return input;
      }
    }
    return undefined;
  }

  detectSequence(sequence: InputAction[]): boolean {
    if (sequence.length === 0) return false;
    
    const recentInputs = this.getRecentInputs(sequence.length);
    if (recentInputs.length < sequence.length) return false;

    // Check if sequence matches recent inputs
    for (let i = 0; i < sequence.length; i++) {
      const bufferIndex = recentInputs.length - sequence.length + i;
      const input = recentInputs[bufferIndex];
      if (!input || input.action !== sequence[i]) {
        return false;
      }
    }

    return true;
  }

  clear(): void {
    this.buffer = [];
  }

  getBuffer(): ReadonlyArray<InputState> {
    return this.buffer;
  }

  getSize(): number {
    return this.buffer.length;
  }

  isEmpty(): boolean {
    return this.buffer.length === 0;
  }
}
