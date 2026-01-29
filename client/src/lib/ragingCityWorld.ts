// LEGENDS OF KAI-JAX: RAGING CITY WORLD STRUCTURE
// Post-Apocalyptic Bronx War Zone

export interface RagingCityZone {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  dangerLevel: 1 | 2 | 3 | 4 | 5;
  controlledBy: 'neutral' | 'sabertooth' | 'void' | 'contested';
  regions: RagingCityRegion[];
  landmarks: string[];
  hazards: string[];
  secrets: string[];
  unlockRequirement?: string;
}

export interface RagingCityRegion {
  id: string;
  name: string;
  type: 'residential' | 'industrial' | 'commercial' | 'underground' | 'rooftop' | 'bridge';
  description: string;
  enemies: string[];
  resources: string[];
}

export interface MainPath {
  id: string;
  bookNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  title: string;
  subtitle: string;
  description: string;
  focusCharacter: 'boryn' | 'boryx_zenith' | 'jaxon' | 'kaison' | 'kaijax' | 'all';
  chapters: PathChapter[];
  unlockRequirement?: string;
}

export interface PathChapter {
  id: string;
  chapterNumber: number;
  name: string;
  description: string;
  objectives: string[];
  location: string;
  boss?: {
    name: string;
    phases: number;
    description: string;
  };
  rewards: {
    xp: number;
    currency: number;
    items: string[];
    unlocksAbility?: string;
    unlocksCharacter?: string;
  };
  isFireMoment: boolean;
  cinematicIntro?: string;
}

export interface SideQuest {
  id: string;
  name: string;
  giver: string;
  giverDescription: string;
  location: string;
  type: 'rescue' | 'hunt' | 'collect' | 'escort' | 'investigate' | 'challenge' | 'memory';
  description: string;
  objectives: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  rewards: {
    xp: number;
    currency: number;
    items: string[];
    reputation?: number;
    unlocksQuest?: string;
    unlocksAbility?: string;
  };
  repeatable: boolean;
  prerequisiteQuest?: string;
  unlocksQuest?: string;
}

// ============ RAGING CITY ZONES (Post-Apocalyptic Bronx Districts) ============

export const RAGING_CITY_ZONES: RagingCityZone[] = [
  {
    id: 'sector_7',
    name: 'Sector-7: The Crucible',
    subtitle: 'Where Legends Are Forged',
    description: 'The central hub of Raging City. Once the Grand Concourse, now a fortified training ground where Thryxen drills survivors. Pyraxis made his last stand here.',
    dangerLevel: 2,
    controlledBy: 'sabertooth',
    regions: [
      {
        id: 's7_training_grounds',
        name: 'The Training Grounds',
        type: 'commercial',
        description: 'Former shopping district converted into combat arenas. Thryxen watches from the central tower.',
        enemies: ['Training Drones', 'Sparring Partners'],
        resources: ['Training Crystals', 'Combat Manuals']
      },
      {
        id: 's7_memorial_plaza',
        name: 'Pyraxis Memorial Plaza',
        type: 'residential',
        description: 'A solemn space where a statue of Pyraxis stands, flames eternally burning at its base.',
        enemies: [],
        resources: ['Memory Fragments', 'Fire Essence']
      },
      {
        id: 's7_nexus_haven',
        name: 'Nexus Haven',
        type: 'underground',
        description: 'The underground sanctuary where surviving heroes gather. Safe zone.',
        enemies: [],
        resources: ['Healing Supplies', 'Information']
      }
    ],
    landmarks: ['Pyraxis Memorial', 'Thryxen\'s Tower', 'The Nexus Gate', 'Orphan\'s Sanctuary'],
    hazards: ['Occasional Void Scouts', 'Crumbling Buildings'],
    secrets: ['Pyraxis\'s Hidden Cache', 'Thryxen\'s Private Training Room', 'Memory Crystal Vault']
  },
  {
    id: 'hunts_point',
    name: 'Hunt\'s Point Warzone',
    subtitle: 'The Killing Fields',
    description: 'The industrial district has become a brutal battleground. Void creatures pour from a massive rift tear. This is where warriors prove themselves.',
    dangerLevel: 4,
    controlledBy: 'contested',
    regions: [
      {
        id: 'hp_factory_ruins',
        name: 'Factory Ruins',
        type: 'industrial',
        description: 'Collapsed factories now serve as Void nesting grounds. Dangerous but rich in salvage.',
        enemies: ['Void Crawlers', 'Rift Echoes', 'Factory Guardians'],
        resources: ['Scrap Metal', 'Void Cores', 'Tech Salvage']
      },
      {
        id: 'hp_rift_tear',
        name: 'The Great Rift Tear',
        type: 'industrial',
        description: 'A permanent tear in reality. Void creatures continuously spawn here. The source must be sealed.',
        enemies: ['Void Spawn', 'Rift Walkers', 'Echo Wraiths'],
        resources: ['Rift Crystals', 'Dimensional Shards']
      },
      {
        id: 'hp_resistance_outpost',
        name: 'Resistance Outpost Alpha',
        type: 'commercial',
        description: 'A fortified position where fighters rest between assaults on the Void.',
        enemies: [],
        resources: ['Ammunition', 'Medical Supplies']
      }
    ],
    landmarks: ['The Great Rift Tear', 'Pyraxis\'s Last Battle Site', 'Void General\'s Throne'],
    hazards: ['Constant Void Attacks', 'Toxic Fumes', 'Unstable Ground', 'Reality Distortions'],
    secrets: ['Pyraxis\'s Final Message', 'Ancient Subway Tunnels', 'Pre-War Tech Cache'],
    unlockRequirement: 'Complete Book 1, Chapter 5'
  },
  {
    id: 'yankee_heights',
    name: 'Yankee Heights',
    subtitle: 'The Rooftop Kingdom',
    description: 'The high-rise district where survivors built bridges between buildings. Jaxon\'s electric quills light the paths at night. A vertical maze of hope.',
    dangerLevel: 3,
    controlledBy: 'sabertooth',
    regions: [
      {
        id: 'yh_sky_bridges',
        name: 'Sky Bridge Network',
        type: 'bridge',
        description: 'Makeshift bridges connect rooftops. Fast travel for those who dare the heights.',
        enemies: ['Sky Raiders', 'Void Flyers'],
        resources: ['Bridge Materials', 'Signal Beacons']
      },
      {
        id: 'yh_electric_tower',
        name: 'Jaxon\'s Electric Tower',
        type: 'rooftop',
        description: 'The tallest building, now a beacon of electric light. Jaxon channels power here.',
        enemies: [],
        resources: ['Electric Crystals', 'Power Cells']
      },
      {
        id: 'yh_refugee_camps',
        name: 'Rooftop Refugee Camps',
        type: 'residential',
        description: 'Survivors live in tent cities across connected rooftops. They need protection.',
        enemies: ['Void Scouts'],
        resources: ['Trade Goods', 'Survivor Stories']
      }
    ],
    landmarks: ['Jaxon\'s Tower', 'The Grand Bridge', 'Sunset Lookout', 'The Lighthouse'],
    hazards: ['Falling Debris', 'High Winds', 'Void Flyer Attacks'],
    secrets: ['Hidden Penthouse', 'Radio Tower Frequency', 'Pre-War Observatory'],
    unlockRequirement: 'Complete Book 2, Chapter 3'
  },
  {
    id: 'fordham_depths',
    name: 'Fordham Depths',
    subtitle: 'The Underground Empire',
    description: 'The subway system has become a sprawling underground city. Kaison\'s spider-sense guides travelers through the dark. Ancient tunnels hide older secrets.',
    dangerLevel: 4,
    controlledBy: 'neutral',
    regions: [
      {
        id: 'fd_subway_city',
        name: 'Subway City',
        type: 'underground',
        description: 'Former subway stations transformed into a thriving underground community.',
        enemies: ['Tunnel Dwellers', 'Lost Echoes'],
        resources: ['Underground Supplies', 'Ancient Artifacts']
      },
      {
        id: 'fd_web_caverns',
        name: 'Kaison\'s Web Caverns',
        type: 'underground',
        description: 'Deep tunnels where Kaison has woven an intricate web of sensors and traps.',
        enemies: [],
        resources: ['Web Silk', 'Sensor Components']
      },
      {
        id: 'fd_ancient_tunnels',
        name: 'Pre-War Tunnels',
        type: 'underground',
        description: 'Tunnels that existed before the Bronx. What secrets do they hold?',
        enemies: ['Ancient Guardians', 'Memory Ghosts'],
        resources: ['Ancient Tech', 'Memory Crystals']
      }
    ],
    landmarks: ['Central Station Hub', 'The Deep Crossing', 'Memory Lake', 'Kaison\'s Lair'],
    hazards: ['Darkness', 'Flooding', 'Collapsed Tunnels', 'Memory Traps'],
    secrets: ['The First Memory Strand', 'Ancient Beast-Kin Ruins', 'Ouroboros Chamber'],
    unlockRequirement: 'Complete Book 3, Chapter 1'
  },
  {
    id: 'pelham_wastes',
    name: 'Pelham Wastes',
    subtitle: 'The Burning Frontier',
    description: 'The northeastern district is a scorched wasteland where Boryn made his final sacrifice, channeling the divine fire of Pyraxis. The eternal flames both protect and destroy. Only the worthy survive here.',
    dangerLevel: 5,
    controlledBy: 'void',
    regions: [
      {
        id: 'pw_fire_fields',
        name: 'Eternal Fire Fields',
        type: 'industrial',
        description: 'Flames that never die, remnants of Boryn\'s ultimate attack channeling Pyraxis\'s power. Void creatures fear them.',
        enemies: ['Fire Wraiths', 'Void Champions'],
        resources: ['Eternal Flame Essence', 'Divine Tiger Ash']
      },
      {
        id: 'pw_void_fortress',
        name: 'Void Fortress Omega',
        type: 'commercial',
        description: 'The main Void stronghold in Raging City. Must be destroyed to free the Bronx.',
        enemies: ['Void Generals', 'Elite Void Guards', 'The Void King\'s Echoes'],
        resources: ['Void Commander Cores', 'Reality Anchors']
      },
      {
        id: 'pw_pyraxis_shrine',
        name: 'Shrine of Pyraxis',
        type: 'residential',
        description: 'An ancient shrine to the god-ancestor Pyraxis, where Boryn made his last stand. Divine presence still lingers...',
        enemies: [],
        resources: ['Pyraxis\'s Divine Blessing', 'Tiger Spirit Essence']
      }
    ],
    landmarks: ['Boryn\'s Last Stand', 'Void Fortress Omega', 'Pyraxis\'s Eternal Flame', 'The Edge of Reality'],
    hazards: ['Extreme Heat', 'Void Corruption', 'Reality Tears', 'Fire Storms'],
    secrets: ['Pyraxis\'s Divine Form', 'The Void King\'s Weakness', 'Memory of the Before-Time'],
    unlockRequirement: 'Complete Book 6'
  }
];

// ============ MAIN STORY PATHS (9 Books of the Sabertooth Lineage) ============

export const STORY_PATHS: MainPath[] = [
  {
    id: 'book_1',
    bookNumber: 1,
    title: 'The Shield\'s Warmth',
    subtitle: 'Boryn and the Orphans',
    description: 'In the chaos of the first Void invasion, Boryn - Pyraxis remembered correctly, a Sabertooth Tiger warrior who embodies sacrifice and protection - discovers two orphaned children with extraordinary abilities. He takes them under his protection, becoming the father they never had.',
    focusCharacter: 'boryn',
    chapters: [
      {
        id: 'b1_c1',
        chapterNumber: 1,
        name: 'The Day the Sky Fell',
        description: 'Raging City was once the Bronx. Then the Rift opened. Play as Boryn as he witnesses the apocalypse begin.',
        objectives: ['Witness the Rift opening', 'Survive the initial Void wave', 'Find shelter'],
        location: 'sector_7',
        rewards: { xp: 200, currency: 100, items: ['Boryn\'s Cloak Fragment'] },
        isFireMoment: true,
        cinematicIntro: 'the_sky_falls'
      },
      {
        id: 'b1_c2',
        chapterNumber: 2,
        name: 'The Electric Child',
        description: 'Boryn finds Jaxon, a young Hedgehog-Lupine hybrid with electric quills, defending himself against Void creatures.',
        objectives: ['Rescue Jaxon', 'Defeat the Void Pack', 'Earn Jaxon\'s trust'],
        location: 'sector_7',
        rewards: { xp: 250, currency: 150, items: ['Electric Quill'], unlocksCharacter: 'jaxon' },
        isFireMoment: true,
        cinematicIntro: 'jaxon_introduction'
      },
      {
        id: 'b1_c3',
        chapterNumber: 3,
        name: 'Spider-Sense Awakening',
        description: 'In the subway tunnels, Boryn discovers Kaison, an Arachnid-Kitsune-Wolf hybrid whose spider-sense warned him of the invasion.',
        objectives: ['Navigate the dark tunnels', 'Find Kaison', 'Escape the tunnel collapse'],
        location: 'fordham_depths',
        rewards: { xp: 250, currency: 150, items: ['Web Strand'], unlocksCharacter: 'kaison' },
        isFireMoment: true,
        cinematicIntro: 'kaison_introduction'
      },
      {
        id: 'b1_c4',
        chapterNumber: 4,
        name: 'Building a Family',
        description: 'Boryn brings both orphans to a safe haven. He begins their training, teaching them the ancient ways passed down from the god-ancestor Pyraxis.',
        objectives: ['Establish a base', 'Complete first training session', 'Defend against Void scouts'],
        location: 'sector_7',
        rewards: { xp: 300, currency: 200, items: ['Training Manual', 'Family Bond Token'] },
        isFireMoment: false
      },
      {
        id: 'b1_c5',
        chapterNumber: 5,
        name: 'The Lineage Mark',
        description: 'Boryn performs an ancient ritual passed down from Pyraxis, granting both orphans the Oversized Fangs - the mark of the Sabertooth Lineage.',
        objectives: ['Gather ritual components', 'Complete the Lineage ritual', 'Manifest the Fangs'],
        location: 'sector_7',
        boss: {
          name: 'Void Interceptor',
          phases: 2,
          description: 'A Void creature attacks during the vulnerable ritual moment.'
        },
        rewards: { xp: 400, currency: 250, items: ['Sabertooth Fang Mark'], unlocksAbility: 'oversized_fangs' },
        isFireMoment: true,
        cinematicIntro: 'lineage_ritual'
      },
      {
        id: 'b1_c6',
        chapterNumber: 6,
        name: 'First Real Fight',
        description: 'Jaxon and Kaison face their first real battle together, defending civilians from a Void attack.',
        objectives: ['Protect the civilians', 'Coordinate with your sibling', 'Defeat the Void Captain'],
        location: 'yankee_heights',
        boss: {
          name: 'Void Captain Dredge',
          phases: 2,
          description: 'A tactical Void commander leading the assault.'
        },
        rewards: { xp: 400, currency: 250, items: ['Victory Token', 'Civilian Gratitude'] },
        isFireMoment: false
      },
      {
        id: 'b1_c7',
        chapterNumber: 7,
        name: 'Father\'s Pride',
        description: 'Boryn watches his adopted children grow stronger. A quiet moment before the storm.',
        objectives: ['Train with Boryn', 'Learn advanced techniques', 'Share a family meal'],
        location: 'sector_7',
        rewards: { xp: 300, currency: 200, items: ['Boryn\'s Teaching', 'Family Photo'] },
        isFireMoment: false
      },
      {
        id: 'b1_c8',
        chapterNumber: 8,
        name: 'The Void Generals Approach',
        description: 'Intelligence reveals that three Void Generals are converging on Raging City. Boryn must act.',
        objectives: ['Scout enemy positions', 'Plan the defense', 'Rally the survivors'],
        location: 'hunts_point',
        rewards: { xp: 350, currency: 200, items: ['Battle Plans', 'General\'s Location'] },
        isFireMoment: true,
        cinematicIntro: 'generals_approach'
      },
      {
        id: 'b1_c9',
        chapterNumber: 9,
        name: 'The Shield Rises',
        description: 'Boryn leads the defense of Sector-7, holding the line while civilians evacuate.',
        objectives: ['Hold position for 5 minutes', 'Protect evacuation routes', 'Face the first General'],
        location: 'sector_7',
        boss: {
          name: 'Void General Malachar',
          phases: 3,
          description: 'The first of the three Void Generals, a towering figure of darkness.'
        },
        rewards: { xp: 500, currency: 300, items: ['General\'s Core', 'Hero\'s Medal'] },
        isFireMoment: true,
        cinematicIntro: 'borax_stands'
      },
      {
        id: 'b1_c10',
        chapterNumber: 10,
        name: 'The Ultimate Sacrifice',
        description: 'Boryn faces all three Void Generals alone to buy time for his children to escape. Channeling the spirit of Pyraxis, his flames will burn eternal.',
        objectives: ['Face the three Generals', 'Protect Jaxon and Kaison', 'Make the ultimate sacrifice'],
        location: 'pelham_wastes',
        boss: {
          name: 'The Three Void Generals',
          phases: 5,
          description: 'Malachar, Vexoth, and Kragnar - together, they are nearly unstoppable.'
        },
        rewards: { xp: 1000, currency: 500, items: ['Boryn\'s Spirit Essence', 'Eternal Flame Shard'], unlocksAbility: 'pyraxis_blessing' },
        isFireMoment: true,
        cinematicIntro: 'borax_sacrifice'
      }
    ]
  },
  {
    id: 'book_2',
    bookNumber: 2,
    title: 'The Mentor\'s Vigil',
    subtitle: 'Boryx Zenith Takes Command',
    description: 'With Boryn fallen, Boryx Zenith arrives - Thryxen\'s closest living echo, a Sabertooth Lion warrior who embodies law and authority. He takes the orphans under his cold but effective tutelage. His methods are harsh, but necessary.',
    focusCharacter: 'boryx_zenith',
    unlockRequirement: 'Complete Book 1',
    chapters: [
      {
        id: 'b2_c1',
        chapterNumber: 1,
        name: 'The Cold Teacher',
        description: 'Boryx Zenith arrives at Sector-7. His training methods are nothing like Boryn\'s warmth.',
        objectives: ['Meet Boryx Zenith', 'Endure the first harsh training', 'Don\'t give up'],
        location: 'sector_7',
        rewards: { xp: 250, currency: 150, items: ['Zenith\'s Expectation'] },
        isFireMoment: true,
        cinematicIntro: 'boryx_arrives'
      },
      {
        id: 'b2_c2',
        chapterNumber: 2,
        name: 'Strength Through Struggle',
        description: 'Boryx Zenith pushes both orphans to their limits. They must find inner strength.',
        objectives: ['Complete grueling exercises', 'Overcome personal doubt', 'Unlock new power'],
        location: 'sector_7',
        rewards: { xp: 300, currency: 200, items: ['Second Wind Token'], unlocksAbility: 'endurance_boost' },
        isFireMoment: false
      },
      {
        id: 'b2_c3',
        chapterNumber: 3,
        name: 'Electric Evolution',
        description: 'Jaxon\'s electric powers begin to evolve. Boryx Zenith guides him to channel this energy.',
        objectives: ['Master electric channeling', 'Create the Electric Web', 'Light the Yankee Heights'],
        location: 'yankee_heights',
        rewards: { xp: 350, currency: 200, items: ['Electric Evolution Gem'], unlocksAbility: 'electric_web' },
        isFireMoment: true
      },
      {
        id: 'b2_c4',
        chapterNumber: 4,
        name: 'Spider-Sense Mastery',
        description: 'Kaison\'s spider-sense can see further than ever. Boryx Zenith teaches him to trust it completely.',
        objectives: ['Navigate blindfolded', 'Predict enemy attacks', 'Sense the Void General'],
        location: 'fordham_depths',
        rewards: { xp: 350, currency: 200, items: ['Spider-Sense Crystal'], unlocksAbility: 'danger_prediction' },
        isFireMoment: true
      },
      {
        id: 'b2_c5',
        chapterNumber: 5,
        name: 'The Rivalry Lesson',
        description: 'Boryx Zenith reveals his history with Boryn - and the ancient tale of how Pyraxis and Thryxen, the god-ancestors, were once rivals who became brothers.',
        objectives: ['Listen to Boryx Zenith\'s story', 'Learn of Pyraxis and Thryxen', 'Honor Boryn\'s memory'],
        location: 'pelham_wastes',
        rewards: { xp: 300, currency: 200, items: ['Memory of Brotherhood'] },
        isFireMoment: true,
        cinematicIntro: 'rivalry_story'
      },
      {
        id: 'b2_c6',
        chapterNumber: 6,
        name: 'Hunt the Hunter',
        description: 'A dangerous Void Hunter is stalking the rooftops. Time to become the predator.',
        objectives: ['Track the Hunter', 'Set traps', 'Defeat the Void Hunter'],
        location: 'yankee_heights',
        boss: {
          name: 'Void Hunter Scythe',
          phases: 3,
          description: 'A stealthy assassin from the Void, sent to eliminate the Sabertooth heirs.'
        },
        rewards: { xp: 450, currency: 300, items: ['Hunter\'s Mask', 'Stealth Cloak'] },
        isFireMoment: false
      },
      {
        id: 'b2_c7',
        chapterNumber: 7,
        name: 'Underground Alliance',
        description: 'The underground dwellers offer alliance, but trust must be earned.',
        objectives: ['Negotiate with the Subway Council', 'Prove worthiness', 'Secure the alliance'],
        location: 'fordham_depths',
        rewards: { xp: 350, currency: 250, items: ['Subway Alliance Token', 'Underground Map'] },
        isFireMoment: false
      },
      {
        id: 'b2_c8',
        chapterNumber: 8,
        name: 'Zenith\'s Test',
        description: 'Boryx Zenith faces both orphans in combat. Only by defeating him will they be ready.',
        objectives: ['Face Boryx Zenith together', 'Use teamwork', 'Land a decisive blow'],
        location: 'sector_7',
        boss: {
          name: 'Boryx Zenith (Sparring)',
          phases: 3,
          description: 'The Sabertooth Lion warrior fights at full power. This is the final test.'
        },
        rewards: { xp: 500, currency: 300, items: ['Zenith\'s Approval', 'Lion\'s Courage'] },
        isFireMoment: true,
        cinematicIntro: 'zenith_test'
      },
      {
        id: 'b2_c9',
        chapterNumber: 9,
        name: 'The Vigil Continues',
        description: 'Boryx Zenith acknowledges their growth, channeling the blessing of Thryxen. But the Void grows stronger too.',
        objectives: ['Receive Boryx Zenith\'s blessing', 'Plan the next campaign', 'Prepare for Book 3'],
        location: 'sector_7',
        rewards: { xp: 400, currency: 250, items: ['Mentor\'s Blessing'], unlocksAbility: 'lion_roar' },
        isFireMoment: true,
        cinematicIntro: 'vigil_continues'
      },
      {
        id: 'b2_c10',
        chapterNumber: 10,
        name: 'Sovereign\'s Stand',
        description: 'Void forces assault Sector-7. Boryx Zenith leads the defense, channeling Thryxen\'s divine power.',
        objectives: ['Defend Sector-7', 'Support Boryx Zenith', 'Witness the Lion\'s might'],
        location: 'sector_7',
        boss: {
          name: 'Void General Vexoth',
          phases: 4,
          description: 'The second General seeks revenge for Malachar\'s defeat.'
        },
        rewards: { xp: 600, currency: 400, items: ['General\'s Essence', 'Sovereign Seal'] },
        isFireMoment: true,
        cinematicIntro: 'sovereign_stands'
      }
    ]
  },
  {
    id: 'book_3',
    bookNumber: 3,
    title: 'Electric Awakening',
    subtitle: 'Jaxon\'s Solo Journey',
    description: 'Jaxon ventures out alone to find the source of his electric powers. The journey takes him to the heart of Yankee Heights, where ancient secrets await.',
    focusCharacter: 'jaxon',
    unlockRequirement: 'Complete Book 2',
    chapters: []
  },
  {
    id: 'book_4',
    bookNumber: 4,
    title: 'Spider\'s Thread',
    subtitle: 'Kaison\'s Solo Journey',
    description: 'Kaison follows his spider-sense into the deepest tunnels, seeking the origin of his abilities. What he finds will change everything.',
    focusCharacter: 'kaison',
    unlockRequirement: 'Complete Book 2',
    chapters: []
  },
  {
    id: 'book_5',
    bookNumber: 5,
    title: 'The Fusion Trial',
    subtitle: 'Birth of Kai-Jax',
    description: 'When both siblings face death, desperation unlocks the ultimate power - fusion. Together, they become Kai-Jax, the Star-Slime Chimera Memory King.',
    focusCharacter: 'kaijax',
    unlockRequirement: 'Complete Books 3 and 4',
    chapters: []
  },
  {
    id: 'book_6',
    bookNumber: 6,
    title: 'Memory Strands',
    subtitle: 'Three Tails Unleashed',
    description: 'Kai-Jax learns to control the three Memory Strand Tails, each containing echoes of fallen heroes. Their power can turn the tide.',
    focusCharacter: 'kaijax',
    unlockRequirement: 'Complete Book 5',
    chapters: []
  },
  {
    id: 'book_7',
    bookNumber: 7,
    title: 'Raging City Burns',
    subtitle: 'The Bronx Falls',
    description: 'The Void launches their final assault. Raging City burns. Every hero must fight or fall.',
    focusCharacter: 'all',
    unlockRequirement: 'Complete Book 6',
    chapters: []
  },
  {
    id: 'book_8',
    bookNumber: 8,
    title: 'Ouroboros Cycle',
    subtitle: 'Time Loops',
    description: 'Kai-Jax discovers the Ouroboros - a cycle of time that connects all moments. To save the future, they must fix the past.',
    focusCharacter: 'kaijax',
    unlockRequirement: 'Complete Book 7',
    chapters: []
  },
  {
    id: 'book_9',
    bookNumber: 9,
    title: 'Crown of Memory',
    subtitle: 'Final Ascension',
    description: 'The Memory King rises. All threads converge. The Void King must fall. This is the end... or a new beginning.',
    focusCharacter: 'kaijax',
    unlockRequirement: 'Complete Book 8',
    chapters: []
  }
];

// ============ SIDE QUESTS ============

export const SIDE_QUESTS: SideQuest[] = [
  {
    id: 'sq_lost_children',
    name: 'The Lost Children',
    giver: 'Elder Martha',
    giverDescription: 'An old woman who runs a makeshift orphanage in Sector-7.',
    location: 'sector_7',
    type: 'rescue',
    description: 'Several children went missing near the old subway entrance. Find them before the Void does.',
    objectives: ['Search the subway entrance', 'Rescue 5 children', 'Return them safely'],
    difficulty: 2,
    rewards: { xp: 200, currency: 150, items: ['Elder\'s Gratitude'], reputation: 10 },
    repeatable: false
  },
  {
    id: 'sq_electric_grid',
    name: 'Power to the People',
    giver: 'Engineer Dex',
    giverDescription: 'A tech-savvy survivor trying to restore power to the Heights.',
    location: 'yankee_heights',
    type: 'collect',
    description: 'Collect power cells from destroyed machinery to restore electricity to the refugee camps.',
    objectives: ['Collect 10 Power Cells', 'Avoid Void patrols', 'Deliver to Engineer Dex'],
    difficulty: 2,
    rewards: { xp: 250, currency: 200, items: ['Electric Amplifier'], reputation: 15 },
    repeatable: true
  },
  {
    id: 'sq_memory_hunter',
    name: 'Memory Hunter',
    giver: 'The Archivist',
    giverDescription: 'A mysterious figure who collects memories of the world before.',
    location: 'fordham_depths',
    type: 'memory',
    description: 'Find Memory Crystals scattered throughout the depths. Each contains a piece of history.',
    objectives: ['Find 5 Memory Crystals', 'View each memory', 'Report to the Archivist'],
    difficulty: 3,
    rewards: { xp: 300, currency: 250, items: ['Memory Viewer', 'History Fragment'], reputation: 20 },
    repeatable: false,
    unlocksQuest: 'sq_memory_hunter_2'
  },
  {
    id: 'sq_void_bounty',
    name: 'Void Bounty: Crawlers',
    giver: 'Bounty Board',
    giverDescription: 'The community bounty board in Nexus Haven.',
    location: 'hunts_point',
    type: 'hunt',
    description: 'Void Crawlers are threatening supply routes. Eliminate them.',
    objectives: ['Defeat 20 Void Crawlers', 'Collect their cores'],
    difficulty: 3,
    rewards: { xp: 300, currency: 300, items: ['Void Core x5'] },
    repeatable: true
  },
  {
    id: 'sq_pyraxis_shrine',
    name: 'Pilgrimage to Fire',
    giver: 'Boryx Zenith',
    giverDescription: 'The Sabertooth Lion mentor, Thryxen\'s closest living echo.',
    location: 'pelham_wastes',
    type: 'memory',
    description: 'Visit the ancient shrine of Pyraxis, the god-ancestor of the Sabertooth Tiger lineage. Channel his eternal fire.',
    objectives: ['Reach the Shrine of Pyraxis', 'Defeat the Shrine Guardians', 'Commune with the god-ancestor'],
    difficulty: 4,
    rewards: { xp: 400, currency: 300, items: ['Pyraxis\'s Divine Blessing'], reputation: 25, unlocksAbility: 'fire_spirit' },
    repeatable: false,
    prerequisiteQuest: 'Complete Book 1'
  },
  {
    id: 'sq_rooftop_race',
    name: 'Skyline Sprint',
    giver: 'Speed Demon Zara',
    giverDescription: 'A fast-talking courier who runs the rooftop mail service.',
    location: 'yankee_heights',
    type: 'challenge',
    description: 'Race across the Sky Bridge Network. Beat Zara\'s record time.',
    objectives: ['Complete the rooftop course', 'Beat the time limit (3:00)', 'Don\'t fall'],
    difficulty: 2,
    rewards: { xp: 200, currency: 150, items: ['Speed Boots'] },
    repeatable: true
  },
  {
    id: 'sq_tunnel_escort',
    name: 'Safe Passage',
    giver: 'Tunnel Guide Malik',
    giverDescription: 'A veteran tunnel navigator who knows every path.',
    location: 'fordham_depths',
    type: 'escort',
    description: 'Escort a group of survivors through the dangerous tunnel network to safety.',
    objectives: ['Protect the survivors', 'Navigate to the safe zone', 'Don\'t lose anyone'],
    difficulty: 3,
    rewards: { xp: 350, currency: 250, items: ['Tunnel Map', 'Gratitude Token'], reputation: 15 },
    repeatable: true
  },
  {
    id: 'sq_void_investigator',
    name: 'What Lurks Below',
    giver: 'Scientist Dr. Chen',
    giverDescription: 'A researcher studying the Void.',
    location: 'hunts_point',
    type: 'investigate',
    description: 'Investigate strange activity near the Great Rift Tear. Something is changing.',
    objectives: ['Scout the Rift Tear', 'Collect samples', 'Report findings'],
    difficulty: 4,
    rewards: { xp: 400, currency: 300, items: ['Void Analysis', 'Rift Sample'] },
    repeatable: false,
    unlocksQuest: 'sq_rift_closing'
  }
];

// ============ WORLD MAP STRUCTURE ============

export interface WorldMapNode {
  id: string;
  type: 'zone' | 'book' | 'chapter' | 'quest';
  name: string;
  connections: string[];
  unlockRequirement?: {
    type: 'book' | 'chapter' | 'quest';
    bookNumber?: number;
    chapterNumber?: number;
    questId?: string;
  };
}

export interface PlayerProgress {
  completedBooks: number[];
  currentBook: number;
  currentChapter: number;
  completedChapters: string[];
  completedQuests: string[];
  unlockedZones: string[];
}

export const WORLD_MAP: WorldMapNode[] = [
  { id: 'sector_7', type: 'zone', name: 'Sector-7: The Crucible', connections: ['book_1', 'sq_lost_children'] },
  { id: 'hunts_point', type: 'zone', name: 'Hunt\'s Point Warzone', connections: ['sq_void_bounty', 'sq_void_investigator'], unlockRequirement: { type: 'chapter', bookNumber: 1, chapterNumber: 5 } },
  { id: 'yankee_heights', type: 'zone', name: 'Yankee Heights', connections: ['sq_electric_grid', 'sq_rooftop_race'], unlockRequirement: { type: 'chapter', bookNumber: 2, chapterNumber: 3 } },
  { id: 'fordham_depths', type: 'zone', name: 'Fordham Depths', connections: ['sq_memory_hunter', 'sq_tunnel_escort'], unlockRequirement: { type: 'chapter', bookNumber: 3, chapterNumber: 1 } },
  { id: 'pelham_wastes', type: 'zone', name: 'Pelham Wastes', connections: ['sq_pyraxis_shrine'], unlockRequirement: { type: 'book', bookNumber: 6 } },
  { id: 'book_1', type: 'book', name: 'Book 1: The Shield\'s Warmth', connections: ['sector_7', 'book_2'] },
  { id: 'book_2', type: 'book', name: 'Book 2: The Mentor\'s Vigil', connections: ['sector_7', 'yankee_heights', 'book_3'], unlockRequirement: { type: 'book', bookNumber: 1 } },
  { id: 'book_3', type: 'book', name: 'Book 3: Electric Awakening', connections: ['yankee_heights', 'book_4'], unlockRequirement: { type: 'book', bookNumber: 2 } },
  { id: 'book_4', type: 'book', name: 'Book 4: Spider\'s Thread', connections: ['fordham_depths', 'book_5'], unlockRequirement: { type: 'book', bookNumber: 2 } },
  { id: 'book_5', type: 'book', name: 'Book 5: The Fusion Trial', connections: ['book_6'], unlockRequirement: { type: 'book', bookNumber: 3 } },
  { id: 'book_6', type: 'book', name: 'Book 6: Memory Strands', connections: ['pelham_wastes', 'book_7'], unlockRequirement: { type: 'book', bookNumber: 5 } },
  { id: 'book_7', type: 'book', name: 'Book 7: Raging City Burns', connections: ['book_8'], unlockRequirement: { type: 'book', bookNumber: 6 } },
  { id: 'book_8', type: 'book', name: 'Book 8: Ouroboros Cycle', connections: ['book_9'], unlockRequirement: { type: 'book', bookNumber: 7 } },
  { id: 'book_9', type: 'book', name: 'Book 9: Crown of Memory', connections: [], unlockRequirement: { type: 'book', bookNumber: 8 } }
];

// ============ HELPER FUNCTIONS ============

export function getZoneById(id: string): RagingCityZone | undefined {
  return RAGING_CITY_ZONES.find(z => z.id === id);
}

export function getBookById(bookNumber: number): MainPath | undefined {
  return STORY_PATHS.find(p => p.bookNumber === bookNumber);
}

export function getChapterById(bookNumber: number, chapterNumber: number): PathChapter | undefined {
  const book = getBookById(bookNumber);
  return book?.chapters.find(c => c.chapterNumber === chapterNumber);
}

export function getSideQuestById(id: string): SideQuest | undefined {
  return SIDE_QUESTS.find(q => q.id === id);
}

export function getQuestsByLocation(location: string): SideQuest[] {
  return SIDE_QUESTS.filter(q => q.location === location);
}

export function getQuestsByType(type: SideQuest['type']): SideQuest[] {
  return SIDE_QUESTS.filter(q => q.type === type);
}

export function isNodeUnlocked(nodeId: string, progress: PlayerProgress): boolean {
  const node = WORLD_MAP.find(n => n.id === nodeId);
  if (!node || !node.unlockRequirement) return true;
  
  const req = node.unlockRequirement;
  switch (req.type) {
    case 'book':
      return req.bookNumber ? progress.completedBooks.includes(req.bookNumber) : true;
    case 'chapter':
      const chapterId = `b${req.bookNumber}_c${req.chapterNumber}`;
      return progress.completedChapters.includes(chapterId);
    case 'quest':
      return req.questId ? progress.completedQuests.includes(req.questId) : true;
    default:
      return true;
  }
}

export function getAvailableZones(progress: PlayerProgress): RagingCityZone[] {
  return RAGING_CITY_ZONES.filter(zone => isNodeUnlocked(zone.id, progress));
}

export function getAvailableBooks(progress: PlayerProgress): MainPath[] {
  return STORY_PATHS.filter(book => isNodeUnlocked(`book_${book.bookNumber}`, progress));
}

export function getConnectedNodes(nodeId: string): WorldMapNode[] {
  const node = WORLD_MAP.find(n => n.id === nodeId);
  if (!node) return [];
  return WORLD_MAP.filter(n => node.connections.includes(n.id));
}

export function calculateOverallProgress(currentBook: number, currentChapter: number): number {
  const totalChapters = 90;
  const chaptersPerBook = 10;
  const completedChapters = ((currentBook - 1) * chaptersPerBook) + (currentChapter - 1);
  return (completedChapters / totalChapters) * 100;
}

export function createInitialProgress(): PlayerProgress {
  return {
    completedBooks: [],
    currentBook: 1,
    currentChapter: 1,
    completedChapters: [],
    completedQuests: [],
    unlockedZones: ['sector_7']
  };
}
