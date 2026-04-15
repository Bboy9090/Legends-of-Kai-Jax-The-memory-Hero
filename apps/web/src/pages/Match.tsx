// Match Screen - Main Gameplay with LEGENDARY COMBAT SYSTEMS
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
import { CombatSystem } from '@game/systems/CombatSystem';
import { AnimationStateMachine } from '@game/systems/AnimationStateMachine';
import { AudioSystem } from '@game/systems/AudioSystem';
import { VFXCoordinator } from '@game/systems/VFXCoordinator';
import { MatchStateManager } from '@game/managers/MatchStateManager';
import { StoryProgressManager } from '@game/managers/StoryProgressManager';
import { PerformanceProfiler, getProfiler } from '@game/debug/PerformanceProfiler';
import { MatchOverlay } from '@web/components/MatchOverlay';
// 🔥 LEGENDARY COMBAT SYSTEMS
import { LegendaryComboSystem } from '@engine/combat/LegendaryComboSystem';
import { PerfectDodgeParrySystem } from '@engine/combat/PerfectDodgeParrySystem';
import { LegendaryVisualEffects } from '@engine/effects/LegendaryVisualEffects';
import '@web/styles/bronx_grit.css';

const Match: React.FC = () => {
  const navigate = useNavigate();
  const { state, setState } = useContext(GameStateContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [matchTime, setMatchTime] = useState(180); // 3 minutes
  
  // 🔥 ENHANCED GAME STATE with Legendary Combat Data + Story Mode
  const [gameState, setGameState] = useState({
    p1: { hp: 100, resonance: 0, ultimate: 0, reflex: 0 },
    p2: { hp: 100, resonance: 0, ultimate: 0, reflex: 0 },
    winner: null as string | null,
    combo: { hits: 0, multiplier: 1.0, tier: null as string | null },
    slowMotion: { active: false, scale: 1.0 },
    screenShake: { active: false, intensity: 0 },
  });
  
  // 📖 STORY MODE STATE
  const [showStoryDialogue, setShowStoryDialogue] = useState(false);
  const [storyDialogue, setStoryDialogue] = useState<string[]>([]);
  const [currentDialogueLine, setCurrentDialogueLine] = useState(0);
  const isStoryMode = state.storyMode || false;

  // 📖 STORY MODE: Show pre-fight dialogue
  useEffect(() => {
    if (isStoryMode && state.storyDialogue && state.storyDialogue.length > 0) {
      setStoryDialogue(state.storyDialogue);
      setShowStoryDialogue(true);
      setCurrentDialogueLine(0);
      
      console.log('📖 [Story] Pre-fight dialogue:', state.storyDialogue);
      
      // Auto-advance dialogue
      let lineIndex = 0;
      const dialogueInterval = setInterval(() => {
        lineIndex++;
        if (lineIndex < state.storyDialogue.length) {
          setCurrentDialogueLine(lineIndex);
        } else {
          clearInterval(dialogueInterval);
          setTimeout(() => setShowStoryDialogue(false), 2000);
        }
      }, 3000);
      
      return () => clearInterval(dialogueInterval);
    }
  }, [isStoryMode, state.storyDialogue]);

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
    camera.position.set(0, 2, 6);
    const cameraBasePosition = camera.position.clone();
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      shadowMap: { enabled: true },
      powerPreference: 'high-performance',
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting setup - LEGENDARY 3-POINT LIGHTING
    const ambientLight = new THREE.AmbientLight(0xb4b4ff, 0.2);
    scene.add(ambientLight);

    // Key light (main directional)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // Fill light (soft ambient from left)
    const fillLight = new THREE.DirectionalLight(0x7dd3fc, 0.3);
    fillLight.position.set(-5, 3, 5);
    scene.add(fillLight);
    
    // Rim light (edge highlight from behind)
    const rimLight = new THREE.DirectionalLight(0xfbbf24, 0.8);
    rimLight.position.set(0, 4, -8);
    scene.add(rimLight);
    
    // Hemisphere light (sky/ground)
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x654321, 0.4);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    
    // Accent point lights
    const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 10, 2);
    pointLight1.position.set(0, 5, 0);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x9d4edd, 0.3, 15, 2);
    pointLight2.position.set(-5, 2, -5);
    scene.add(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0x00d9ff, 0.3, 15, 2);
    pointLight3.position.set(5, 2, -5);
    scene.add(pointLight3);

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

    // Initialize all game systems
    const combat = new CombatSystem(eventBus);
    const audio = new AudioSystem(eventBus);
    const vfx = new VFXCoordinator(scene, camera, eventBus);
    const matchState = new MatchStateManager(
      state.selectedCharacter || 'kai-jax',
      state.opponent || 'lunara-solis',
      180,
      eventBus
    );
    const profiler = getProfiler();
    
    // 🔥 LEGENDARY COMBAT SYSTEMS INITIALIZATION
    const legendaryCombo = new LegendaryComboSystem();
    const perfectDodgeParry = new PerfectDodgeParrySystem();
    const legendaryVFX = new LegendaryVisualEffects();
    let timeScale = 1.0; // For slow-motion effects
    
    console.log('🔥 LEGENDARY COMBAT SYSTEMS ACTIVATED!');

    // Register character stats with combat system
    const characterStats: Record<string, { weight: number; power: number; defense: number }> = {
      'kai-jax': { weight: 80, power: 0.9, defense: 0.95 },
      'lunara-solis': { weight: 75, power: 1.05, defense: 0.9 },
      'umbra-flux': { weight: 70, power: 0.95, defense: 0.85 },
      'boryx-zenith': { weight: 110, power: 1.1, defense: 1.05 },
      'sentinel-vox': { weight: 85, power: 0.95, defense: 0.9 },
      'kiro-kong': { weight: 105, power: 1.0, defense: 1.0 },
    };

    const p1Id = state.selectedCharacter || 'kai-jax';
    const p2Id = state.opponent || 'lunara-solis';
    const p1Stats = characterStats[p1Id] || { weight: 80, power: 1, defense: 1 };
    const p2Stats = characterStats[p2Id] || { weight: 80, power: 1, defense: 1 };

    combat.registerCharacter(p1Id, p1Stats, p1Character.position);
    combat.registerCharacter(p2Id, p2Stats, p2Character.position);

    // Initialize animation state machines
    const p1Mixer = new THREE.AnimationMixer(p1Character);
    const p1Anims = new AnimationStateMachine(p1Character, p1Mixer, eventBus);
    const p2Mixer = new THREE.AnimationMixer(p2Character);
    const p2Anims = new AnimationStateMachine(p2Character, p2Mixer, eventBus);

    // Ground plane for collision
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // Game loop state
    let gameRunning = true;
    const clock = new THREE.Clock();
    let p1AttackCooldown = 0;
    let p2AttackCooldown = 0;
    let debugMode = false;

    // Subscribe to critical game events
    const handleCharacterHit = (data: Record<string, any>) => {
      // 🔥 RECORD HIT IN LEGENDARY COMBO SYSTEM
      const hitType = data.heavy ? 'heavy' : 'light';
      const isPerfectTiming = data.perfectTiming || false;
      const isAerial = data.aerial || false;
      
      legendaryCombo.recordHit(
        data.attackerId,
        { damage: data.damage, critical: data.critical || false },
        hitType as any,
        isPerfectTiming,
        isAerial,
        false // team combo
      );
      
      // Get combo state for UI update
      const comboState = legendaryCombo.getComboState(data.attackerId);
      
      // Apply damage from hit
      const iface = matchState as Record<string, any>;
      if (iface.applyDamage) {
        // Apply damage with combo multiplier!
        const damageWithMultiplier = data.damage * (comboState?.multiplier || 1.0);
        iface.applyDamage(data.defenderId, damageWithMultiplier);
      }
      
      // 🔥 LEGENDARY VISUAL EFFECTS
      legendaryVFX.triggerScreenShake(0.5, undefined, data.damage);
      legendaryVFX.triggerHitEffect(
        data.hitPosition,
        comboState && comboState.hits >= 10 ? 'crit' : 'hit'
      );
      
      if (comboState && comboState.tier) {
        legendaryVFX.triggerComboVisualization(
          comboState.hits,
          comboState.tier,
          new THREE.Vector2(0.5, 0.3) // Screen position
        );
      }
      
      // Update game state immediately with combo data
      const matchStats = matchState.getMatchStats();
      setGameState(prev => ({
        ...prev,
        p1: { 
          hp: Math.max(0, matchStats.p1HP), 
          resonance: Math.max(0, matchStats.p1Resonance),
          ultimate: prev.p1.ultimate,
          reflex: prev.p1.reflex
        },
        p2: { 
          hp: Math.max(0, matchStats.p2HP), 
          resonance: Math.max(0, matchStats.p2Resonance),
          ultimate: prev.p2.ultimate,
          reflex: prev.p2.reflex
        },
        winner: matchStats.winner,
        combo: {
          hits: comboState?.hits || 0,
          multiplier: comboState?.multiplier || 1.0,
          tier: comboState?.tier || null
        }
      }));
      
      // Trigger VFX and audio on hit
      vfx.createImpactEffect(data.hitPosition);
      audio.playHitEffect(data.heavy ? 'heavy' : 'light');
      
      console.log(`🔥 [LEGENDARY HIT] ${data.attackerId} → ${data.defenderId}: ${damageWithMultiplier.toFixed(1)} DMG (${comboState?.hits || 0} hit combo, ${(comboState?.multiplier || 1.0).toFixed(2)}x multiplier)`);
    };

    const handleAttackTriggered = (data: Record<string, any>) => {
      // Play attack sound effect
      audio.playAttackEffect(data.heavy ? 'heavy' : 'light');
      console.log(`[Combat] ${data.characterId} triggered ${data.heavy ? 'heavy' : 'light'} attack`);
    };

    const handleMatchEnded = (data: Record<string, any>) => {
      // Match ended, show victory state
      gameRunning = false;
      console.log(`[Match] Match ended! Winner: ${data.winner}`);
      
      // 📖 STORY MODE: Save chapter completion
      if (isStoryMode && data.winner === 'p1' && state.currentBook && state.currentChapterNumber) {
        const storyManager = StoryProgressManager.getInstance();
        const matchStats = matchState.getMatchStats();
        
        // Get legendary combat stats
        const perfectDodgeParryState = perfectDodgeParry.getState('p1');
        const comboState = legendaryCombo.getComboState(state.selectedCharacter || 'kai-jax');
        
        // Complete chapter with performance metrics
        storyManager.completeChapter(
          state.currentBook,
          state.currentChapterNumber,
          {
            completionTime: 180000 - (matchStats.timeRemaining * 1000),
            perfectDodges: perfectDodgeParryState?.dodgeCount || 0,
            perfectParries: perfectDodgeParryState?.parryCount || 0,
            maxCombo: comboState?.hits || 0,
            finalHP: matchStats.p1HP,
            bossDefeated: state.opponent?.includes('malakor') || state.opponent?.includes('void-king'),
          }
        );
        
        console.log('📖 [Story] Chapter completed! Progress saved.');
        
        // Show story victory dialogue after delay
        setTimeout(() => {
          const victoryDialogue = [
            `Chapter ${state.currentChapterNumber} Complete!`,
            `The memory of ${state.opponent} has been absorbed.`,
            'Continue your journey...',
          ];
          
          setStoryDialogue(victoryDialogue);
          setShowStoryDialogue(true);
          setCurrentDialogueLine(0);
          
          // Return to saga mode after dialogue
          setTimeout(() => {
            setShowStoryDialogue(false);
            navigate('/saga-mode');
          }, 9000);
        }, 4000);
      }
    };

    // Subscribe to events
    eventBus.subscribe('character:hit', handleCharacterHit);
    eventBus.subscribe('attack:triggered', handleAttackTriggered);
    eventBus.subscribe('match:ended', handleMatchEnded);

    // Handle browser autoplay policy - resume audio on first user interaction
    const handleFirstUserInteraction = () => {
      audio.resume().catch((err: Error) => console.warn('[Audio] Resume failed (autoplay policy):', err));
      // Only need this once
      document.removeEventListener('click', handleFirstUserInteraction);
      document.removeEventListener('keydown', handleFirstUserInteraction);
    };
    document.addEventListener('click', handleFirstUserInteraction);
    document.addEventListener('keydown', handleFirstUserInteraction);

    // Handle keyboard input for attacks
    const keysPressed: { [key: string]: boolean } = {};
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = true;

      // P1 Attack (J key)
      if ((e.key === 'j' || e.key === 'J') && gameRunning) {
        if (p1Controller.getPhysics) {
          const p1Physics = p1Controller.getPhysics();
          p1Physics.attackTriggered = true;
        }
      }
      
      // 🔥 P1 DODGE (Shift key) - PERFECT DODGE SYSTEM
      if ((e.key === 'Shift') && gameRunning) {
        const result = perfectDodgeParry.attemptPerfectDodge(
          state.selectedCharacter || 'kai-jax',
          performance.now() + 200 // Simulate incoming attack timing
        );
        
        if (result.success && result.state) {
          console.log('🔥 PERFECT DODGE! Slow-motion activated!');
          timeScale = result.timeScale || 0.25;
          audio.playDodgeEffect?.();
          legendaryVFX.triggerPerfectDodgeEffect(p1Character.position);
          
          // Update UI
          setGameState(prev => ({
            ...prev,
            slowMotion: { active: true, scale: timeScale },
            p1: { ...prev.p1, reflex: Math.min(100, prev.p1.reflex + result.state!.reflexMeterGain) }
          }));
          
          // Reset after slow-motion duration
          setTimeout(() => {
            timeScale = 1.0;
            setGameState(prev => ({
              ...prev,
              slowMotion: { active: false, scale: 1.0 }
            }));
          }, 3000);
        }
      }
      
      // 🔥 P1 PARRY (Q key) - PERFECT PARRY SYSTEM
      if ((e.key === 'q' || e.key === 'Q') && gameRunning) {
        const result = perfectDodgeParry.attemptPerfectParry(
          state.selectedCharacter || 'kai-jax',
          performance.now() + 150 // Simulate incoming attack timing
        );
        
        if (result.success && result.state) {
          console.log('🔥 PERFECT PARRY! Enemy stunned!');
          audio.playParryEffect?.();
          legendaryVFX.triggerPerfectParryEffect(p1Character.position);
          legendaryVFX.triggerScreenFlash('#FFD700', 0.8, 100);
          
          // Update UI
          setGameState(prev => ({
            ...prev,
            p1: { ...prev.p1, resonance: Math.min(100, prev.p1.resonance + result.state!.resonanceMeterGain) }
          }));
        }
      }

      // Debug mode toggle (D key)
      if (e.key === 'd' || e.key === 'D') {
        debugMode = !debugMode;
        console.log(`[Debug Mode] ${debugMode ? 'ENABLED' : 'DISABLED'}`);
        if (debugMode && !document.getElementById('profiler-widget')) {
          const widget = profiler.createHtmlWidget();
          widget.id = 'profiler-widget';
          document.body.appendChild(widget);
        } else if (!debugMode && document.getElementById('profiler-widget')) {
          document.getElementById('profiler-widget')?.remove();
        }
      }

      // Exit (ESC key)
      if (e.key === 'Escape') {
        gameRunning = false;
        // Reset game state to menu before navigating
        setState({ ...state, gameState: 'menu' });
        navigate('/');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = false;
      
      if ((e.key === 'j' || e.key === 'J') && p1Controller.getPhysics) {
        const p1Physics = p1Controller.getPhysics();
        p1Physics.attackTriggered = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Handle movement input
    const handleMovementInput = () => {
      if (p1Controller.getPhysics) {
        let moveInput = 0;
        if (keysPressed['a'] || keysPressed['arrowleft']) moveInput -= 1;
        if (keysPressed['d'] || keysPressed['arrowright']) moveInput += 1;
        
        const p1Physics = p1Controller.getPhysics();
        p1Physics.moveInput = moveInput;
      }
    };

    const animate = () => {
      requestAnimationFrame(animate);

      if (!gameRunning) return;

      const baseDeltaTime = Math.min(clock.getDelta(), 0.016); // Cap at 60fps
      // 🔥 Apply time scale for slow-motion effects
      const deltaTime = baseDeltaTime * timeScale;

      // Handle movement input each frame
      handleMovementInput();

      profiler.startMark('physics_update');
      // Update characters
      p1Controller.update(deltaTime, groundPlane);
      p2Controller.update(deltaTime, groundPlane);
      profiler.endMark('physics_update');

      profiler.startMark('mixer_update');
      // Update animation mixers
      p1Mixer.update(deltaTime);
      p2Mixer.update(deltaTime);
      profiler.endMark('mixer_update');

      profiler.startMark('animation_update');
      // Update animations with physics state
      p1Anims.updatePhysicsState(p1Controller.getPhysics());
      p1Anims.update(deltaTime);
      p2Anims.updatePhysicsState(p2Controller.getPhysics());
      p2Anims.update(deltaTime);
      profiler.endMark('animation_update');
      
      // 🔥 UPDATE LEGENDARY SYSTEMS
      profiler.startMark('legendary_systems_update');
      legendaryCombo.update(deltaTime);
      perfectDodgeParry.update(deltaTime);
      legendaryVFX.update(deltaTime);
      profiler.endMark('legendary_systems_update');

      profiler.startMark('combat_update');
      // Update combat
      combat.updateHurtBox(p1Id, p1Character.position);
      combat.updateHurtBox(p2Id, p2Character.position);
      combat.update();
      profiler.endMark('combat_update');

      profiler.startMark('match_state_update');
      // Update match state
      matchState.update(deltaTime);
      profiler.endMark('match_state_update');

      profiler.startMark('vfx_update');
      // Update VFX
      vfx.update(deltaTime);
      vfx.setCameraBasePosition(cameraBasePosition);
      profiler.endMark('vfx_update');
      
      // 🔥 APPLY SCREEN SHAKE from Legendary VFX
      const shake = legendaryVFX.getCurrentScreenShake();
      if (shake) {
        const shakeOffset = new THREE.Vector3(
          Math.sin(performance.now() * shake.frequency) * shake.intensity,
          Math.cos(performance.now() * shake.frequency * 1.3) * shake.intensity,
          0
        );
        camera.position.copy(cameraBasePosition).add(shakeOffset);
      } else {
        camera.position.copy(cameraBasePosition);
      }

      // Handle attack input for P1 (J key)
      p1AttackCooldown = Math.max(0, p1AttackCooldown - deltaTime);
      const p1Physics = p1Controller.getPhysics();
      
      if (p1Physics.moveInput !== undefined) {
        const p1Facing = p1Physics.moveInput > 0 ? 1 : p1Physics.moveInput < 0 ? -1 : 1;
        const p1AttackPos = p1Character.position.clone().add(new THREE.Vector3(1.2 * p1Facing, 0.5, 0));

        // Check if invincible (don't allow attack during hitstun)
        const canAttack = !matchState.isInvincible(p1Id) && p1AttackCooldown <= 0;

        if (canAttack && p1Physics.attack) {
          const knockbackDir = new THREE.Vector3(8 * p1Facing, 2, 0);
          
          combat.createHitBox(
            p1Id,
            12, // damage
            knockbackDir,
            p1AttackPos,
            0.8, // radius
            18, // duration (frames at 60fps = 0.3s)
            5 // hit-stop
          );

          eventBus.emit('attack:triggered', {
            characterId: p1Id,
            heavy: false,
          });

          p1AttackCooldown = 0.5; // 500ms cooldown between attacks
        }
      }

      // Handle attack input for P2 (simulated AI - attacks every 2 seconds)
      p2AttackCooldown = Math.max(0, p2AttackCooldown - deltaTime);
      if (p2AttackCooldown <= 0 && Math.random() > 0.85) {
        const p2Facing = p1Character.position.x > p2Character.position.x ? 1 : -1;
        const p2AttackPos = p2Character.position.clone().add(new THREE.Vector3(1.2 * p2Facing, 0.5, 0));
        const knockbackDir = new THREE.Vector3(8 * p2Facing, 2, 0);

        combat.createHitBox(
          p2Id,
          10,
          knockbackDir,
          p2AttackPos,
          0.8,
          18,
          5
        );

        eventBus.emit('attack:triggered', {
          characterId: p2Id,
          heavy: false,
        });

        p2AttackCooldown = 1.5;
      }

      // Update game state from match state manager
      const matchStats = matchState.getMatchStats();
      setGameState({
        p1: { hp: Math.max(0, matchStats.p1HP), resonance: Math.max(0, matchStats.p1Resonance) },
        p2: { hp: Math.max(0, matchStats.p2HP), resonance: Math.max(0, matchStats.p2Resonance) },
        winner: matchStats.winner,
      });
      setMatchTime(Math.max(0, matchStats.timeRemaining));

      // Check if match is over
      if (matchStats.winner || matchStats.timeRemaining <= 0) {
        gameRunning = false;
        // Reset game state when match ends
        setTimeout(() => {
          setState({ ...state, gameState: 'menu' });
          navigate('/');
        }, 3000); // Give time to see the winner
      }

      profiler.updateFrameMetrics();

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

    return () => {
      gameRunning = false;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('click', handleFirstUserInteraction);
      document.removeEventListener('keydown', handleFirstUserInteraction);
      eventBus.unsubscribe('character:hit', handleCharacterHit);
      eventBus.unsubscribe('attack:triggered', handleAttackTriggered);
      eventBus.unsubscribe('match:ended', handleMatchEnded);
      renderer.dispose();
      scene.clear();
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

      {/* 🔥 LEGENDARY MATCH OVERLAY with Combat Data */}
      <MatchOverlay
        p1Hp={gameState.p1.hp}
        p2Hp={gameState.p2.hp}
        p1Resonance={gameState.p1.resonance}
        p2Resonance={gameState.p2.resonance}
        matchTime={matchTime}
        winner={gameState.winner}
        p1Name={state.selectedCharacter || 'KAI-JAX'}
        p2Name={state.opponent || 'LUNARA SOLIS'}
        comboCount={gameState.combo.hits}
        comboMultiplier={gameState.combo.multiplier}
        comboTier={gameState.combo.tier}
        p1Ultimate={gameState.p1.ultimate}
        p2Ultimate={gameState.p2.ultimate}
        p1Reflex={gameState.p1.reflex}
        p2Reflex={gameState.p2.reflex}
        slowMotionActive={gameState.slowMotion.active}
        screenShakeActive={gameState.screenShake.active}
      />

      {/* Controls hint - Now integrated in MatchOverlay */}
      
      {/* 📖 STORY DIALOGUE OVERLAY */}
      {showStoryDialogue && storyDialogue.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
          <div className="max-w-3xl w-full mx-8">
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 border-2 border-amber-400 rounded-lg p-8 shadow-2xl">
              <div className="text-mono-small text-amber-400 text-xs mb-4 tracking-widest">
                CHAPTER {state.currentChapterNumber || 1} - BOOK {state.currentBook || 1}
              </div>
              <p className="text-legendary text-2xl text-white leading-relaxed min-h-[120px]">
                {storyDialogue[currentDialogueLine]}
              </p>
              <div className="flex items-center justify-between mt-6">
                <div className="flex gap-2">
                  {storyDialogue.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 w-2 rounded-full ${
                        idx === currentDialogueLine 
                          ? 'bg-amber-400' 
                          : idx < currentDialogueLine 
                          ? 'bg-amber-400/50' 
                          : 'bg-neutral-600'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-mono-small text-neutral-500 text-xs">
                  {currentDialogueLine + 1} / {storyDialogue.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Match;
