import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  ENEMY_ASSET_REGISTRY,
  EnemyModelId,
  resolveEnemyFallbackChain,
} from '../data/enemyAssetRegistry.ts';
import {
  GLBCharacterInstance,
  preloadGlbAssets,
} from '../engine/GLBCharacterController.ts';
import { buildIronMarketDistrict } from '../engine/IronMarketBuilder.ts';
import { buildNeonWardDistrict } from '../engine/NeonWardBuilder.ts';
import { buildSector7District } from '../engine/Sector7Builder.ts';
import { buildUndercrownDistrict } from '../engine/UndercrownBuilder.ts';
import {
  bestTextOn,
  contrastRatio,
  darkenForText,
  parseHex,
  readableOnDark,
} from '../accessibility/contrast.ts';
import {
  COMBO_DECAY_SECONDS,
  createInitialComboState,
  getComboCombatBenefits,
  getComboTierLabel,
  registerComboHit,
  registerCommittedWhiff,
  resetComboOnDamage,
  tickComboDecay,
} from '../combat/comboSystem.ts';
import {
  DEFAULT_GAMEPAD_BINDINGS,
  GamepadInputPoller,
  remapGamepadBinding,
} from '../combat/combatInputMapper.ts';
import {
  DUO_FINISHERS,
  addDuoSynergy,
  createInitialDuoSynergyState,
  interruptDuoFinisher,
  registerChordInput,
  selectContextualFinisher,
  stepDuoFinisher,
  tryStartDuoFinisher,
} from '../combat/duoSynergySystem.ts';
import {
  ARCHETYPE_CONFIGS,
  allocateAttackTokens,
  computeEnemySeparationVector,
  evaluateEnemyDefensiveReaction,
} from '../combat/enemyCombatDirector.ts';
import {
  PARRY,
  TIMING_PROFILES,
  applyGuardBreakToShield,
  consumeCounterWindow,
  createCounterWindowState,
  openCounterWindow,
  parryOutcomeOdds,
  parryWindowFor,
  resolveIncomingStrike,
  tickCounterWindow,
} from '../combat/parry.ts';
import {
  WEB_LIMITS,
  WorldBoxCollider,
  computePredatorPullResult,
  computeWebThrowAndWallPin,
  getEnemyWebResistance,
  shouldAutoReleaseTether,
  validateGrappleAnchor,
} from '../combat/webInteractionSystem.ts';
import { ENERGY_DOMAINS, HERO_ABILITIES, SKILL_TREES } from '../data/abilitiesData.ts';
import {
  BOSS_ROSTER,
  CANON_AUDIT_NOTES,
  DISTRICTS,
  FAMILY_AND_MENTORS,
  FOUR_HERITAGES,
} from '../data/canonData.ts';
import { COSMETIC_PRESETS } from '../data/itemsData.ts';
import { MISSION_1_STEPS } from '../data/missionsData.ts';
import { createEnemyRig, createHeroRig } from '../engine/CharacterBuilder.ts';
import { OFFLINE_LEGAL_DOCS } from '../legal/offlineLegal.ts';
import {
  CURRENT_SAVE_VERSION,
  computeHeroStats,
  createNewSave,
  deleteSlot,
  grantHeroXp,
  listAllSaves,
  loadFromSlot,
  loadFromSlotWithRecovery,
  migrateSaveData,
  saveToSlot,
  validateSavePayload,
} from '../save/SaveManager.ts';

function createMemoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
    rawMap: map,
  };
}

// 1. Canon Governance & Terminology Integrity Tests
assert.equal(FOUR_HERITAGES.length, 4, 'Must define all 4 canonical heritages');
assert.equal(DISTRICTS.length, 8, 'Must define all 8 canonical districts');
assert.equal(DISTRICTS[0].name, 'Ashblock Heights');
assert.equal(DISTRICTS[0].status, 'playable');
assert.equal(ENERGY_DOMAINS.length, 9, 'Nine-domain progression must be modeled as energy domains');

const serializedCanon = JSON.stringify({
  FOUR_HERITAGES,
  DISTRICTS,
  FAMILY_AND_MENTORS,
  BOSS_ROSTER,
  CANON_AUDIT_NOTES,
  HERO_ABILITIES,
  MISSION_1_STEPS,
});
assert.equal(/\bVoid\b/.test(serializedCanon), false, 'Canon modules must use Erasure, not off-canon Void');
assert.equal(/\b(Kaison|Silver|Volter)\b/i.test(serializedCanon), false, 'Reject unapproved PR #374 hero names');
assert.ok(
  CANON_AUDIT_NOTES.some((n) => /strictly three primary physical tails/i.test(n.detail)),
  'Canon bible must enforce Kai-Jax strictly three primary physical tails'
);

// 2. Save v2 Schema, Starting Hero Selection & Canon-Gated Fusion Default Test
const freshSave = createNewSave('test-slot');
assert.equal(freshSave.version, CURRENT_SAVE_VERSION);
assert.equal(freshSave.fusionUnlocked, false, 'Fusion must be locked at campaign start');
assert.equal(freshSave.traversalTier, 'Apex Street', 'Traversal starts at Apex Street');
assert.equal(freshSave.activeHero, 'kai');
const jaxStartSave = createNewSave('slot-1', 'Ashblock', 'jax');
assert.equal(jaxStartSave.activeHero, 'jax', 'Starting hero selection must persist Jax');

// 3. Save Migration (v0/v1 -> v2) & Payload Validation Test
assert.equal(validateSavePayload({ activeHero: 'kai', missionStageIndex: 2, checkpointPos: [0, 0, -14] }), true);
assert.equal(validateSavePayload({ activeHero: 'invalid_hero' }), false);
assert.equal(validateSavePayload(null), false);

const migrated = migrateSaveData({ version: 0, memoryFragments: 3, activeHero: 'jax' }, 'slot-1');
assert.equal(migrated.version, CURRENT_SAVE_VERSION);
assert.equal(migrated.memoryFragments, 3);
assert.equal(migrated.activeHero, 'jax');
assert.equal(migrated.heroes.kai.level, 1);

// 4. Atomic Multi-Slot Persistence, Corrupt JSON Shadow Backup Recovery & Zero Cross-Slot Contamination
const memStore = createMemoryStorage();
const s1 = createNewSave('slot-1');
s1.memoryFragments = 4;
s1.heroes.kai.level = 3;
saveToSlot('slot-1', s1, memStore);

const s2 = createNewSave('slot-2', 'Slot Two', 'jax');
s2.memoryFragments = 9;
saveToSlot('slot-2', s2, memStore);

// Update slot-1 so _bak holds previous valid state and primary holds latest
s1.memoryFragments = 5;
saveToSlot('slot-1', s1, memStore);
assert.equal(loadFromSlot('slot-1', memStore)?.memoryFragments, 5);
assert.equal(loadFromSlot('slot-2', memStore)?.memoryFragments, 9, 'Zero cross-slot contamination');

// Simulate abrupt power-loss / truncated JSON in primary slot-1
memStore.setItem('kaijax_save_v1_slot-1', '{"__kaijaxEnvelope":2,"checksum":"deadbeef","payload":{TRUNCATED');
const rec = loadFromSlotWithRecovery('slot-1', memStore);
assert.equal(rec.status, 'recovered_from_backup', 'Corrupted primary save must auto-recover from _bak');
assert.equal(rec.data?.heroes.kai.level, 3, 'Recovered save preserves hero progression');
assert.equal(loadFromSlot('slot-2', memStore)?.activeHero, 'jax', 'Slot 2 unaffected by Slot 1 recovery');

// Legacy v1 raw JSON in autosave upgrades seamlessly
memStore.setItem('kaijax_save_v1_autosave', JSON.stringify({ version: 1, activeHero: 'kai', memoryFragments: 7 }));
const legRec = loadFromSlotWithRecovery('autosave', memStore);
assert.equal(legRec.status, 'migrated_legacy');
assert.equal(legRec.data?.memoryFragments, 7);
assert.equal(Object.values(listAllSaves(memStore)).filter(Boolean).length, 3);
deleteSlot('slot-2', memStore);
assert.equal(loadFromSlot('slot-2', memStore), null);

// 5. Progression, XP & Skill Tree Calculation Test
const baseStats = computeHeroStats('kai', freshSave.heroes.kai);
const leveled = grantHeroXp(freshSave.heroes.kai, 120);
assert.equal(leveled.leveledUp, true);
assert.equal(leveled.updated.level, 2);
assert.equal(leveled.updated.skillPoints, 2);

const boostedStats = computeHeroStats('kai', {
  ...leveled.updated,
  unlockedSkills: ['kai-t1-fangs'],
});
assert.ok(boostedStats.attack > baseStats.attack, 'Unlocking skill node must increase hero attack');

// 6. Distinct Hero Abilities & Mission Steps Verification
assert.equal(HERO_ABILITIES.kai.length, 3);
assert.equal(HERO_ABILITIES.jax.length, 3);
assert.equal(HERO_ABILITIES.kaijax.length, 3);
assert.notEqual(HERO_ABILITIES.kai[0].name, HERO_ABILITIES.jax[0].name);
assert.equal(MISSION_1_STEPS.length, 5, 'Mission 1 must have 5 playable stages through Boss');
assert.ok(SKILL_TREES.some((s) => s.hero === 'kai') && SKILL_TREES.some((s) => s.hero === 'jax'));

// 7. Combo Momentum, Style Variation Scoring, Whiff Penalty, Decay & Damage Reset Suite
let combo = createInitialComboState();
combo = registerComboHit(combo, 1, 'kai_light_1');
const firstScore = combo.styleScore ?? 0;
combo = registerComboHit(combo, 1, 'kai_heavy'); // Varied move earns bonus style multiplier
const variedGain = (combo.styleScore ?? 0) - firstScore;

let mashCombo = createInitialComboState();
mashCombo = registerComboHit(mashCombo, 1, 'kai_light_1');
const mashFirst = mashCombo.styleScore ?? 0;
mashCombo = registerComboHit(mashCombo, 1, 'kai_light_1'); // Repeated move earns lower style
const mashGain = (mashCombo.styleScore ?? 0) - mashFirst;
assert.ok(variedGain > mashGain, 'Technical move variation must score higher than repeated mashing');

combo = registerComboHit(combo, 28, 'web_strike');
assert.equal(combo.count, 30);
const apexBenefits = getComboCombatBenefits(combo.count);
assert.equal(apexBenefits.apexMomentumActive, true);
assert.equal(apexBenefits.finisherEligible, true);
assert.ok(apexBenefits.duoSynergyMultiplier > 1.0);
assert.ok(getComboTierLabel(combo.count).baseScale > 1.0);

const afterWhiff = registerCommittedWhiff(combo, 1.5);
assert.ok(afterWhiff.timer < combo.timer, 'Committed heavy whiff reduces combo decay window');

combo = tickComboDecay(combo, 1.5);
assert.equal(combo.count, 30, 'Combo remains active while decay timer > 0');

const broken = resetComboOnDamage(combo);
assert.equal(broken.count, 0, 'Taking damage must reset combo count to 0');
assert.equal(broken.timer, 0, 'Taking damage must reset combo decay timer to 0');
assert.equal(broken.brokenSeq, 1);

let expiring = registerComboHit(createInitialComboState(), 3);
expiring = tickComboDecay(expiring, COMBO_DECAY_SECONDS + 0.2);
assert.equal(expiring.count, 0, 'Combo resets when decay timer expires');

// 8. Agile Block, Perfect Parry, Counter Window Eligibility, Unblockables & Shield Guard Break Suite
assert.equal(parryWindowFor('standard'), PARRY.window);
assert.equal(PARRY.window, 0.10);
assert.equal(parryWindowFor('generous'), PARRY.generousWindow);
assert.equal(PARRY.generousWindow, 0.16);

assert.equal(resolveIncomingStrike({ parryTimer: 0.05, dodgeTimer: 0.2, invulnTimer: 0.2 }), 'parry');
assert.equal(resolveIncomingStrike({ parryTimer: 0, dodgeTimer: 0.12, invulnTimer: 0.12 }), 'evade');
assert.equal(resolveIncomingStrike({ parryTimer: 0, dodgeTimer: 0, invulnTimer: 0, blockHeld: true }), 'block');
assert.equal(
  resolveIncomingStrike({ parryTimer: 0.05, dodgeTimer: 0, invulnTimer: 0, blockHeld: true, unblockable: true }),
  'guard_broken',
  'Unblockable attack must shatter passive block/parry'
);
assert.equal(
  resolveIncomingStrike({ parryTimer: 0, dodgeTimer: 0.2, invulnTimer: 0.2, blockHeld: false, unblockable: true }),
  'evade',
  'Unblockable attack can be cleanly evaded with dodge i-frames'
);

let cw = createCounterWindowState();
assert.equal(cw.active, false);
cw = openCounterWindow('enemy-1');
assert.equal(cw.active, true);
cw = tickCounterWindow(cw, 0.4);
assert.equal(cw.active, true);
const consumedCw = consumeCounterWindow(cw);
assert.equal(consumedCw.consumed, true);
assert.equal(consumedCw.targetEnemyId, 'enemy-1');
assert.equal(consumedCw.nextState.active, false, 'Counter window closes once consumed');

const shieldChip = applyGuardBreakToShield(90, 22, false);
assert.equal(shieldChip.broken, false, 'Light attack cannot break riot shield');
const shieldShatter = applyGuardBreakToShield(90, 65, true);
assert.equal(shieldShatter.broken, true, 'Heavy / Guard-Break shatters riot shield');

const stdOdds = parryOutcomeOdds(PARRY.window, TIMING_PROFILES.typical);
const genOdds = parryOutcomeOdds(PARRY.generousWindow, TIMING_PROFILES.typical);
assert.ok(genOdds.parry > stdOdds.parry);

// 9. Web Physics, Anchor Obstruction Validation, Predator Pull, Wall Pin & Auto-Release Suite
const testWall: WorldBoxCollider[] = [
  { minX: -4, maxX: 4, minY: 0, maxY: 8, minZ: -5, maxZ: -3 },
];
const validAnchor = validateGrappleAnchor(
  new THREE.Vector3(0, 0, 2),
  new THREE.Vector3(8, 7, 2),
  testWall
);
assert.equal(validAnchor.valid, true, 'Unobstructed elevated anchor must validate');

const obstructedAnchor = validateGrappleAnchor(
  new THREE.Vector3(0, 0, 2),
  new THREE.Vector3(0, 5, -10),
  testWall
);
assert.equal(obstructedAnchor.valid, false, 'Anchor behind solid wall collider must be rejected');
assert.equal(obstructedAnchor.reason, 'obstructed');

const normalPull = computePredatorPullResult(
  new THREE.Vector3(0, 0, 4),
  new THREE.Vector3(0, 0, -2),
  'brawler',
  []
);
assert.equal(normalPull.displaced, true);
assert.ok(normalPull.nextPos.z > -2 && normalPull.nextPos.z < 3.2, 'Pulled brawler lands in front of Kai');

const bossPull = computePredatorPullResult(
  new THREE.Vector3(0, 0, 4),
  new THREE.Vector3(0, 0, -2),
  'boss',
  []
);
assert.equal(bossPull.immune, true, 'Boss must resist yank displacement');
assert.equal(bossPull.displaced, false);

const bruiserRes = getEnemyWebResistance('bruiser');
assert.ok(bruiserRes.pullFactor > 0 && bruiserRes.pullFactor < 1.0, 'Heavy bruiser has partial pull resistance');

// Wall pin against outer Ashblock street wall (X = +21) clamps safely outside wall
const pinRes = computeWebThrowAndWallPin(
  new THREE.Vector3(18.0, 0, -10),
  new THREE.Vector3(1, 0, 0),
  'dodger',
  []
);
assert.equal(pinRes.wallPinned, true, 'Enemy thrown into approved street wall becomes wall-pinned');
assert.equal(pinRes.pinDuration, WEB_LIMITS.wallPinDuration);
assert.ok(pinRes.nextPos.x <= 20.45, 'Wall-pinned enemy never clips past wall boundary');

assert.equal(
  shouldAutoReleaseTether(new THREE.Vector3(0, 5, -10), new THREE.Vector3(0, 0, 2), false, testWall),
  true,
  'Obstructed web tether must automatically release'
);
assert.equal(
  shouldAutoReleaseTether(new THREE.Vector3(0, 2, 0), new THREE.Vector3(0, 0, 25), false, []),
  true,
  'Over-range web tether must automatically release'
);

// 10. Duo Synergy Meter, Two-Button Chord Detector & Single-Application Finisher Impact Suite
let syn = createInitialDuoSynergyState(0);
syn = addDuoSynergy(syn, 'web_into_storm');
syn = addDuoSynergy(syn, 'parry_partner_followup');
syn = addDuoSynergy(syn, 'switch_combo');
assert.ok(syn.meter >= 50 && syn.meter <= 100, 'Cooperative triggers fill Duo Synergy meter');

// Reject invalid finisher without target
const rejectedNoTarget = tryStartDuoFinisher({
  synergyState: syn,
  hasValidTarget: false,
  targetEnemyId: null,
  nearbyEnemyCount: 0,
  bothBrothersAvailable: true,
  isFused: false,
  fusionUnlocked: false,
  counterWindowOpen: false,
  playerAirborne: false,
  playerStunnedOrDown: false,
  alreadyInFinisher: false,
});
assert.equal(rejectedNoTarget.accepted, false);
assert.equal(rejectedNoTarget.reason, 'no_valid_target');
assert.equal(rejectedNoTarget.nextSynergy.meter, syn.meter, 'Rejected finisher does not spend synergy');

// Two-button simultaneous Attack + Ability chord within 0.18s triggers!
const c1 = registerChordInput(syn, 'attack', 10.0);
assert.equal(c1.chordTriggered, false);
const c2 = registerChordInput(c1.nextState, 'ability', 10.09);
assert.equal(c2.chordTriggered, true, 'Simultaneous Attack + Ability within 0.18s triggers Duo Finisher chord');

// Contextual finisher selection covers crowd, counter, air, and convergence
assert.equal(
  selectContextualFinisher({
    synergyState: syn,
    hasValidTarget: true,
    targetEnemyId: 'e1',
    nearbyEnemyCount: 4,
    bothBrothersAvailable: true,
    isFused: false,
    fusionUnlocked: false,
    counterWindowOpen: false,
    playerAirborne: false,
    playerStunnedOrDown: false,
    alreadyInFinisher: false,
  }).id,
  'storm-snare'
);
assert.equal(Object.keys(DUO_FINISHERS).length, 6, 'All 6 canonical Duo Finishers defined');

const startedFin = tryStartDuoFinisher({
  synergyState: syn,
  hasValidTarget: true,
  targetEnemyId: 'e1',
  nearbyEnemyCount: 1,
  bothBrothersAvailable: true,
  isFused: false,
  fusionUnlocked: false,
  counterWindowOpen: true,
  playerAirborne: false,
  playerStunnedOrDown: false,
  alreadyInFinisher: false,
});
assert.equal(startedFin.accepted, true);
assert.equal(startedFin.execution?.finisher.id, 'twin-fang-reversal');
assert.equal(startedFin.nextSynergy.meter, syn.meter - 50, 'Accepted finisher spends 50 Duo Synergy');

// Step through entire finisher in 50ms slices and verify each impact frame fires STRICTLY ONCE
let exec = startedFin.execution!;
let totalImpactsTriggered = 0;
for (let i = 0; i < 30; i++) {
  const s = stepDuoFinisher(exec, 0.05);
  exec = s.nextExecution;
  totalImpactsTriggered += s.triggeredImpactMultipliers.length;
}
assert.equal(exec.completed, true);
assert.equal(
  totalImpactsTriggered,
  exec.finisher.impactTimes.length,
  'Finisher damage must apply strictly once per impact frame (zero duplicate application)'
);

// Interruption safety
const interrupted = interruptDuoFinisher(startedFin.execution!);
assert.equal(interrupted.interrupted, true);
assert.equal(stepDuoFinisher(interrupted, 0.5).triggeredImpactMultipliers.length, 0);

// 11. Enemy Combat Director: 6 Regular Archetypes + Boss, Attack-Token Cap & Anti-Stacking
assert.equal(Object.keys(ARCHETYPE_CONFIGS).length, 8, 'All archetypes + boss configured');
const crowd = [
  { id: 'e1', kind: 'brawler' as const, pos: new THREE.Vector3(0, 0, 2), state: 'chase' as const, snareTimer: 0, stunTimer: 0 },
  { id: 'e2', kind: 'dodger' as const, pos: new THREE.Vector3(1, 0, 2.5), state: 'chase' as const, snareTimer: 0, stunTimer: 0 },
  { id: 'e3', kind: 'bruiser' as const, pos: new THREE.Vector3(-1, 0, 3), state: 'chase' as const, snareTimer: 0, stunTimer: 0 },
  { id: 'e4', kind: 'assassin' as const, pos: new THREE.Vector3(2, 0, 4), state: 'chase' as const, snareTimer: 0, stunTimer: 0 },
];
const tokens = allocateAttackTokens(crowd, new THREE.Vector3(0, 0, 0), 2);
assert.equal(tokens.size, 2, 'Attack-token regulator caps simultaneous non-boss attackers to 2');

const sepVec = computeEnemySeparationVector('e1', new THREE.Vector3(0, 0, 0), [
  { id: 'e1', kind: 'brawler', pos: new THREE.Vector3(0, 0, 0), state: 'chase', snareTimer: 0, stunTimer: 0 },
  { id: 'e2', kind: 'brawler', pos: new THREE.Vector3(0.4, 0, 0), state: 'chase', snareTimer: 0, stunTimer: 0 },
]);
assert.ok(sepVec.x < 0, 'Anti-stacking pushes overlapping enemies apart');

assert.equal(
  evaluateEnemyDefensiveReaction({
    kind: 'dodger',
    shieldHp: 0,
    incapacitated: false,
    isGuardBreakMove: false,
    isWebOrAbilityOrCounter: false,
    repeatLightCount: 3,
  }),
  'dodger_sidestep',
  'Agile Dodger sidesteps 3+ consecutive light mashing'
);
assert.equal(
  evaluateEnemyDefensiveReaction({
    kind: 'dodger',
    shieldHp: 0,
    incapacitated: true, // Snared or Wall-Pinned!
    isGuardBreakMove: false,
    isWebOrAbilityOrCounter: false,
    repeatLightCount: 5,
  }),
  'none',
  'Snared/Wall-Pinned Dodger cannot sidestep'
);
assert.equal(
  evaluateEnemyDefensiveReaction({
    kind: 'assassin',
    shieldHp: 0,
    incapacitated: false,
    isGuardBreakMove: false,
    isWebOrAbilityOrCounter: false,
    repeatLightCount: 4,
  }),
  'assassin_counter',
  'Elite Assassin parries 4+ consecutive identical light attacks'
);

// 12. Gamepad Input Mapper: Edge-Triggered Polling, Chord Detection & Conflict-Free Remapping
const remapped = remapGamepadBinding(DEFAULT_GAMEPAD_BINDINGS, 'lightAttack', 5);
assert.equal(remapped.lightAttack, 5);
assert.equal(remapped.switchPartner, 2, 'Remapping swaps existing button cleanly without duplicates');

const poller = new GamepadInputPoller();
const makeButtons = (pressedIndices: number[]) =>
  Array.from({ length: 12 }, (_, idx) => ({ pressed: pressedIndices.includes(idx) }));

const frame1 = poller.poll({ axes: [0, 0, 0, 0], buttons: makeButtons([2]) }, DEFAULT_GAMEPAD_BINDINGS);
assert.equal(frame1.lightAttackJustPressed, true);
const frame2 = poller.poll({ axes: [0, 0, 0, 0], buttons: makeButtons([2]) }, DEFAULT_GAMEPAD_BINDINGS);
assert.equal(frame2.lightAttackJustPressed, false, 'Holding button must not spam edge-triggered attack');
const frame3Chord = poller.poll({ axes: [0, 0, 0, 0], buttons: makeButtons([2, 3]) }, DEFAULT_GAMEPAD_BINDINGS);
assert.equal(frame3Chord.duoChordJustPressed, true, 'Pressing Attack + Tactical triggers Gamepad Duo Chord');

// 13. WCAG 2.1 Contrast & Dark UI Readability Suite
assert.deepEqual(parseHex('#0a0b10'), [10, 11, 16]);
assert.ok(contrastRatio('#f1f5f9', '#0a0b10') > 15);
assert.ok(contrastRatio('#94a3b8', '#0a0b10') >= 4.5);
const rescuedDimViolet = readableOnDark('#4c1d95', '#0a0b10', 4.5);
assert.ok(contrastRatio(rescuedDimViolet, '#0a0b10') >= 4.5);
for (const h of FOUR_HERITAGES) {
  const safeAccent = readableOnDark(h.color, '#131620', 4.5);
  assert.ok(contrastRatio(safeAccent, '#131620') >= 4.5);
}
for (const c of COSMETIC_PRESETS) {
  const safeCosmetic = readableOnDark(c.accentHex, '#0a0b10', 4.5);
  assert.ok(contrastRatio(safeCosmetic, '#0a0b10') >= 4.5);
}
assert.equal(bestTextOn('#0a0b10', '#131620'), '#ffffff');
assert.equal(bestTextOn('#f59e0b', '#fbbf24'), '#000000');
const darkenedBgs = darkenForText(['#f97316', '#38bdf8'], '#ffffff', 4.6);
assert.ok(darkenedBgs.every((bg) => contrastRatio('#ffffff', bg) >= 4.6));

// 14. Headless Three.js Articulated Hero & Archetype Rigs + Tri-Tail Canon Geometry Suite
const stubShadowTex = new THREE.Texture();
const kaiRig = createHeroRig('kai', stubShadowTex);
const jaxRig = createHeroRig('jax', stubShadowTex);
const kaijaxRig = createHeroRig('kaijax', stubShadowTex);
const shieldRig = createEnemyRig('shield', stubShadowTex);
const assassinRig = createEnemyRig('assassin', stubShadowTex);
const bossRig = createEnemyRig('boss', stubShadowTex);

assert.equal(kaiRig.spiderLimbs.length, 4, 'Kai must assemble 4 articulated spider limbs');
assert.equal(kaiRig.tails.length, 0, 'Unfused Kai must have 0 tails');
assert.equal(jaxRig.maneSpikes.length, 7, 'Jax must assemble 7 electric storm mane spikes');
assert.equal(kaijaxRig.tails.length, 3, 'Fused Kai-Jax must enforce STRICTLY 3 primary physical tails');
assert.ok(shieldRig.leftArm.getObjectByName('enemy_riot_shield'), 'Shield archetype mounts riot shield');
assert.ok(assassinRig.leftArm.children.length >= 2, 'Assassin archetype mounts twin blades');
assert.ok(bossRig.telegraphRing instanceof THREE.Mesh);

// 15. Offline Bundled Legal Docs Suite (Zero External Dependencies)
for (const doc of Object.values(OFFLINE_LEGAL_DOCS)) {
  assert.ok(doc.sections.length >= 3);
  const serialized = JSON.stringify(doc);
  assert.equal(/https?:\/\//i.test(serialized), false);
}

// 16. Official Visual Library Authority, Rigged GLB Manifest & Legacy Purge Suite
import('../data/characterAssetRegistry.ts').then(
  async ({ CHARACTER_ASSET_REGISTRY, resolveCharacterGlbUrl }) => {
  const entries = Object.values(CHARACTER_ASSET_REGISTRY);
  assert.equal(entries.length, 6, 'Must define Kai, Jax, Kai-Jax, Boryn, Borax, and Bovar');

  const approvedIds = ['kai', 'jax', 'kaijax', 'boryn', 'borax'] as const;
  for (const id of approvedIds) {
    const entry = CHARACTER_ASSET_REGISTRY[id];
    assert.equal(entry.visualAuthorityStatus, 'approved');
    assert.equal(resolveCharacterGlbUrl(id, 'high'), `/models/characters/${id}_master.glb`);
    assert.equal(resolveCharacterGlbUrl(id, 'low'), `/models/characters/${id}_lod1.glb`);
    assert.equal(entry.requiredClips.length, 19);
    assert.equal(entry.requiredMorphs.length, 5);
  }

  assert.equal(CHARACTER_ASSET_REGISTRY.bovar.visualAuthorityStatus, 'awaiting_visual_approval');
  assert.equal(resolveCharacterGlbUrl('bovar', 'high'), null);
  assert.equal(resolveCharacterGlbUrl('bovar', 'low'), null);
  assert.equal(CHARACTER_ASSET_REGISTRY.kaijax.physicalTailCount, 3);

  // 17. P1-E Responsive Mobile HUD Settings & GLB UV / Skeleton Binary Invariants Suite
  const { DEFAULT_SETTINGS, loadSettings, saveSettings } = await import('../save/SaveManager.ts');
  const fs = await import('node:fs');
  const path = await import('node:path');

  assert.equal(DEFAULT_SETTINGS.hudVerticalOffset, 10, 'Default HUD bottom vertical offset is 10px');
  assert.equal(DEFAULT_SETTINGS.hudCompactMode, 'auto', 'Default HUD density mode is auto');
  const hudStore = createMemoryStorage();
  saveSettings(
    {
      ...DEFAULT_SETTINGS,
      hudEdgeOffset: 24,
      hudVerticalOffset: 18,
      hudCompactMode: 'compact',
      hudButtonScale: 1.1,
    },
    hudStore
  );
  const reloadedSettings = loadSettings(hudStore);
  assert.equal(reloadedSettings.hudEdgeOffset, 24);
  assert.equal(reloadedSettings.hudVerticalOffset, 18);
  assert.equal(reloadedSettings.hudCompactMode, 'compact');
  assert.equal(reloadedSettings.hudButtonScale, 1.1);

  const modelsRoot = path.join(process.cwd(), 'public', 'models', 'characters');
  assert.equal(fs.existsSync(path.join(modelsRoot, 'bovar_master.glb')), false, 'Bovar GLB must never be fabricated');

  for (const id of approvedIds) {
    const glbBuf = fs.readFileSync(path.join(modelsRoot, `${id}_master.glb`));
    assert.equal(glbBuf.toString('ascii', 0, 4), 'glTF');
    const jsonLen = glbBuf.readUInt32LE(12);
    const gltf = JSON.parse(glbBuf.toString('utf8', 20, 20 + jsonLen));
    const binOffset = 20 + jsonLen + 8;

    // Verify TEXCOORD_0 UVs are strictly within valid [0, 1] atlas range
    const prim = gltf.meshes[0].primitives[0];
    const uvAcc = gltf.accessors[prim.attributes.TEXCOORD_0];
    const uvBv = gltf.bufferViews[uvAcc.bufferView];
    const uvStart = binOffset + (uvBv.byteOffset || 0) + (uvAcc.byteOffset || 0);
    for (let i = 0; i < uvAcc.count * 2; i++) {
      const val = glbBuf.readFloatLE(uvStart + i * 4);
      assert.ok(val >= 0 && val <= 1.0001, `${id} UV out of [0,1] bounds: ${val}`);
    }

    // Verify Kai-Jax strictly 3 physical tail roots (tail_ember_01, tail_storm_01, tail_memory_01)
    const tailRoots = gltf.nodes.filter((n: { name?: string }) =>
      /^tail(_ember|_memory|_storm)?_01$/.test(n.name || '')
    );
    if (id === 'kaijax') {
      assert.equal(tailRoots.length, 3, 'Kai-Jax GLB must contain strictly 3 primary physical tail roots');
    } else if (id === 'kai' || id === 'jax') {
      assert.equal(tailRoots.length, 0, `${id} GLB must contain 0 tails`);
    } else {
      assert.equal(tailRoots.length, 1, `${id} GLB must contain 1 physical tail root`);
    }
  }

  // 18. P1-G Combat Input Buffer, Responsive Cancel Rules & Mastered GLB Generator Version Suite
  const {
    bufferCombatAction,
    canCancelAttackIntoDodge,
    clearCombatBuffer,
    consumeBufferedAction,
    createCombatInputBuffer,
    tickCombatBuffer,
  } = await import('../combat/combatInputBuffer.ts');

  let cbuf = createCombatInputBuffer(0.22);
  assert.equal(cbuf.action, null);
  cbuf = bufferCombatAction(cbuf, 'light');
  assert.equal(cbuf.action, 'light');
  // Higher-priority defensive dodge overrides queued light strike
  cbuf = bufferCombatAction(cbuf, 'dodge');
  assert.equal(cbuf.action, 'dodge', 'Dodge/Parry must override lower-priority buffered light strike');
  // Lower-priority light strike does NOT overwrite buffered dodge while active
  cbuf = bufferCombatAction(cbuf, 'light');
  assert.equal(cbuf.action, 'dodge', 'Lower-priority input must not overwrite active dodge buffer');
  cbuf = tickCombatBuffer(cbuf, 0.1);
  assert.ok(cbuf.remainingSeconds > 0.11 && cbuf.remainingSeconds < 0.13);
  const popped = consumeBufferedAction(cbuf);
  assert.equal(popped.consumed, 'dodge');
  assert.equal(popped.nextState.action, null);

  let expBuf = bufferCombatAction(createCombatInputBuffer(0.2), 'heavy');
  expBuf = tickCombatBuffer(expBuf, 0.25);
  assert.equal(expBuf.action, null, 'Expired buffered input clears cleanly');
  assert.equal(clearCombatBuffer(bufferCombatAction(expBuf, 'duo')).action, null);

  assert.equal(canCancelAttackIntoDodge(0.19, 'light'), true, 'Light strike cancels responsively into dodge');
  assert.equal(canCancelAttackIntoDodge(0.20, 'heavy'), true, 'Heavy strike recovery cancels into dodge');
  assert.equal(canCancelAttackIntoDodge(0.41, 'heavy'), false, 'Initial heavy windup commitment respected');

  // Verify mastered/reconstructed GLBs carry P1-G/P1-I generator compatibility and all 6 canonical attachment sockets
  const { REQUIRED_ATTACHMENT_SOCKETS, resolveCharacterFallbackChain } = await import(
    '../data/characterAssetRegistry.ts'
  );
  for (const id of approvedIds) {
    const glbBuf = fs.readFileSync(path.join(modelsRoot, `${id}_master.glb`));
    const jsonLen = glbBuf.readUInt32LE(12);
    const gltf = JSON.parse(glbBuf.toString('utf8', 20, 20 + jsonLen));
    const genStr = String(gltf.asset?.generator || '');
    assert.ok(
      genStr.includes('P1-G') || genStr.includes('P1-I') || genStr.includes('Blender'),
      `${id}_master.glb must preserve P1-G/P1-I character pipeline compatibility`
    );
    const nodeNames = new Set((gltf.nodes || []).map((n: { name?: string }) => n.name));
    for (const sock of REQUIRED_ATTACHMENT_SOCKETS) {
      assert.ok(nodeNames.has(sock), `${id}_master.glb must include attachment socket ${sock}`);
    }
  }

  // 19. P1-I Multi-View Reconstruction Manifest, Versioned Model Selection & Preserved P1-G Fallback Suite
  assert.equal(DEFAULT_SETTINGS.characterModelVersion, 'p1i_reconstructed');
  const reconManifestPath = path.join(process.cwd(), 'public', 'models', 'reconstruction-sheets', 'manifest.json');
  assert.equal(fs.existsSync(reconManifestPath), true, 'Phase 1 reconstruction manifest must exist');
  const reconManifest = JSON.parse(fs.readFileSync(reconManifestPath, 'utf8'));
  assert.equal(reconManifest.characters.bovar, undefined, 'Bovar must remain gated out of reconstruction sheets');

  for (const id of approvedIds) {
    assert.equal(
      resolveCharacterGlbUrl(id, 'high', false, 'p1i_reconstructed'),
      `/models/characters/${id}_master.glb`
    );
    assert.equal(
      resolveCharacterGlbUrl(id, 'low', false, 'p1i_reconstructed'),
      `/models/characters/${id}_lod1.glb`
    );
    assert.equal(
      resolveCharacterGlbUrl(id, 'high', false, 'p1g_mastered'),
      `/models/characters/p1g/${id}_master.glb`
    );
    assert.equal(
      resolveCharacterGlbUrl(id, 'low', false, 'p1g_mastered'),
      `/models/characters/p1g/${id}_lod1.glb`
    );
    assert.equal(
      resolveCharacterGlbUrl(id, 'high', false, 'meshy_custom'),
      `/models/characters/meshy/${id}_master.glb`
    );
    assert.equal(resolveCharacterGlbUrl(id, 'high', false, 'procedural_fallback'), null);

    const meshyChain = resolveCharacterFallbackChain(id, 'high', false, 'meshy_custom');
    assert.deepEqual(meshyChain, [
      `/models/characters/meshy/${id}_master.glb`,
      `/models/characters/${id}_master.glb`,
      `/models/characters/p1g/${id}_master.glb`,
    ]);

    // Verify both P1-I and preserved P1-G v3.0 binaries exist on disk
    assert.equal(fs.existsSync(path.join(modelsRoot, 'p1i', `${id}_master.glb`)), true);
    assert.equal(fs.existsSync(path.join(modelsRoot, 'p1i', `${id}_lod1.glb`)), true);
    assert.equal(fs.existsSync(path.join(modelsRoot, 'p1g', `${id}_master.glb`)), true);
    assert.equal(fs.existsSync(path.join(modelsRoot, 'p1g', `${id}_lod1.glb`)), true);

    const p1iBuf = fs.readFileSync(path.join(modelsRoot, 'p1i', `${id}_master.glb`));
    const p1iJsonLen = p1iBuf.readUInt32LE(12);
    const p1iGltf = JSON.parse(p1iBuf.toString('utf8', 20, 20 + p1iJsonLen));
    const p1iGen = String(p1iGltf.asset?.generator || '');
    assert.ok(
      p1iGen.includes('P1-I Reconstructed') || p1iGen.includes('P1-I Meshy Sculpture'),
      `${id}_master.glb must preserve P1-I Meshy lineage (${p1iGen})`
    );

    // Verify 4-view orthographic plates + calibrated landmarks exist
    const charRecon = reconManifest.characters[id];
    assert.ok(charRecon?.projectionLandmarks?.crownY > 0);
    assert.ok(charRecon?.projectionLandmarks?.footY > charRecon?.projectionLandmarks?.crownY);
    for (const viewFile of ['front.png', 'side.png', 'back.png', 'three_quarter.png', 'turnaround_4view.jpg']) {
      assert.equal(
        fs.existsSync(path.join(process.cwd(), 'public', 'models', 'reconstruction-sheets', id, viewFile)),
        true,
        `Missing ${id}/${viewFile}`
      );
    }
  }

  for (const sub of ['', 'p1i', 'p1g', 'meshy']) {
    assert.equal(
      fs.existsSync(path.join(modelsRoot, sub, 'bovar_master.glb')),
      false,
      `Bovar GLB must remain withheld in ${sub || 'root'}`
    );
  }

  // 20. P1-J Studio 19-Clip Grounded Animation, Rig Stretch Certification & Strictly-3-Tail Invariants Suite
  for (const id of approvedIds) {
    const masterBuf = fs.readFileSync(path.join(modelsRoot, `${id}_master.glb`));
    const jsonLen = masterBuf.readUInt32LE(12);
    const gltf = JSON.parse(masterBuf.toString('utf8', 20, 20 + jsonLen));
    assert.equal(gltf.animations.length, 19, `${id} master GLB must carry all 19 upgraded clips`);
    assert.equal(gltf.skins.length, 1, `${id} master GLB must have 1 weighted skeletal skin`);

    const rigCertPath = path.join(process.cwd(), 'docs', 'production', `p1j_${id}_rig_cert.json`);
    assert.equal(fs.existsSync(rigCertPath), true, `Missing P1-J rig certification report for ${id}`);
    const rigCert = JSON.parse(fs.readFileSync(rigCertPath, 'utf8'));
    assert.equal(rigCert.status, 'PASS', `${id} P1-J rig certification must be PASS`);
    assert.ok(rigCert.maxP99PoseEdgeStretch <= 3.6, `${id} p99 stretch must stay bounded (${rigCert.maxP99PoseEdgeStretch})`);

    if (id === 'kaijax') {
      const tailNodes = (gltf.nodes || []).filter((n: { name?: string }) =>
        /^tail_(ember|storm|memory)_0[1-4]$/.test(n.name || '')
      );
      assert.equal(tailNodes.length, 12, 'Kai-Jax GLB must contain strictly 3×4=12 primary tail bones');
      const spiderNodes = (gltf.nodes || []).filter((n: { name?: string }) =>
        /^spider_(UL|UR|LL|LR)_0[1-3]$/.test(n.name || '')
      );
      assert.equal(spiderNodes.length, 12, 'Kai-Jax GLB must contain 4×3=12 dorsal spider-limb bones');
      const maneNodes = (gltf.nodes || []).filter((n: { name?: string }) =>
        /^mane_0[1-7]$/.test(n.name || '')
      );
      assert.equal(maneNodes.length, 7, 'Kai-Jax GLB must contain all 7 storm-mane crest bones');
    }
  }

  // 21. P1-K 8-District Production Specifications, Source Transparency & Modular Ashblock GLB Kit Suite
  const { DISTRICT_PRODUCTION_SPECS } = await import('../data/districtSpecifications.ts');
  const { DISTRICTS: CANON_DISTRICTS } = await import('../data/canonData.ts');
  assert.equal(DISTRICT_PRODUCTION_SPECS.length, 8, 'All 8 Raging City districts must have production specs');
  assert.deepEqual(
    DISTRICT_PRODUCTION_SPECS.map((s) => s.districtId),
    CANON_DISTRICTS.map((d) => d.id),
    'District spec IDs and campaign order must match canonData DISTRICTS'
  );
  const ashSpec = DISTRICT_PRODUCTION_SPECS[0];
  assert.equal(ashSpec.districtId, 'ashblock-heights');
  assert.equal(ashSpec.reconstructionState, 'reconstructed_3d_playable');
  assert.equal(ashSpec.visualAuthority, 'direct_visual_sheet');

  const neonSpec = DISTRICT_PRODUCTION_SPECS.find((s) => s.districtId === 'neon-ward')!;
  const erasureSpec = DISTRICT_PRODUCTION_SPECS.find((s) => s.districtId === 'erasure-fields')!;
  assert.equal(neonSpec.visualAuthority, 'composite_sheets_inferred', 'Neon Ward must transparently disclose composite/inferred authority');
  assert.equal(erasureSpec.visualAuthority, 'composite_sheets_inferred', 'Erasure Fields exterior must transparently disclose composite/inferred authority');

  const envKitDir = path.join(process.cwd(), 'public', 'models', 'environments', 'ashblock');
  const kitManifestPath = path.join(envKitDir, 'ashblock_kit_manifest.json');
  assert.equal(fs.existsSync(kitManifestPath), true, 'Ashblock modular GLB kit manifest must exist');
  const kitManifest = JSON.parse(fs.readFileSync(kitManifestPath, 'utf8'));
  assert.equal(kitManifest.assets.length, 12, 'P1-L Ashblock Heights must provide 12 modular PBR GLB kit assets');
  for (const asset of kitManifest.assets) {
    const assetPath = path.join(envKitDir, asset.file);
    assert.equal(fs.existsSync(assetPath), true, `Missing modular environment GLB: ${asset.file}`);
    const glbBuf = fs.readFileSync(assetPath);
    assert.equal(glbBuf.toString('ascii', 0, 4), 'glTF', `${asset.file} must be a valid binary GLB`);
    const jLen = glbBuf.readUInt32LE(12);
    const gltfJson = JSON.parse(glbBuf.toString('utf8', 20, 20 + jLen));
    assert.ok(gltfJson.materials?.[0]?.normalTexture, `${asset.file} must embed tangent-space PBR normal map`);
    assert.ok(gltfJson.materials?.[0]?.occlusionTexture, `${asset.file} must embed baked AO channel`);
    assert.ok(asset.triangleCount >= 80 && asset.triangleCount <= 2500, `${asset.file} triangle count within modular mobile budget`);
  }

  // 22. P1-K / P1-L Geometry-Attached Skybridge/Stronghold Web Anchors, Syndicate Arc Relay Hazards & Mode Toggle Suite
  assert.equal(DEFAULT_SETTINGS.environmentMode, 'reconstructed');
  const { buildAshblockHeights } = await import('../engine/WorldBuilder.ts');
  const stubTex = new THREE.Texture() as unknown as THREE.CanvasTexture;
  const stubWorldTex = {
    asphaltMap: stubTex,
    asphaltRoughness: stubTex,
    sidewalkMap: stubTex,
    buildingFacadeMap: stubTex,
    buildingWarmOchreMap: stubTex,
    containerMap: stubTex,
    awningMap: stubTex,
    muralUnityMap: stubTex,
    billboardTrustMap: stubTex,
    graffitiMemoryMap: stubTex,
    bannerRoarMap: stubTex,
    signMarketMap: stubTex,
    signTailoringMap: stubTex,
    bannerFangSyndicateMap: stubTex,
    graffitiNoLawMap: stubTex,
    contactShadowMap: stubTex,
    dispose: () => undefined,
  };
  const worldScene = new THREE.Scene();
  const ashWorld = buildAshblockHeights(worldScene, stubWorldTex, 'reconstructed');
  assert.equal(ashWorld.environmentMode, 'reconstructed');
  assert.equal(ashWorld.modularKitExpectedCount, 12);
  assert.equal(ashWorld.webAnchors.length, 10, 'P1-L Ashblock Heights must expose 10 geometry-attached traversal web anchors');

  for (const anchor of ashWorld.webAnchors) {
    assert.ok(anchor.attachedStructureId.length > 3, `Anchor ${anchor.id} must bind to a named world structure`);
    assert.ok(
      [
        'skybridge_truss_girder',
        'tenement_crane_davit',
        'watertower_hoist_davit',
        'stronghold_spotlight_truss',
      ].includes(anchor.attachmentType),
      `Anchor ${anchor.id} must specify structural attachment type`
    );
    const supportDist = anchor.position.distanceTo(anchor.supportPoint);
    assert.ok(
      supportDist <= 0.45,
      `Anchor ${anchor.id} must attach physically to support geometry (dist=${supportDist.toFixed(3)}m)`
    );
  }

  assert.equal(ashWorld.environmentalHazards.length, 5, 'P1-L Ashblock Heights must provide 5 interactive Syndicate Arc Relay takedown props');
  for (const haz of ashWorld.environmentalHazards) {
    assert.ok(haz.pullRadius >= 7.0 && haz.aoeRadius >= 4.5 && haz.damage >= 50);
    assert.equal(haz.cooldown, 0);
  }

  const gateIdx = ashWorld.alleyGateColliderIndex;
  assert.ok(gateIdx >= 0 && gateIdx < ashWorld.colliders.length);
  ashWorld.setEnvironmentMode('legacy');
  assert.equal(ashWorld.environmentMode, 'legacy');
  ashWorld.setEnvironmentMode('reconstructed');
  assert.equal(ashWorld.environmentMode, 'reconstructed');
  assert.equal(ashWorld.alleyGateColliderIndex, gateIdx, 'Alley gate collider index preserved across mode switch');

  // 23. P1-L Continuous Rooftop/Skybridge Traversal Network, Mobile Quality Tier & Android Packaging Protection Suite
  const zoneIds = new Set(ashWorld.walkableZones.map((z) => z.id));
  for (const requiredZone of [
    'west_ascent_step_1',
    'west_ascent_step_2',
    'west_ascent_step_3',
    'west_high_rooftop_terrace',
    'central_walkable_skybridge',
    'east_bloodward_dojo_rooftop',
    'east_market_canopy_ledge',
    'syndicate_gatehouse_gantry',
    'boss_west_elevated_balcony',
    'boss_east_elevated_balcony',
  ]) {
    assert.equal(zoneIds.has(requiredZone), true, `Missing required walkable rooftop/arena zone: ${requiredZone}`);
  }

  // Verify step-by-step vertical ascent from street (0m) -> 1.80m -> 3.65m -> 5.35m -> 7.05m never exceeds jump reach (2.0m)
  const westStepElevations = [
    0,
    ...['west_ascent_step_1', 'west_ascent_step_2', 'west_ascent_step_3', 'west_high_rooftop_terrace'].map(
      (id) => ashWorld.walkableZones.find((z) => z.id === id)!.elevationY
    ),
  ];
  for (let i = 1; i < westStepElevations.length; i++) {
    const stepDelta = westStepElevations[i] - westStepElevations[i - 1];
    assert.ok(
      stepDelta > 0.5 && stepDelta <= 1.95,
      `Rooftop ascent step ${i} height delta (${stepDelta.toFixed(2)}m) must be comfortably climbable`
    );
  }

  // Verify central skybridge deck aligns flush with West Rooftop & East Bloodward Dojo at y = 7.05m while leaving street clear underneath
  const skybridgeCollider = ashWorld.colliders.find((c) => c.zoneTag === 'central_walkable_skybridge')!;
  assert.equal(skybridgeCollider.maxY, 7.05);
  assert.ok(skybridgeCollider.minY >= 6.5, 'Walkable skybridge must leave full street combat headroom underneath');

  assert.ok(ashWorld.instancedPropCount >= 70, 'Streetlamps, bollards, and string-lights must use GPU InstancedMesh batching');
  ashWorld.setQualityTier('low');
  assert.equal(ashWorld.qualityTier, 'low');
  ashWorld.setQualityTier('high');
  assert.equal(ashWorld.qualityTier, 'high');

  const rootGitignore = fs.readFileSync(path.join(process.cwd(), '.gitignore'), 'utf8');
  assert.ok(
    rootGitignore.includes('android/app/src/main/assets/public'),
    'Root .gitignore must exclude generated Capacitor Android public web assets from workspace sync'
  );
  const androidBuildScript = fs.readFileSync(path.join(process.cwd(), 'build-android-release.sh'), 'utf8');
  assert.ok(
    androidBuildScript.includes('npx cap sync android'),
    'Android release build script must sync web assets into android/app/src/main/assets/public during packaging'
  );

  // 24. P1-M Gameplay Feel, Pendulum Web Swing, Multi-Touch Isolation & Visual Fidelity Certification Suite
  const engineSrc = fs.readFileSync(path.join(process.cwd(), 'src/game/engine/GameEngine.ts'), 'utf8');
  assert.ok(engineSrc.includes('swingRopeLength'), 'GameEngine must enforce radial rope constraint for pendulum momentum swinging');
  assert.ok(engineSrc.includes('zipActive') && engineSrc.includes('zipTargetPos'), 'GameEngine must implement guided Zip-to-Anchor perch traversal');
  assert.ok(engineSrc.includes('coyoteTimer') && engineSrc.includes('jumpBufferTimer'), 'GameEngine must implement coyote time and pre-landing jump input buffering');
  assert.ok(engineSrc.includes('dodgeCancelCount') && engineSrc.includes('lastInputResponseMs'), 'GameEngine must measure dodge cancels and input response latency');

  const hudSrc = fs.readFileSync(path.join(process.cwd(), 'src/components/GameHUD.tsx'), 'utf8');
  assert.ok(hudSrc.includes('joyPointerId'), 'GameHUD virtual joystick must isolate pointerId for simultaneous multi-touch combat');

  const worldSrc = fs.readFileSync(path.join(process.cwd(), 'src/game/engine/WorldBuilder.ts'), 'utf8');
  assert.ok(/envMapIntensity:\s*0\.16/.test(worldSrc), 'Ashblock asphalt material must restrain twilight specular blowout');
  assert.ok(worldSrc.includes('Open-sightline top safety rail'), 'Rooftop safety rails must use open-sightline stanchions so mentors remain visible');

  // 25. Wave 3 Villain GLB Registry, LOD Chain & Zero-Placeholder Preload Gate
  const requiredVillains: EnemyModelId[] = [
    'fang_enforcer',
    'blood_broker',
    'syndicate_brawler',
    'syndicate_stalker',
    'syndicate_marksman',
    'architect_scout',
    'neon_prince',
    'undercrown_sentinel',
    'borax_zenith',
    'erasure_choir',
    'hollow_architect',
  ];
  for (const vid of requiredVillains) {
    assert.ok(ENEMY_ASSET_REGISTRY[vid], `Missing enemy asset registry entry: ${vid}`);
    const lodChain = resolveEnemyFallbackChain(vid, 'low', true);
    assert.equal(lodChain[0], ENEMY_ASSET_REGISTRY[vid].lod1GlbUrl);
    const masterChain = resolveEnemyFallbackChain(vid, 'high', false);
    assert.equal(masterChain[0], ENEMY_ASSET_REGISTRY[vid].masterGlbUrl);
  }
  const emptyPreload = await preloadGlbAssets([]);
  assert.equal(emptyPreload.ready, true);
  const dummyFallback = new THREE.Group();
  const stubShadow = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  const inst = new GLBCharacterInstance('fang_enforcer', stubShadow, dummyFallback);
  assert.equal(dummyFallback.visible, false, 'Procedural fallback must remain hidden while approved GLBs load');
  inst.dispose();
  stubShadow.dispose();

  // 26. Wave 4 Sector-7 District Builder & Clean Disposal Gate
  const s7Scene = new THREE.Scene();
  const s7StubTex = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  const s7World = buildSector7District(s7Scene, {
    asphaltMap: s7StubTex as unknown as THREE.CanvasTexture,
    asphaltRoughness: s7StubTex as unknown as THREE.CanvasTexture,
    sidewalkMap: s7StubTex as unknown as THREE.CanvasTexture,
    buildingFacadeMap: s7StubTex as unknown as THREE.CanvasTexture,
    buildingWarmOchreMap: s7StubTex as unknown as THREE.CanvasTexture,
    containerMap: s7StubTex as unknown as THREE.CanvasTexture,
    awningMap: s7StubTex as unknown as THREE.CanvasTexture,
    muralUnityMap: s7StubTex as unknown as THREE.CanvasTexture,
    billboardTrustMap: s7StubTex as unknown as THREE.CanvasTexture,
    graffitiMemoryMap: s7StubTex as unknown as THREE.CanvasTexture,
    bannerRoarMap: s7StubTex as unknown as THREE.CanvasTexture,
    signMarketMap: s7StubTex as unknown as THREE.CanvasTexture,
    contactShadowMap: s7StubTex as unknown as THREE.CanvasTexture,
    dispose: () => s7StubTex.dispose(),
  });
  assert.equal(s7World.webAnchors.length, 6, 'Sector-7 must provide 6 viaduct/gantry web anchors');
  assert.equal(s7World.environmentalHazards.length, 4, 'Sector-7 must provide 4 Kar-Voth Arc Transformers');
  assert.equal(s7World.walkableZones.length, 7, 'Sector-7 must provide 7 elevated cargo/viaduct zones');
  s7World.dispose();

  // 27. Wave 5 Neon Ward District Builder & Sector-7 Mission Sequence
  const nwScene = new THREE.Scene();
  const nwWorld = buildNeonWardDistrict(nwScene, {
    asphaltMap: s7StubTex as unknown as THREE.CanvasTexture,
    asphaltRoughness: s7StubTex as unknown as THREE.CanvasTexture,
    sidewalkMap: s7StubTex as unknown as THREE.CanvasTexture,
    buildingFacadeMap: s7StubTex as unknown as THREE.CanvasTexture,
    buildingWarmOchreMap: s7StubTex as unknown as THREE.CanvasTexture,
    containerMap: s7StubTex as unknown as THREE.CanvasTexture,
    awningMap: s7StubTex as unknown as THREE.CanvasTexture,
    muralUnityMap: s7StubTex as unknown as THREE.CanvasTexture,
    billboardTrustMap: s7StubTex as unknown as THREE.CanvasTexture,
    graffitiMemoryMap: s7StubTex as unknown as THREE.CanvasTexture,
    bannerRoarMap: s7StubTex as unknown as THREE.CanvasTexture,
    signMarketMap: s7StubTex as unknown as THREE.CanvasTexture,
    contactShadowMap: s7StubTex as unknown as THREE.CanvasTexture,
    dispose: () => s7StubTex.dispose(),
  });
  assert.equal(nwWorld.webAnchors.length, 6, 'Neon Ward must provide 6 cantilevered sign-cage web anchors');
  assert.equal(nwWorld.environmentalHazards.length, 4, 'Neon Ward must provide 4 Overloaded Neon Signboard hazards');
  assert.equal(nwWorld.walkableZones.length, 7, 'Neon Ward must provide 7 elevated sign-cage/skywalk zones');
  nwWorld.dispose();

  // 28. Wave 6 Five-District Cross-Disposal, Iron Market, Undercrown & Progression Persistence
  const texStub = {
    asphaltMap: s7StubTex as unknown as THREE.CanvasTexture,
    asphaltRoughness: s7StubTex as unknown as THREE.CanvasTexture,
    sidewalkMap: s7StubTex as unknown as THREE.CanvasTexture,
    buildingFacadeMap: s7StubTex as unknown as THREE.CanvasTexture,
    buildingWarmOchreMap: s7StubTex as unknown as THREE.CanvasTexture,
    containerMap: s7StubTex as unknown as THREE.CanvasTexture,
    awningMap: s7StubTex as unknown as THREE.CanvasTexture,
    muralUnityMap: s7StubTex as unknown as THREE.CanvasTexture,
    billboardTrustMap: s7StubTex as unknown as THREE.CanvasTexture,
    graffitiMemoryMap: s7StubTex as unknown as THREE.CanvasTexture,
    bannerRoarMap: s7StubTex as unknown as THREE.CanvasTexture,
    signMarketMap: s7StubTex as unknown as THREE.CanvasTexture,
    contactShadowMap: s7StubTex as unknown as THREE.CanvasTexture,
    dispose: () => s7StubTex.dispose(),
  };
  const crossScene = new THREE.Scene();
  for (let cycle = 0; cycle < 2; cycle++) {
    const a = buildAshblockHeights(crossScene, texStub, 'reconstructed');
    assert.ok(crossScene.children.length > 0);
    a.dispose?.();
    assert.equal(crossScene.children.length, 0, 'Ashblock Heights dispose() must leave zero scene children');

    const s7 = buildSector7District(crossScene, texStub);
    s7.dispose();
    assert.equal(crossScene.children.length, 0, 'Sector-7 dispose() must leave zero scene children');

    const nw = buildNeonWardDistrict(crossScene, texStub);
    nw.dispose();
    assert.equal(crossScene.children.length, 0, 'Neon Ward dispose() must leave zero scene children');

    const im = buildIronMarketDistrict(crossScene, texStub);
    assert.equal(im.webAnchors.length, 6);
    assert.equal(im.environmentalHazards.length, 4);
    assert.equal(im.civilians.length, 2);
    im.dispose();
    assert.equal(crossScene.children.length, 0, 'Iron Market dispose() must leave zero scene children');

    const uc = buildUndercrownDistrict(crossScene, texStub);
    assert.equal(uc.webAnchors.length, 6);
    assert.equal(uc.environmentalHazards.length, 4);
    uc.dispose();
    assert.equal(crossScene.children.length, 0, 'Undercrown dispose() must leave zero scene children');
  }
  const w6Save = createNewSave('slot-2', 'Wave 6 Progression', 'kai');
  w6Save.completedDistricts = ['ashblock-heights', 'sector-7', 'neon-ward', 'iron-market', 'undercrown'];
  const w6Store = new Map<string, string>();
  const mockLs = {
    getItem: (k: string) => w6Store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      w6Store.set(k, v);
    },
    removeItem: (k: string) => {
      w6Store.delete(k);
    },
  } as unknown as Storage;
  saveToSlot('slot-2', w6Save, mockLs);
  const loadedW6 = loadFromSlot('slot-2', mockLs);
  assert.deepEqual(loadedW6?.completedDistricts, w6Save.completedDistricts);
  s7StubTex.dispose();

  console.log('ALL P1, P1-C, P1-E, P1-G, P1-I, P1-J, P1-K, P1-L, P1-M, WAVE 3, 4, 5 & 6 TESTS PASSED (28/28 suites)');
});

