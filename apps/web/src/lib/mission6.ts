/** Mission 6: canonical, individually recoverable memory nodes. No simulated rescues. */
export const MISSION6_ID = "story_act2_m6";
export const MEMORY_INTERACT_RANGE = 3.25;

export interface TrappedMemory {
  id: "ashblock_memory_1" | "ashblock_memory_2" | "ashblock_memory_3";
  label: string;
  posX: number;
  posZ: number;
  unlockAfterDefeats: number;
  unlocked: boolean;
  rescued: boolean;
}

const NODES: Omit<TrappedMemory, "unlocked" | "rescued">[] = [
  { id: "ashblock_memory_1", label: "North Memory", posX: -5, posZ: 4, unlockAfterDefeats: 2 },
  { id: "ashblock_memory_2", label: "East Memory", posX: 7, posZ: 1, unlockAfterDefeats: 4 },
  { id: "ashblock_memory_3", label: "South Memory", posX: 0, posZ: -7, unlockAfterDefeats: 6 },
];
export const freshMission6Memories = (missionId: string | null): TrappedMemory[] =>
  missionId === MISSION6_ID ? NODES.map(node => ({ ...node, unlocked: false, rescued: false })) : [];

export function isMemoryInRange(node: TrappedMemory, x: number, z: number): boolean {
  return Math.hypot(node.posX - x, node.posZ - z) <= MEMORY_INTERACT_RANGE;
}

export function unlockMission6Memories(nodes: TrappedMemory[], defeated: number): TrappedMemory[] {
  return nodes.map(node => ({ ...node, unlocked: node.unlocked || defeated >= node.unlockAfterDefeats }));
}

export function hasRescuedAllMission6Memories(nodes: TrappedMemory[]): boolean {
  return nodes.length === 3 && nodes.every(node => node.rescued);
}

/** Standard Gamepad mapping: left shoulder (LB / L1). */
export const MISSION6_RESCUE_GAMEPAD_BUTTON = 4;

export function findRecoverableMemory(nodes: TrappedMemory[], x: number, z: number): TrappedMemory | undefined {
  return nodes.find(node => node.unlocked && !node.rescued && isMemoryInRange(node, x, z));
}

/** Rising edge only: holding LB never repeats or rescues multiple nodes. */
export function isGamepadRescueEdge(pressed: boolean, previouslyPressed: boolean): boolean {
  return pressed && !previouslyPressed;
}
