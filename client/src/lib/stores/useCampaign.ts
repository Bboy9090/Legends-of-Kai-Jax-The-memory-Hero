import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  type ChapterNumber, 
  type PillarType,
  CAMPAIGN_CHAPTERS,
  getChapterByNumber,
  getMissionById 
} from '../ragingCityCampaign';

interface CampaignState {
  currentChapter: ChapterNumber;
  currentMissionId: string | null;
  
  completedMissions: string[];
  completedChapters: ChapterNumber[];
  
  collectedFragments: string[];
  unlockedAbilities: string[];
  
  gameFlags: Record<string, boolean>;
  
  health: number;
  maxHealth: number;
  dread: number;
  fusion: number;
  maxFusion: number;
  fusionLocked: boolean;
  
  tailsUnlocked: number;
  
  pathOath: PillarType | null;
  
  setCurrentChapter: (chapter: ChapterNumber) => void;
  setCurrentMission: (missionId: string | null) => void;
  completeMission: (missionId: string) => void;
  completeChapter: (chapter: ChapterNumber) => void;
  collectFragment: (fragmentId: string) => void;
  unlockAbility: (abilityId: string) => void;
  setGameFlag: (flag: string, value: boolean) => void;
  
  setHealth: (health: number) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  setDread: (dread: number) => void;
  addDread: (amount: number) => void;
  setFusion: (fusion: number) => void;
  addFusion: (amount: number) => void;
  setFusionLocked: (locked: boolean) => void;
  
  unlockTail: () => void;
  setPathOath: (oath: PillarType) => void;
  
  resetCampaign: () => void;
  
  isChapterUnlocked: (chapter: ChapterNumber) => boolean;
  isMissionCompleted: (missionId: string) => boolean;
  hasFragment: (fragmentId: string) => boolean;
  hasAbility: (abilityId: string) => boolean;
  hasFlag: (flag: string) => boolean;
  getChapterProgress: (chapter: ChapterNumber) => number;
}

const initialState = {
  currentChapter: 0 as ChapterNumber,
  currentMissionId: null,
  completedMissions: [],
  completedChapters: [],
  collectedFragments: [],
  unlockedAbilities: ['dodge'],
  gameFlags: {
    PROLOGUE_STARTED: true,
    WORLD_MAP_ENABLED: false,
    FRAGMENT_SYSTEM_ENABLED: false
  },
  health: 100,
  maxHealth: 100,
  dread: 0,
  fusion: 0,
  maxFusion: 100,
  fusionLocked: true,
  tailsUnlocked: 0,
  pathOath: null
};

export const useCampaign = create<CampaignState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCurrentChapter: (chapter) => set({ currentChapter: chapter }),
      
      setCurrentMission: (missionId) => set({ currentMissionId: missionId }),
      
      completeMission: (missionId) => {
        const mission = getMissionById(missionId);
        if (!mission) return;
        
        set((state) => {
          const newFlags = { ...state.gameFlags };
          mission.rewards.flags.forEach(flag => {
            newFlags[flag] = true;
          });
          
          const newAbilities = [...state.unlockedAbilities];
          mission.rewards.abilities?.forEach(ability => {
            if (!newAbilities.includes(ability)) {
              newAbilities.push(ability);
            }
          });
          
          const newFragments = [...state.collectedFragments];
          mission.rewards.fragments.forEach(fragment => {
            if (!newFragments.includes(fragment)) {
              newFragments.push(fragment);
            }
          });
          
          return {
            completedMissions: [...state.completedMissions, missionId],
            gameFlags: newFlags,
            unlockedAbilities: newAbilities,
            collectedFragments: newFragments,
            currentMissionId: null
          };
        });
      },
      
      completeChapter: (chapter) => {
        set((state) => ({
          completedChapters: [...state.completedChapters, chapter]
        }));
      },
      
      collectFragment: (fragmentId) => {
        set((state) => ({
          collectedFragments: [...state.collectedFragments, fragmentId]
        }));
      },
      
      unlockAbility: (abilityId) => {
        set((state) => ({
          unlockedAbilities: [...state.unlockedAbilities, abilityId]
        }));
      },
      
      setGameFlag: (flag, value) => {
        set((state) => ({
          gameFlags: { ...state.gameFlags, [flag]: value }
        }));
      },
      
      setHealth: (health) => set({ health: Math.max(0, Math.min(get().maxHealth, health)) }),
      
      takeDamage: (amount) => {
        const newHealth = Math.max(0, get().health - amount);
        set({ health: newHealth });
        get().addDread(amount * 0.5);
      },
      
      heal: (amount) => {
        set({ health: Math.min(get().maxHealth, get().health + amount) });
      },
      
      setDread: (dread) => set({ dread: Math.max(0, Math.min(100, dread)) }),
      
      addDread: (amount) => {
        set({ dread: Math.min(100, get().dread + amount) });
      },
      
      setFusion: (fusion) => set({ fusion: Math.max(0, Math.min(get().maxFusion, fusion)) }),
      
      addFusion: (amount) => {
        if (!get().fusionLocked) {
          set({ fusion: Math.min(get().maxFusion, get().fusion + amount) });
        }
      },
      
      setFusionLocked: (locked) => set({ fusionLocked: locked }),
      
      unlockTail: () => {
        set((state) => ({
          tailsUnlocked: Math.min(9, state.tailsUnlocked + 1)
        }));
      },
      
      setPathOath: (oath) => set({ pathOath: oath }),
      
      resetCampaign: () => set(initialState),
      
      isChapterUnlocked: (chapter) => {
        const state = get();
        if (chapter === 0) return true;
        if (chapter > 3) return false;
        
        const prevChapter = chapter - 1;
        return state.completedChapters.includes(prevChapter as ChapterNumber) || 
               state.hasFlag(`CHAPTER_${chapter}_GATE_UNLOCKED`);
      },
      
      isMissionCompleted: (missionId) => {
        return get().completedMissions.includes(missionId);
      },
      
      hasFragment: (fragmentId) => {
        return get().collectedFragments.includes(fragmentId);
      },
      
      hasAbility: (abilityId) => {
        return get().unlockedAbilities.includes(abilityId);
      },
      
      hasFlag: (flag) => {
        return get().gameFlags[flag] === true;
      },
      
      getChapterProgress: (chapter) => {
        const chapterData = getChapterByNumber(chapter);
        if (!chapterData) return 0;
        
        const state = get();
        const completedInChapter = chapterData.missions.filter(
          m => state.completedMissions.includes(m.id)
        ).length;
        
        return chapterData.missions.length > 0 
          ? (completedInChapter / chapterData.missions.length) * 100 
          : 0;
      }
    }),
    {
      name: 'kaijax-campaign-storage'
    }
  )
);
