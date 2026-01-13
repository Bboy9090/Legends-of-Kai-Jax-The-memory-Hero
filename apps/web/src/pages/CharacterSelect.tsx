// Character Selection Screen
// Path: apps/web/src/pages/CharacterSelect.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameStateContext } from '@web/router/gameRouter';
import { createAllPlaceholderCharacters } from '@game/utils/PlaceholderModelGenerator';
import { loadCharacterModel } from '@game/utils/ModelLoader';
import * as THREE from 'three';
import '@web/styles/bronx_grit.css';

interface CharacterOption {
  id: string;
  name: string;
  title: string;
  stats: {
    weight: number;
    speed: number;
    power: number;
    defense: number;
  };
}

const CHARACTERS: CharacterOption[] = [
  {
    id: 'kai-jax',
    name: 'KAI-JAX',
    title: 'The Memory King',
    stats: { weight: 80, speed: 85, power: 80, defense: 70 },
  },
  {
    id: 'lunara-solis',
    name: 'LUNARA SOLIS',
    title: 'Oracle Sentinel',
    stats: { weight: 75, speed: 70, power: 85, defense: 80 },
  },
  {
    id: 'umbra-flux',
    name: 'UMBRA-FLUX',
    title: 'Velocity Wraith',
    stats: { weight: 70, speed: 95, power: 75, defense: 65 },
  },
  {
    id: 'boryx-zenith',
    name: 'BORYX ZENITH',
    title: 'Guardian King',
    stats: { weight: 110, speed: 50, power: 95, defense: 90 },
  },
  {
    id: 'sentinel-vox',
    name: 'SENTINEL VOX',
    title: 'Star-Force Kitsune',
    stats: { weight: 85, speed: 90, power: 85, defense: 75 },
  },
  {
    id: 'kiro-kong',
    name: 'KIRO KONG',
    title: 'Primal Breaker',
    stats: { weight: 105, speed: 60, power: 100, defense: 85 },
  },
];

const CharacterSelect: React.FC = () => {
  const navigate = useNavigate();
  const { state, setState } = React.useContext(GameStateContext);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modelScene, setModelScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);

  // Initialize 3D preview
  useEffect(() => {
    const canvas = document.getElementById('character-preview') as HTMLCanvasElement;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    const cam = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    cam.position.set(0, 1, 2);
    cam.lookAt(0, 1, 0);

    const rend = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    rend.setSize(canvas.clientWidth, canvas.clientHeight);
    rend.shadowMap.enabled = true;
    rend.shadowMap.type = THREE.PCFShadowShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffaa00, 0.8);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x0099ff, 0.4);
    rimLight.position.set(-5, 2, 3);
    scene.add(rimLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Load initial character
    const placeholderCharacters = createAllPlaceholderCharacters();
    const initialCharacter = placeholderCharacters.get(CHARACTERS[0].id);
    if (initialCharacter) {
      scene.add(initialCharacter);
    }

    setModelScene(scene);
    setCamera(cam);
    setRenderer(rend);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate character for better view
      const character = scene.children.find(c => c.name === CHARACTERS[selectedIndex].id);
      if (character && character instanceof THREE.Group) {
        character.rotation.y += 0.01;
      }

      rend.render(scene, cam);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      cam.aspect = width / height;
      cam.updateProjectionMatrix();
      rend.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      rend.dispose();
    };
  }, [selectedIndex]);

  // Update displayed character
  useEffect(() => {
    if (!modelScene) return;

    // Remove old character
    const oldCharacter = modelScene.children.find(
      c => c.name && c.name !== 'ground' && c instanceof THREE.Group
    );
    if (oldCharacter) {
      modelScene.remove(oldCharacter);
    }

    // Add new character
    const placeholderCharacters = createAllPlaceholderCharacters();
    const newCharacter = placeholderCharacters.get(CHARACTERS[selectedIndex].id);
    if (newCharacter) {
      modelScene.add(newCharacter);
    }
  }, [selectedIndex, modelScene]);

  const handleSelectCharacter = () => {
    const selected = CHARACTERS[selectedIndex];
    setState({ ...state, selectedCharacter: selected.id });
    
    // Navigate to appropriate mode launcher
    if (state.selectedMode === 'saga') {
      navigate('/saga-mode');
    } else if (state.selectedMode === 'versus') {
      navigate('/versus-mode');
    } else {
      navigate('/saga-mode'); // Default to saga
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        setSelectedIndex(Math.max(0, selectedIndex - 1));
        break;
      case 'ArrowRight':
        setSelectedIndex(Math.min(CHARACTERS.length - 1, selectedIndex + 1));
        break;
      case 'Enter':
      case ' ':
        handleSelectCharacter();
        break;
      case 'Escape':
        navigate('/');
        break;
    }
  };

  const selected = CHARACTERS[selectedIndex];

  return (
    <div
      className="w-full h-screen bg-black flex flex-col relative"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Grit overlay */}
      <div className="grit-filter" />

      {/* Header */}
      <div className="relative z-10 text-center pt-8">
        <h1 className="text-legendary text-4xl tracking-widest">SELECT YOUR HERO</h1>
        <p className="text-mono-small text-amber-400 mt-2">{selected.title}</p>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex gap-8 px-8 py-8">
        {/* 3D Preview */}
        <div className="flex-1 flex items-center justify-center">
          <canvas
            id="character-preview"
            className="w-full h-full max-w-md rounded border border-amber-400/30"
          />
        </div>

        {/* Character info + stats */}
        <div className="flex-1 flex flex-col justify-center gap-6">
          <div>
            <h2 className="text-legendary text-3xl mb-2">{selected.name}</h2>
            <p className="text-grit text-sm mb-4 max-w-xs">
              Champion fighter with unique combat signature and memory-based abilities.
            </p>
          </div>

          {/* Stats display */}
          <div className="space-y-2">
            {Object.entries(selected.stats).map(([stat, value]) => (
              <div key={stat} className="flex items-center gap-4">
                <span className="text-mono-small w-20">{stat.toUpperCase()}</span>
                <div className="w-48 h-2 bg-matte border border-amber-400/30 rounded">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-cyan-400 rounded transition-all"
                    style={{ width: `${(value / 120) * 100}%` }}
                  />
                </div>
                <span className="text-grit text-sm w-8">{value}</span>
              </div>
            ))}
          </div>

          {/* Navigation hints */}
          <div className="pt-4 border-t border-amber-400/30">
            <div className="text-mono-small text-amber-400 space-y-1">
              <p>← → SELECT CHARACTER</p>
              <p>ENTER TO CONFIRM</p>
              <p>ESC TO RETURN</p>
            </div>
          </div>
        </div>
      </div>

      {/* Character thumbnails */}
      <div className="relative z-10 flex justify-center gap-4 pb-8 px-8 overflow-x-auto">
        {CHARACTERS.map((char, idx) => (
          <button
            key={char.id}
            onClick={() => setSelectedIndex(idx)}
            className={`
              px-4 py-2 rounded text-mono-small transition-all flex-shrink-0
              ${
                idx === selectedIndex
                  ? 'bg-amber-400 text-black ring-2 ring-amber-400'
                  : 'bg-matte text-amber-400 hover:bg-gray-900 border border-amber-400/30'
              }
            `}
          >
            {char.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CharacterSelect;
