/**
 * OPERATION KAI-JAX — P1-K PHASE 1: RAGING CITY 8-DISTRICT PRODUCTION SPECIFICATIONS
 *
 * Reconciled directly against:
 *   1. `/docs/CANON_BIBLE.md` (Three-Act Campaign, Five Beast-God Domains, Factions)
 *   2. `/src/game/data/canonData.ts` (`RAGING_CITY_DISTRICTS`)
 *   3. The 10 Official Environment Visual Library Sheets in `/public/assets/aistudio/`:
 *      - `f9d37a6e.png`: THE RAGING CITY — WORLD OVERVIEW
 *      - `d438c610.png`: ASHBLOCK HEIGHTS
 *      - `e05fb785.png`: IRONVEIN WARDS (Industrial Rail & Foundry)
 *      - `a43aff68.png`: SKYFALL SPINES (High-Altitude Gothic/Gold Spires)
 *      - `d2fb286b.png`: BLOODWARD LOFT (Boryn's Rooftop Dojo Sanctuary)
 *      - `16464786.png`: STORM RONIN SANCTUM (Borax's Upper-City Rose-Window Ruin)
 *      - `1f74b763.png`: LIBRARY OF THREADS (The World's Great Memory Archive)
 *      - `0e91caa6.png`: THE FRACTURE PIT & UNDERCITY (Service Tunnel Sector 7B)
 *      - `e5b27b30.png`: FANG SYNDICATE STRONGHOLD (Underground Arena & Neon Signage)
 *      - `fbb50f2d.png`: HOLLOW FANG CATHEDRAL (Anti-Sabertooth Covenant Purge Spire)
 *
 * Strict Source Transparency Rule:
 *   - Districts with dedicated titled Visual Library sheets are marked `visualAuthority: 'direct_visual_sheet'`.
 *   - Districts whose visual language is synthesized from adjacent/composite Visual Library sheets without a
 *     standalone sheet of that exact title (`neon-ward`, open-exterior `erasure-fields`) are explicitly marked
 *     `visualAuthority: 'composite_sheets_inferred'` so inferred camera angles are never misrepresented as canon plates.
 */

export type DistrictWavePriority =
  | 'Wave 1 — Active Playable 3D Reconstruction'
  | 'Wave 2 — Mid-Campaign Industrial & Market Production'
  | 'Wave 3 — Act II/III Apex & Finale Production';

export type DistrictVisualAuthority = 'direct_visual_sheet' | 'composite_sheets_inferred';

export interface DistrictProductionSpec {
  districtId: string;
  order: number;
  name: string;
  act: 'Act I — Age of Protection' | 'Act II — Age of Law' | 'Act III — Age of Memory';
  wavePriority: DistrictWavePriority;
  reconstructionState: 'reconstructed_3d_playable' | 'specified_ready_for_wave';
  visualAuthority: DistrictVisualAuthority;
  controllingVisualSheets: {
    file: string;
    sheetTitle: string;
    role: string;
  }[];
  inferredElementsDisclosure: string;
  architecturalStyle: string;
  dominantMaterials: string[];
  lightingMood: {
    timeOfDay: string;
    keyHex: string;
    fillHex: string;
    fogHex: string;
    accentEmissives: string[];
  };
  elevationStructure: {
    minElevationM: number;
    maxElevationM: number;
    tiers: string[];
  };
  traversalOpportunities: string[];
  combatArenaFootprints: {
    name: string;
    dimensionsM: [number, number];
    role: string;
  }[];
  interactiveObjects: string[];
  environmentalHazards: string[];
  storyLandmarks: string[];
  mobilePerformanceBudget: {
    maxSceneTriangles: number;
    maxDrawCalls: number;
    maxTextureAtlasBudgetMb: number;
    targetMinSpecFps: 30;
    targetPerformanceFps: 60;
  };
}

export const DISTRICT_PRODUCTION_SPECS: DistrictProductionSpec[] = [
  {
    districtId: 'ashblock-heights',
    order: 1,
    name: 'Ashblock Heights',
    act: 'Act I — Age of Protection',
    wavePriority: 'Wave 1 — Active Playable 3D Reconstruction',
    reconstructionState: 'reconstructed_3d_playable',
    visualAuthority: 'direct_visual_sheet',
    controllingVisualSheets: [
      {
        file: '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_26_PM__2__d438c610.png',
        sheetTitle: 'ASHBLOCK HEIGHTS',
        role: 'Primary controlling street, tenement, skybridge, water-tower, mural & dusk lighting authority',
      },
      {
        file: '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_26_PM__5__d2fb286b.png',
        sheetTitle: 'BLOODWARD LOFT',
        role: "Boryn's rooftop corrugated dojo sanctuary, makiwara posts & warm training interior on East Ashblock",
      },
      {
        file: '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_25_PM__1__f9d37a6e.png',
        sheetTitle: 'THE RAGING CITY',
        role: 'Elevated rail viaduct, Beast-Kin street-market awnings & layered sunset skyline context',
      },
      {
        file: '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_28_PM__9__e5b27b30.png',
        sheetTitle: 'FANG SYNDICATE STRONGHOLD',
        role: 'Syndicate shock-relay barricade & magenta/crimson blockade prop language',
      },
    ],
    inferredElementsDisclosure:
      'Rear courtyard layout behind the z = -48m Alley Gate and back-alley wall faces not visible in the front street angle of d438c610.png are extrapolated using the exact weathered brick, concrete cornice, and Syndicate barricade grammar of the approved plates.',
    architecturalStyle:
      'Multi-story weathered ochre & rust-brick working-class Beast-Kin tenements crowned by corrugated iron rooftop shanties, wooden stave water towers, exterior iron fire-escapes, and riveted steel pedestrian skybridges.',
    dominantMaterials: [
      'Weathered ochre & rust-red clay brick with recessed mortar',
      'Aged cast-concrete belt courses, parapets & wet Rain-Slicked basalt asphalt',
      'Rusted corrugated sheet iron & salvaged timber shanties',
      'Riveted structural steel skybridge trusses & wrought-iron fire escapes',
      'Crimson/ochre Beast-Kin canvas street-market awnings',
    ],
    lightingMood: {
      timeOfDay: 'Amber-violet golden dusk transitioning into storm-blue night shadow',
      keyHex: '#FFB067',
      fillHex: '#6E85B7',
      fogHex: '#231D30',
      accentEmissives: ['#FF9E44', '#A855F7', '#38BDF8', '#EF4444'],
    },
    elevationStructure: {
      minElevationM: 0.0,
      maxElevationM: 19.5,
      tiers: [
        'Tier 0 (0.0m): Rain-slicked main market street, tenement stoops & Boss Courtyard',
        'Tier 1 (3.1m – 8.9m): Mid-facade iron fire-escape landings & elevated rescue balconies',
        'Tier 2 (9.2m – 11.8m): Spanning riveted steel pedestrian skybridges & structural web-anchor collars',
        'Tier 3 (15.6m – 19.5m): Tenement rooftops, Bloodward Loft dojo perch & wooden stave water towers',
      ],
    },
    traversalOpportunities: [
      'Geometry-attached pendulum web-swinging from overhead steel skybridge trusses (z = -21m, -33m, -44m, -66m)',
      'Web-zip perch launches onto rooftop water-tower hoist davits and fire-escape balconies',
      'Wall-run vertical boosts up shear concrete tenement flanks',
      "Jax Storm-Step midair lightning dashes across East/West rooftop gaps to Boryn's Bloodward Loft",
    ],
    combatArenaFootprints: [
      {
        name: 'Stage 0–1 Market Row & East Rescue Alley',
        dimensionsM: [30, 28],
        role: 'Opening 3-enemy free-flow street encounter with unobstructed sightlines & Syndicate Relay #1/#2',
      },
      {
        name: 'Stage 3 Syndicate Blockade Plaza',
        dimensionsM: [32, 16],
        role: 'Pre-gate heavy skirmish beneath the z = -44m steel skybridge with wall-pin concrete piers',
      },
      {
        name: 'Stage 4 Fang Enforcer Boss Courtyard',
        dimensionsM: [34, 34],
        role: 'Dedicated 34m x 34m boss arena centered at (0, 0, -72) framed by perimeter skybridges, water towers & dual Syndicate Arc Relays',
      },
    ],
    interactiveObjects: [
      '4 Fang Syndicate High-Voltage Arc Relays (Interactive Environmental Takedown pylons)',
      '2 Trapped Ashblock Civilian Rescue Encounters (West Stoop & Elevated East Balcony)',
      'Echoing Memory Site Shrine (z = -38m East Alley)',
      'Reinforced Syndicate Alley Gate (z = -48m)',
      'Boryn & Borax Mentor Dialogue Perches',
    ],
    environmentalHazards: [
      'Syndicate Shock Barricades & High-Voltage Arc Relays',
      'Crumbling rooftop shanty edges & vertical drop lanes',
    ],
    storyLandmarks: [
      'Bloodward Loft Rooftop Dojo ("A protector does not fight for glory. He fights so others can dream.")',
      '"THE MEMORY — REMEMBER WHAT THEY TRIED TO ERASE!" mural wall',
      '"STRENGTH THROUGH UNITY" sentinel facade mural & Covenant "TRUST — WE SEE YOU" surveillance billboard',
      'Distant Horizon Monoliths of the Ancient Beast-Gods',
    ],
    mobilePerformanceBudget: {
      maxSceneTriangles: 48000,
      maxDrawCalls: 95,
      maxTextureAtlasBudgetMb: 24,
      targetMinSpecFps: 30,
      targetPerformanceFps: 60,
    },
  },
  {
    districtId: 'sector-7',
    order: 2,
    name: 'Sector-7',
    act: 'Act I — Age of Protection',
    wavePriority: 'Wave 2 — Mid-Campaign Industrial & Market Production',
    reconstructionState: 'specified_ready_for_wave',
    visualAuthority: 'direct_visual_sheet',
    controllingVisualSheets: [
      {
        file: '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_26_PM__3__e05fb785.png',
        sheetTitle: 'IRONVEIN WARDS — RAGING CITY INDUSTRIAL DISTRICT',
        role: 'Steam freight rail viaducts, overhead gantry cranes, coal-smoke stacks & riveted ironwork',
      },
      {
        file: '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_27_PM__8__0e91caa6.png',
        sheetTitle: 'THE FRACTURE PIT & UNDERCITY (SERVICE TUNNEL SECTOR 7B)',
        role: 'Sub-grade Sector 7B transit service tunnels, derailed tram cars & storm-arc conduits',
      },
    ],
    inferredElementsDisclosure:
      'Transition ramps between the upper Ironvein freight rail yards (e05fb785.png) and lower Service Tunnel Sector 7B (0e91caa6.png) are architecturally bridged via industrial freight elevators.',
    architecturalStyle:
      'Heavy riveted steel rail yards, elevated steam-locomotive viaducts, gantry crane bays, and sub-surface Sector 7B transit tunnels.',
    dominantMaterials: [
      'Blackened riveted boiler steel & oil-stained concrete',
      'Slag-glowing foundry grates & rusted rail tracks',
      'High-voltage ceramic insulators & storm-blue conduit pipes',
    ],
    lightingMood: {
      timeOfDay: 'Coal-haze industrial twilight pierced by furnace orange & storm-blue rail arcs',
      keyHex: '#F97316',
      fillHex: '#3B82F6',
      fogHex: '#1E1B22',
      accentEmissives: ['#FB923C', '#38BDF8'],
    },
    elevationStructure: {
      minElevationM: -12.0,
      maxElevationM: 22.0,
      tiers: [
        'Sub-Tier (-12m): Service Tunnel Sector 7B & derailed tram catwalks',
        'Grade (0m): Switching yard & cargo container lanes',
        'Viaduct (+11m – +22m): Elevated freight rail deck & overhead gantry crane booms',
      ],
    },
    traversalOpportunities: [
      'Gantry crane hook web-swinging over active freight tracks',
      'Jax Storm-Step rail-grinding along electrified third-rail conduits',
    ],
    combatArenaFootprints: [
      { name: 'Freight Turntable Pit', dimensionsM: [36, 36], role: 'Multi-wave ambush arena with rotating crane hook' },
      { name: 'Sector 7B Substation', dimensionsM: [32, 28], role: 'Vane-7 boss encounter flanked by arc transformers' },
    ],
    interactiveObjects: ['Overhead Electromagnetic Crane Drops', 'Rail Switch Breakers'],
    environmentalHazards: ['Electrified Rail Conduits', 'Molten Slag Vents'],
    storyLandmarks: ['Service Tunnel Sector 7B Gate', 'Ironvein Freight Viaduct'],
    mobilePerformanceBudget: {
      maxSceneTriangles: 50000,
      maxDrawCalls: 100,
      maxTextureAtlasBudgetMb: 26,
      targetMinSpecFps: 30,
      targetPerformanceFps: 60,
    },
  },
  {
    districtId: 'neon-ward',
    order: 3,
    name: 'Neon Ward',
    act: 'Act I — Age of Protection',
    wavePriority: 'Wave 2 — Mid-Campaign Industrial & Market Production',
    reconstructionState: 'specified_ready_for_wave',
    visualAuthority: 'composite_sheets_inferred',
    controllingVisualSheets: [
      {
        file: '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_25_PM__1__f9d37a6e.png',
        sheetTitle: 'THE RAGING CITY',
        role: 'Commercial mid-tier Beast-Kin storefronts, elevated monorail & illuminated signage framing',
      },
      {
        file: '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_28_PM__9__e5b27b30.png',
        sheetTitle: 'FANG SYNDICATE STRONGHOLD',
        role: 'Neon magenta/cyan holographic signboards & rain-reflected Syndicate nightlife palette',
      },
    ],
    inferredElementsDisclosure:
      'No standalone Visual Library sheet is titled "Neon Ward"; architecture is derived strictly from the mid-city commercial signage tier of f9d37a6e.png combined with the neon graphic palette of e5b27b30.png.',
    architecturalStyle:
      'Dense vertical Beast-Kin commercial avenues wrapped in cantilevered neon sign cages, glass skywalks, and rain-mirrored plazas.',
    dominantMaterials: [
      'Wet specular basalt paving & dark anodized aluminum mullions',
      'Glowing magenta/violet/cyan neon tubing & backlit acrylic',
      'Glazed ceramic tile shopfronts',
    ],
    lightingMood: {
      timeOfDay: 'Rain-soaked midnight neon',
      keyHex: '#E879F9',
      fillHex: '#38BDF8',
      fogHex: '#131126',
      accentEmissives: ['#F43F5E', '#A855F7', '#22D3EE'],
    },
    elevationStructure: {
      minElevationM: 0.0,
      maxElevationM: 24.0,
      tiers: [
        'Plaza (0m): Rain-mirrored commercial boulevard',
        'Sign-Cage Tier (8m – 16m): Projecting neon sign gantries & glass skywalks',
        'Penthouse Roofs (24m): Broadcast holoprojector decks',
      ],
    },
    traversalOpportunities: [
      'Cantilevered neon sign-frame web-zip chains',
      'Shadow-Silk stealth perches along upper holoprojector trusses',
    ],
    combatArenaFootprints: [
      { name: 'Mirage Glass Concourse', dimensionsM: [34, 30], role: 'Stalker & Dodger vertical ambush arena' },
      { name: 'Broadcast Atrium Roof', dimensionsM: [36, 36], role: 'Sable-Mirage boss rooftop arena' },
    ],
    interactiveObjects: ['Overloaded Neon Signboards', 'Holoprojector Decoy Breakers'],
    environmentalHazards: ['Hologram Decoy Traps', 'Sniper Rooftop Sightlines'],
    storyLandmarks: ['Covenant Public Broadcast Tower', 'Glass Concourse Fountain'],
    mobilePerformanceBudget: {
      maxSceneTriangles: 48000,
      maxDrawCalls: 95,
      maxTextureAtlasBudgetMb: 26,
      targetMinSpecFps: 30,
      targetPerformanceFps: 60,
    },
  },
  {
    districtId: 'iron-market',
    order: 4,
    name: 'Iron Market',
    act: 'Act II — Age of Law',
    wavePriority: 'Wave 2 — Mid-Campaign Industrial & Market Production',
    reconstructionState: 'specified_ready_for_wave',
    visualAuthority: 'direct_visual_sheet',
    controllingVisualSheets: [
      {
        file: '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_26_PM__3__e05fb785.png',
        sheetTitle: 'IRONVEIN WARDS (IRONVEIN WORKS — KAI-JAX FORGE KEEPS)',
        role: 'Molten crucible spouts, anvil gantries & heavy steel foundry halls',
      },
      {
        file: '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_28_PM__9__e5b27b30.png',
        sheetTitle: 'FANG SYNDICATE STRONGHOLD',
        role: 'Octagonal black-market fighting pit, chain cages & Syndicate betting galleries',
      },
    ],
    inferredElementsDisclosure:
      'Combines the exterior forge-keep architecture of e05fb785.png with the sunken black-market Syndicate cage arena of e5b27b30.png.',
    architecturalStyle:
      'Fortified subterranean-to-grade forge bazaar centered around molten crucible channels, chain-hung cargo cages, and the Syndicate octagonal fight pit.',
    dominantMaterials: [
      'Hammered cast iron, forge-blackened masonry & heavy link chains',
      'Ember-lit slag channels & timber-framed bazaar stalls',
      'Crimson Syndicate banners & steel cage mesh',
    ],
    lightingMood: {
      timeOfDay: 'Smoky forge-lit interior/canyon dusk',
      keyHex: '#FB7185',
      fillHex: '#F59E0B',
      fogHex: '#241418',
      accentEmissives: ['#F97316', '#EC4899'],
    },
    elevationStructure: {
      minElevationM: -6.0,
      maxElevationM: 16.0,
      tiers: [
        'Sunken Pit (-6m): Octagonal Fang Syndicate Blood-Pit',
        'Bazaar Ring (0m): Black-market forge stalls & anvil bays',
        'Crucible Catwalks (+10m – +16m): Overhead ladle cranes & betting balconies',
      ],
    },
    traversalOpportunities: [
      'Chain-cage & crucible-crane web swings across the central bazaar',
      'Pyraxis thermal updraft launches between balconies',
    ],
    combatArenaFootprints: [
      { name: 'Anvil Bazaar Ring', dimensionsM: [32, 32], role: 'Shield & Bruiser brawl with throwable forge crates' },
      { name: 'Octagonal Fang Pit', dimensionsM: [30, 30], role: 'Krag the Iron-Jaw boss cage encounter' },
    ],
    interactiveObjects: ['Suspended Scrap Cages', 'Forge Quench Valves'],
    environmentalHazards: ['Molten Forge Vents', 'Syndicate Turret Nests'],
    storyLandmarks: ['Kai-Jax Forge Keeps Crucible', 'Fang Syndicate Fight Pit'],
    mobilePerformanceBudget: {
      maxSceneTriangles: 48000,
      maxDrawCalls: 95,
      maxTextureAtlasBudgetMb: 24,
      targetMinSpecFps: 30,
      targetPerformanceFps: 60,
    },
  },
  {
    districtId: 'undercrown',
    order: 5,
    name: 'Undercrown',
    act: 'Act II — Age of Law',
    wavePriority: 'Wave 3 — Act II/III Apex & Finale Production',
    reconstructionState: 'specified_ready_for_wave',
    visualAuthority: 'direct_visual_sheet',
    controllingVisualSheets: [
      {
        file: '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_27_PM__8__0e91caa6.png',
        sheetTitle: 'THE FRACTURE PIT & UNDERCITY ("THE DEEP REMEMBERS / NO KINGS ONLY PATHS")',
        role: 'Colossal subterranean chasm, suspended derailed transit cars, ancient stone ribs & blue lightning abyss',
      },
    ],
    inferredElementsDisclosure:
      'Lower catacomb chambers beneath the Fracture Pit chasm bridge follow the carved Beast-God stone pillar motifs visible in 0e91caa6.png.',
    architecturalStyle:
      'Subterranean abyssal cavern beneath Raging City bridged by fractured transit viaducts, ancient pre-Covenant stone arches, and storm-charged chasm vents.',
    dominantMaterials: [
      'Carved monolithic basalt & damp mossy limestone',
      'Twisted transit steel & suspended cable bridges',
      'Bioluminescent memory-lichen & azure chasm lightning',
    ],
    lightingMood: {
      timeOfDay: 'Subterranean bioluminescent twilight',
      keyHex: '#38BDF8',
      fillHex: '#818CF8',
      fogHex: '#0D1726',
      accentEmissives: ['#38BDF8', '#A855F7'],
    },
    elevationStructure: {
      minElevationM: -24.0,
      maxElevationM: 8.0,
      tiers: [
        'Abyssal Ledge (-24m): Ancient Beast-God shrine plinths above the lightning rift',
        'Suspended Tram Span (-8m): Broken viaduct bridge & cable catwalks',
        'Tunnel Mouth (+8m): Sector 7B entry gallery ("THE DEEP REMEMBERS")',
      ],
    },
    traversalOpportunities: [
      'Long-arc chasm web-swinging beneath fractured viaduct ribs',
      'Wall-run chains across sheer carved cavern walls',
    ],
    combatArenaFootprints: [
      { name: 'Fracture Bridge Span', dimensionsM: [18, 42], role: 'Linear high-tension bridge ambush' },
      { name: 'Vault-Warden Shrine Plinth', dimensionsM: [36, 36], role: 'Circular ancient stone boss arena' },
    ],
    interactiveObjects: ['Ancient Resonance Pillars', 'Suspended Tram Wreckage'],
    environmentalHazards: ['Memory-Drain Mist', 'Collapsing Catwalks'],
    storyLandmarks: ['"THE DEEP REMEMBERS" Graffiti Arch', 'Fracture Pit Chasm'],
    mobilePerformanceBudget: {
      maxSceneTriangles: 46000,
      maxDrawCalls: 90,
      maxTextureAtlasBudgetMb: 24,
      targetMinSpecFps: 30,
      targetPerformanceFps: 60,
    },
  },
  {
    districtId: 'zenith-spires',
    order: 6,
    name: 'Zenith Spires',
    act: 'Act II — Age of Law',
    wavePriority: 'Wave 3 — Act II/III Apex & Finale Production',
    reconstructionState: 'specified_ready_for_wave',
    visualAuthority: 'direct_visual_sheet',
    controllingVisualSheets: [
      {
        file: '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_26_PM__4__a43aff68.png',
        sheetTitle: 'SKYFALL SPINES',
        role: 'Soaring gothic-gold upper-city needle spires above the cloud deck, suspension bridges & storm lightning',
      },
      {
        file: '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_27_PM__6__16464786.png',
        sheetTitle: 'STORM RONIN SANCTUM',
        role: "Borax's broken rose-window cathedral vigil in the howling upper spires",
      },
    ],
    inferredElementsDisclosure:
      'Bovar tribunal plaza courtyard geometry connects the Skyfall Spines suspension bridges (a43aff68.png) to Borax’s Storm Ronin Sanctum (16464786.png); Note: Bovar character 3D asset remains withheld pending official visual sheet approval.',
    architecturalStyle:
      'Cloud-piercing white-marble and gilded-bronze gothic needle spires linked by high-altitude suspension bridges and wind-carved rose-window sanctums.',
    dominantMaterials: [
      'Fluted pale stone, brushed tribunal gold & dark slate spires',
      'Cobalt-and-gold heraldic banners',
      'Shattered stained-glass rose windows & storm-wet flagstones',
    ],
    lightingMood: {
      timeOfDay: 'High-altitude storm-cloud break with golden sunbeams & cyan lightning',
      keyHex: '#FDE68A',
      fillHex: '#60A5FA',
      fogHex: '#1E293B',
      accentEmissives: ['#F59E0B', '#38BDF8'],
    },
    elevationStructure: {
      minElevationM: 40.0,
      maxElevationM: 95.0,
      tiers: [
        'Cloud Suspension Spans (40m): swaying sky-bridges above cloud sea',
        'Storm Ronin Sanctum (68m): Borax’s rose-window vigil nave',
        'Apex Tribunal Terrace (95m): Highest law-spire arena',
      ],
    },
    traversalOpportunities: [
      'High-velocity spire-to-spire web-swinging across cloud gaps',
      'Kar-Voth lightning-rail ascents up gilded spire conductors',
    ],
    combatArenaFootprints: [
      { name: 'Storm Ronin Nave', dimensionsM: [28, 38], role: 'Gothic cathedral duel court' },
      { name: 'Apex Tribunal Terrace', dimensionsM: [40, 40], role: 'Act II climax arena (Bovar withheld from 3D spawn until visual approval)' },
    ],
    interactiveObjects: ['Lightning Conductor Pylons', 'Shattered Bell Counterweights'],
    environmentalHazards: ['Suppression Pylons', 'High-Altitude Gale Winds'],
    storyLandmarks: ['Storm Ronin Sanctum', 'Skyfall Spines Cloud Sea'],
    mobilePerformanceBudget: {
      maxSceneTriangles: 48000,
      maxDrawCalls: 95,
      maxTextureAtlasBudgetMb: 26,
      targetMinSpecFps: 30,
      targetPerformanceFps: 60,
    },
  },
  {
    districtId: 'erasure-fields',
    order: 7,
    name: 'Erasure Fields',
    act: 'Act III — Age of Memory',
    wavePriority: 'Wave 3 — Act II/III Apex & Finale Production',
    reconstructionState: 'specified_ready_for_wave',
    visualAuthority: 'composite_sheets_inferred',
    controllingVisualSheets: [
      {
        file: '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_29_PM__10__fbb50f2d.png',
        sheetTitle: 'HOLLOW FANG CATHEDRAL — ANTI-SABERTOOTH COVENANT',
        role: 'Monolithic Covenant purge spire, toxic emerald containment vats & brutalist discipline architecture',
      },
    ],
    inferredElementsDisclosure:
      'Exterior perimeter wastelands surrounding the Hollow Fang Cathedral ("Erasure Fields") are extrapolated from the brutalist monolithic spire and green purge-vat aesthetic of fbb50f2d.png.',
    architecturalStyle:
      'Ash-bleached Covenant quarantine expanse dominated by the monolithic Hollow Fang Cathedral spire, emerald memory-purge containment vats, and fractured reality monoliths.',
    dominantMaterials: [
      'Brutalist obsidian-grey ferroconcrete & Covenant silver insignia',
      'Glowing emerald-green purge fluid & reinforced glass vats',
      'Vitrified ash-stone & floating fractured basalt slabs',
    ],
    lightingMood: {
      timeOfDay: 'Overcast eclipse haze lit by clinical emerald Covenant purge vats',
      keyHex: '#34D399',
      fillHex: '#94A3B8',
      fogHex: '#0F1F1C',
      accentEmissives: ['#10B981', '#A855F7'],
    },
    elevationStructure: {
      minElevationM: 0.0,
      maxElevationM: 36.0,
      tiers: [
        'Quarantine Ash-Plain (0m): Fractured containment trenches',
        'Purge Vat Nave (12m): Hollow Fang Cathedral interior catwalks',
        'Spire Conduit Deck (36m): Upper Null-Loom siphon ring',
      ],
    },
    traversalOpportunities: [
      'Memory-Step reality-anchor grapple across suspended ash monoliths',
      'Cathedral buttress web-swings avoiding purge-vat mist',
    ],
    combatArenaFootprints: [
      { name: 'Hollow Fang Forecourt', dimensionsM: [38, 34], role: 'Covenant purge-squad gauntlet' },
      { name: 'Cathedral Containment Nave', dimensionsM: [36, 36], role: 'Arch-Inquisitor Null boss chamber' },
    ],
    interactiveObjects: ['Covenant Purge Vat Valves', 'Memory Tether Anchors'],
    environmentalHazards: ['Null-Zones (Ability Lockout)', 'Reality Rift Tears'],
    storyLandmarks: ['Hollow Fang Cathedral ("FAITH • SCIENCE • DISCIPLINE • PURGE")'],
    mobilePerformanceBudget: {
      maxSceneTriangles: 46000,
      maxDrawCalls: 90,
      maxTextureAtlasBudgetMb: 24,
      targetMinSpecFps: 30,
      targetPerformanceFps: 60,
    },
  },
  {
    districtId: 'memory-nexus',
    order: 8,
    name: 'Memory Nexus',
    act: 'Act III — Age of Memory',
    wavePriority: 'Wave 3 — Act II/III Apex & Finale Production',
    reconstructionState: 'specified_ready_for_wave',
    visualAuthority: 'direct_visual_sheet',
    controllingVisualSheets: [
      {
        file: '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_27_PM__7__1f74b763.png',
        sheetTitle: "LIBRARY OF THREADS — THE WORLD'S GREAT MEMORY ARCHIVE",
        role: 'Towering circular memory-scroll galleries, glowing violet memory orbs, arched stone bridges & thread looms',
      },
    ],
    inferredElementsDisclosure:
      'Inner Convergence Loom boss dais at the heart of the rotunda extends the arched bridge and glowing violet orb language directly depicted in 1f74b763.png.',
    architecturalStyle:
      'Sacred multi-tiered rotunda of the Great Memory Archive: towering carved stone archive shelves, suspended golden-violet memory orbs, calligraphic scroll banners, and luminous Silk-Thread bridges.',
    dominantMaterials: [
      'Warm carved archive sandstone & polished obsidian-gold inlays',
      'Luminous violet/gold Memory Orbs & woven Thryxen silk threads',
      'Suspended parchment scroll banners',
    ],
    lightingMood: {
      timeOfDay: 'Timeless astral-violet & warm candle-gold sanctuary',
      keyHex: '#C084FC',
      fillHex: '#FBBF24',
      fogHex: '#18102B',
      accentEmissives: ['#A855F7', '#F59E0B', '#38BDF8'],
    },
    elevationStructure: {
      minElevationM: 0.0,
      maxElevationM: 32.0,
      tiers: [
        'Archive Rotunda Floor (0m): Central Memory Pool & Convergence Dais',
        'Scroll Galleries (10m – 22m): Concentric arched bridges & orb alcoves',
        'Crown Loom Oculus (32m): Celestial Memory-Thread canopy',
      ],
    },
    traversalOpportunities: [
      'Luminous Memory-Orb web-swing rings spanning the rotunda atrium',
      'Kai-Jax Convergence 3-tail aerial dashes between concentric scroll balconies',
    ],
    combatArenaFootprints: [
      { name: 'Library Arched Span', dimensionsM: [24, 40], role: 'Pre-finale defense of the Archive Scrolls' },
      { name: 'Convergence Loom Dais', dimensionsM: [42, 42], role: 'Grand Finale arena against The Architect of Erasure' },
    ],
    interactiveObjects: ['Resonant Memory Orbs', 'Ancestral Heritage Looms'],
    environmentalHazards: ['Erasure Shockwaves', 'Phase-Shifting Platforms'],
    storyLandmarks: ['Library of Threads Rotunda', 'Crown Memory Oculus'],
    mobilePerformanceBudget: {
      maxSceneTriangles: 48000,
      maxDrawCalls: 95,
      maxTextureAtlasBudgetMb: 26,
      targetMinSpecFps: 30,
      targetPerformanceFps: 60,
    },
  },
];
