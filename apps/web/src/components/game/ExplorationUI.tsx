import { useState, useEffect } from "react";

interface District {
  name: string;
  description: string;
}

const DISTRICT_INFO: Record<string, District> = {
  "Ashblock Heights": { name: "Ashblock Heights", description: "Fang Syndicate territory - rooftop battles" },
  "Sector-7 Outskirts": { name: "Sector-7 Outskirts", description: "Collapsed infrastructure, first fusion site" },
  "Neon Ward": { name: "Neon Ward", description: "Speed trials and colorful deception" },
  "Iron Market": { name: "Iron Market", description: "Black market deals, moral choices await" },
  "The Undercrown": { name: "The Undercrown", description: "Ancient ruins hold Sabertooth secrets" },
  "Zenith Spires": { name: "Zenith Spires", description: "Gravity-distorted towers" },
  "Erasure Fields": { name: "Erasure Fields", description: "Reality deletion zones" },
  "Memory Nexus": { name: "Memory Nexus", description: "All timelines converge here" }
};

interface ExplorationUIProps {
  currentDistrict: string;
  encounterAlert?: {
    type: 'battle' | 'boss' | 'story' | 'loot';
    district: string;
    level: number;
  } | null;
  onDismissAlert?: () => void;
}

export default function ExplorationUI({ currentDistrict, encounterAlert, onDismissAlert }: ExplorationUIProps) {
  const [showDistrictBanner, setShowDistrictBanner] = useState(false);
  const [lastDistrict, setLastDistrict] = useState(currentDistrict);
  
  useEffect(() => {
    if (currentDistrict !== lastDistrict) {
      setShowDistrictBanner(true);
      setLastDistrict(currentDistrict);
      
      const timer = setTimeout(() => {
        setShowDistrictBanner(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [currentDistrict, lastDistrict]);
  
  const district = DISTRICT_INFO[currentDistrict] || { name: currentDistrict, description: "" };
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute top-4 left-4 bg-black/70 px-4 py-2 rounded-lg border border-orange-500/30">
        <div className="text-orange-400 text-sm font-bold uppercase tracking-wider">
          {district.name}
        </div>
        <div className="text-gray-400 text-xs">{district.description}</div>
      </div>
      
      <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-2 rounded-lg border border-gray-600/30">
        <div className="text-gray-300 text-xs">
          <span className="text-cyan-400">WASD</span> Move | 
          <span className="text-orange-400 ml-2">Walk into glowing zones</span> to trigger encounters
        </div>
      </div>
      
      {showDistrictBanner && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
          <div className="bg-gradient-to-r from-transparent via-black/90 to-transparent px-20 py-8">
            <div className="text-center">
              <div className="text-orange-500 text-lg font-light tracking-[0.3em] uppercase mb-2">
                Entering
              </div>
              <div className="text-white text-4xl font-bold tracking-wider uppercase" 
                   style={{ textShadow: "0 0 20px #ff6600" }}>
                {district.name}
              </div>
              <div className="text-gray-400 text-sm mt-2 italic">
                {district.description}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {encounterAlert && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <div className="bg-black/95 border-2 rounded-xl p-8 text-center max-w-md mx-4 animate-pulse"
               style={{ 
                 borderColor: encounterAlert.type === 'boss' ? '#ff0000' :
                              encounterAlert.type === 'story' ? '#9932cc' :
                              encounterAlert.type === 'loot' ? '#ffd700' : '#ff6600'
               }}>
            <div className="text-2xl font-bold uppercase tracking-wider mb-2"
                 style={{ 
                   color: encounterAlert.type === 'boss' ? '#ff0000' :
                          encounterAlert.type === 'story' ? '#9932cc' :
                          encounterAlert.type === 'loot' ? '#ffd700' : '#ff6600'
                 }}>
              {encounterAlert.type === 'boss' ? 'BOSS ENCOUNTER!' :
               encounterAlert.type === 'story' ? 'STORY EVENT!' :
               encounterAlert.type === 'loot' ? 'TREASURE FOUND!' : 'ENEMY ENCOUNTER!'}
            </div>
            
            <div className="text-gray-300 text-sm mb-4">
              {encounterAlert.district} - Level {encounterAlert.level}
            </div>
            
            {encounterAlert.type === 'battle' || encounterAlert.type === 'boss' ? (
              <div className="text-white text-lg">
                Prepare for combat!
              </div>
            ) : encounterAlert.type === 'story' ? (
              <div className="text-white text-lg">
                A memory from the past awakens...
              </div>
            ) : (
              <div className="text-white text-lg">
                Claim your reward!
              </div>
            )}
            
            <button
              onClick={onDismissAlert}
              className="mt-6 px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg uppercase tracking-wider transition-colors pointer-events-auto"
            >
              {encounterAlert.type === 'battle' || encounterAlert.type === 'boss' ? 'FIGHT!' : 'CONTINUE'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
