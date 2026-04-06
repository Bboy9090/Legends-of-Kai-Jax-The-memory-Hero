import type { CampaignNodeId } from "../../lib/stores/useRunner";

export interface EncounterSpec {
  id: string;
  label: string;
  minionCount: number;
  includeBoss: boolean;
  tierScale: number;
}

export interface DistrictRoamMeta {
  id: CampaignNodeId;
  name: string;
  theme: string;
  encounters: EncounterSpec[];
  rewards: { xp: number; currency: number };
}
