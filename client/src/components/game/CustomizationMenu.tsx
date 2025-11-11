import { useState } from "react";
import { useRunner, Character } from "../../lib/stores/useRunner";
import { ACCESSORIES, getAccessoriesByType, AccessoryType, canEquipAccessory } from "../../lib/cosmetics";
import { Lock } from "lucide-react";

export default function CustomizationMenu() {
  const { 
    selectedCharacter, 
    equippedCosmetics, 
    unlockedAccessories, 
    highScore,
    equipAccessory,
    unequipAccessory,
    setGameState 
  } = useRunner();
  
  const [selectedSlot, setSelectedSlot] = useState<AccessoryType>('hat');
  
  const equipped = equippedCosmetics[selectedCharacter];
  const availableAccessories = getAccessoriesByType(selectedSlot).filter(
    acc => canEquipAccessory(acc, selectedCharacter)
  );
  
  const handleEquip = (accessoryId: string) => {
    equipAccessory(selectedCharacter, accessoryId, selectedSlot);
  };
  
  const handleUnequip = () => {
    unequipAccessory(selectedCharacter, selectedSlot);
  };
  
  const isUnlocked = (accessoryId: string) => {
    return unlockedAccessories.includes(accessoryId);
  };
  
  const accessorySlots: { type: AccessoryType; label: string }[] = [
    { type: 'hat', label: '🎩 Hat' },
    { type: 'glasses', label: '😎 Glasses' },
    { type: 'cape', label: '🦸 Cape' },
    { type: 'belt', label: '⚡ Belt' },
    { type: 'backpack', label: '🎒 Backpack' },
    { type: 'mask', label: '🎭 Mask' },
    { type: 'gloves', label: '🥊 Gloves' },
    { type: 'boots', label: '👟 Boots' }
  ];
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-black/40 border-b-4 border-cyan-400 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Customize {selectedCharacter === 'jaxon' ? 'Jaxon' : 'Kaison'}
            </h1>
            <p className="text-gray-300 mt-1">High Score: {highScore}</p>
          </div>
          <button
            onClick={() => setGameState('menu')}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
          >
            ← Back to Menu
          </button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
        {/* Left: Accessory Slots */}
        <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-cyan-400/30 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">Accessory Slots</h2>
          <div className="space-y-2">
            {accessorySlots.map(slot => {
              const equippedItem = equipped[slot.type];
              const isSelected = selectedSlot === slot.type;
              
              return (
                <button
                  key={slot.type}
                  onClick={() => setSelectedSlot(slot.type)}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-500/30 border-2 border-cyan-400'
                      : 'bg-white/10 border-2 border-transparent hover:bg-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{slot.label}</span>
                    {equippedItem && (
                      <span className="text-sm bg-green-500/30 px-2 py-1 rounded">
                        ✓ Equipped
                      </span>
                    )}
                  </div>
                  {equippedItem && (
                    <p className="text-sm text-gray-300 mt-1">
                      {ACCESSORIES.find(a => a.id === equippedItem)?.name}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Middle: Available Accessories */}
        <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-400/30 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">
            {selectedSlot.charAt(0).toUpperCase() + selectedSlot.slice(1)} Options
          </h2>
          
          {equipped[selectedSlot] && (
            <button
              onClick={handleUnequip}
              className="w-full mb-4 p-4 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-400 rounded-lg transition-all"
            >
              <span className="font-bold">✗ Remove Current</span>
            </button>
          )}
          
          <div className="space-y-3">
            {availableAccessories.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No accessories available for this slot
              </p>
            ) : (
              availableAccessories.map(accessory => {
                const unlocked = isUnlocked(accessory.id);
                const isEquipped = equipped[selectedSlot] === accessory.id;
                
                return (
                  <div
                    key={accessory.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isEquipped
                        ? 'bg-green-500/20 border-green-400'
                        : unlocked
                        ? 'bg-white/10 border-white/30 hover:bg-white/20 cursor-pointer'
                        : 'bg-gray-800/50 border-gray-600 opacity-60'
                    }`}
                    onClick={() => unlocked && !isEquipped && handleEquip(accessory.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          {accessory.name}
                          {!unlocked && <Lock className="w-4 h-4 text-yellow-400" />}
                          {isEquipped && <span className="text-green-400">✓</span>}
                        </h3>
                        <p className="text-sm text-gray-300 mt-1">{accessory.description}</p>
                        <div className="mt-2 flex gap-2">
                          {accessory.color && (
                            <div 
                              className="w-6 h-6 rounded border-2 border-white/50"
                              style={{ backgroundColor: accessory.color }}
                            />
                          )}
                          {accessory.emissiveColor && (
                            <div 
                              className="w-6 h-6 rounded border-2 border-white/50"
                              style={{ backgroundColor: accessory.emissiveColor }}
                              title="Glow color"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {!unlocked && (
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <p className="text-yellow-400 text-sm font-semibold">
                          🔒 Unlock at {accessory.unlockRequirement} points
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Need {accessory.unlockRequirement - highScore} more points
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Right: Character Preview & Info */}
        <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-pink-400/30 p-6">
          <h2 className="text-2xl font-bold mb-4 text-pink-400">Preview</h2>
          
          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-lg aspect-square flex items-center justify-center border-2 border-white/20 mb-4">
            <div className="text-center">
              <div className="text-8xl mb-4">
                {selectedCharacter === 'jaxon' ? '🔴' : '🔵'}
              </div>
              <p className="text-xl font-bold">
                {selectedCharacter === 'jaxon' ? 'Jaxon' : 'Kaison'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {Object.keys(equipped).length} accessories equipped
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-bold text-cyan-400 mb-2">Currently Equipped:</h3>
              {Object.keys(equipped).length === 0 ? (
                <p className="text-gray-400 text-sm">No accessories equipped</p>
              ) : (
                <ul className="space-y-1">
                  {Object.entries(equipped).map(([slot, id]) => {
                    const accessory = ACCESSORIES.find(a => a.id === id);
                    return (
                      <li key={slot} className="text-sm flex justify-between items-center">
                        <span className="text-gray-300">
                          {slot.charAt(0).toUpperCase() + slot.slice(1)}:
                        </span>
                        <span className="font-semibold">{accessory?.name}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-lg p-4 border border-white/20">
              <h3 className="font-bold text-yellow-400 mb-2">💡 Tip:</h3>
              <p className="text-sm text-gray-200">
                Earn points by playing the game to unlock more accessories!
              </p>
            </div>
            
            <div className="bg-green-600/20 rounded-lg p-4 border border-green-400/30">
              <h3 className="font-bold text-green-400 mb-1">Unlocked:</h3>
              <p className="text-2xl font-bold">{unlockedAccessories.length} / {ACCESSORIES.length}</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-cyan-400 h-2 rounded-full transition-all"
                  style={{ width: `${(unlockedAccessories.length / ACCESSORIES.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
