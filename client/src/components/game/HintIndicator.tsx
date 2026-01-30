import { useState, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';

interface HintIndicatorProps {
  hint: {
    direction: string;
    description: string;
  } | null;
  onDismiss: () => void;
}

export default function HintIndicator({ hint, onDismiss }: HintIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
  useEffect(() => {
    if (hint) {
      setIsVisible(true);
      setIsExpanded(true);
      
      const collapseTimer = setTimeout(() => {
        setIsExpanded(false);
      }, 5000);
      
      return () => clearTimeout(collapseTimer);
    } else {
      setIsVisible(false);
    }
  }, [hint]);
  
  if (!isVisible || !hint) return null;
  
  const getDirectionArrow = (direction: string) => {
    const dir = direction.toLowerCase();
    if (dir.includes('east') || dir.includes('right')) return '→';
    if (dir.includes('west') || dir.includes('left')) return '←';
    if (dir.includes('north') || dir.includes('up')) return '↑';
    if (dir.includes('south') || dir.includes('down')) return '↓';
    if (dir.includes('central') || dir.includes('tower')) return '◆';
    return '•';
  };
  
  return (
    <div 
      className={`
        fixed top-20 right-4 z-40 transition-all duration-300
        ${isExpanded ? 'w-64' : 'w-12'}
      `}
    >
      {isExpanded ? (
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-xs font-bold tracking-wider">
                LEAD
              </span>
            </div>
            <button 
              onClick={onDismiss}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-white text-sm mb-2">
            {hint.description}
          </p>
          
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <span className="text-lg">{getDirectionArrow(hint.direction)}</span>
            <span className="capitalize">{hint.direction}</span>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-12 h-12 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-cyan-500/30 hover:border-cyan-500 transition-colors group"
        >
          <MapPin className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
        </button>
      )}
    </div>
  );
}
