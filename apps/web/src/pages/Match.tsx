// Match Screen - Main Gameplay
// Path: apps/web/src/pages/Match.tsx

import React, { useEffect, useState, useContext, useRef } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { GameStateContext } from '@web/router/gameRouter';
import { createAllPlaceholderCharacters } from '@game/utils/PlaceholderModelGenerator';
import { CharacterMovementController } from '@game/controllers/CharacterMovementController';
import { KineticEngine } from '@game/engines/KineticEngine';
import { FeelabilityEngine } from '@game/engines/FeelabilityEngine';
import { EventBus } from '@game/core/EventBus';
import { MatchOverlay } from '@web/components/MatchOverlay';
import '@web/styles/bronx_grit.css';

const Match: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useContext(GameStateContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [matchTime, setMatchTime] = useState(180); // 3 minutes
  const [gameState, setGameState] = useState({
    p1: { hp: 100, resonance: 0 },
    p2: { hp: 100, resonance: 0 },
    winner: null as string | null,
  });

  // Initialize game
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.Fog(0x050505, 50, 100);

    const camera = new THREE.PerspectiveCamera(
      60,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      shadowMap: { enabled: true },
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffaa00, 0.8);
    keyLight.position.set(10, 10, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x00aaff, 0.3);
    rimLight.position.set(-10, 5, 5);
    scene.add(rimLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.8,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create characters
    const placeholderCharacters = createAllPlaceholderCharacters();
    const p1Character = placeholderCharacters.get(state.selectedCharacter || 'kai-jax')!;
    const p2Character = placeholderCharacters.get(state.opponent || 'lunara-solis')!;

    // Position characters
    p1Character.position.set(-5, 1, 0);
    p2Character.position.set(5, 1, 0);
    p2Character.rotation.y = Math.PI; // Face each other

    scene.add(p1Character);
    scene.add(p2Character);

    // Initialize game systems
    const eventBus = new EventBus();
    const kinetic = new KineticEngine();
    const feelability = new FeelabilityEngine(eventBus);

    // Create movement controllers
    const p1Controller = new CharacterMovementController(p1Character, kinetic, feelability, eventBus);
    const p2Controller = new CharacterMovementController(p2Character, kinetic, feelability, eventBus);

    // Ground plane for collision
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // Game loop
    let gameRunning = true;
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      if (!gameRunning) return;

      const deltaTime = Math.min(clock.getDelta(), 0.016); // Cap at 60fps

      // Update characters
      p1Controller.update(deltaTime, groundPlane);
      p2Controller.update(deltaTime, groundPlane);

      // Check match time
      setMatchTime((prev) => {
        if (prev <= 0) {
          gameRunning = false;
          // Determine winner by HP
          const p1Hp = gameState.p1.hp;
          const p2Hp = gameState.p2.hp;
          setGameState((prev) => ({
            ...prev,
            winner: p1Hp > p2Hp ? 'p1' : p2Hp > p1Hp ? 'p2' : 'draw',
          }));
          return 0;
        }
        return prev - deltaTime;
      });

      // Render
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Handle ESC to exit
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        gameRunning = false;
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyPress);
      renderer.dispose();
    };
  }, [state.selectedCharacter, state.opponent, gameState.p1.hp, gameState.p2.hp, navigate]);

  return (
    <div className="w-full h-screen bg-black relative">
      <div className="grit-filter" />

      {/* Game canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />

      {/* HUD Overlay */}
      <MatchOverlay
        p1Hp={gameState.p1.hp}
        p2Hp={gameState.p2.hp}
        p1Resonance={gameState.p1.resonance}
        p2Resonance={gameState.p2.resonance}
        matchTime={matchTime}
        winner={gameState.winner}
        p1Name={state.selectedCharacter || 'KAI-JAX'}
        p2Name={state.opponent || 'LUNARA SOLIS'}
      />

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 text-mono-small text-amber-400 text-xs z-20">
        <p>A/D - MOVE | SPACE - JUMP | J - ATTACK | ESC - EXIT</p>
      </div>
    </div>
  );
};

export default Match;
