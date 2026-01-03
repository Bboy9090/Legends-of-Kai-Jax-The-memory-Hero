// Updated Main Menu with Navigation
// Path: apps/web/src/pages/AeternaMainMenu.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GameStateContext } from '@web/router/gameRouter';
import '@web/styles/bronx_grit.css';

interface MenuItem {
  label: string;
  path: string;
  description: string;
}

const AeternaMainMenu: React.FC = () => {
  const navigate = useNavigate();
  const { setState } = React.useContext(GameStateContext);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const menuItems: MenuItem[] = [
    {
      label: 'SAGA MODE',
      path: '/character-select',
      description: 'Experience the story of the Memory Hero',
    },
    {
      label: 'VERSUS MODE',
      path: '/character-select',
      description: 'Face off against opponents',
    },
    {
      label: 'GALLERY',
      path: '/',
      description: 'View character art and lore',
    },
    {
      label: 'SETTINGS',
      path: '/',
      description: 'Game configuration',
    },
  ];

  const handleSelectMode = (index: number) => {
    const item = menuItems[index];
    
    // Set game mode before navigation
    if (index === 0) {
      setState({ selectedMode: 'saga' });
    } else if (index === 1) {
      setState({ selectedMode: 'versus' });
    }

    navigate(item.path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        setSelectedIndex(Math.max(0, selectedIndex - 1));
        break;
      case 'ArrowDown':
        setSelectedIndex(Math.min(menuItems.length - 1, selectedIndex + 1));
        break;
      case 'Enter':
      case ' ':
        handleSelectMode(selectedIndex);
        break;
    }
  };

  return (
    <div
      className="w-full h-screen bg-black flex flex-col items-center justify-center relative"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Grit overlay */}
      <div className="grit-filter" />

      {/* Title */}
      <div className="text-center mb-12 relative z-10">
        <h1 className="text-legendary text-5xl mb-2 tracking-widest">
          BEAST-KIN SOVEREIGNTY
        </h1>
        <h2 className="text-mono-small text-amber-400 mb-4">GENESIS</h2>
        <p className="text-grit text-sm">THE MEMORY HERO AWAITS</p>
      </div>

      {/* Menu Items */}
      <div className="relative z-10 flex flex-col gap-4 w-64">
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            onClick={() => handleSelectMode(index)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`
              btn-grit
              py-4 px-6
              text-left
              transition-all duration-200
              ${
                index === selectedIndex
                  ? 'bg-amber-400 text-black scale-105 ring-2 ring-amber-400'
                  : 'bg-matte text-amber-400 hover:bg-gray-900'
              }
            `}
          >
            <div className="text-mono-small font-bold">{item.label}</div>
            <div className="text-xs text-gray-400 mt-1">{item.description}</div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-center text-grit text-xs w-full">
        <p>THE SOURCE REMEMBERS UNITY</p>
        <p className="text-gray-600 mt-1">© 2026 AETERNA COVENANT</p>
      </div>
    </div>
  );
};

export default AeternaMainMenu;
