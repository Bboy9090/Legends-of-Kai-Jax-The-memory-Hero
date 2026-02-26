export type StoryBeatType = 'narration' | 'dialogue' | 'action' | 'choice' | 'transition' | 'reveal';

export interface StoryBeat {
  id: string;
  type: StoryBeatType;
  speaker?: string;
  speakerTitle?: string;
  text: string;
  emotion?: 'neutral' | 'angry' | 'sad' | 'happy' | 'determined' | 'fear' | 'mysterious';
  duration?: number;
  cameraMove?: 'pan_left' | 'pan_right' | 'zoom_in' | 'zoom_out' | 'shake' | 'fade';
  soundEffect?: string;
  music?: string;
  visualEffect?: 'flash' | 'darken' | 'ember' | 'lightning' | 'memory_swirl';
}

export interface CinematicScene {
  id: string;
  chapterNumber: number;
  missionId: string;
  title: string;
  location: string;
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  weather: 'clear' | 'rain' | 'storm' | 'fog' | 'ember_rain';
  beats: StoryBeat[];
  triggersGameplay?: boolean;
  nextSceneId?: string;
}

export const PROLOGUE_SCENES: CinematicScene[] = [
  {
    id: 'prologue_awakening',
    chapterNumber: 0,
    missionId: 'p0_1',
    title: 'The Awakening',
    location: 'Home Town - The Orphanage',
    timeOfDay: 'night',
    weather: 'ember_rain',
    beats: [
      {
        id: 'p1',
        type: 'narration',
        text: 'Raging City. Once called the Bronx. Now... a war zone where the old gods are forgotten.',
        duration: 4000,
        cameraMove: 'pan_right',
        visualEffect: 'ember'
      },
      {
        id: 'p2',
        type: 'narration',
        text: 'But in the ashes of the world, two children dream of something more.',
        duration: 3500,
        visualEffect: 'ember'
      },
      {
        id: 'p3',
        type: 'transition',
        text: '— THE ORPHANAGE, ASHBLOCK HEIGHTS —',
        duration: 2000,
        cameraMove: 'fade'
      },
      {
        id: 'p4',
        type: 'dialogue',
        speaker: 'Jaxon',
        speakerTitle: 'The Electric Quill',
        text: '*wakes suddenly* Another nightmare... the same fire. The same voice calling my name.',
        emotion: 'fear',
        duration: 4000
      },
      {
        id: 'p5',
        type: 'dialogue',
        speaker: 'Kaison',
        speakerTitle: 'The Web-Spinner',
        text: '*from the bunk above* You too? I dreamed of... tails. Three of them. Made of starlight.',
        emotion: 'mysterious',
        duration: 4000
      },
      {
        id: 'p6',
        type: 'action',
        text: 'A distant explosion shakes the orphanage. Sirens wail across Ashblock Heights.',
        duration: 3000,
        cameraMove: 'shake',
        soundEffect: 'explosion_distant'
      },
      {
        id: 'p7',
        type: 'dialogue',
        speaker: 'Jaxon',
        text: 'The Fang Syndicate is hitting the district again. We need to move!',
        emotion: 'determined',
        duration: 3000
      },
      {
        id: 'p8',
        type: 'narration',
        text: 'What Jaxon and Kaison do not know... is that tonight, everything changes.',
        duration: 3500,
        visualEffect: 'darken'
      },
      {
        id: 'p9',
        type: 'narration',
        text: 'Tonight, the Hunger awakens.',
        duration: 2500,
        visualEffect: 'flash',
        cameraMove: 'zoom_in'
      }
    ],
    triggersGameplay: true
  },
  {
    id: 'prologue_first_fusion',
    chapterNumber: 0,
    missionId: 'p0_3',
    title: 'First Fusion',
    location: 'Ashblock Heights - Rooftops',
    timeOfDay: 'night',
    weather: 'storm',
    beats: [
      {
        id: 'ff1',
        type: 'action',
        text: 'The rooftops of Ashblock burn. Fang Enforcers close in from all sides.',
        duration: 3000,
        visualEffect: 'ember',
        cameraMove: 'pan_left'
      },
      {
        id: 'ff2',
        type: 'dialogue',
        speaker: 'Fang Enforcer',
        speakerTitle: 'Syndicate Soldier',
        text: 'Orphans! You picked the wrong night to run. Hand over the Fragment!',
        emotion: 'angry',
        duration: 3500
      },
      {
        id: 'ff3',
        type: 'dialogue',
        speaker: 'Kaison',
        text: 'Fragment? We don\'t have any—',
        emotion: 'fear',
        duration: 2000
      },
      {
        id: 'ff4',
        type: 'dialogue',
        speaker: 'Jaxon',
        text: '*electric quills begin to spark* Kaison... something\'s happening to me...',
        emotion: 'fear',
        duration: 3000,
        visualEffect: 'lightning'
      },
      {
        id: 'ff5',
        type: 'dialogue',
        speaker: 'Kaison',
        text: '*web threads emerge from fingertips* Me too... I can feel you. Inside my head.',
        emotion: 'mysterious',
        duration: 3500
      },
      {
        id: 'ff6',
        type: 'narration',
        text: 'For the first time in a thousand years, the Memory God stirs.',
        duration: 3000,
        visualEffect: 'memory_swirl'
      },
      {
        id: 'ff7',
        type: 'reveal',
        speaker: 'Ancient Voice',
        speakerTitle: 'Myrr\'Kai, The Memory Eater',
        text: '"What survives is not what is strongest... it is what remembers how to become again."',
        emotion: 'mysterious',
        duration: 5000,
        visualEffect: 'flash',
        cameraMove: 'zoom_in'
      },
      {
        id: 'ff8',
        type: 'action',
        text: 'Light explodes from both children. When it fades... only one figure stands.',
        duration: 3500,
        visualEffect: 'flash',
        cameraMove: 'shake'
      },
      {
        id: 'ff9',
        type: 'dialogue',
        speaker: 'Kai-Jax',
        speakerTitle: 'The Memory Hero',
        text: '*looks at three glowing tails* We are... one. WE ARE KAI-JAX!',
        emotion: 'determined',
        duration: 4000
      }
    ],
    triggersGameplay: true
  }
];

export const CHAPTER_1_SCENES: CinematicScene[] = [
  {
    id: 'ch1_the_hungry_edge',
    chapterNumber: 1,
    missionId: 'c1_1',
    title: 'The Hungry Edge',
    location: 'Sector-7 Outskirts',
    timeOfDay: 'dawn',
    weather: 'fog',
    beats: [
      {
        id: 'h1',
        type: 'narration',
        text: 'Three days since the Awakening. Jaxon and Kaison have learned to fuse... but not to control it.',
        duration: 4000
      },
      {
        id: 'h2',
        type: 'transition',
        text: '— SECTOR-7 OUTSKIRTS, THE HUNGRY EDGE —',
        duration: 2500,
        cameraMove: 'fade'
      },
      {
        id: 'h3',
        type: 'narration',
        text: 'This is where Raging City\'s forgotten come to starve. Where hunger is the only law.',
        duration: 3500,
        visualEffect: 'darken'
      },
      {
        id: 'h4',
        type: 'dialogue',
        speaker: 'Jaxon',
        text: '*stomach growling* When\'s the last time we ate something that wasn\'t garbage?',
        emotion: 'sad',
        duration: 3000
      },
      {
        id: 'h5',
        type: 'dialogue',
        speaker: 'Kaison',
        text: 'Focus. There\'s a supply drop happening at the old warehouse. If we can—',
        emotion: 'determined',
        duration: 3000
      },
      {
        id: 'h6',
        type: 'action',
        text: 'A massive figure blocks the street ahead. Eight feet tall. Eyes like burning coals.',
        duration: 3000,
        cameraMove: 'zoom_in'
      },
      {
        id: 'h7',
        type: 'dialogue',
        speaker: 'The Hollow King',
        speakerTitle: 'Sovereign of Hunger',
        text: '"Little chimeras... you carry the scent of the First Fang. Kar-Voth\'s hunger lives in you."',
        emotion: 'mysterious',
        duration: 5000
      },
      {
        id: 'h8',
        type: 'dialogue',
        speaker: 'Jaxon',
        text: 'We don\'t know what you\'re talking about. Get out of our way!',
        emotion: 'angry',
        duration: 2500
      },
      {
        id: 'h9',
        type: 'dialogue',
        speaker: 'The Hollow King',
        text: '"If you hesitate... you are already dead. That is the first lesson of Hunger."',
        emotion: 'determined',
        duration: 4000,
        visualEffect: 'darken'
      },
      {
        id: 'h10',
        type: 'narration',
        text: 'The Trial of Hunger begins.',
        duration: 2000,
        cameraMove: 'shake'
      }
    ],
    triggersGameplay: true
  }
];

export const CHAPTER_2_SCENES: CinematicScene[] = [
  {
    id: 'ch2_iron_order',
    chapterNumber: 2,
    missionId: 'c2_1',
    title: 'The Iron Order',
    location: 'Neon Ward',
    timeOfDay: 'night',
    weather: 'clear',
    beats: [
      {
        id: 'io1',
        type: 'narration',
        text: 'With Hunger mastered, the children seek answers. Who were the First Sabertooths? Why do they carry this power?',
        duration: 4500
      },
      {
        id: 'io2',
        type: 'transition',
        text: '— NEON WARD, THE IRON ORDER TERRITORY —',
        duration: 2500,
        cameraMove: 'fade'
      },
      {
        id: 'io3',
        type: 'narration',
        text: 'The Neon Ward. Where law is absolute. Where the Iron Order keeps peace through power.',
        duration: 3500
      },
      {
        id: 'io4',
        type: 'dialogue',
        speaker: 'Kaison',
        text: 'This place is different. Clean streets. No gangs. Why does everyone look so... afraid?',
        emotion: 'mysterious',
        duration: 3500
      },
      {
        id: 'io5',
        type: 'action',
        text: 'A figure descends from a rooftop. Armor like a lion\'s mane. Eyes cold as winter.',
        duration: 3000,
        cameraMove: 'zoom_in',
        visualEffect: 'lightning'
      },
      {
        id: 'io6',
        type: 'dialogue',
        speaker: 'Boryx Zenith',
        speakerTitle: 'Echo of Thryxen, The Storm Sovereign',
        text: '"You carry the Fusion signature. Myrr\'Kai\'s children... after all these centuries."',
        emotion: 'neutral',
        duration: 4500
      },
      {
        id: 'io7',
        type: 'dialogue',
        speaker: 'Jaxon',
        text: 'You know about the voice? The Memory Eater? Tell us everything!',
        emotion: 'determined',
        duration: 3000
      },
      {
        id: 'io8',
        type: 'dialogue',
        speaker: 'Boryx Zenith',
        text: '"Power that must shout has already lost control. You are not ready for answers."',
        emotion: 'neutral',
        duration: 4000
      },
      {
        id: 'io9',
        type: 'dialogue',
        speaker: 'Boryx Zenith',
        text: '"First, you must learn LAW. Control. Discipline. Or your Fusion will consume you."',
        emotion: 'determined',
        duration: 4500,
        visualEffect: 'lightning'
      },
      {
        id: 'io10',
        type: 'narration',
        text: 'The Trial of Law begins. Boryx Zenith will teach... or destroy.',
        duration: 3000,
        cameraMove: 'shake'
      }
    ],
    triggersGameplay: true
  }
];

export const CHAPTER_3_SCENES: CinematicScene[] = [
  {
    id: 'ch3_broken_bridge',
    chapterNumber: 3,
    missionId: 'c3_1',
    title: 'The Broken Bridge',
    location: 'Iron Market',
    timeOfDay: 'dusk',
    weather: 'rain',
    beats: [
      {
        id: 'bb1',
        type: 'narration',
        text: 'Boryx Zenith\'s training was brutal. But now Jaxon and Kaison understand their power.',
        duration: 4000
      },
      {
        id: 'bb2',
        type: 'narration',
        text: 'Two pillars mastered. Hunger and Law. But the hardest lesson awaits.',
        duration: 3500
      },
      {
        id: 'bb3',
        type: 'transition',
        text: '— IRON MARKET, THE BROKEN BRIDGE —',
        duration: 2500,
        cameraMove: 'fade'
      },
      {
        id: 'bb4',
        type: 'dialogue',
        speaker: 'Kaison',
        text: 'Something feels wrong here. My spider-sense is screaming.',
        emotion: 'fear',
        duration: 3000
      },
      {
        id: 'bb5',
        type: 'action',
        text: 'A figure emerges from the rain. Tiger stripes. Ember eyes. Ancient and tired.',
        duration: 3000,
        visualEffect: 'ember'
      },
      {
        id: 'bb6',
        type: 'dialogue',
        speaker: 'Boryn',
        speakerTitle: 'Echo of Pyraxis, The Bloodward Titan',
        text: '"Children of Memory... I have waited so long to meet you."',
        emotion: 'sad',
        duration: 4000
      },
      {
        id: 'bb7',
        type: 'dialogue',
        speaker: 'Jaxon',
        text: 'Another Sabertooth? Are you here to test us too?',
        emotion: 'determined',
        duration: 2500
      },
      {
        id: 'bb8',
        type: 'dialogue',
        speaker: 'Boryn',
        text: '"No. I am here to teach you the hardest lesson. The one that costs everything."',
        emotion: 'sad',
        duration: 4000,
        visualEffect: 'ember'
      },
      {
        id: 'bb9',
        type: 'dialogue',
        speaker: 'Boryn',
        text: '"I will break... so you do not have to. That is what fathers do."',
        emotion: 'determined',
        duration: 4500
      },
      {
        id: 'bb10',
        type: 'narration',
        text: 'The Trial of Sacrifice begins. Some lessons can only be taught with blood.',
        duration: 3500,
        visualEffect: 'darken',
        cameraMove: 'zoom_in'
      }
    ],
    triggersGameplay: true
  }
];

export const ALL_SCENES: CinematicScene[] = [
  ...PROLOGUE_SCENES,
  ...CHAPTER_1_SCENES,
  ...CHAPTER_2_SCENES,
  ...CHAPTER_3_SCENES
];

export function getSceneByMissionId(missionId: string): CinematicScene | undefined {
  return ALL_SCENES.find(scene => scene.missionId === missionId);
}

export function getScenesForChapter(chapterNumber: number): CinematicScene[] {
  return ALL_SCENES.filter(scene => scene.chapterNumber === chapterNumber);
}
