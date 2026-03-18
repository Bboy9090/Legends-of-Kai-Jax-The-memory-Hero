declare module "@beast-kin/shared/data/complete_beast_roster" {
  export interface CompleteBeastRosterEntry {
    id: string;
    beastHybrid?: string;
    visual: {
      primaryColor?: string;
      accentColor?: string;
      features?: string[];
    };
  }

  export const COMPLETE_BEAST_ROSTER: CompleteBeastRosterEntry[];
}

