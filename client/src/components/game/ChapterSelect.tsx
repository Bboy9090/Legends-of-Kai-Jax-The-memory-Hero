import { useState } from 'react';
import { useRunner } from '../../lib/stores/useRunner';
import { CAMPAIGN_CHAPTERS, PILLARS, getChapterProgress, isChapterLocked, type Chapter, type PillarType } from '../../lib/ragingCityCampaign';
import { ArrowLeft, Lock, Star, Swords, Shield, Flame, Brain, ChevronRight, MapPin } from 'lucide-react';

interface ChapterSelectProps {
  onSelectChapter: (chapterNumber: number) => void;
  onBack: () => void;
  completedChapters: number[];
}

const PILLAR_ICONS: Record<PillarType, React.ReactNode> = {
  hunger: <Flame className="w-5 h-5" />,
  law: <Shield className="w-5 h-5" />,
  sacrifice: <Swords className="w-5 h-5" />,
  memory: <Brain className="w-5 h-5" />
};

function ChapterCard({ chapter, isCompleted, onClick }: { chapter: Chapter; isCompleted: boolean; onClick: () => void }) {
  const locked = isChapterLocked(chapter.number);
  const pillarInfo = PILLARS[chapter.pillar];
  const progress = getChapterProgress(chapter.number);
  
  const darkenFactor = Math.min(chapter.number * 0.05, 0.3);
  
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={`
        w-full p-4 rounded-lg text-left transition-all duration-300 relative overflow-hidden
        ${locked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-xl cursor-pointer'}
        ${isCompleted ? 'ring-2 ring-green-500' : ''}
      `}
      style={{
        background: locked 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
          : `linear-gradient(135deg, rgba(${darkenFactor * 255}, ${darkenFactor * 255}, ${darkenFactor * 255}, 0.9) 0%, #1a1a1a 50%, ${pillarInfo.hex}20 100%)`,
        border: `1px solid ${locked ? '#333' : pillarInfo.hex}40`,
        boxShadow: locked ? 'none' : `0 4px 20px ${pillarInfo.hex}20`
      }}
    >
      {locked && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Coming in Full Release</p>
          </div>
        </div>
      )}
      
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-gray-400 text-xs tracking-wider mb-1">{chapter.publicName}</p>
          <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}>
            {chapter.districtName}
          </h3>
        </div>
        <div 
          className="p-2 rounded-full"
          style={{ 
            background: `${pillarInfo.hex}30`,
            color: pillarInfo.hex
          }}
        >
          {PILLAR_ICONS[chapter.pillar]}
        </div>
      </div>
      
      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{chapter.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span 
            className="text-xs font-bold px-2 py-1 rounded"
            style={{ 
              background: `${pillarInfo.hex}20`,
              color: pillarInfo.hex
            }}
          >
            {chapter.trialName}
          </span>
          {chapter.sovereign && (
            <span className="text-xs text-orange-400">
              <Star className="w-3 h-3 inline mr-1" />
              {chapter.sovereign.name}
            </span>
          )}
        </div>
        
        {!locked && (
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <span className="text-green-500 text-xs font-bold">COMPLETE</span>
            ) : progress > 0 ? (
              <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${progress}%`,
                    background: pillarInfo.hex
                  }}
                />
              </div>
            ) : null}
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>
    </button>
  );
}

export default function ChapterSelect({ onSelectChapter, onBack, completedChapters }: ChapterSelectProps) {
  const [selectedAct, setSelectedAct] = useState<'I' | 'II' | 'III'>('I');
  
  const actChapters = {
    'I': CAMPAIGN_CHAPTERS.filter(c => c.number <= 3),
    'II': CAMPAIGN_CHAPTERS.filter(c => c.number >= 4 && c.number <= 6),
    'III': CAMPAIGN_CHAPTERS.filter(c => c.number >= 7)
  };
  
  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to bottom, 
              rgba(0, 0, 0, 0.95) 0%, 
              rgba(20, 20, 30, 0.98) 50%,
              rgba(0, 0, 0, 0.95) 100%
            ),
            radial-gradient(ellipse at 30% 20%, rgba(255, 100, 0, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(0, 150, 255, 0.15) 0%, transparent 50%)
          `
        }}
      />
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              background: i % 2 === 0 ? '#ff660066' : '#00bfff66',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random() * 3}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 flex flex-col h-screen">
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-bold tracking-wider">BACK</span>
          </button>
          
          <div className="text-center">
            <h1 
              className="text-2xl font-black text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(180deg, #e0e0e0 0%, #808080 100%)',
                fontFamily: "'Arial Black', 'Impact', sans-serif"
              }}
            >
              STORY MODE
            </h1>
            <p className="text-gray-500 text-xs tracking-wider">DISTRICT TRIALS</p>
          </div>
          
          <div className="w-20" />
        </div>
        
        <div className="flex gap-2 p-4 justify-center">
          {(['I', 'II', 'III'] as const).map(act => (
            <button
              key={act}
              onClick={() => setSelectedAct(act)}
              className={`
                px-6 py-2 rounded-sm font-bold text-sm tracking-wider transition-all
                ${selectedAct === act 
                  ? 'bg-gradient-to-b from-gray-600 to-gray-800 text-white border border-gray-500' 
                  : 'bg-gray-900 text-gray-500 border border-gray-800 hover:border-gray-600'}
              `}
              style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}
            >
              ACT {act}
            </button>
          ))}
        </div>
        
        <div className="p-4 text-center">
          <p className="text-gray-400 text-sm">
            {selectedAct === 'I' && 'THE AGE OF PROTECTION - Street survival, identity formation'}
            {selectedAct === 'II' && 'THE AGE OF LAW - Discipline, truth, legacy (Coming Soon)'}
            {selectedAct === 'III' && 'THE AGE OF MEMORY - Erasure, identity, inevitability (Coming Soon)'}
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto space-y-4">
            {actChapters[selectedAct].map(chapter => (
              <ChapterCard
                key={chapter.number}
                chapter={chapter}
                isCompleted={completedChapters.includes(chapter.number)}
                onClick={() => onSelectChapter(chapter.number)}
              />
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-800 bg-black/50">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex gap-4">
              {Object.entries(PILLARS).map(([key, pillar]) => (
                <div key={key} className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ background: pillar.hex }}
                  />
                  <span className="text-xs text-gray-500 capitalize">{key}</span>
                </div>
              ))}
            </div>
            
            <div className="text-right">
              <p className="text-gray-500 text-xs">Beta Content: Prologue + Chapters 1-3</p>
              <p className="text-cyan-400 text-xs font-bold">
                {completedChapters.length}/4 Complete
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
