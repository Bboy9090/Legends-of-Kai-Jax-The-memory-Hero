import { MissionStep } from '../types';

export const MISSION_1_STEPS: MissionStep[] = [
  {
    id: 'm1-opening',
    title: '01. Ashblock After Dusk',
    objective: 'Clear the Fang Syndicate scouts blocking Ashblock Row.',
    hint: 'Use Light Attacks (J / Click), Heavy Breakers (K / Right-Click), and Dodge (L / Q). Switch between Kai and Jax anytime.',
    targetPos: [0, 0, -14],
    dialogueOnStart: [
      {
        speaker: 'Bovar (Comms)',
        role: 'Adoptive Father',
        portraitHero: 'bovar',
        text: 'Kai, Jax—stay off the main avenue! The Fang Syndicate locked down the Alley Gate and swept half the block.',
      },
      {
        speaker: 'Jax',
        role: 'Storm Fang',
        portraitHero: 'jax',
        text: 'Let them try to hold the street. Give the word, Kai, and I\'ll break their frontline wide open.',
      },
      {
        speaker: 'Kai',
        role: 'Memory-Web Heir',
        portraitHero: 'kai',
        text: 'Stay sharp. Civilians are still trapped past the market stalls, and something near the plaza is tearing at my head—like a static echo.',
      },
    ],
  },
  {
    id: 'm1-rescue',
    title: '02. Rescue the Trapped Citizens',
    objective: 'Defeat the Syndicate ambushers and rescue 2 endangered civilians in the Side Alley & Rooftop Walkway.',
    hint: 'Approach trapped civilians and press Interact (E) after clearing nearby guards. Use Web Swing or stairs to reach the high walkway.',
    targetPos: [-16, 0, -24],
    dialogueOnStart: [
      {
        speaker: 'Kai',
        role: 'Memory-Web Heir',
        portraitHero: 'kai',
        text: 'That\'s the first squad down. Keep moving—two neighbors are pinned behind the shipping crates and up on the fire-escape deck.',
      },
      {
        speaker: 'Jax',
        role: 'Storm Fang',
        portraitHero: 'jax',
        text: 'I see the overhead crane line. Swing across or vault the crates—I\'m right on your flank.',
      },
    ],
  },
  {
    id: 'm1-memory-site',
    title: '03. The Disrupted Memory Site',
    objective: 'Investigate the fractured Myrr\'Kai memory rift in the Plaza and weave it back together.',
    hint: 'Stand near the glowing violet crystal pillar and press Interact (E) or trigger Memory Weave (Ability 3 as Kai).',
    targetPos: [16, 0, -28],
    dialogueOnStart: [
      {
        speaker: 'Kai',
        role: 'Memory-Web Heir',
        portraitHero: 'kai',
        text: 'Look at the pavement—threads of violet light bleeding out of the stone. Someone tried to scrub what happened here.',
      },
      {
        speaker: 'Jax',
        role: 'Storm Fang',
        portraitHero: 'jax',
        text: 'My mane\'s bristling just standing near it. Pull it together, brother—let\'s see what the Syndicate is hiding.',
      },
    ],
  },
  {
    id: 'm1-alley-gate',
    title: '04. Breach the Alley Gate',
    objective: 'Reach the barricaded Alley Gate and overload its security pylon.',
    hint: 'Use Web Swing from the street crane or sprint north to the steel Alley Gate and interact (E) to unlock the Courtyard.',
    targetPos: [0, 0, -48],
    dialogueOnStart: [
      {
        speaker: 'Kai',
        role: 'Memory-Web Heir',
        portraitHero: 'kai',
        text: 'That memory echo... Boryn stood at this gate before the city fell silent. The Fang Syndicate didn\'t take Ashblock alone.',
      },
      {
        speaker: 'Jax',
        role: 'Storm Fang',
        portraitHero: 'jax',
        text: 'Answers are on the other side of that Alley Gate. Let\'s tear the lock off.',
      },
    ],
  },
  {
    id: 'm1-boss',
    title: '05. The City Bites Back',
    objective: 'Defeat the Fang Enforcer in the Ashblock Courtyard.',
    hint: 'Break the Enforcer\'s armor with Heavy Attacks and Storm Pressure. Parry or dodge red ground-slam telegraphs!',
    targetPos: [0, 0, -72],
    dialogueOnStart: [
      {
        speaker: 'Fang Enforcer',
        role: 'Syndicate Heavy Commander',
        portraitHero: 'enforcer',
        text: 'Two stray cubs rattling the gate? Bovar should\'ve kept you chained indoors. Ashblock belongs to the Fang now.',
      },
      {
        speaker: 'Jax',
        role: 'Storm Fang',
        portraitHero: 'jax',
        text: 'Big talk for a tin-plated bully. Watch his hammer swing—it\'s heavy, which means it leaves an opening!',
      },
      {
        speaker: 'Kai',
        role: 'Memory-Web Heir',
        portraitHero: 'kai',
        text: 'Together, Jax. Don\'t let him corner us!',
      },
    ],
  },
];

export const FUSION_AWAKENING_DIALOGUE = [
  {
    speaker: 'Fang Enforcer',
    role: 'Syndicate Heavy Commander',
    portraitHero: 'enforcer' as const,
    text: 'Enough games! Hydraulic Overdrive—let\'s crush this courtyard down to bedrock!',
  },
  {
    speaker: 'Jax',
    role: 'Storm Fang',
    portraitHero: 'jax' as const,
    text: 'Kai—his shockwave\'s locking down the whole plaza! My storm and your threads are resonating!',
  },
  {
    speaker: 'Kai',
    role: 'Memory-Web Heir',
    portraitHero: 'kai' as const,
    text: 'Ember, Storm, and Memory... three threads, one will. Grab on, brother—NOW!',
  },
  {
    speaker: 'Kai-Jax',
    role: 'The Memory Hero (Three-Tail Convergence)',
    portraitHero: 'kaijax' as const,
    text: 'We remember what you tried to erase. Press Fusion [F] to unleash Kai-Jax and finish the Enforcer!',
  },
];

export const MISSION_1_VICTORY_DIALOGUE = [
  {
    speaker: 'Kai',
    role: 'Memory-Web Heir',
    portraitHero: 'kai' as const,
    text: 'The Enforcer\'s down, and the blockade across Ashblock Heights is breaking.',
  },
  {
    speaker: 'Jax',
    role: 'Storm Fang',
    portraitHero: 'jax' as const,
    text: 'That felt like thunder and fire forged into one body. Whatever Borax and Boryn hid from us... it\'s waking up.',
  },
  {
    speaker: 'Bovar (Comms)',
    role: 'Adoptive Father',
    portraitHero: 'bovar' as const,
    text: 'I felt that surge from three blocks away. Catch your breath, boys—Sector-7 scouts already know the gate fell. Rest at Ashblock and prepare.',
  },
];
