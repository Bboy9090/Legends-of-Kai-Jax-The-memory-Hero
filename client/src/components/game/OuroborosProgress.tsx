import { useState, useEffect, useMemo } from "react";

interface OuroborosProgressProps {
  currentAct: number;
  currentChapter: number;
  totalActs?: number;
  chaptersPerAct?: number;
  onActSelect?: (act: number) => void;
}

const actData = [
  { name: "The Shield's Warmth", subtitle: "Pyraxis & The Orphans", color: "#ff6600" },
  { name: "The Mentor's Vigil", subtitle: "Thryxen's Training", color: "#00bfff" },
  { name: "Electric Awakening", subtitle: "Jaxon's Power", color: "#00ff88" },
  { name: "Spider's Thread", subtitle: "Kaison's Instinct", color: "#ff00ff" },
  { name: "The Fusion Trial", subtitle: "Birth of Kai-Jax", color: "#ffaa00" },
  { name: "Memory Strands", subtitle: "Three Tails Unleashed", color: "#00ffff" },
  { name: "Raging City Burns", subtitle: "The Bronx Falls", color: "#ff3300" },
  { name: "Ouroboros Cycle", subtitle: "Time Loops", color: "#9900ff" },
  { name: "Crown of Memory", subtitle: "Final Ascension", color: "#ffffff" }
];

export default function OuroborosProgress({
  currentAct = 1,
  currentChapter = 1,
  totalActs = 9,
  chaptersPerAct = 10,
  onActSelect
}: OuroborosProgressProps) {
  const [hoveredAct, setHoveredAct] = useState<number | null>(null);

  const overallProgress = useMemo(() => {
    const completedActs = currentAct - 1;
    const chapterProgress = (currentChapter - 1) / chaptersPerAct;
    return ((completedActs + chapterProgress) / totalActs) * 100;
  }, [currentAct, currentChapter, totalActs, chaptersPerAct]);

  return (
    <div 
      className="w-full min-h-screen flex flex-col"
      style={{
        backgroundImage: 'url(/sabertooth-lineage.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-70" />
      
      <div className="relative z-10 flex-1 flex flex-col p-8">
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-white to-cyan-500"
            style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}
          >
            SABERTOOTH LINEAGE SAGA
          </h1>
          <p className="text-gray-400 mt-2 tracking-widest text-sm">
            9 BOOKS • 90 CHAPTERS • THE MEMORY KING'S JOURNEY
          </p>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto w-full">
          {actData.map((act, index) => {
            const actNumber = index + 1;
            const isCompleted = actNumber < currentAct;
            const isCurrent = actNumber === currentAct;
            const isLocked = actNumber > currentAct;
            const isHovered = hoveredAct === actNumber;

            return (
              <button
                key={actNumber}
                onClick={() => !isLocked && onActSelect?.(actNumber)}
                onMouseEnter={() => setHoveredAct(actNumber)}
                onMouseLeave={() => setHoveredAct(null)}
                disabled={isLocked}
                className={`relative p-6 rounded-lg text-left transition-all duration-300 ${
                  isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'
                }`}
                style={{
                  background: isHovered || isCurrent
                    ? `linear-gradient(135deg, ${act.color}33 0%, rgba(0,0,0,0.8) 100%)`
                    : 'rgba(0,0,0,0.6)',
                  border: isCurrent 
                    ? `2px solid ${act.color}` 
                    : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: isCurrent ? `0 0 20px ${act.color}44` : 'none'
                }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black"
                    style={{
                      background: isCompleted 
                        ? `linear-gradient(135deg, ${act.color} 0%, ${act.color}88 100%)`
                        : 'rgba(50,50,50,0.8)',
                      border: `2px solid ${act.color}`,
                      color: isCompleted ? '#000' : act.color
                    }}
                  >
                    {isCompleted ? '✓' : actNumber}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 tracking-widest mb-1">
                      BOOK {actNumber}
                    </p>
                    <h3 
                      className="text-lg font-black text-white"
                      style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}
                    >
                      {act.name}
                    </h3>
                    <p className="text-sm text-gray-400">{act.subtitle}</p>
                    
                    {isCurrent && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Chapter {currentChapter}/{chaptersPerAct}</span>
                          <span>{Math.round((currentChapter / chaptersPerAct) * 100)}%</span>
                        </div>
                        <div 
                          className="h-1 rounded-full overflow-hidden"
                          style={{ background: 'rgba(255,255,255,0.1)' }}
                        >
                          <div 
                            className="h-full rounded-full"
                            style={{
                              width: `${(currentChapter / chaptersPerAct) * 100}%`,
                              background: act.color
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {isLocked && (
                    <div className="text-2xl opacity-50">🔒</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 max-w-2xl mx-auto w-full">
          <div className="text-center mb-2">
            <span 
              className="text-xs font-bold tracking-[0.3em] text-cyan-400"
              style={{ 
                fontFamily: "'Arial Black', 'Impact', sans-serif",
                textShadow: '0 0 10px rgba(0,191,255,0.5)'
              }}
            >
              OUROBOROS PROGRESS
            </span>
          </div>
          
          <div 
            className="h-4 rounded-full overflow-hidden relative"
            style={{
              background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
              border: '1px solid rgba(0,191,255,0.3)',
              boxShadow: '0 0 20px rgba(0,0,0,0.5), inset 0 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            <div 
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${overallProgress}%`,
                background: 'linear-gradient(90deg, #00bfff 0%, #00ff88 50%, #ffaa00 100%)',
                boxShadow: '0 0 10px rgba(0,191,255,0.8), 0 0 20px rgba(0,255,136,0.5)'
              }}
            />
            
            {[...Array(totalActs - 1)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-black bg-opacity-50"
                style={{ left: `${((i + 1) / totalActs) * 100}%` }}
              />
            ))}
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Book 1</span>
            <span className="text-cyan-400 font-bold">{Math.round(overallProgress)}% Complete</span>
            <span>Book 9</span>
          </div>
        </div>
      </div>
    </div>
  );
}
