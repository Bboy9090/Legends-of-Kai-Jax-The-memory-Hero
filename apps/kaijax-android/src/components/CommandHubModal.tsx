import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Check,
  CloudDownload,
  Download,
  Hammer,
  HardDrive,
  Lock,
  Map as MapIcon,
  Play,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { CanonVaultManifest } from '../services/googleDriveAuth';
import { CHARACTER_ASSET_REGISTRY } from '../game/data/characterAssetRegistry';
import { clearCharacterGltfCache } from '../game/engine/GLBCharacterController';
import { ENERGY_DOMAINS, HERO_ABILITIES, SKILL_TREES } from '../game/data/abilitiesData';
import {
  BOSS_ROSTER,
  CANON_AUDIT_NOTES,
  DISTRICTS,
  FAMILY_AND_MENTORS,
  FOUR_HERITAGES,
  TRAVERSAL_PROGRESSION,
} from '../game/data/canonData';
import { COSMETIC_PRESETS, EQUIPMENT_CATALOG, MATERIAL_NAMES } from '../game/data/itemsData';
import { MISSION_1_STEPS } from '../game/data/missionsData';
import {
  ALTERNATE_BUMPER_GAMEPAD_BINDINGS,
  DEFAULT_GAMEPAD_BINDINGS,
} from '../game/combat/combatInputMapper';
import { DISTRICT_PRODUCTION_SPECS } from '../game/data/districtSpecifications';
import { readableOnDark } from '../game/accessibility/contrast';
import { computeHeroStats, SAVE_SLOTS } from '../game/save/SaveManager';
import { CharacterModelVersion, EnvironmentMode, EquipSlot, GameSettings, SaveSlotData } from '../game/types';

export type HubTab = 'missions' | 'skills' | 'gear' | 'map' | 'canon' | 'settings';

interface CommandHubModalProps {
  activeTab: HubTab;
  setActiveTab: (tab: HubTab) => void;
  save: SaveSlotData;
  allSaves: Record<string, SaveSlotData | null>;
  settings: GameSettings;
  isInGame: boolean;
  onClose: () => void;
  onReturnToTitle: () => void;
  onUnlockSkill: (hero: 'kai' | 'jax', skillId: string, cost: number) => void;
  onEquipItem: (hero: 'kai' | 'jax', slot: EquipSlot, itemId: string) => void;
  onCraftItem: (itemId: string) => void;
  onSelectCosmetic: (cosmeticId: string) => void;
  onUpdateSettings: (next: GameSettings) => void;
  onSaveSlot: (slotId: string) => void;
  onLoadSlot: (slotId: string) => void;
  onDeleteSlot: (slotId: string) => void;
  onStartPatrol: () => void;
  onOpenLegal: (docId: 'privacy' | 'terms') => void;
  canonManifest: CanonVaultManifest;
  onOpenCanonDrive: () => void;
}

export const CommandHubModal: React.FC<CommandHubModalProps> = ({
  activeTab,
  setActiveTab,
  save,
  allSaves,
  settings,
  isInGame,
  onClose,
  onReturnToTitle,
  onUnlockSkill,
  onEquipItem,
  onCraftItem,
  onSelectCosmetic,
  onUpdateSettings,
  onSaveSlot,
  onLoadSlot,
  onDeleteSlot,
  onStartPatrol,
  onOpenLegal,
  canonManifest,
  onOpenCanonDrive,
}) => {
  const [selectedHeroTab, setSelectedHeroTab] = useState<'kai' | 'jax'>(save.activeHero);
  const [vaultFilter, setVaultFilter] = useState<'all' | 'character' | 'arena'>('all');
  const [inspectedSheet, setInspectedSheet] = useState<CanonVaultManifest['assets'][number] | null>(null);
  const [brokenSheetUrls, setBrokenSheetUrls] = useState<Record<string, boolean>>({});
  const [pipelineInfo, setPipelineInfo] = useState<{
    meshyConfigured: boolean;
    blenderAvailable: boolean;
    blenderVersion: string;
    characters: Record<string, { p1i: boolean; p1g: boolean; meshy: boolean; multiviewSheet: boolean }>;
  } | null>(null);
  const [pipelineBusyId, setPipelineBusyId] = useState<string | null>(null);
  const [pipelineMessage, setPipelineMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== 'canon' && activeTab !== 'settings') return;
    let cancelled = false;
    fetch('/api/character-pipeline/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setPipelineInfo(data);
      })
      .catch(() => {
        // Offline / static Android Capacitor bundle gracefully skips server pipeline status
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleImportExternalMesh = (characterId: string, file: File | undefined) => {
    if (!file) return;
    setPipelineBusyId(characterId);
    setPipelineMessage(`Auto-rigging ${file.name} for ${characterId.toUpperCase()} in Blender 3.4.1...`);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const resp = await fetch('/api/character-pipeline/import-glb', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            characterId,
            fileName: file.name,
            base64Data: String(reader.result || ''),
          }),
        });
        const json = await resp.json();
        if (!resp.ok) {
          setPipelineMessage(json.error || 'Blender auto-rigging failed.');
          return;
        }
        clearCharacterGltfCache();
        if (json.pipelineStatus) setPipelineInfo(json.pipelineStatus);
        onUpdateSettings({ ...settings, characterModelVersion: 'meshy_custom' });
        setPipelineMessage(
          `Rigged & retargeted 19 animations onto ${characterId.toUpperCase()} (Master + Mobile LOD1 active).`
        );
      } catch {
        setPipelineMessage('Server pipeline unavailable in offline static mode.');
      } finally {
        setPipelineBusyId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCloudMeshyReconstruct = async (characterId: string) => {
    setPipelineBusyId(characterId);
    setPipelineMessage(`Submitting ${characterId.toUpperCase()} 3-view plates to Meshy API...`);
    try {
      const resp = await fetch('/api/character-pipeline/meshy/reconstruct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId }),
      });
      const json = await resp.json();
      if (!resp.ok) {
        setPipelineMessage(json.error || 'Meshy reconstruction unavailable.');
        return;
      }
      clearCharacterGltfCache();
      if (json.pipelineStatus) setPipelineInfo(json.pipelineStatus);
      onUpdateSettings({ ...settings, characterModelVersion: 'meshy_custom' });
      setPipelineMessage(`Meshy 3D + Blender 3.4.1 19-clip rig ready for ${characterId.toUpperCase()}.`);
    } catch {
      setPipelineMessage('Meshy server proxy unreachable.');
    } finally {
      setPipelineBusyId(null);
    }
  };

  const tabs: { id: HubTab; label: string; icon: React.ReactNode }[] = [
    { id: 'missions', label: 'Missions', icon: <Play className="w-4 h-4" /> },
    { id: 'skills', label: 'Heroes & Skills', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'gear', label: 'Gear & Craft', icon: <Hammer className="w-4 h-4" /> },
    { id: 'map', label: 'Raging City', icon: <MapIcon className="w-4 h-4" /> },
    { id: 'canon', label: 'Canon Bible', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings & Saves', icon: <Settings className="w-4 h-4" /> },
  ];

  const heroProg = save.heroes[selectedHeroTab];
  const heroStats = computeHeroStats(selectedHeroTab, heroProg);

  const exportSaveJson = () => {
    const blob = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kaijax-${save.slotId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-6 safe-area-pad pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-hub-title"
    >
      <div className="w-full max-w-6xl h-[92vh] rounded-2xl bg-[#0d1018] border border-slate-700/90 flex flex-col overflow-hidden shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-800 bg-[#0a0b10]">
          <div className="flex items-center gap-3 min-w-0">
            <h2 id="command-hub-title" className="font-display text-2xl font-bold text-slate-50 truncate">
              Command Hub — Legends of Kai-Jax
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isInGame && (
              <button
                onClick={onReturnToTitle}
                className="min-h-[44px] px-3.5 py-1.5 rounded-lg bg-[#131620] hover:bg-slate-800 border border-slate-600 text-xs font-medium text-slate-200 whitespace-nowrap shrink-0"
              >
                Title Screen
              </button>
            )}
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs px-3 gap-1 whitespace-nowrap shrink-0"
            >
              <X className="w-4 h-4" />
              <span>{isInGame ? 'Resume' : 'Close'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-800 bg-[#10131d] overflow-x-auto"
          role="tablist"
          aria-label="Command Hub Sections"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              className={`min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === t.id
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-[#171b28] text-slate-200 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 sm:p-6 space-y-6">
          {/* 1. MISSIONS TAB */}
          {activeTab === 'missions' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <p className="text-xs text-amber-400 font-semibold">Act I — Age of Protection</p>
                  <h3 className="font-display text-3xl font-bold text-white">Mission 1: The City Bites Back</h3>
                  <p className="text-sm text-slate-300 mt-1">
                    Location: Ashblock Heights · Playable Heroes: Kai &amp; Jax (Switching + Companion AI)
                  </p>
                </div>

                <div className="space-y-2.5">
                  {MISSION_1_STEPS.map((step, idx) => {
                    const done = save.missionCompleted || idx < save.missionStageIndex;
                    const current = !save.missionCompleted && idx === save.missionStageIndex;
                    return (
                      <div
                        key={step.id}
                        className={`rounded-xl border p-4 ${
                          current
                            ? 'bg-[#171c2b] border-amber-400/70'
                            : done
                              ? 'bg-[#11151f] border-emerald-500/30'
                              : 'bg-[#0f121a] border-slate-800 opacity-65'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm text-slate-100">{step.title}</span>
                          <span className="text-xs font-mono-tabular text-slate-400">
                            {done ? 'Completed' : current ? 'Active Objective' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{step.objective}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{step.hint}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-[#131620] border border-slate-800 p-4 space-y-3">
                  <h4 className="font-display text-xl font-bold text-white">Campaign Mastery</h4>
                  <div className="space-y-2 text-xs font-mono-tabular text-slate-300">
                    <div className="flex justify-between"><span>Traversal Tier</span><span className="text-sky-300">{save.traversalTier}</span></div>
                    <div className="flex justify-between"><span>Civilians Rescued</span><span>{save.rescuedCivilians} / 2</span></div>
                    <div className="flex justify-between"><span>Memory Fragments</span><span className="text-violet-300">{save.memoryFragments}</span></div>
                    <div className="flex justify-between"><span>Kai-Jax Fusion</span><span className="text-amber-300">{save.fusionUnlocked ? 'Awakened' : 'Locked (M1 Phase 2)'}</span></div>
                  </div>
                  {isInGame && (
                    <button
                      onClick={() => {
                        onStartPatrol();
                        onClose();
                      }}
                      className="w-full min-h-[44px] rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
                    >
                      Launch Ashblock Patrol Skirmish
                    </button>
                  )}
                </div>

                <div className="rounded-xl bg-[#131620] border border-slate-800 p-4 space-y-2">
                  <h4 className="font-display text-lg font-bold text-white">Traversal Mastery Path</h4>
                  {TRAVERSAL_PROGRESSION.map((tp) => (
                    <div key={tp.tier} className="text-xs border-b border-slate-800/80 pb-2 last:border-none">
                      <div className="flex justify-between font-semibold text-slate-200">
                        <span>{tp.tier}</span>
                        <span className="text-slate-400">{tp.unlockNote}</span>
                      </div>
                      <p className="text-slate-400 mt-0.5">{tp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. HEROES & SKILL TREES */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedHeroTab('kai')}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold border ${
                      selectedHeroTab === 'kai'
                        ? 'bg-violet-600 border-violet-400 text-white'
                        : 'bg-[#131620] border-slate-700 text-slate-300'
                    }`}
                  >
                    Kai — Memory-Web Heir (Lv.{save.heroes.kai.level})
                  </button>
                  <button
                    onClick={() => setSelectedHeroTab('jax')}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold border ${
                      selectedHeroTab === 'jax'
                        ? 'bg-sky-600 border-sky-400 text-white'
                        : 'bg-[#131620] border-slate-700 text-slate-300'
                    }`}
                  >
                    Jax — Storm Fang (Lv.{save.heroes.jax.level})
                  </button>
                </div>

                <div className="text-sm font-mono-tabular text-amber-300 font-semibold">
                  Available Skill Points: {heroProg.skillPoints} · XP {heroProg.xp}/{heroProg.xpToNext}
                </div>
              </div>

              {/* Hero Stats & Active Abilities */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-xl bg-[#131620] border border-slate-800 p-4 space-y-2">
                  <h4 className="font-display text-xl font-bold text-white">Combat Attributes</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono-tabular text-slate-200">
                    <div>Max HP: {heroStats.maxHp}</div>
                    <div>Max Energy: {heroStats.maxEnergy}</div>
                    <div>Attack: {heroStats.attack}</div>
                    <div>Defense: {heroStats.defense}</div>
                    <div>Crit Rate: {Math.round(heroStats.critChance * 100)}%</div>
                    <div>Ability Power: {Math.round(heroStats.abilityPower * 100)}%</div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-1.5 text-[11px] font-mono-tabular text-slate-300">
                    <div>Parries: <span className="text-amber-300">{save.combatStats?.parryCount ?? 0}</span></div>
                    <div>Evades: <span className="text-sky-300">{save.combatStats?.evadeCount ?? 0}</span></div>
                    <div>Hits Taken: <span className="text-red-300">{save.combatStats?.hitsTaken ?? 0}</span></div>
                    <div>Peak Combo: <span className="text-violet-300">{save.combatStats?.maxCombo ?? 0}</span></div>
                  </div>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {HERO_ABILITIES[selectedHeroTab].map((ab) => (
                    <div key={ab.id} className="rounded-xl bg-[#131620] border border-slate-800 p-3.5">
                      <div className="flex justify-between text-[11px] font-mono-tabular text-slate-400">
                        <span>Slot {ab.slot}</span>
                        <span>{ab.heritage}</span>
                      </div>
                      <div className="font-semibold text-sm text-white mt-1">{ab.name}</div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ab.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Tree Nodes */}
              <div className="space-y-3">
                <h4 className="font-display text-xl font-bold text-white">Hero Skill Tree</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {SKILL_TREES.filter((n) => n.hero === selectedHeroTab).map((node) => {
                    const unlocked = heroProg.unlockedSkills.includes(node.id);
                    const reqMet = !node.requires || heroProg.unlockedSkills.includes(node.requires);
                    const canBuy = !unlocked && reqMet && heroProg.skillPoints >= node.cost;
                    return (
                      <div
                        key={node.id}
                        className={`rounded-xl border p-4 flex flex-col justify-between ${
                          unlocked
                            ? 'bg-[#171c2c] border-emerald-500/50'
                            : 'bg-[#131620] border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between text-[11px] font-mono-tabular text-slate-400">
                            <span>Tier {node.tier}</span>
                            <span>Cost: {node.cost} SP</span>
                          </div>
                          <div className="font-semibold text-sm text-white mt-1">{node.name}</div>
                          <p className="text-xs text-slate-300 mt-1">{node.description}</p>
                        </div>
                        <button
                          onClick={() => onUnlockSkill(selectedHeroTab, node.id, node.cost)}
                          disabled={!canBuy}
                          className={`mt-3 min-h-[44px] rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 ${
                            unlocked
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : canBuy
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {unlocked ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Unlocked
                            </>
                          ) : !reqMet ? (
                            <>
                              <Lock className="w-3.5 h-3.5" /> Requires Prior Tier
                            </>
                          ) : (
                            `Unlock (${node.cost} SP)`
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Canon Nine-Domain Energy Manifestations (3 physical tails rule) */}
              <div className="rounded-xl bg-[#131620] border border-amber-500/30 p-4">
                <h4 className="font-display text-xl font-bold text-amber-300">
                  Kai-Jax Convergence — Three Primary Tails &amp; Nine Energy Domains
                </h4>
                <p className="text-xs text-slate-200 mt-1">
                  Canon Rule: Kai-Jax manifests strictly three physical tails (Ember, Storm, Memory). Nine-domain progression manifests as radiant Energy Domains rather than extra physical tails.
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {ENERGY_DOMAINS.map((dom) => {
                    const active = save.unlockedDomains.includes(dom.id);
                    return (
                      <div
                        key={dom.id}
                        className={`rounded-lg border px-3 py-2 text-xs ${
                          active ? 'bg-[#1a1f30] border-violet-500/50 text-slate-100' : 'bg-[#0e1119] border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="font-semibold">{dom.name}</div>
                        <div className="text-[11px] mt-0.5 text-slate-300">{dom.bonus}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. GEAR, CRAFTING & COSMETICS */}
          {activeTab === 'gear' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedHeroTab('kai')}
                    className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-semibold ${
                      selectedHeroTab === 'kai' ? 'bg-violet-600 text-white' : 'bg-[#131620] text-slate-300'
                    }`}
                  >
                    Equip for Kai
                  </button>
                  <button
                    onClick={() => setSelectedHeroTab('jax')}
                    className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-semibold ${
                      selectedHeroTab === 'jax' ? 'bg-sky-600 text-white' : 'bg-[#131620] text-slate-300'
                    }`}
                  >
                    Equip for Jax
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono-tabular text-slate-300">
                  {MATERIAL_NAMES.map((m) => (
                    <span key={m}>
                      {m}: <strong className="text-amber-300">{save.materials[m] ?? 0}</strong>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {EQUIPMENT_CATALOG.map((item) => {
                  const owned = save.inventoryIds.includes(item.id);
                  const equipped = save.heroes[selectedHeroTab].equipped[item.slot] === item.id;
                  const heroEligible = !item.heroRestriction || item.heroRestriction === 'any' || item.heroRestriction === selectedHeroTab;
                  const canCraft =
                    !owned &&
                    item.craftCost &&
                    Object.entries(item.craftCost).every(([mat, qty]) => (save.materials[mat] ?? 0) >= qty);

                  return (
                    <div key={item.id} className="rounded-xl bg-[#131620] border border-slate-800 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>{item.slot.toUpperCase()} · {item.rarity}</span>
                          <span>{item.heroRestriction === 'any' ? 'Shared' : item.heroRestriction?.toUpperCase()}</span>
                        </div>
                        <div className="font-semibold text-sm text-white mt-1">{item.name}</div>
                        <p className="text-xs text-slate-300 mt-1">{item.description}</p>
                        <div className="mt-2 text-[11px] font-mono-tabular text-sky-300">
                          +{item.attackBonus} ATK · +{item.defenseBonus} DEF · +{item.energyBonus} EN
                        </div>
                      </div>

                      {owned ? (
                        <button
                          onClick={() => onEquipItem(selectedHeroTab, item.slot, item.id)}
                          disabled={equipped || !heroEligible}
                          className={`mt-3 min-h-[44px] rounded-lg text-xs font-semibold ${
                            equipped
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : heroEligible
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {equipped ? 'Equipped' : heroEligible ? 'Equip' : `For ${item.heroRestriction?.toUpperCase()} Only`}
                        </button>
                      ) : (
                        <button
                          onClick={() => onCraftItem(item.id)}
                          disabled={!canCraft}
                          className={`mt-3 min-h-[44px] rounded-lg text-xs font-semibold ${
                            canCraft ? 'bg-sky-600 hover:bg-sky-500 text-white' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          Craft ({Object.entries(item.craftCost ?? {}).map(([k, v]) => `${v} ${k}`).join(', ')})
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Cosmetics */}
              <div>
                <h4 className="font-display text-xl font-bold text-white mb-2">Armor Trim &amp; Cosmetic Unlocks</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {COSMETIC_PRESETS.map((c) => {
                    const unlocked = save.unlockedCosmeticIds.includes(c.id);
                    const active = save.activeCosmeticId === c.id;
                    return (
                      <button
                        key={c.id}
                        disabled={!unlocked}
                        onClick={() => onSelectCosmetic(c.id)}
                        className={`text-left rounded-xl border p-3.5 transition-colors ${
                          active
                            ? 'bg-[#1a2030] border-amber-400'
                            : unlocked
                              ? 'bg-[#131620] border-slate-700 hover:border-slate-500'
                              : 'bg-[#0e1118] border-slate-800 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: c.accentHex }} />
                          <span className="text-xs font-semibold text-white">{c.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{c.description}</p>
                        <div className="mt-2 text-[11px] font-semibold text-amber-300">
                          {active ? 'Active' : unlocked ? 'Select' : 'Mission Reward'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 4. RAGING CITY 8-DISTRICT WORLD MAP & BOSS ROSTER */}
          {activeTab === 'map' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-2xl font-bold text-white">The Raging City — Eight-District Streamable Architecture</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Wave 1 (Ashblock Heights) is reconstructed with modular PBR GLB architecture, geometry-attached skybridge web anchors, and interactive Arc Relays. Districts 2–8 carry reconciled canon production specs across Waves 2–3.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {DISTRICTS.map((d) => {
                  const spec = DISTRICT_PRODUCTION_SPECS.find((s) => s.districtId === d.id);
                  const waveShort = spec ? spec.wavePriority.split('—')[0].trim() : 'Wave 3';
                  return (
                    <div
                      key={d.id}
                      className={`rounded-xl border p-4 flex flex-col justify-between ${
                        d.status === 'playable'
                          ? 'bg-[#151b2b] border-amber-400/70'
                          : 'bg-[#11141e] border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between text-[11px] font-mono-tabular text-slate-300">
                          <span>0{d.order} · {waveShort}</span>
                          <span className={d.status === 'playable' ? 'text-emerald-300 font-semibold' : 'text-slate-300'}>
                            {d.status === 'playable' ? 'Playable 3D Kit' : 'Spec Locked'}
                          </span>
                        </div>
                        <h4 className="font-display text-xl font-bold text-white mt-1">{d.name}</h4>
                        <div className="text-[11px] text-amber-300">{d.act}</div>
                        <p className="text-xs text-slate-200 mt-2 leading-relaxed">{d.summary}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800 space-y-1 text-[11px] text-slate-300">
                        <div>Boss: <strong className="text-slate-100">{d.bossName}</strong></div>
                        <div>Heritage: {d.heritageFocus}</div>
                        {spec && (
                          <>
                            <div className="font-mono-tabular text-sky-300">
                              {spec.elevationStructure.minElevationM}m..+{spec.elevationStructure.maxElevationM}m · &le;{Math.round(spec.mobilePerformanceBudget.maxSceneTriangles / 1000)}k tris
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Authority: {spec.visualAuthority === 'direct_visual_sheet' ? 'Direct Canon Sheet' : 'Composite Sheets (Disclosed)'}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <h4 className="font-display text-xl font-bold text-white mb-2">Canonical Boss Roster</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {BOSS_ROSTER.map((b) => (
                    <div key={b.name} className="rounded-xl bg-[#131620] border border-slate-800 p-3.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-white">{b.name}</span>
                        <span className={b.status === 'Active in Vertical Slice' ? 'text-emerald-300' : 'text-slate-300'}>
                          {b.district} · {b.faction}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1">{b.mechanics}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. CANON BIBLE & ADAPTATION LEDGER */}
          {activeTab === 'canon' && (
            <div className="space-y-6">
              {/* Production 3D Rig, 4-View Reconstruction Turnarounds & Blender Auto-Rig Pipeline */}
              <div className="rounded-xl bg-[#131620] border border-slate-800 p-4 space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-white">
                      P1-I Reconstructed 3D Character Rigs &amp; 4-View Turnarounds
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Dual-Hemisphere Orthographic 3D reconstructions anchored to the Official Visual Library, certified across 7 extreme joint poses in Blender 3.4.1.
                    </p>
                  </div>
                  <div className="text-xs font-mono-tabular text-slate-300">
                    <span>Active Pipeline: {(settings.characterModelVersion ?? 'p1i_reconstructed').replace(/_/g, ' ')}</span>
                    <span aria-hidden="true"> · </span>
                    <span>5 Approved GLBs · 19 Clips Each</span>
                  </div>
                </div>

                {pipelineInfo && (
                  <div className="rounded-lg bg-[#0d1018] border border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-slate-300">
                      <span className="text-emerald-300 font-semibold">
                        Blender {pipelineInfo.blenderVersion} Auto-Rig Ready
                      </span>
                      <span aria-hidden="true"> · </span>
                      <span>
                        {pipelineInfo.meshyConfigured
                          ? 'Cloud Meshy API Connected (MESHY_API_KEY active)'
                          : 'Cloud Meshy API Standby (Set MESHY_API_KEY in AI Studio Secrets or import .glb/.fbx/.obj below)'}
                      </span>
                    </div>
                    {pipelineMessage && <span className="text-amber-300 font-medium">{pipelineMessage}</span>}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {Object.values(CHARACTER_ASSET_REGISTRY).map((entry) => {
                    const isApproved = entry.visualAuthorityStatus === 'approved';
                    const traitParts: string[] = [`${entry.standingHeightMeters.toFixed(2)}m`];
                    if (entry.spiderLimbCount > 0) traitParts.push(`${entry.spiderLimbCount} Spider Limbs`);
                    if (entry.maneSpikeCount > 0) traitParts.push(`${entry.maneSpikeCount} Storm Spikes`);
                    if (entry.physicalTailCount > 0) {
                      traitParts.push(
                        `${entry.physicalTailCount} ${entry.physicalTailCount === 1 ? 'Tail' : 'Primary Tails'}`
                      );
                    }
                    const sheetKey = `turnaround_${entry.id}`;
                    const sheetBroken = Boolean(brokenSheetUrls[sheetKey]);
                    const hasCustomMeshy = Boolean(pipelineInfo?.characters?.[entry.id]?.meshy);
                    const isBusy = pipelineBusyId === entry.id;

                    return (
                      <div
                        key={entry.id}
                        className="rounded-xl bg-[#0d1018] border border-slate-800 p-3.5 flex flex-col justify-between gap-2.5"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 text-[11px] font-mono-tabular">
                            <span className={isApproved ? 'text-emerald-300 font-semibold' : 'text-amber-300 font-semibold'}>
                              {isApproved ? 'Approved · P1-I + P1-G GLB' : 'Awaiting Official Sheet · Withheld'}
                            </span>
                            <span className="text-slate-400">
                              {isApproved ? (hasCustomMeshy ? 'P1-I + P1-G + Custom' : 'Master + LOD1') : 'No GLB Exported'}
                            </span>
                          </div>

                          {isApproved && entry.multiviewSheetUrl && !sheetBroken && (
                            <button
                              type="button"
                              onClick={() =>
                                setInspectedSheet({
                                  driveId: sheetKey,
                                  name: `${entry.displayName} — 4-View Orthographic Reconstruction Sheet`,
                                  mimeType: 'image/jpeg',
                                  category: 'character',
                                  subjectTag: entry.id,
                                  folderPath: 'P1-I Reconstruction Sheets',
                                  localUrl: entry.multiviewSheetUrl as string,
                                  sizeBytes: 0,
                                  importedAt: new Date().toISOString(),
                                })
                              }
                              className="w-full mt-2 rounded-lg overflow-hidden border border-slate-800 hover:border-amber-400/60 bg-[#080a10] block"
                            >
                              <img
                                src={entry.multiviewSheetUrl}
                                alt={`${entry.displayName} 4-View Orthographic Sheet`}
                                referrerPolicy="no-referrer"
                                onError={() => setBrokenSheetUrls((prev) => ({ ...prev, [sheetKey]: true }))}
                                className="w-full h-24 object-contain bg-[#080a10]"
                              />
                            </button>
                          )}

                          <h4 className="font-display text-lg font-bold text-white mt-2">{entry.displayName}</h4>
                          <div className="text-[11px] font-mono-tabular text-sky-300 mt-0.5">
                            {traitParts.join(' · ')}
                            {isApproved ? ` · ${entry.requiredClips.length} Clips · ${entry.requiredMorphs.length} Morphs` : ''}
                          </div>
                          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{entry.notes}</p>
                        </div>

                        {isApproved && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
                            <label className="min-h-[36px] flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161b28] hover:bg-slate-800 border border-slate-700 text-[11px] font-medium text-slate-200 cursor-pointer">
                              <Upload className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate">{isBusy ? 'Rigging...' : 'Import GLB/FBX'}</span>
                              <input
                                type="file"
                                accept=".glb,.gltf,.fbx,.obj"
                                disabled={isBusy}
                                onChange={(e) => handleImportExternalMesh(entry.id, e.target.files?.[0])}
                                className="hidden"
                              />
                            </label>
                            {pipelineInfo?.meshyConfigured && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleCloudMeshyReconstruct(entry.id)}
                                className="min-h-[36px] px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-semibold"
                              >
                                Meshy 3D
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Official Visual Library & Google Drive Canon Vault */}
              <div className="rounded-xl bg-[#131620] border border-emerald-500/40 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-white">
                      Official Visual Library &amp; Google Drive Canon Vault
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Select any character, faction, or arena sheet below to inspect full-resolution artwork, or sync updates from Google Drive.
                    </p>
                  </div>
                  <button
                    onClick={onOpenCanonDrive}
                    className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold whitespace-nowrap shrink-0"
                  >
                    <CloudDownload className="w-4 h-4" />
                    <span>Open Google Drive Canon Sync</span>
                  </button>
                </div>

                {canonManifest.assets.length > 0 && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#0d1018] border border-slate-800">
                        {(
                          [
                            { id: 'all', label: `All Sheets (${canonManifest.assets.length})` },
                            {
                              id: 'character',
                              label: `Characters & Factions (${canonManifest.assets.filter((a) => a.category === 'character').length})`,
                            },
                            {
                              id: 'arena',
                              label: `Arenas & Districts (${canonManifest.assets.filter((a) => a.category === 'arena').length})`,
                            },
                          ] as const
                        ).map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setVaultFilter(tab.id)}
                            className={`min-h-[36px] px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                              vaultFilter === tab.id
                                ? 'bg-amber-500 text-slate-950 font-semibold'
                                : 'text-slate-300 hover:text-white'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                      <span className="text-xs text-slate-400">Click any sheet to inspect full artwork</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
                      {canonManifest.assets
                        .filter((asset) => vaultFilter === 'all' || asset.category === vaultFilter)
                        .map((asset) => {
                          const imgBroken = Boolean(brokenSheetUrls[asset.driveId]);
                          return (
                            <button
                              key={asset.driveId}
                              type="button"
                              onClick={() => setInspectedSheet(asset)}
                              className="text-left rounded-lg bg-[#0d1018] hover:bg-[#141926] border border-slate-800 hover:border-slate-600 p-2.5 space-y-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                            >
                              {asset.mimeType.startsWith('image/') && !imgBroken ? (
                                <img
                                  src={asset.localUrl}
                                  alt={asset.name}
                                  referrerPolicy="no-referrer"
                                  onError={() =>
                                    setBrokenSheetUrls((prev) => ({ ...prev, [asset.driveId]: true }))
                                  }
                                  className="w-full h-36 object-cover object-top rounded bg-[#090b10]"
                                />
                              ) : (
                                <div className="w-full h-36 rounded bg-gradient-to-br from-[#131826] to-[#090b10] flex flex-col items-center justify-center text-xs text-slate-300 px-3 text-center">
                                  <BookOpen className="w-5 h-5 text-amber-400 mb-1" />
                                  <span className="line-clamp-2">{asset.name}</span>
                                </div>
                              )}
                              <div className="text-xs font-semibold text-white truncate">{asset.name}</div>
                              <div className="text-[11px] font-mono-tabular text-slate-400 truncate">
                                <span className="text-emerald-300">
                                  {asset.category === 'character' ? 'Character' : 'Arena'}
                                </span>
                                <span aria-hidden="true"> · </span>
                                <span>{asset.subjectTag}</span>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-xl bg-[#131620] border border-violet-500/40 p-4">
                <h3 className="font-display text-2xl font-bold text-white">Game Canon Bible &amp; Source Material Audit</h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CANON_AUDIT_NOTES.map((note) => (
                    <div key={note.topic} className="rounded-lg bg-[#0d1018] border border-slate-800 p-3">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-100">{note.topic}</span>
                        <span className="text-amber-300">{note.status}</span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed">{note.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-display text-xl font-bold text-white mb-2">The Four Established Heritages</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {FOUR_HERITAGES.map((h) => {
                    const safeAccent = readableOnDark(h.color, '#131620');
                    return (
                      <div key={h.id} className="rounded-xl bg-[#131620] border border-slate-800 p-4">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: safeAccent }} />
                          <span className="font-display text-lg font-bold text-white">{h.name}</span>
                        </div>
                        <div className="text-xs mt-0.5 font-semibold" style={{ color: safeAccent }}>{h.aspect}</div>
                        <p className="text-xs text-slate-200 mt-2 leading-relaxed">{h.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-display text-xl font-bold text-white mb-2">Family &amp; Mentors</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {FAMILY_AND_MENTORS.map((f) => (
                    <div key={f.name} className="rounded-xl bg-[#131620] border border-slate-800 p-4">
                      <div className="font-display text-xl font-bold text-white">{f.name}</div>
                      <div className="text-xs text-sky-300">{f.title} · {f.speciesOrRole}</div>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">{f.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. SETTINGS, ACCESSIBILITY & MULTI-SLOT SAVE/LOAD */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Save Slots */}
              <div className="rounded-xl bg-[#131620] border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-amber-400" />
                    Offline Save Slots
                  </h3>
                  <button
                    onClick={exportSaveJson}
                    className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1c2130] hover:bg-slate-700 text-xs text-slate-200"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export JSON
                  </button>
                </div>

                <div className="space-y-2.5">
                  {SAVE_SLOTS.map((slotId) => {
                    const slot = allSaves[slotId];
                    return (
                      <div key={slotId} className="rounded-xl bg-[#0d1018] border border-slate-800 p-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold text-white uppercase">{slotId}</div>
                          {slot ? (
                            <div className="text-[11px] font-mono-tabular text-slate-300">
                              Kai Lv.{slot.heroes.kai.level} · Jax Lv.{slot.heroes.jax.level} · Stage {slot.missionStageIndex + 1}/5
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-300">Empty Slot</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onSaveSlot(slotId)}
                            className="min-h-[36px] px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold"
                          >
                            Save
                          </button>
                          {slot && (
                            <>
                              <button
                                onClick={() => onLoadSlot(slotId)}
                                className="min-h-[36px] px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
                              >
                                Load
                              </button>
                              <button
                                onClick={() => onDeleteSlot(slotId)}
                                aria-label={`Delete ${slotId}`}
                                className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg bg-slate-800 hover:bg-red-600/80 text-slate-300"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Performance, Controls, Audio & Accessibility */}
              <div className="rounded-xl bg-[#131620] border border-slate-800 p-5 space-y-4">
                <h3 className="font-display text-2xl font-bold text-white">Performance, Audio &amp; Accessibility</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="space-y-1">
                    <span className="text-slate-300">Graphics Quality</span>
                    <select
                      value={settings.graphicsQuality}
                      onChange={(e) => onUpdateSettings({ ...settings, graphicsQuality: e.target.value as GameSettings['graphicsQuality'] })}
                      className="w-full min-h-[40px] rounded-lg bg-[#0d1018] border border-slate-700 px-2.5 text-slate-100"
                    >
                      <option value="low">Low (Mobile LOD1 · Battery Saver)</option>
                      <option value="balanced">Balanced (Mobile Standard)</option>
                      <option value="high">High (Master GLB · 60 FPS Capable)</option>
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="text-slate-300">Frame Rate Target</span>
                    <select
                      value={settings.targetFps}
                      onChange={(e) => onUpdateSettings({ ...settings, targetFps: Number(e.target.value) as 30 | 60 })}
                      className="w-full min-h-[40px] rounded-lg bg-[#0d1018] border border-slate-700 px-2.5 text-slate-100"
                    >
                      <option value={30}>30 FPS (Baseline)</option>
                      <option value={60}>60 FPS (High Performance)</option>
                    </select>
                  </label>

                  <label className="space-y-1 sm:col-span-2">
                    <span className="text-slate-300">Character 3D Model Pipeline Version</span>
                    <select
                      aria-label="Character 3D Model Pipeline Version"
                      value={settings.characterModelVersion ?? 'p1i_reconstructed'}
                      onChange={(e) =>
                        onUpdateSettings({
                          ...settings,
                          characterModelVersion: e.target.value as CharacterModelVersion,
                        })
                      }
                      className="w-full min-h-[40px] rounded-lg bg-[#0d1018] border border-slate-700 px-2.5 text-slate-100"
                    >
                      <option value="p1i_reconstructed">
                        P1-I / P1-J Mastered Meshy 3D Rig (Default · 19 Grounded Clips)
                      </option>
                      <option value="p1g_mastered">
                        P1-G v3.0 Mastered (Preserved Baseline Checkpoint)
                      </option>
                      <option value="meshy_custom">
                        External Meshy / Blender Imported GLB (Auto-Fallback to P1-I)
                      </option>
                      <option value="procedural_fallback">
                        Procedural In-Engine Rig Fallback
                      </option>
                    </select>
                  </label>

                  <label className="space-y-1 sm:col-span-2">
                    <span className="text-slate-300">Environment Architecture Mode (Ashblock Heights)</span>
                    <select
                      aria-label="Environment Architecture Mode"
                      value={settings.environmentMode ?? 'reconstructed'}
                      onChange={(e) =>
                        onUpdateSettings({
                          ...settings,
                          environmentMode: e.target.value as EnvironmentMode,
                        })
                      }
                      className="w-full min-h-[40px] rounded-lg bg-[#0d1018] border border-slate-700 px-2.5 text-slate-100"
                    >
                      <option value="reconstructed">
                        P1-K Reconstructed Modular GLB World (Default · Skybridges + Arc Relays)
                      </option>
                      <option value="legacy">
                        Legacy Procedural Baseline (Side-by-Side Comparison)
                      </option>
                    </select>
                  </label>
                </div>

                {/* Audio Sliders */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Master Volume ({Math.round(settings.masterVolume * 100)}%)</span>
                    <button
                      onClick={() => onUpdateSettings({ ...settings, muted: !settings.muted })}
                      className="px-2.5 py-1 rounded bg-slate-800 text-slate-200"
                    >
                      {settings.muted ? 'Unmute Audio' : 'Mute Audio'}
                    </button>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={settings.masterVolume}
                    onChange={(e) => onUpdateSettings({ ...settings, masterVolume: Number(e.target.value) })}
                    className="w-full accent-amber-400"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <label className="space-y-1">
                      <span className="text-slate-300">Music ({Math.round(settings.musicVolume * 100)}%)</span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={settings.musicVolume}
                        onChange={(e) => onUpdateSettings({ ...settings, musicVolume: Number(e.target.value) })}
                        className="w-full accent-violet-400"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-slate-300">SFX ({Math.round(settings.sfxVolume * 100)}%)</span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={settings.sfxVolume}
                        onChange={(e) => onUpdateSettings({ ...settings, sfxVolume: Number(e.target.value) })}
                        className="w-full accent-sky-400"
                      />
                    </label>
                  </div>
                </div>

                {/* Touch Controls, HUD Safe-Zone Offsets & Camera */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <label className="space-y-1">
                    <span className="text-slate-300">HUD Scale ({settings.hudButtonScale.toFixed(2)}x)</span>
                    <input
                      type="range"
                      min={0.75}
                      max={1.25}
                      step={0.05}
                      value={settings.hudButtonScale}
                      onChange={(e) => onUpdateSettings({ ...settings, hudButtonScale: Number(e.target.value) })}
                      className="w-full accent-amber-400"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-slate-300">HUD Opacity ({Math.round(settings.hudOpacity * 100)}%)</span>
                    <input
                      type="range"
                      min={0.45}
                      max={1}
                      step={0.05}
                      value={settings.hudOpacity}
                      onChange={(e) => onUpdateSettings({ ...settings, hudOpacity: Number(e.target.value) })}
                      className="w-full accent-amber-400"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-slate-300">Touch Sensitivity</span>
                    <input
                      type="range"
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={settings.touchSensitivity}
                      onChange={(e) => onUpdateSettings({ ...settings, touchSensitivity: Number(e.target.value) })}
                      className="w-full accent-amber-400"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-slate-300">HUD Edge X ({settings.hudEdgeOffset}px)</span>
                    <input
                      type="range"
                      min={6}
                      max={40}
                      step={2}
                      value={settings.hudEdgeOffset}
                      onChange={(e) => onUpdateSettings({ ...settings, hudEdgeOffset: Number(e.target.value) })}
                      className="w-full accent-amber-400"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-slate-300">HUD Bottom Y ({settings.hudVerticalOffset ?? 10}px)</span>
                    <input
                      type="range"
                      min={4}
                      max={36}
                      step={2}
                      value={settings.hudVerticalOffset ?? 10}
                      onChange={(e) => onUpdateSettings({ ...settings, hudVerticalOffset: Number(e.target.value) })}
                      className="w-full accent-amber-400"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-slate-300">HUD Layout Density</span>
                    <select
                      value={settings.hudCompactMode ?? 'auto'}
                      onChange={(e) =>
                        onUpdateSettings({
                          ...settings,
                          hudCompactMode: e.target.value as 'auto' | 'compact' | 'expanded',
                        })
                      }
                      className="w-full min-h-[36px] rounded-lg bg-[#0d1018] border border-slate-700 px-2 text-slate-100"
                    >
                      <option value="auto">Auto Landscape</option>
                      <option value="compact">Compact Mobile</option>
                      <option value="expanded">Expanded Tablet/PC</option>
                    </select>
                  </label>
                </div>

                {/* Accessibility Toggles */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'aimAssist', label: 'Combat Aim Assist' },
                    { key: 'invertCameraY', label: 'Invert Camera Y' },
                    { key: 'autoRecenterCamera', label: 'Auto-Recenter Camera' },
                    { key: 'reducedMotion', label: 'Reduced Motion' },
                    { key: 'reduceCameraShake', label: 'Reduce Camera Shake' },
                    { key: 'hapticsEnabled', label: 'Touch Haptics' },
                    { key: 'subtitlesEnabled', label: 'Story Subtitles' },
                  ].map((opt) => {
                    const checked = Boolean(settings[opt.key as keyof GameSettings]);
                    return (
                      <button
                        key={opt.key}
                        onClick={() =>
                          onUpdateSettings({ ...settings, [opt.key]: !checked })
                        }
                        className={`min-h-[40px] px-3 rounded-lg border text-left flex items-center justify-between ${
                          checked ? 'bg-[#1a2030] border-amber-400/60 text-white' : 'bg-[#0d1018] border-slate-800 text-slate-400'
                        }`}
                      >
                        <span>{opt.label}</span>
                        <span>{checked ? 'ON' : 'OFF'}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="space-y-1">
                    <span className="text-slate-200">Subtitle Text Size</span>
                    <select
                      value={settings.subtitleScale}
                      onChange={(e) => onUpdateSettings({ ...settings, subtitleScale: e.target.value as 'normal' | 'large' })}
                      className="w-full min-h-[44px] rounded-lg bg-[#0d1018] border border-slate-600 px-2.5 text-slate-100"
                    >
                      <option value="normal">Standard</option>
                      <option value="large">Large Accessibility</option>
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-slate-200">Colorblind Mode</span>
                    <select
                      value={settings.colorblindMode}
                      onChange={(e) => onUpdateSettings({ ...settings, colorblindMode: e.target.value as GameSettings['colorblindMode'] })}
                      className="w-full min-h-[44px] rounded-lg bg-[#0d1018] border border-slate-600 px-2.5 text-slate-100"
                    >
                      <option value="none">Standard Palette</option>
                      <option value="protanopia">Protanopia Safe</option>
                      <option value="deuteranopia">Deuteranopia Safe</option>
                      <option value="tritanopia">Tritanopia Safe</option>
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-slate-200">Parry Timing Window</span>
                    <select
                      value={settings.parryTiming}
                      onChange={(e) => onUpdateSettings({ ...settings, parryTiming: e.target.value as GameSettings['parryTiming'] })}
                      className="w-full min-h-[44px] rounded-lg bg-[#0d1018] border border-slate-600 px-2.5 text-slate-100"
                    >
                      <option value="standard">Standard (0.10s)</option>
                      <option value="generous">Generous (0.16s)</option>
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-slate-200">Gamepad Control Mapping</span>
                    <select
                      value={
                        (settings.gamepadBindings?.lightAttack ?? 2) === 5
                          ? 'bumper'
                          : 'standard'
                      }
                      onChange={(e) =>
                        onUpdateSettings({
                          ...settings,
                          gamepadBindings:
                            e.target.value === 'bumper'
                              ? { ...ALTERNATE_BUMPER_GAMEPAD_BINDINGS }
                              : { ...DEFAULT_GAMEPAD_BINDINGS },
                        })
                      }
                      className="w-full min-h-[44px] rounded-lg bg-[#0d1018] border border-slate-600 px-2.5 text-slate-100"
                    >
                      <option value="standard">Standard (X/RT Attack · Y Web/Storm · LB Block)</option>
                      <option value="bumper">Bumper Fighter (RB/RT Attack · X Web/Storm · LT Block)</option>
                    </select>
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
                  <span>Offline Compliance Documents</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onOpenLegal('privacy')}
                      className="min-h-[40px] px-3 rounded-lg bg-[#0d1018] hover:bg-slate-800 border border-slate-600 text-slate-100"
                    >
                      Privacy Policy
                    </button>
                    <button
                      onClick={() => onOpenLegal('terms')}
                      className="min-h-[40px] px-3 rounded-lg bg-[#0d1018] hover:bg-slate-800 border border-slate-600 text-slate-100"
                    >
                      Terms of Use
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-Resolution Canon Sheet Lightbox */}
      {inspectedSheet && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={inspectedSheet.name}
          onClick={() => setInspectedSheet(null)}
        >
          <div
            className="w-full max-w-5xl max-h-[92vh] rounded-2xl bg-[#0b0e16] border border-slate-700 flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-slate-800 bg-[#080a10]">
              <div className="min-w-0">
                <h4 className="font-display text-xl font-bold text-white truncate">{inspectedSheet.name}</h4>
                <div className="text-xs font-mono-tabular text-slate-300 truncate">
                  <span className="text-emerald-300">
                    {inspectedSheet.category === 'character' ? 'Character & Faction Sheet' : 'Arena & World Sheet'}
                  </span>
                  <span aria-hidden="true"> · </span>
                  <span>{inspectedSheet.subjectTag}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectedSheet(null)}
                className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <X className="w-4 h-4" />
                <span>Close Sheet</span>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#06080d]">
              {!brokenSheetUrls[inspectedSheet.driveId] ? (
                <img
                  src={inspectedSheet.localUrl}
                  alt={inspectedSheet.name}
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setBrokenSheetUrls((prev) => ({ ...prev, [inspectedSheet.driveId]: true }))
                  }
                  className="max-h-[78vh] w-auto object-contain rounded-lg"
                />
              ) : (
                <div className="py-16 text-center text-sm text-slate-300">
                  Sheet preview unavailable ({inspectedSheet.localUrl})
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
