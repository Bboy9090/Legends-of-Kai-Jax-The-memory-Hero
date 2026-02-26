/**
 * Campaign districts — Raging City progression flow.
 * Aligned with backend layer_7_campaign and useRunner CampaignNodeId.
 */

import type { CampaignNodeId } from "./stores/useRunner";
import { getStoryMissionsByAct } from "./story_missions";

export interface CampaignDistrict {
  nodeId: CampaignNodeId;
  name: string;
  theme: string;
  region: string;
  act: number;
  /** Mission ids in this district (story missions). */
  missionIds: string[];
  isBoss: boolean;
  bossName?: string;
  description?: string;
}

/** Campaign flow: districts + boss nodes. */
export const CAMPAIGN_DISTRICTS: CampaignDistrict[] = [
  { nodeId: "start", name: "The Beginning", theme: "Awakening", region: "Raging City — Outskirts", act: 1, missionIds: [], isBoss: false, description: "Kai-Jax awakens with fragmented memories." },
  { nodeId: "district-1", name: "Ashblock Heights", theme: "Survival", region: "The City Teaches You to Bleed", act: 1, missionIds: ["act1-1", "act1-2"], isBoss: false, bossName: undefined },
  { nodeId: "district-2", name: "Undercity Veins", theme: "Gangs & Cults", region: "Memory is the Currency", act: 1, missionIds: ["act1-3", "act1-4"], isBoss: false },
  { nodeId: "district-3", name: "Stormward Spires", theme: "Sabertooth Truth", region: "First God's Domain", act: 1, missionIds: ["act1-5", "act1-6"], isBoss: false },
  { nodeId: "mid-boss", name: "Temple Guardian", theme: "First Trial", region: "Stormward Spires", act: 1, missionIds: ["act1-7"], isBoss: true, bossName: "Voltage Fang" },
  { nodeId: "district-4", name: "Memory Vaults", theme: "Erased History", region: "The Void Covenant", act: 2, missionIds: ["act1-8", "act1-9"], isBoss: false },
  { nodeId: "district-5", name: "Behemoth Scar", theme: "Endgame Threat", region: "The Scar", act: 2, missionIds: ["act1-10"], isBoss: false },
  { nodeId: "final-boss", name: "The Crown Moment", theme: "Ninth Tail", region: "Memory Throne", act: 3, missionIds: ["act1-10"], isBoss: true, bossName: "Ashen Tiger" },
];

/** Get district by node id. */
export function getDistrictByNodeId(nodeId: CampaignNodeId): CampaignDistrict | undefined {
  return CAMPAIGN_DISTRICTS.find((d) => d.nodeId === nodeId);
}

/** Get all mission ids for a district. */
export function getMissionIdsForDistrict(nodeId: CampaignNodeId): string[] {
  const d = getDistrictByNodeId(nodeId);
  return d?.missionIds ?? [];
}

/** Get story missions that belong to a district (by mission id). */
export function getMissionsForDistrict(nodeId: CampaignNodeId) {
  const ids = getMissionIdsForDistrict(nodeId);
  const allMissions = [...getStoryMissionsByAct(1), ...getStoryMissionsByAct(2), ...getStoryMissionsByAct(3)];
  return allMissions.filter((m) => ids.includes(m.id));
}
