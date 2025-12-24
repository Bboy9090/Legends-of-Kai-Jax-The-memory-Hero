import { Vector2D, Vec2 } from '@smash-heroes/shared';

/**
 * Dynamic Framing Camera - The camera is a character
 * Zoom in for 1v1 tension, zoom out for chaotic squad brawls
 */
export class DynamicCamera {
  private position: Vector2D = { x: 0, y: 0 };
  private targetPosition: Vector2D = { x: 0, y: 0 };
  private zoom: number = 1.0;
  private targetZoom: number = 1.0;
  
  // Camera parameters
  private readonly smoothingFactor: number;
  private readonly zoomSmoothingFactor: number;
  private readonly minZoom: number;
  private readonly maxZoom: number;
  private readonly baseZoom: number;
  
  // Camera bounds
  private readonly padding: number;
  private readonly minDistance: number;
  private readonly maxDistance: number;

  constructor(config?: DynamicCameraConfig) {
    this.smoothingFactor = config?.smoothingFactor ?? 0.1;
    this.zoomSmoothingFactor = config?.zoomSmoothingFactor ?? 0.08;
    this.minZoom = config?.minZoom ?? 0.5;
    this.maxZoom = config?.maxZoom ?? 2.0;
    this.baseZoom = config?.baseZoom ?? 1.0;
    this.padding = config?.padding ?? 100;
    this.minDistance = config?.minDistance ?? 200;
    this.maxDistance = config?.maxDistance ?? 1000;
  }

  /**
   * Update camera to frame all fighters dynamically
   */
  update(fighters: FighterPosition[]): void {
    if (fighters.length === 0) return;

    // Calculate center point and bounding box
    const bounds = this.calculateBounds(fighters);
    
    // Determine target position (center of all fighters)
    this.targetPosition = {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
    };

    // Determine target zoom based on spread
    this.targetZoom = this.calculateZoom(bounds, fighters.length);

    // Smoothly interpolate to target
    this.position.x += (this.targetPosition.x - this.position.x) * this.smoothingFactor;
    this.position.y += (this.targetPosition.y - this.position.y) * this.smoothingFactor;
    this.zoom += (this.targetZoom - this.zoom) * this.zoomSmoothingFactor;
  }

  /**
   * Calculate bounds containing all fighters
   */
  private calculateBounds(fighters: FighterPosition[]): CameraBounds {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const fighter of fighters) {
      minX = Math.min(minX, fighter.position.x);
      maxX = Math.max(maxX, fighter.position.x);
      minY = Math.min(minY, fighter.position.y);
      maxY = Math.max(maxY, fighter.position.y);
    }

    return {
      minX: minX - this.padding,
      maxX: maxX + this.padding,
      minY: minY - this.padding,
      maxY: maxY + this.padding,
      width: maxX - minX + this.padding * 2,
      height: maxY - minY + this.padding * 2,
    };
  }

  /**
   * Calculate appropriate zoom level based on fighter spread
   */
  private calculateZoom(bounds: CameraBounds, fighterCount: number): number {
    const distance = Math.max(bounds.width, bounds.height);

    let zoom: number;
    
    if (fighterCount === 1) {
      // Single fighter - closer view
      zoom = this.baseZoom * 1.2;
    } else if (fighterCount === 2) {
      // 1v1 - zoom in for tension when close, zoom out when far
      if (distance < this.minDistance) {
        zoom = this.maxZoom; // Zoom in close for dramatic 1v1
      } else if (distance > this.maxDistance) {
        zoom = this.minZoom; // Zoom out if they're far apart
      } else {
        // Interpolate between min and max zoom
        const t = (distance - this.minDistance) / (this.maxDistance - this.minDistance);
        zoom = this.maxZoom - (this.maxZoom - this.minZoom) * t;
      }
    } else {
      // Multi-fighter brawl - zoom out for chaos
      if (distance < this.minDistance * 1.5) {
        zoom = this.baseZoom;
      } else if (distance > this.maxDistance) {
        zoom = this.minZoom;
      } else {
        // Interpolate
        const t = (distance - this.minDistance * 1.5) / (this.maxDistance - this.minDistance * 1.5);
        zoom = this.baseZoom - (this.baseZoom - this.minZoom) * t;
      }
    }

    // Clamp zoom
    return Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
  }

  /**
   * Focus on a specific fighter (for dramatic moments)
   */
  focusOn(position: Vector2D, zoomLevel: number = this.maxZoom): void {
    this.targetPosition = { ...position };
    this.targetZoom = zoomLevel;
  }

  /**
   * Apply camera shake (integrate with ScreenEffects)
   */
  applyShake(offset: Vector2D): Vector2D {
    return {
      x: this.position.x + offset.x,
      y: this.position.y + offset.y,
    };
  }

  /**
   * Get current camera transform
   */
  getTransform(): CameraTransform {
    return {
      position: { ...this.position },
      zoom: this.zoom,
      targetPosition: { ...this.targetPosition },
      targetZoom: this.targetZoom,
    };
  }

  /**
   * Set camera bounds (for stage limits)
   */
  setStageBounds(bounds: StageBounds): void {
    // Clamp camera position to stage bounds
    this.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, this.position.x));
    this.position.y = Math.max(bounds.minY, Math.min(bounds.maxY, this.position.y));
  }

  /**
   * Reset camera to default state
   */
  reset(): void {
    this.position = { x: 0, y: 0 };
    this.targetPosition = { x: 0, y: 0 };
    this.zoom = this.baseZoom;
    this.targetZoom = this.baseZoom;
  }

  /**
   * Get screen position from world position
   */
  worldToScreen(worldPos: Vector2D, screenWidth: number, screenHeight: number): Vector2D {
    return {
      x: (worldPos.x - this.position.x) * this.zoom + screenWidth / 2,
      y: (worldPos.y - this.position.y) * this.zoom + screenHeight / 2,
    };
  }

  /**
   * Get world position from screen position
   */
  screenToWorld(screenPos: Vector2D, screenWidth: number, screenHeight: number): Vector2D {
    return {
      x: (screenPos.x - screenWidth / 2) / this.zoom + this.position.x,
      y: (screenPos.y - screenHeight / 2) / this.zoom + this.position.y,
    };
  }
}

export interface DynamicCameraConfig {
  smoothingFactor?: number;
  zoomSmoothingFactor?: number;
  minZoom?: number;
  maxZoom?: number;
  baseZoom?: number;
  padding?: number;
  minDistance?: number;
  maxDistance?: number;
}

export interface FighterPosition {
  id: string;
  position: Vector2D;
  isActive: boolean;
}

export interface CameraBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

export interface CameraTransform {
  position: Vector2D;
  zoom: number;
  targetPosition: Vector2D;
  targetZoom: number;
}

export interface StageBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
