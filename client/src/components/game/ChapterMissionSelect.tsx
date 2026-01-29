import { useState } from 'react';
import { ArrowLeft, Star, Check, Lock, Flame, Shield, Swords, Brain, ChevronRight, MapPin } from 'lucide-react';
import { 
  getChapterByNumber, 
  PILLARS, 
  type Chapter, 
  type Mission, 
  type PillarType,
  type ChapterNumber
} from '../../lib/ragingCityCampaign';
import { useCampaign } from '../../lib/stores/useCampaign';

interface ChapterMissionSelectProps {
  chapterNumber: ChapterNumber;
  onSelectMission: (missionId: string) => void;
  onBack: () => void;
}

const PILLAR_ICONS: Record<PillarType, React.ReactNode> = {
  hunger: <Flame className="w-4 h-4" />,
  law: <Shield className="w-4 h-4" />,
  sacrifice: <Swords className="w-4 h-4" />,
  memory: <Brain className="w-4 h-4" />
};

function MissionCard({ mission, isCompleted, isLocked, onClick }: { 
  mission: Mission; 
  isCompleted: boolean;
  isLocked: boolean;
  onClick: () => void;
}) {
  const pillarInfo = PILLARS[mission.pillar];
  
  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`
        w-full p-4 rounded-lg text-left transition-all duration-200 relative
        ${isLocked ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.01] cursor-pointer'}
        ${isCompleted ? 'bg-green-900/20 border-green-500/30' : 'bg-gray-900/50 border-gray-700/30'}
        border
      `}
      style={{
        boxShadow: isCompleted ? '0 0 10px rgba(34, 197, 94, 0.2)' : 'none'
      }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="p-2 rounded-lg shrink-0"
          style={{ 
            background: `${pillarInfo.hex}20`,
            color: pillarInfo.hex
          }}
        >
          {mission.isSovereign ? <Star className="w-5 h-5" /> : PILLAR_ICONS[mission.pillar]}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-bold truncate">
              {mission.name}
            </h3>
            {mission.isSovereign && (
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                SOVEREIGN
              </span>
            )}
          </div>
          
          <p className="text-gray-400 text-sm mb-2 line-clamp-1">
            {mission.description}
          </p>
          
          <div className="flex items-center gap-3 text-xs">
            <span 
              className="px-2 py-0.5 rounded capitalize"
              style={{ 
                background: `${pillarInfo.hex}15`,
                color: pillarInfo.hex
              }}
            >
              {mission.pillar}
            </span>
            
            <span className="text-gray-500">
              +{mission.rewards.xp} XP
            </span>
            
            {mission.rewards.fragments.length > 0 && (
              <span className="text-purple-400">
                +{mission.rewards.fragments.length} Fragment
              </span>
            )}
          </div>
        </div>
        
        <div className="shrink-0">
          {isCompleted ? (
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-500" />
            </div>
          ) : isLocked ? (
            <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center">
              <Lock className="w-4 h-4 text-gray-500" />
            </div>
          ) : (
            <ChevronRight className="w-6 h-6 text-gray-400" />
          )}
        </div>
      </div>
    </button>
  );
}

export default function ChapterMissionSelect({ chapterNumber, onSelectMission, onBack }: ChapterMissionSelectProps) {
  const chapter = getChapterByNumber(chapterNumber);
  const { completedMissions, isMissionCompleted } = useCampaign();
  
  if (!chapter) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-500">Chapter not found</p>
      </div>
    );
  }
  
  const pillarInfo = PILLARS[chapter.pillar];
  const completedCount = chapter.missions.filter(m => isMissionCompleted(m.id)).length;
  const progress = chapter.missions.length > 0 ? (completedCount / chapter.missions.length) * 100 : 0;
  
  const getMissionLockStatus = (mission: Mission, index: number) => {
    if (index === 0) return false;
    const prevMission = chapter.missions[index - 1];
    return !isMissionCompleted(prevMission.id);
  };
  
  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to bottom, 
              ${pillarInfo.hex}15 0%, 
              rgba(0, 0, 0, 0.98) 30%,
              rgba(0, 0, 0, 0.95) 100%
            )
          `
        }}
      />
      
      <div className="relative z-10 flex flex-col h-screen">
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-bold tracking-wider">BACK TO CHAPTERS</span>
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-xs tracking-wider mb-1">{chapter.publicName}</p>
              <h1 
                className="text-3xl font-black text-white mb-1"
                style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}
              >
                {chapter.districtName}
              </h1>
              <p 
                className="text-sm font-bold tracking-wider"
                style={{ color: pillarInfo.hex }}
              >
                {chapter.trialName}
              </p>
            </div>
            
            <div 
              className="p-3 rounded-xl"
              style={{ 
                background: `${pillarInfo.hex}20`,
                color: pillarInfo.hex
              }}
            >
              {PILLAR_ICONS[chapter.pillar]}
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">Progress</span>
              <span className="text-gray-400">{completedCount}/{chapter.missions.length}</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${progress}%`,
                  background: pillarInfo.hex
                }}
              />
            </div>
          </div>
        </div>
        
        {chapter.landmarks.length > 0 && (
          <div className="p-4 border-b border-gray-800/50">
            <p className="text-gray-500 text-xs tracking-wider mb-2">LANDMARKS</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {chapter.landmarks.map(landmark => (
                <div 
                  key={landmark.id}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-900/50 rounded-lg shrink-0"
                >
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-300">{landmark.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-gray-500 text-xs tracking-wider mb-3">MISSIONS</p>
          
          <div className="space-y-3">
            {chapter.missions.map((mission, index) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                isCompleted={isMissionCompleted(mission.id)}
                isLocked={getMissionLockStatus(mission, index)}
                onClick={() => onSelectMission(mission.id)}
              />
            ))}
          </div>
          
          {chapter.missions.length === 0 && (
            <div className="text-center py-12">
              <Lock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">Missions coming in full release</p>
            </div>
          )}
        </div>
        
        {chapter.sovereign && (
          <div 
            className="p-4 border-t border-gray-800"
            style={{ background: `${pillarInfo.hex}10` }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-full"
                style={{ background: `${pillarInfo.hex}30` }}
              >
                <Star className="w-5 h-5" style={{ color: pillarInfo.hex }} />
              </div>
              <div>
                <p className="text-gray-400 text-xs">TRIAL SOVEREIGN</p>
                <p className="text-white font-bold">{chapter.sovereign.name}</p>
                <p className="text-gray-500 text-xs italic">"{chapter.sovereign.philosophy}"</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
