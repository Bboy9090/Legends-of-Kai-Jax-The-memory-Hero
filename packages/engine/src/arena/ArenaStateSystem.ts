/**
 * OMEGA PROTOCOL: ARENA STATE SYSTEM
 * 
 * First-class arena modifiers enabling:
 * - Destructible props with fracture states
 * - Reality Pin Zones (Boryx Zenith's anchor mechanic)
 * - Gravity shifts and floor changes
 * - Environmental storytelling through destruction
 * 
 * "Arena modifiers are no longer boss-only hacks."
 * "The arena tells the story now, not just the UI."
 */

import { Vector2D } from '@beast-kin/shared';

export interface ArenaState {
  id: string;
  name: string;
  bounds: ArenaBounds;
  props: ArenaProp[];
  hazards: ArenaHazard[];
  pinZones: RealityPinZone[];
  gravityModifiers: GravityModifier[];
  floorState: FloorState;
  destructionLevel: number; // 0-100, affects visuals
  activeEvents: ArenaEvent[];
}

export interface ArenaBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  blastZones: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
}

export interface ArenaProp {
  id: string;
  type: PropType;
  position: Vector2D;
  size: { width: number; height: number; depth: number };
  health: number;
  maxHealth: number;
  fractureState: FractureState;
  collision: CollisionState;
  destructible: boolean;
  affectsMovement: boolean;
  visualStyle: PropVisualStyle;
}

export type PropType = 'pillar' | 'platform' | 'wall' | 'debris' | 'crystal' | 'statue' | 'barrier';

export type FractureState = 'intact' | 'cracked' | 'fractured' | 'destroyed';

export type CollisionState = 'solid' | 'passthrough' | 'one_way' | 'none';

export interface PropVisualStyle {
  baseColor: string;
  fractureColor: string;
  emissive: boolean;
  emissiveColor?: string;
  particleOnDestroy: string;
}

export interface ArenaHazard {
  id: string;
  type: HazardType;
  position: Vector2D;
  size: { width: number; height: number };
  active: boolean;
  damage: number;
  knockback: number;
  knockbackAngle: number;
  interval: number; // Frames between damage ticks
  duration: number; // -1 for permanent
  remainingDuration: number;
}

export type HazardType = 'void_zone' | 'fire' | 'electric' | 'gravity_well' | 'spike' | 'laser';

export interface RealityPinZone {
  id: string;
  creatorId: string;
  position: Vector2D;
  radius: number;
  strength: number; // 0-1, affects knockback/movement reduction
  duration: number; // Frames remaining
  maxDuration: number;
  decayRate: number;
  color: string;
  active: boolean;
  
  // Effects applied within zone
  effects: PinZoneEffect[];
}

export interface PinZoneEffect {
  type: 'knockback_reduction' | 'movement_slow' | 'gravity_increase' | 'damage_reduction';
  value: number; // Multiplier
}

export interface GravityModifier {
  id: string;
  position: Vector2D;
  radius: number;
  gravityMultiplier: number;
  direction?: Vector2D; // Custom gravity direction (null = down)
  duration: number;
  active: boolean;
}

export interface FloorState {
  type: FloorType;
  friction: number;
  stability: number; // Affects landing lag and footing
  crumbling: boolean;
  crumbleProgress: number; // 0-100
  sections: FloorSection[];
}

export type FloorType = 'solid' | 'crumbling' | 'ice' | 'conveyor' | 'trampoline';

export interface FloorSection {
  id: string;
  startX: number;
  endX: number;
  type: FloorType;
  intact: boolean;
  fallTimer: number; // Frames until section falls
}

export interface ArenaEvent {
  id: string;
  type: ArenaEventType;
  triggeredAt: number;
  duration: number;
  data: Record<string, unknown>;
  completed: boolean;
}

export type ArenaEventType = 
  | 'prop_destroy'
  | 'hazard_spawn'
  | 'floor_collapse'
  | 'pin_zone_create'
  | 'gravity_shift'
  | 'full_reset';

export class ArenaStateSystem {
  private currentState: ArenaState;
  private eventQueue: ArenaEvent[] = [];
  private frameCount: number = 0;
  
  constructor(initialState: ArenaState) {
    this.currentState = initialState;
  }
  
  /**
   * Main update loop
   */
  update(deltaTime: number): ArenaUpdateResult {
    this.frameCount++;
    const result: ArenaUpdateResult = {
      propsDestroyed: [],
      hazardsTriggered: [],
      pinZonesExpired: [],
      floorsCollapsed: [],
      eventsProcessed: [],
    };
    
    // Update props
    this.updateProps(result);
    
    // Update hazards
    this.updateHazards(deltaTime, result);
    
    // Update pin zones
    this.updatePinZones(deltaTime, result);
    
    // Update floor state
    this.updateFloor(deltaTime, result);
    
    // Process event queue
    this.processEvents(result);
    
    // Update destruction level
    this.calculateDestructionLevel();
    
    return result;
  }
  
  /**
   * Apply damage to a prop
   */
  damageProp(propId: string, damage: number): PropDamageResult | null {
    const prop = this.currentState.props.find(p => p.id === propId);
    if (!prop || !prop.destructible) return null;
    
    prop.health -= damage;
    
    // Update fracture state
    const healthPercent = prop.health / prop.maxHealth;
    if (healthPercent <= 0) {
      prop.fractureState = 'destroyed';
      prop.collision = 'none';
      this.queueEvent('prop_destroy', { propId, position: prop.position });
    } else if (healthPercent <= 0.3) {
      prop.fractureState = 'fractured';
    } else if (healthPercent <= 0.6) {
      prop.fractureState = 'cracked';
    }
    
    return {
      propId,
      newHealth: prop.health,
      fractureState: prop.fractureState,
      destroyed: prop.fractureState === 'destroyed',
    };
  }
  
  /**
   * Create a reality pin zone (Boryx Zenith mechanic)
   */
  createPinZone(
    creatorId: string,
    position: Vector2D,
    radius: number,
    strength: number,
    duration: number
  ): RealityPinZone {
    // Check for overlapping zones - cannot overlap
    const hasOverlap = this.currentState.pinZones.some(zone => {
      if (!zone.active) return false;
      const distance = Math.sqrt(
        Math.pow(zone.position.x - position.x, 2) +
        Math.pow(zone.position.y - position.y, 2)
      );
      return distance < zone.radius + radius;
    });
    
    if (hasOverlap) {
      // Reduce radius to prevent overlap
      radius = radius * 0.5;
    }
    
    const zone: RealityPinZone = {
      id: `pin_${this.frameCount}_${creatorId}`,
      creatorId,
      position: { ...position },
      radius,
      strength: Math.min(strength, 0.8), // Cap strength to prevent stalemates
      duration,
      maxDuration: duration,
      decayRate: 0.02, // Aggressive decay
      color: '#F6C177', // Boryx color
      active: true,
      effects: [
        { type: 'knockback_reduction', value: 1 - strength * 0.5 },
        { type: 'movement_slow', value: 1 - strength * 0.3 },
      ],
    };
    
    this.currentState.pinZones.push(zone);
    this.queueEvent('pin_zone_create', { zone });
    
    return zone;
  }
  
  /**
   * Check if position is within any pin zone and get effects
   */
  getPinZoneEffects(position: Vector2D): PinZoneEffect[] {
    const effects: PinZoneEffect[] = [];
    
    for (const zone of this.currentState.pinZones) {
      if (!zone.active) continue;
      
      const distance = Math.sqrt(
        Math.pow(zone.position.x - position.x, 2) +
        Math.pow(zone.position.y - position.y, 2)
      );
      
      if (distance <= zone.radius) {
        // Scale effects by distance from center
        const distanceScale = 1 - (distance / zone.radius);
        effects.push(...zone.effects.map(e => ({
          ...e,
          value: e.type.includes('reduction') || e.type.includes('slow')
            ? e.value + (1 - e.value) * (1 - distanceScale) // Less effect at edges
            : e.value * distanceScale,
        })));
      }
    }
    
    return effects;
  }
  
  /**
   * Spawn a hazard
   */
  spawnHazard(
    type: HazardType,
    position: Vector2D,
    size: { width: number; height: number },
    damage: number,
    duration: number = -1
  ): ArenaHazard {
    const hazard: ArenaHazard = {
      id: `hazard_${this.frameCount}_${type}`,
      type,
      position: { ...position },
      size,
      active: true,
      damage,
      knockback: damage * 0.5,
      knockbackAngle: -90, // Up
      interval: 30, // Every 0.5s at 60fps
      duration,
      remainingDuration: duration,
    };
    
    this.currentState.hazards.push(hazard);
    this.queueEvent('hazard_spawn', { hazard });
    
    return hazard;
  }
  
  /**
   * Collapse a floor section
   */
  collapseFloorSection(sectionId: string, delay: number = 60): void {
    const section = this.currentState.floorState.sections.find(s => s.id === sectionId);
    if (section && section.intact) {
      section.fallTimer = delay;
      this.currentState.floorState.crumbling = true;
    }
  }
  
  /**
   * Apply gravity modifier
   */
  applyGravityModifier(
    position: Vector2D,
    radius: number,
    multiplier: number,
    duration: number,
    direction?: Vector2D
  ): GravityModifier {
    const modifier: GravityModifier = {
      id: `gravity_${this.frameCount}`,
      position: { ...position },
      radius,
      gravityMultiplier: multiplier,
      direction,
      duration,
      active: true,
    };
    
    this.currentState.gravityModifiers.push(modifier);
    this.queueEvent('gravity_shift', { modifier });
    
    return modifier;
  }
  
  /**
   * Get gravity at position
   */
  getGravityAt(position: Vector2D): { multiplier: number; direction: Vector2D } {
    let totalMultiplier = 1.0;
    let customDirection: Vector2D | null = null;
    
    for (const modifier of this.currentState.gravityModifiers) {
      if (!modifier.active) continue;
      
      const distance = Math.sqrt(
        Math.pow(modifier.position.x - position.x, 2) +
        Math.pow(modifier.position.y - position.y, 2)
      );
      
      if (distance <= modifier.radius) {
        const influence = 1 - (distance / modifier.radius);
        totalMultiplier *= (1 + (modifier.gravityMultiplier - 1) * influence);
        
        if (modifier.direction) {
          customDirection = modifier.direction;
        }
      }
    }
    
    return {
      multiplier: totalMultiplier,
      direction: customDirection ?? { x: 0, y: 1 },
    };
  }
  
  /**
   * Get floor friction at position
   */
  getFloorFrictionAt(positionX: number): number {
    const section = this.currentState.floorState.sections.find(
      s => s.startX <= positionX && s.endX >= positionX && s.intact
    );
    
    if (!section) return 1.0;
    
    switch (section.type) {
      case 'ice': return 0.3;
      case 'conveyor': return 1.5;
      case 'crumbling': return 0.8;
      default: return this.currentState.floorState.friction;
    }
  }
  
  // Private update methods
  
  private updateProps(result: ArenaUpdateResult): void {
    for (const prop of this.currentState.props) {
      if (prop.fractureState === 'destroyed' && prop.collision !== 'none') {
        prop.collision = 'none';
        result.propsDestroyed.push(prop.id);
      }
    }
  }
  
  private updateHazards(deltaTime: number, result: ArenaUpdateResult): void {
    for (const hazard of this.currentState.hazards) {
      if (!hazard.active) continue;
      
      if (hazard.duration > 0) {
        hazard.remainingDuration -= 1;
        if (hazard.remainingDuration <= 0) {
          hazard.active = false;
        }
      }
    }
    
    // Clean up inactive hazards
    this.currentState.hazards = this.currentState.hazards.filter(h => h.active);
  }
  
  private updatePinZones(deltaTime: number, result: ArenaUpdateResult): void {
    for (const zone of this.currentState.pinZones) {
      if (!zone.active) continue;
      
      // Decay
      zone.strength = Math.max(0, zone.strength - zone.decayRate);
      zone.duration -= 1;
      
      if (zone.duration <= 0 || zone.strength <= 0) {
        zone.active = false;
        result.pinZonesExpired.push(zone.id);
      }
      
      // Update effect values based on current strength
      for (const effect of zone.effects) {
        if (effect.type === 'knockback_reduction') {
          effect.value = 1 - zone.strength * 0.5;
        } else if (effect.type === 'movement_slow') {
          effect.value = 1 - zone.strength * 0.3;
        }
      }
    }
    
    // Clean up inactive zones
    this.currentState.pinZones = this.currentState.pinZones.filter(z => z.active);
  }
  
  private updateFloor(deltaTime: number, result: ArenaUpdateResult): void {
    for (const section of this.currentState.floorState.sections) {
      if (section.fallTimer > 0) {
        section.fallTimer -= 1;
        if (section.fallTimer <= 0) {
          section.intact = false;
          result.floorsCollapsed.push(section.id);
          this.queueEvent('floor_collapse', { sectionId: section.id });
        }
      }
    }
    
    // Update crumbling state
    this.currentState.floorState.crumbling = this.currentState.floorState.sections.some(
      s => s.fallTimer > 0
    );
  }
  
  private processEvents(result: ArenaUpdateResult): void {
    for (const event of this.eventQueue) {
      if (!event.completed) {
        this.currentState.activeEvents.push(event);
        event.completed = true;
        result.eventsProcessed.push(event);
      }
    }
    
    this.eventQueue = [];
    
    // Clean up old completed events
    this.currentState.activeEvents = this.currentState.activeEvents.filter(
      e => this.frameCount - e.triggeredAt < e.duration
    );
  }
  
  private queueEvent(type: ArenaEventType, data: Record<string, unknown>): void {
    this.eventQueue.push({
      id: `event_${this.frameCount}_${type}`,
      type,
      triggeredAt: this.frameCount,
      duration: 60, // 1 second visibility
      data,
      completed: false,
    });
  }
  
  private calculateDestructionLevel(): void {
    const props = this.currentState.props;
    const totalProps = props.length;
    const destroyedProps = props.filter(p => p.fractureState === 'destroyed').length;
    const damagedProps = props.filter(p => p.fractureState !== 'intact').length;
    
    const floorDamage = this.currentState.floorState.sections.filter(s => !s.intact).length /
      Math.max(1, this.currentState.floorState.sections.length);
    
    this.currentState.destructionLevel = Math.min(100,
      (destroyedProps / Math.max(1, totalProps)) * 60 +
      (damagedProps / Math.max(1, totalProps)) * 20 +
      floorDamage * 20
    );
  }
  
  // Getters
  
  getState(): ArenaState {
    return this.currentState;
  }
  
  getDestructionLevel(): number {
    return this.currentState.destructionLevel;
  }
  
  getProp(propId: string): ArenaProp | undefined {
    return this.currentState.props.find(p => p.id === propId);
  }
  
  getActivePinZones(): RealityPinZone[] {
    return this.currentState.pinZones.filter(z => z.active);
  }
  
  getActiveHazards(): ArenaHazard[] {
    return this.currentState.hazards.filter(h => h.active);
  }
}

export interface ArenaUpdateResult {
  propsDestroyed: string[];
  hazardsTriggered: string[];
  pinZonesExpired: string[];
  floorsCollapsed: string[];
  eventsProcessed: ArenaEvent[];
}

export interface PropDamageResult {
  propId: string;
  newHealth: number;
  fractureState: FractureState;
  destroyed: boolean;
}

/**
 * Factory function to create a standard arena state
 */
export function createStandardArena(id: string, name: string): ArenaState {
  return {
    id,
    name,
    bounds: {
      left: -15,
      right: 15,
      top: -10,
      bottom: 5,
      blastZones: {
        left: -25,
        right: 25,
        top: -20,
        bottom: 15,
      },
    },
    props: [
      {
        id: 'pillar_left',
        type: 'pillar',
        position: { x: -10, y: 0 },
        size: { width: 2, height: 8, depth: 2 },
        health: 100,
        maxHealth: 100,
        fractureState: 'intact',
        collision: 'solid',
        destructible: true,
        affectsMovement: true,
        visualStyle: {
          baseColor: '#4A5568',
          fractureColor: '#2D3748',
          emissive: false,
          particleOnDestroy: 'debris',
        },
      },
      {
        id: 'pillar_right',
        type: 'pillar',
        position: { x: 10, y: 0 },
        size: { width: 2, height: 8, depth: 2 },
        health: 100,
        maxHealth: 100,
        fractureState: 'intact',
        collision: 'solid',
        destructible: true,
        affectsMovement: true,
        visualStyle: {
          baseColor: '#4A5568',
          fractureColor: '#2D3748',
          emissive: false,
          particleOnDestroy: 'debris',
        },
      },
      {
        id: 'platform_center',
        type: 'platform',
        position: { x: 0, y: -4 },
        size: { width: 6, height: 0.5, depth: 4 },
        health: 150,
        maxHealth: 150,
        fractureState: 'intact',
        collision: 'one_way',
        destructible: true,
        affectsMovement: true,
        visualStyle: {
          baseColor: '#718096',
          fractureColor: '#4A5568',
          emissive: true,
          emissiveColor: '#63B3ED',
          particleOnDestroy: 'energy_burst',
        },
      },
    ],
    hazards: [],
    pinZones: [],
    gravityModifiers: [],
    floorState: {
      type: 'solid',
      friction: 1.0,
      stability: 1.0,
      crumbling: false,
      crumbleProgress: 0,
      sections: [
        { id: 'floor_left', startX: -15, endX: -5, type: 'solid', intact: true, fallTimer: 0 },
        { id: 'floor_center', startX: -5, endX: 5, type: 'solid', intact: true, fallTimer: 0 },
        { id: 'floor_right', startX: 5, endX: 15, type: 'solid', intact: true, fallTimer: 0 },
      ],
    },
    destructionLevel: 0,
    activeEvents: [],
  };
}
