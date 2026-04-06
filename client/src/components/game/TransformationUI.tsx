import { useTransformations } from '../../lib/stores/useTransformations';
import { useSquad } from '../../lib/stores/useSquad';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Zap } from 'lucide-react';

export default function TransformationUI() {
  const { squad, activeHeroIndex } = useSquad();
  const { transformationLevels, transformationMeters, activateTransformation, getHeroTransformation, canTransform } = useTransformations();
  
  const activeHeroId = squad[activeHeroIndex];
  const currentLevel = transformationLevels[activeHeroId] || 0;
  const meter = transformationMeters[activeHeroId] || 0;
  const transformation = getHeroTransformation(activeHeroId);

  const handleTransform = () => {
    if (currentLevel === 0 && canTransform(activeHeroId, 1)) {
      activateTransformation(activeHeroId, 1);
    } else if (currentLevel === 1 && canTransform(activeHeroId, 2)) {
      activateTransformation(activeHeroId, 2);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-30">
      <Card className="bg-slate-900 bg-opacity-95 border-yellow-500 border-2 w-64">
        <CardContent className="p-3">
          {/* Transformation State */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-yellow-400 text-xs font-bold">TRANSFORMATION</span>
              {transformation && (
                <span className="text-white text-xs font-bold">{transformation.name}</span>
              )}
            </div>
            
            {/* Meter Bar */}
            <div className="bg-slate-800 h-3 rounded-full overflow-hidden border border-yellow-600">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-red-500 transition-all duration-300"
                style={{ width: `${meter}%` }}
              />
            </div>
            <p className="text-yellow-300 text-xs mt-1">{meter.toFixed(0)}% / 100%</p>
          </div>

          {/* Transform Button */}
          {currentLevel < 2 && (
            <Button
              onClick={handleTransform}
              disabled={meter < 100}
              className={`w-full py-2 text-sm font-black ${
                meter >= 100
                  ? 'bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 animate-pulse'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              <Zap className="w-4 h-4 mr-2" />
              {currentLevel === 0 ? 'TRANSFORM LV1' : 'TRANSFORM LV2'}
            </Button>
          )}

          {/* Current Power Multiplier */}
          {transformation && transformation.level > 0 && (
            <div className="mt-3 text-center">
              <p className="text-red-500 text-lg font-black">{transformation.powerMultiplier}x POWER</p>
              <p className="text-cyan-400 text-xs">{transformation.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
