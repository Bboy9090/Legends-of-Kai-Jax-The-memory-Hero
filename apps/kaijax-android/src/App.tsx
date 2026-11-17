import { Capacitor } from '@capacitor/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AdminLoginDialog } from './components/AdminLoginDialog';
import { CanonDriveModal } from './components/CanonDriveModal';
import { CommandHubModal, HubTab } from './components/CommandHubModal';
import { DialogueOverlay } from './components/DialogueOverlay';
import { GameHUD } from './components/GameHUD';
import { OfflineLegalModal } from './components/OfflineLegalModal';
import { TitleScreen } from './components/TitleScreen';
import { AudioEngine } from './game/audio/AudioEngine';
import { registerAdminPrompt } from './services/adminSession';
import { CanonVaultManifest, fetchLocalCanonManifest } from './services/googleDriveAuth';
import { EQUIPMENT_CATALOG } from './game/data/itemsData';
import { MISSION_1_STEPS } from './game/data/missionsData';
import { GameEngine } from './game/engine/GameEngine';
import { withEarlyWebGL2ContextCapture } from './game/engine/EarlyWebGLContextCapture';
import { installWebGLTextureProbe, type GlTextureProbeHandle } from './game/engine/WebGLTextureProbe';
import {
  GlbPreloadSnapshot,
  preloadCoreAshblockAssets,
} from './game/engine/GLBCharacterController';
import {
  createNewSave,
  deleteSlot,
  grantHeroXp,
  listAllSaves,
  loadFromSlot,
  loadSettings,
  saveSettings,
  saveToSlot,
} from './game/save/SaveManager';
import { DialogueLine, EquipSlot, GameSettings, HudSnapshot, SaveSlotData } from './game/types';
import { registerPlatformLifecycle } from './platform/androidLifecycle';

const INITIAL_HUD: HudSnapshot = {
  activeHero: 'kai',
  kaiHp: 140,
  kaiMaxHp: 140,
  kaiEnergy: 115,
  kaiMaxEnergy: 115,
  jaxHp: 175,
  jaxMaxHp: 175,
  jaxEnergy: 95,
  jaxMaxEnergy: 95,
  fusionCharge: 0,
  isFused: false,
  fusionTimeLeft: 0,
  fusionCooldown: 0,
  fusionUnlocked: false,
  duoSynergy: 25,
  duoFinisherReady: false,
  activeFinisherName: null,
  counterWindowActive: false,
  isBlocking: false,
  tacticalActionLabel: 'Web Pull',
  tacticalCooldown: 0,
  styleScore: 0,
  comboCount: 0,
  comboTimer: 0,
  comboMaxTimer: 3.5,
  comboBrokenSeq: 0,
  lastBrokenCombo: 0,
  abilityCooldowns: [0, 0, 0],
  dodgeCooldown: 0,
  lockedTargetName: null,
  lockedTargetHp: 0,
  lockedTargetMaxHp: 1,
  lockedTargetScreenX: null,
  lockedTargetScreenY: null,
  lockedTargetArchetype: null,
  lockedTargetShield: 0,
  bossName: null,
  bossHp: 0,
  bossMaxHp: 1,
  bossArmor: 0,
  bossMaxArmor: 1,
  bossPhase: 1,
  bossTelegraph: null,
  interactPrompt: null,
  canWebSwing: false,
  isWallRunning: false,
  isShadowInked: false,
  thryxenActive: false,
  lightningChanneled: false,
  traversalState: 'Apex Street',
  missionStepIndex: 0,
  missionStepTitle: MISSION_1_STEPS[0].title,
  missionObjective: MISSION_1_STEPS[0].objective,
  missionCompleted: false,
  rescuedCivilians: 0,
  totalCivilians: 2,
  memoryFragments: 0,
  fpsEstimate: 60,
  onePercentLowFps: 60,
  drawCalls: 0,
  activeTriangles: 0,
  isGameOver: false,
  isVictory: false,
  webglContextLost: false,
  parryCount: 0,
  evadeCount: 0,
  hitsTaken: 0,
  floatingDamages: [],
};

export default function App() {
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const audioRef = useRef<AudioEngine | null>(null);

  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [allSaves, setAllSaves] = useState<Record<string, SaveSlotData | null>>(() => listAllSaves());
  const initialExisting = allSaves.autosave ?? allSaves['slot-1'] ?? allSaves['slot-2'] ?? allSaves['slot-3'] ?? null;
  const [save, setSave] = useState<SaveSlotData>(() => initialExisting ?? createNewSave('autosave'));
  const saveRef = useRef<SaveSlotData>(save);

  const [screen, setScreen] = useState<'title' | 'playing'>('title');
  const [hubOpen, setHubOpen] = useState(false);
  const [hubTab, setHubTab] = useState<HubTab>('missions');
  const [canonDriveOpen, setCanonDriveOpen] = useState(false);
  // Administrator sign-in prompt (asset import / reconstruction). Resolves true once the server accepted the login.
  const [adminPrompt, setAdminPrompt] = useState<((ok: boolean) => void) | null>(null);
  const [canonManifest, setCanonManifest] = useState<CanonVaultManifest>({
    updatedAt: '',
    sourceAccount: '',
    assets: [],
  });
  const [legalDoc, setLegalDoc] = useState<'privacy' | 'terms' | null>(null);
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [toast, setToast] = useState<string | null>(null);
  const [preloadSnap, setPreloadSnap] = useState<GlbPreloadSnapshot>({
    total: 0,
    loaded: 0,
    ready: false,
    elapsedMs: 0,
  });
  const [enteringWorld, setEnteringWorld] = useState(false);
  const preloadPromiseRef = useRef<Promise<GlbPreloadSnapshot> | null>(null);

  // Dialogue Queue State
  const [dialogueQueue, setDialogueQueue] = useState<DialogueLine[] | null>(null);
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const dialogueDoneRef = useRef<(() => void) | undefined>(undefined);

  // Latest state refs for native Android back button & lifecycle handlers
  const screenRef = useRef(screen);
  const hubOpenRef = useRef(hubOpen);
  const canonDriveOpenRef = useRef(canonDriveOpen);
  const legalDocRef = useRef(legalDoc);
  const dialogueQueueRef = useRef(dialogueQueue);
  screenRef.current = screen;
  hubOpenRef.current = hubOpen;
  canonDriveOpenRef.current = canonDriveOpen;
  legalDocRef.current = legalDoc;
  dialogueQueueRef.current = dialogueQueue;

  useEffect(() => {
    fetchLocalCanonManifest().then(setCanonManifest).catch(() => undefined);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 2800);
  }, []);

  const commitSave = useCallback((patch: Partial<SaveSlotData>, silent = false) => {
    setSave((prev) => {
      const next = saveToSlot('autosave', { ...prev, ...patch });
      saveRef.current = next;
      engineRef.current?.syncSaveMetadata(next);
      return next;
    });
    setAllSaves(listAllSaves());
    if (!silent) showToast('Progress Saved');
  }, [showToast]);

  const grantRewards = useCallback(
    (xp: number, materials?: Record<string, number>, fragment = 0) => {
      setSave((prev) => {
        const kRes = grantHeroXp(prev.heroes.kai, xp);
        const jRes = grantHeroXp(prev.heroes.jax, xp);
        const nextMaterials = { ...prev.materials };
        if (materials) {
          for (const [k, v] of Object.entries(materials)) {
            nextMaterials[k] = (nextMaterials[k] ?? 0) + v;
          }
        }
        if (kRes.leveledUp || jRes.leveledUp) {
          audioRef.current?.playSfx('levelup');
          showToast(`Level Up! Kai Lv.${kRes.updated.level} · Jax Lv.${jRes.updated.level}`);
        }
        const next = saveToSlot('autosave', {
          ...prev,
          memoryFragments: prev.memoryFragments + fragment,
          materials: nextMaterials,
          heroes: {
            kai: kRes.updated,
            jax: jRes.updated,
          },
        });
        saveRef.current = next;
        engineRef.current?.syncSaveMetadata(next);
        return next;
      });
      setAllSaves(listAllSaves());
    },
    [showToast]
  );

  const triggerDialogue = useCallback((lines: DialogueLine[], onComplete?: () => void) => {
    if (!settings.subtitlesEnabled) {
      onComplete?.();
      return;
    }
    dialogueDoneRef.current = onComplete;
    setDialogueIdx(0);
    setDialogueQueue(lines);
  }, [settings.subtitlesEnabled]);

  // Mount 3D GameEngine & AudioEngine once
  useEffect(() => {
    if (!canvasHostRef.current) return;
    const audio = new AudioEngine(settings);
    audioRef.current = audio;

    const enableGpuProbe = new URLSearchParams(window.location.search).get('gpuProbe') === '1';
    let gpuTextureProbe: GlTextureProbeHandle | null = null;

    const attachGpuProbe = (gl: WebGL2RenderingContext) => {
      if (gpuTextureProbe) return;
      gpuTextureProbe = installWebGLTextureProbe(gl, (anomaly) => {
        console.warn('[Kai-Jax GPU probe] Error observed after texture operation', anomaly);
      });
      const coverage = gpuTextureProbe.snapshot();
      if (!coverage.coreHooksReady) {
        console.warn('[Kai-Jax GPU probe] Incomplete hook coverage; no errors does not prove clean graphics.', coverage.unavailableMethods);
      }
      (window as unknown as Record<string, unknown>).__KAIJAX_GPU_PROBE__ = gpuTextureProbe;
    };

    const constructEngine = () => new GameEngine(canvasHostRef.current!, saveRef.current, settings, audio, {
      onHudUpdate: (snap) => setHud(snap),
      onTriggerDialogue: triggerDialogue,
      onSaveProgress: commitSave,
      onGrantRewards: grantRewards,
      onTogglePause: () => {
        setHubOpen((open) => {
          const next = !open;
          engineRef.current?.setPaused(next);
          return next;
        });
      },
    });
    // Only the diagnostic URL temporarily intercepts canvas.getContext.
    // The wrapper is removed immediately after constructor return or throw.
    const engine = enableGpuProbe
      ? withEarlyWebGL2ContextCapture(constructEngine, attachGpuProbe, (reason) => console.warn('[Kai-Jax GPU probe]', reason))
      : constructEngine();
    engine.setTitleShowcase(true);
    engineRef.current = engine;

    // Fallback only if the host does not permit early canvas instrumentation.
    // Probe-disabled sessions never inspect gl.getError or patch canvas APIs.
    if (enableGpuProbe && !gpuTextureProbe) {
      const gl = canvasHostRef.current.querySelector('canvas')?.getContext('webgl2');
      if (gl) {
        try { attachGpuProbe(gl); }
        catch { console.warn('[Kai-Jax GPU probe] Late diagnostic attachment failed.'); }
      } else console.warn('[Kai-Jax GPU probe] WebGL2 context unavailable.');
    }
    const preferLod1 = engine.getPerformanceMetrics().isSoftwareGl || settings.graphicsQuality === 'low';
    preloadPromiseRef.current = preloadCoreAshblockAssets(
      settings.graphicsQuality,
      preferLod1,
      settings.characterModelVersion ?? 'p1i_reconstructed',
      (snap) => setPreloadSnap(snap)
    );

    return () => {
      gpuTextureProbe?.uninstall();
      if ((window as unknown as Record<string, unknown>).__KAIJAX_GPU_PROBE__ === gpuTextureProbe) {
        delete (window as unknown as Record<string, unknown>).__KAIJAX_GPU_PROBE__;
      }
      engine.dispose();
      audio.dispose();
      engineRef.current = null;
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    registerAdminPrompt(() => new Promise<boolean>((resolve) => setAdminPrompt(() => resolve)));
    return () => registerAdminPrompt(null);
  }, []);

  // The Android/iOS app is a static bundle with no admin server: vault and reconstruction tools are web-dev only.
  const openCanonDrive = useCallback(() => {
    if (Capacitor.isNativePlatform()) {
      showToast('Admin asset tools are only available on the development server.');
      return;
    }
    setCanonDriveOpen(true);
  }, [showToast]);

  // Register Android Capacitor & browser visibility lifecycle handlers
  useEffect(() => {
    const cleanup = registerPlatformLifecycle({
      onBackground: () => {
        if (screenRef.current === 'playing') {
          commitSave({}, true);
          engineRef.current?.setPaused(true);
        }
        audioRef.current?.suspend();
      },
      onForeground: () => {
        if (screenRef.current === 'playing' && !hubOpenRef.current && !dialogueQueueRef.current && !legalDocRef.current) {
          engineRef.current?.setPaused(false);
        }
        audioRef.current?.resume();
      },
      onBackButton: () => {
        if (legalDocRef.current) {
          setLegalDoc(null);
          return true;
        }
        if (canonDriveOpenRef.current) {
          setCanonDriveOpen(false);
          return true;
        }
        if (hubOpenRef.current) {
          setHubOpen(false);
          if (screenRef.current === 'playing' && !dialogueQueueRef.current) {
            engineRef.current?.setPaused(false);
          }
          return true;
        }
        if (screenRef.current === 'playing') {
          setHubTab('missions');
          setHubOpen(true);
          engineRef.current?.setPaused(true);
          return true;
        }
        return false;
      },
    });
    return cleanup;
  }, [commitSave]);

  // Sync OS prefers-reduced-motion media query updates dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setSettings((prev) => {
        const next = { ...prev, reducedMotion: e.matches };
        saveSettings(next);
        engineRef.current?.applyGraphicsSettings(next);
        return next;
      });
    };
    mq.addEventListener('change', handleMotionChange);
    return () => mq.removeEventListener('change', handleMotionChange);
  }, []);

  const handleStartGame = async (fresh: boolean, selectedHero?: 'kai' | 'jax') => {
    audioRef.current?.unlock();
    audioRef.current?.playSfx('ui');
    if (preloadPromiseRef.current && !preloadSnap.ready) {
      setEnteringWorld(true);
      await preloadPromiseRef.current;
      setEnteringWorld(false);
    }
    let targetSave = saveRef.current;
    if (fresh) {
      targetSave = saveToSlot(
        'autosave',
        createNewSave('autosave', 'Ashblock Heights — Act I', selectedHero ?? 'kai')
      );
      setSave(targetSave);
      saveRef.current = targetSave;
      setAllSaves(listAllSaves());
    } else if (selectedHero && selectedHero !== targetSave.activeHero) {
      targetSave = saveToSlot('autosave', { ...targetSave, activeHero: selectedHero });
      setSave(targetSave);
      saveRef.current = targetSave;
      setAllSaves(listAllSaves());
    }
    engineRef.current?.loadSaveState(targetSave);
    engineRef.current?.setTitleShowcase(false);
    setScreen('playing');
    setHubOpen(false);
    engineRef.current?.setPaused(false);

    if (targetSave.missionStageIndex === 0 && !targetSave.missionCompleted) {
      const openingLines = MISSION_1_STEPS[0].dialogueOnStart;
      if (openingLines) {
        engineRef.current?.setPaused(true);
        triggerDialogue(openingLines, () => {
          engineRef.current?.setPaused(false);
        });
      }
    }
  };

  const handleAdvanceDialogue = () => {
    audioRef.current?.playSfx('ui');
    if (!dialogueQueue) return;
    if (dialogueIdx + 1 >= dialogueQueue.length) {
      setDialogueQueue(null);
      const cb = dialogueDoneRef.current;
      dialogueDoneRef.current = undefined;
      cb?.();
    } else {
      setDialogueIdx((i) => i + 1);
    }
  };

  const handleSkipDialogue = () => {
    audioRef.current?.playSfx('ui');
    setDialogueQueue(null);
    const cb = dialogueDoneRef.current;
    dialogueDoneRef.current = undefined;
    cb?.();
  };

  const handleOpenHub = (tab: HubTab = 'missions') => {
    audioRef.current?.playSfx('ui');
    setHubTab(tab);
    setHubOpen(true);
    if (screen === 'playing') {
      engineRef.current?.setPaused(true);
    }
  };

  const handleCloseHub = () => {
    audioRef.current?.playSfx('ui');
    setHubOpen(false);
    if (screen === 'playing' && !dialogueQueue) {
      engineRef.current?.setPaused(false);
    }
  };

  const handleUnlockSkill = (hero: 'kai' | 'jax', skillId: string, cost: number) => {
    const prog = save.heroes[hero];
    if (prog.skillPoints < cost || prog.unlockedSkills.includes(skillId)) return;
    audioRef.current?.playSfx('levelup');
    const updatedHero = {
      ...prog,
      skillPoints: prog.skillPoints - cost,
      unlockedSkills: [...prog.unlockedSkills, skillId],
    };
    commitSave({
      heroes: { ...save.heroes, [hero]: updatedHero },
    });
  };

  const handleEquipItem = (hero: 'kai' | 'jax', slot: EquipSlot, itemId: string) => {
    audioRef.current?.playSfx('ui');
    const prog = save.heroes[hero];
    commitSave({
      heroes: {
        ...save.heroes,
        [hero]: { ...prog, equipped: { ...prog.equipped, [slot]: itemId } },
      },
    });
  };

  const handleCraftItem = (itemId: string) => {
    const item = EQUIPMENT_CATALOG.find((i) => i.id === itemId);
    if (!item || !item.craftCost) return;
    const nextMats = { ...save.materials };
    for (const [m, qty] of Object.entries(item.craftCost)) {
      if ((nextMats[m] ?? 0) < qty) return;
      nextMats[m] -= qty;
    }
    audioRef.current?.playSfx('levelup');
    commitSave({
      materials: nextMats,
      inventoryIds: [...save.inventoryIds, item.id],
    });
    showToast(`Crafted ${item.name}`);
  };

  const handleUpdateSettings = (next: GameSettings) => {
    setSettings(next);
    saveSettings(next);
    audioRef.current?.applySettings(next);
    engineRef.current?.applyGraphicsSettings(next);
  };

  const handleSaveSlot = (slotId: string) => {
    saveToSlot(slotId, save);
    setAllSaves(listAllSaves());
    showToast(`Saved to ${slotId.toUpperCase()}`);
  };

  const handleLoadSlot = (slotId: string) => {
    const loaded = loadFromSlot(slotId);
    if (!loaded) return;
    setSave(loaded);
    saveRef.current = loaded;
    engineRef.current?.loadSaveState(loaded);
    engineRef.current?.setTitleShowcase(false);
    setScreen('playing');
    setHubOpen(false);
    engineRef.current?.setPaused(false);
    showToast(`Loaded ${slotId.toUpperCase()}`);
  };

  const handleDeleteSlot = (slotId: string) => {
    deleteSlot(slotId);
    setAllSaves(listAllSaves());
    showToast(`Cleared ${slotId.toUpperCase()}`);
  };

  const hasSavedGame = Boolean(allSaves.autosave || allSaves['slot-1'] || allSaves['slot-2'] || allSaves['slot-3']);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0b10]">
      {/* Dedicated WebGL Canvas Host */}
      <div ref={canvasHostRef} className="fixed inset-0 z-0" />

      {/* Title Screen */}
      {screen === 'title' && !hubOpen && (
        <TitleScreen
          hasExistingSave={hasSavedGame}
          latestSave={hasSavedGame ? save : null}
          syncedCanonCount={canonManifest.assets.length}
          onContinue={(hero) => handleStartGame(false, hero)}
          onNewCampaign={(hero) => handleStartGame(true, hero)}
          onOpenHub={(t) => handleOpenHub(t)}
          onOpenCanonDrive={openCanonDrive}
          onOpenLegal={(doc) => setLegalDoc(doc)}
        />
      )}

      {/* Active Gameplay HUD */}
      {screen === 'playing' && !hubOpen && (
        <GameHUD
          hud={hud}
          settings={settings}
          dialogueOpen={Boolean(dialogueQueue)}
          engineRef={engineRef}
          onOpenHub={(tab) => handleOpenHub(tab ?? 'missions')}
          onRetryCheckpoint={() => {
            engineRef.current?.loadSaveState(saveRef.current);
          }}
          onStartPatrol={() => {
            engineRef.current?.spawnPatrolSkirmish();
          }}
        />
      )}

      {/* Cinematic Story Dialogue */}
      {dialogueQueue && (
        <DialogueOverlay
          lines={dialogueQueue}
          currentIndex={dialogueIdx}
          subtitleScale={settings.subtitleScale}
          onAdvance={handleAdvanceDialogue}
          onSkip={handleSkipDialogue}
        />
      )}

      {/* Preload Gate Overlay (prevents blocky placeholder pop-in on slow devices) */}
      {enteringWorld && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md text-white">
          <div className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold mb-2">
            Ashblock Heights · Act I
          </div>
          <div className="text-xl font-bold mb-4">Streaming Certified 3D Rigs...</div>
          <div className="w-64 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-violet-500 transition-all duration-150"
              style={{
                width: `${preloadSnap.total > 0 ? Math.round((preloadSnap.loaded / preloadSnap.total) * 100) : 100}%`,
              }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-300">
            {preloadSnap.loaded} / {preloadSnap.total} GLBs cached
          </div>
        </div>
      )}

      {/* Command Hub / Pause / Progression / Canon Bible / Settings */}
      {hubOpen && (
        <CommandHubModal
          activeTab={hubTab}
          setActiveTab={setHubTab}
          save={save}
          allSaves={allSaves}
          settings={settings}
          isInGame={screen === 'playing'}
          onClose={handleCloseHub}
          onReturnToTitle={() => {
            setHubOpen(false);
            setDialogueQueue(null);
            setScreen('title');
            engineRef.current?.setTitleShowcase(true);
            engineRef.current?.setPaused(false);
          }}
          onUnlockSkill={handleUnlockSkill}
          onEquipItem={handleEquipItem}
          onCraftItem={handleCraftItem}
          onSelectCosmetic={(id) => commitSave({ activeCosmeticId: id })}
          onUpdateSettings={handleUpdateSettings}
          onSaveSlot={handleSaveSlot}
          onLoadSlot={handleLoadSlot}
          onDeleteSlot={handleDeleteSlot}
          onStartPatrol={() => engineRef.current?.spawnPatrolSkirmish()}
          onSwitchDistrict={(districtId) => {
            if (screen !== 'playing') {
              setScreen('playing');
              engineRef.current?.setTitleShowcase(false);
            }
            engineRef.current?.switchDistrict(districtId);
            engineRef.current?.setPaused(false);
            showToast(
              districtId === 'sector-7'
                ? 'Deployed to Sector-7: Ironvein Yards'
                : districtId === 'neon-ward'
                  ? 'Deployed to Neon Ward (Provisional)'
                  : districtId === 'iron-market'
                    ? 'Deployed to Iron Market: Forge Keeps'
                    : districtId === 'undercrown'
                      ? 'Deployed to Undercrown: Fracture Pit'
                      : districtId === 'zenith-spires'
                        ? 'Deployed to Zenith Spires: Skyfall Spines'
                        : districtId === 'erasure-fields'
                          ? 'Deployed to Erasure Fields (Provisional)'
                          : districtId === 'memory-nexus'
                            ? 'Deployed to Memory Nexus: Library of Threads'
                            : 'Returned to Ashblock Heights'
            );
          }}
          onOpenLegal={(doc) => setLegalDoc(doc)}
          canonManifest={canonManifest}
          onOpenCanonDrive={openCanonDrive}
        />
      )}

      {adminPrompt && (
        <AdminLoginDialog
          onResult={(ok) => {
            adminPrompt(ok);
            setAdminPrompt(null);
          }}
        />
      )}

      {/* Google Drive Canon Art & Arena Sync Modal */}
      {canonDriveOpen && (
        <CanonDriveModal
          onClose={() => setCanonDriveOpen(false)}
          onManifestUpdated={(m) => {
            setCanonManifest(m);
            showToast(`Canon Vault Updated (${m.assets.length} files)`);
          }}
        />
      )}

      {/* Offline Legal Modal (Privacy Policy & Terms of Use) */}
      {legalDoc && <OfflineLegalModal docId={legalDoc} onClose={() => setLegalDoc(null)} />}

      {/* WebGL Context Loss Recovery Overlay */}
      {hud.webglContextLost && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="webgl-lost-title"
        >
          <div className="max-w-md w-full rounded-2xl bg-[#131620] border border-amber-500/60 p-6 text-center shadow-2xl">
            <h2 id="webgl-lost-title" className="font-display text-2xl font-bold text-amber-300">
              Graphics Context Paused
            </h2>
            <p className="mt-2 text-sm text-slate-200 leading-relaxed">
              Your device reclaimed the 3D GPU context while suspended or under thermal load. Your Ashblock Heights save progress is intact.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 w-full min-h-[48px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors"
            >
              Restore 3D Renderer
            </button>
          </div>
        </div>
      )}

      {/* Clean Non-Intrusive Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-xl bg-[#131620] border border-amber-400/60 text-xs font-semibold text-amber-200 shadow-2xl pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  );
}
