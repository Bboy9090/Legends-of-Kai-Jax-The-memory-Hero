import { Mission } from './types';
/**
 * Complete Mission Registry - 100 Missions
 * Organized into 10 Books with 10 Missions each
 */
export declare const MISSION_REGISTRY: Mission[];
/**
 * Get mission by ID
 */
export declare function getMissionById(id: number): Mission | undefined;
/**
 * Get missions by book
 */
export declare function getMissionsByBook(book: number): Mission[];
/**
 * Get all missions
 */
export declare function getAllMissions(): Mission[];
/**
 * Get available missions (prerequisites met, not completed)
 */
export declare function getAvailableMissions(completedMissionIds: number[]): Mission[];
//# sourceMappingURL=registry.d.ts.map