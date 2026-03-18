/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * MODULE ICONS - Icons for all game modules
 */

import {
  BookOpen,
  Gamepad2,
  Swords,
  Users,
  Trophy,
  Flame,
  Skull,
  Zap,
  Sparkles,
  Crown,
  Shield,
  Target,
  Play,
  Settings,
  Shirt,
  Home,
  Video,
  WandSparkles,
  Pencil,
} from 'lucide-react';

export interface ModuleIconProps {
  module: string;
  size?: number;
  className?: string;
}

export function getModuleIcon(module: string) {
  const iconMap: Record<string, typeof BookOpen> = {
    // Story modes
    'beast-wars-story': BookOpen,
    'story-mode': BookOpen,
    'legacy-story': BookOpen,
    
    // Game modes
    'game-modes': Gamepad2,
    'towers': Trophy,
    'gauntlet': Flame,
    'survivor': Skull,
    'versus': Swords,
    'versus-1v1': Swords,
    'versus-2v2': Users,
    'versus-3v3': Users,
    
    // Main menu
    'nexus-haven': Home,
    'quick-battle': Play,
    'customization': Shirt,
    'character-showcase': Crown,
    'settings': Settings,
    
    // Other
    'mission': Target,
    'battle': Swords,
    'training': Shield,
    'ffmpeg': Video,
    'level-editor': Video,
    'level-editor-1': WandSparkles,
    'level-designer-1': WandSparkles,
    'level-builder-1': WandSparkles,
    'level-creator-1': WandSparkles,
    'level-editor-2': WandSparkles,
    'level-designer-2': WandSparkles,
    'level-builder-2': WandSparkles,
    'level-creator-2': WandSparkles,
    'level-editor-3': WandSparkles,
    'level-designer-3': WandSparkles,
    'level-builder-3': WandSparkles,
    'level-creator-3': WandSparkles,
    'level-editor-4': WandSparkles,
    'level-designer-4': WandSparkles,
    'level-builder-4': WandSparkles,
    'level-creator-4': WandSparkles,
    'level-editor-5': WandSparkles,
    'level-designer-5': WandSparkles,
    'level-builder-5': WandSparkles,
    'level-creator-5': WandSparkles,
    'level-editor-6': WandSparkles,
    'level-designer-6': WandSparkles,
    'level-builder-6': WandSparkles,
    'level-creator-6': WandSparkles, };

  return iconMap[module] || Sparkles;
}

export default function ModuleIcon({ module, size = 24, className = '' }: ModuleIconProps) {
  const Icon = getModuleIcon(module);
  return <Icon size={size} className={className} />;
}
