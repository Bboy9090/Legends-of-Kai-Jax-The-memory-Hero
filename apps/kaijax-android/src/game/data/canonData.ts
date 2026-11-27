import { DistrictInfo, TraversalTier } from '../types';

export interface HeritageInfo {
  id: string;
  name: string;
  aspect: string;
  color: string;
  description: string;
  canonSource: string;
}

export interface FamilyFigure {
  name: string;
  title: string;
  speciesOrRole: string;
  heritageLink: string;
  description: string;
}

export interface BossProfile {
  name: string;
  district: string;
  faction: string;
  status: 'Active in Vertical Slice' | 'Campaign Expansion';
  mechanics: string;
}

export const TRAVERSAL_PROGRESSION: {
  tier: TraversalTier;
  unlockNote: string;
  description: string;
}[] = [
  {
    tier: 'Apex Street',
    unlockNote: 'Starting State',
    description: 'High-speed urban sprint, vaulting, ledge grabs, and rooftop climbing across Ashblock alleys.',
  },
  {
    tier: 'Web Evade',
    unlockNote: 'Mission 1 · Early',
    description: 'Snap-line evade and instant lateral dodge cancelling grounded combos.',
  },
  {
    tier: 'Chain Reposition',
    unlockNote: 'Mission 1 · Mid',
    description: 'Multi-target zip repositioning and wall-run chained momentum across vertical facades.',
  },
  {
    tier: 'Web Swing',
    unlockNote: 'Mission 1 · Alley Approach',
    description: 'Pendulum web swinging from crane booms and overhead steel trusses with assisted momentum.',
  },
  {
    tier: 'Memory Step',
    unlockNote: 'Unlocked with Memory Reconstruction',
    description: 'Phase-step along reconstructed Myrr\'Kai memory threads to bridge gaps and counter ambushes.',
  },
];

export const FOUR_HERITAGES: HeritageInfo[] = [
  {
    id: 'myrrkai',
    name: 'Myrr\'Kai',
    aspect: 'Memory',
    color: '#8B5CF6',
    description: 'Memory reconstruction, hidden history, perception, and identity. Anchors Kai\'s Memory Weave and reveals erased truth.',
    canonSource: 'Confirmed Canon',
  },
  {
    id: 'pyraxis',
    name: 'Pyraxis',
    aspect: 'Sacrifice and Ember',
    color: '#F97316',
    description: 'Fire, venom, sacrifice, and the cost of power. Fuels Web of Pyraxis and Ember Venom strikes.',
    canonSource: 'Confirmed Canon',
  },
  {
    id: 'karvoth',
    name: 'Kar-Voth',
    aspect: 'Hunger and Storm',
    color: '#38BDF8',
    description: 'Storm pressure, overwhelming force, survival, and destructive potential. Surges through Jax\'s Storm Mane.',
    canonSource: 'Confirmed Canon',
  },
  {
    id: 'thryxen',
    name: 'Thryxen',
    aspect: 'Law and Sovereignty',
    color: '#D4AF37',
    description: 'Predatory awareness, discipline, control, and authority.Sharpens threat detection and counter timing.',
    canonSource: 'Confirmed Canon',
  },
];

export const FAMILY_AND_MENTORS: FamilyFigure[] = [
  {
    name: 'Bovar',
    title: 'Adoptive Father',
    speciesOrRole: 'Guardian & Anchor in Ashblock Heights',
    heritageLink: 'Foundational Survival',
    description: 'Raised Kai and Jax in the lower tiers of the Raging City, instilling loyalty and warning them against the Fang Syndicate.',
  },
  {
    name: 'Boryn',
    title: 'Protector & Mentor',
    speciesOrRole: 'Sabertooth Tiger',
    heritageLink: 'Pyraxis / Protective Discipline',
    description: 'Fierce protector whose discipline shields the brothers while teaching them to bear the weight of their bloodlines.',
  },
  {
    name: 'Borax',
    title: 'Warden of Order',
    speciesOrRole: 'Sabertooth Lion',
    heritageLink: 'Thryxen (Law & Sovereignty)',
    description: 'Associated with rigid law, sovereignty, and the coming reckoning in Zenith Spires.',
  },
];

export const DISTRICTS: DistrictInfo[] = [
  {
    id: 'ashblock-heights',
    order: 1,
    name: 'Ashblock Heights',
    act: 'Act I — Age of Protection',
    bossName: 'Fang Enforcer',
    heritageFocus: 'Myrr\'Kai & Kar-Voth Awakening',
    status: 'playable',
    summary: 'Dense brutalist tenements, rain-slick alleys, fire escapes, and elevated crane spans currently locked down by the Fang Syndicate.',
    hazards: ['Syndicate Shock Barricades', 'Disrupted Memory Rift', 'Rooftop Ambush Chokepoints'],
  },
  {
    id: 'sector-7',
    order: 2,
    name: 'Sector-7',
    act: 'Act I — Age of Protection',
    bossName: 'Architect Scout',
    heritageFocus: 'Thryxen Surveillance & Escape',
    status: 'upcoming',
    summary: 'Industrial freight corridors and automated rail spans patrolled by reconnaissance constructs.',
    hazards: ['Automated Searchlights', 'Moving Freight Platforms'],
  },
  {
    id: 'neon-ward',
    order: 3,
    name: 'Neon Ward',
    act: 'Act II — Age of Law',
    bossName: 'Neon Prince',
    heritageFocus: 'Pyraxis & Urban Deception',
    status: 'upcoming',
    summary: 'Vertical holographic market towers where faction influence is bought with memory shards.',
    hazards: ['Illusion Billboards', 'High-Voltage Conduit Drops'],
  },
  {
    id: 'iron-market',
    order: 4,
    name: 'Iron Market',
    act: 'Act II — Age of Law',
    bossName: 'Blood Broker',
    heritageFocus: 'Kar-Voth & Debt Enforcement',
    status: 'upcoming',
    summary: 'Smuggler foundries and black-market relic vaults beneath rusted gantries.',
    hazards: ['Molten Slag Channels', 'Armored Syndicate Enforcers'],
  },
  {
    id: 'undercrown',
    order: 5,
    name: 'Undercrown',
    act: 'Act II — Age of Law',
    bossName: 'Undercrown Sentinel',
    heritageFocus: 'Buried History',
    status: 'upcoming',
    summary: 'Flooded old-world transit tunnels holding pre-city ruins and dormant wards.',
    hazards: ['Subterranean Surge Currents', 'Collapsing Vault Pillars'],
  },
  {
    id: 'zenith-spires',
    order: 6,
    name: 'Zenith Spires',
    act: 'Act II — Age of Law',
    bossName: 'Borax Zenith',
    heritageFocus: 'Thryxen Law vs. Brotherhood',
    status: 'upcoming',
    summary: 'High-altitude citadels enforcing cold sovereignty above the smog line.',
    hazards: ['Gale Crosswinds', 'Sovereign Judgment Fields'],
  },
  {
    id: 'erasure-fields',
    order: 7,
    name: 'Erasure Fields',
    act: 'Act III — Age of Memory',
    bossName: 'Erasure Choir',
    heritageFocus: 'Memory Preservation',
    status: 'upcoming',
    summary: 'Reality-scarred plains where unanchored memories dissolve into static.',
    hazards: ['Amnesia Resonance Pulses', 'Memory-Corrupted Husks'],
  },
  {
    id: 'memory-nexus',
    order: 8,
    name: 'Memory Nexus',
    act: 'Act III — Age of Memory',
    bossName: 'Hollow Architect',
    heritageFocus: 'Convergence of All Four Powers',
    status: 'upcoming',
    summary: 'The mythic nexus beneath the Raging City where Kai-Jax confronts the erasure of their lineage.',
    hazards: ['Temporal Thread Fractures', 'Architect Reality Shifts'],
  },
];

export const BOSS_ROSTER: BossProfile[] = [
  {
    name: 'Fang Enforcer',
    district: 'Ashblock Heights',
    faction: 'Fang Syndicate',
    status: 'Active in Vertical Slice',
    mechanics: 'Armored war-hammer juggernaut. Phase 1 uses telegraphed overhead slams and bull rushes; Phase 2 ignites shockwave fissures requiring dodge/parry windows and Kai-Jax convergence.',
  },
  {
    name: 'Blood Broker',
    district: 'Iron Market',
    faction: 'Iron Syndicate',
    status: 'Campaign Expansion',
    mechanics: 'Siphoning twin-glaive duelist who weaponizes stolen relic charges.',
  },
  {
    name: 'Architect Scout',
    district: 'Sector-7',
    faction: 'The Architect Vanguard',
    status: 'Campaign Expansion',
    mechanics: 'High-altitude drone-tethered sniper forcing Web Swing pursuit.',
  },
  {
    name: 'Neon Prince',
    district: 'Neon Ward',
    faction: 'Neon Court',
    status: 'Campaign Expansion',
    mechanics: 'Afterimage decoys countered by Kai\'s Memory Weave.',
  },
  {
    name: 'Undercrown Sentinel',
    district: 'Undercrown',
    faction: 'Old-World Wardens',
    status: 'Campaign Expansion',
    mechanics: 'Ancient stone-and-alloy colossus guarding subterranean memory vaults.',
  },
  {
    name: 'Borax Zenith',
    district: 'Zenith Spires',
    faction: 'Thryxen Sovereignty',
    status: 'Campaign Expansion',
    mechanics: 'Relentless law-bound lion warrior testing parry mastery and brother synergy.',
  },
  {
    name: 'Erasure Choir',
    district: 'Erasure Fields',
    faction: 'The Unremembered',
    status: 'Campaign Expansion',
    mechanics: 'Multi-voice acoustic resonance encounter disrupting HUD and memory threads.',
  },
  {
    name: 'Hollow Architect',
    district: 'Memory Nexus',
    faction: 'Nexus Singularity',
    status: 'Campaign Expansion',
    mechanics: 'Climax encounter reshaping the arena between erased and restored timelines.',
  },
];

export const CANON_AUDIT_NOTES = [
  {
    topic: 'Repository Manuscripts & Concept Art',
    status: 'Unavailable in Workspace',
    detail: 'No book manuscript files or reference image assets were supplied in the workspace directory. Confirmed canon is derived strictly from the Master Production Brief without fabricating book quotes.',
  },
  {
    topic: 'Kai-Jax Three-Tail Rule',
    status: 'Strictly Enforced',
    detail: 'The fused form Kai-Jax manifests strictly three primary physical tails (Ember, Storm, Memory). Nine-domain progression unlocks radiant Energy Domains rather than extra physical tails.',
  },
  {
    topic: 'Canon-Gated Fusion',
    status: 'Strictly Enforced',
    detail: 'Kai-Jax fusion remains locked until the narrative climax of Mission 1 Phase 2 against the Fang Enforcer, then operates with gauge cost, duration, and cooldown.',
  },
  {
    topic: 'Gameplay Adaptations',
    status: 'Tagged Separately',
    detail: 'Supply crate drops, crafting material pickups, equipment stats, and post-mission District Patrol skirmishes are tagged as [GAMEPLAY ADAPTATION] to support ARPG progression.',
  },
];
