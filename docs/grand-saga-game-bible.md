# Super Smash Grand Saga — Game Bible (Hybrid Build)

This document consolidates the gameplay, story, and systems vision for the browser-first build. It is structured for GitHub/Replit consumption and maps the nine-story acts, core modes, combat systems, UI, synergy grid, transformations, and endgame loops.

## Core Backbone (applies to every act)
1. Choose squad (4 heroes).
2. Open-zone traversal or instant drop-in based on act identity.
3. Fight → Objective → Fire Moment → Boss.
4. Unlock upgrades / transformations.
5. Cinematic close → next mission.

Each act customizes mechanics, pacing, and presentation around this backbone.

## Story Mode: Acts & Missions (Act I–IX → 100 missions)
- **Act I — Cross Point Tournament (20 missions):** Tournament hype, rival bouts, crowd buffs, arena hazards, Rift breach escape.
- **Act II — Year of No A-Listers (18 missions):** Stealth/survival, scavenging, weakened squads, Pikachu feral burst, DK rampage, rescue Mario.
- **Act III — Unity’s Dawn (12 missions):** Mindscapes, illusion prisons, dual-character puzzles, Super Smash Brother fusion, Silver & Lunara awaken.
- **Act IV — Great Hunt (8 missions):** Open zones, relic hunts, Yoshi prophecy rescue, Rift anomaly races, Mephiles ambushes.
- **Act V — Primordial Gambit (10 missions):** Fortress sieges, multi-stage bosses, aerial strikes, Sonic controlled god-state, Bowser sacrifice.
- **Act VI — Shadows of the Void (8 missions):** Cosmic storms, realm traversal, Thunder God Pikachu trial, Dark Samus showdown, Celestial Choir vision.
- **Act VII — Nexus Legacy (8 missions):** Adults/kids swaps, Bash Brothers spotlight, Lyra resonance trial, dual-generation finales.
- **Act VIII — War of the Eternals (10 missions):** Multiverse Gauntlet brackets, divine rulesets, Harmonarch judgment, Hyper Sonic vs Void Echo.
- **Act IX — Oblivion’s End (6 missions):** Open battlefield war, multi-hero QTE swaps, Void King collapse, Infinite Symphony finish.

### Story Mode Flow
- **Sector streaming:** Small scenes (tutorial, collision, boss) swap via store state; bubble rule culls >50m.
- **Victory requirements:** Defeat major bosses, play all Fire Moments, complete joint battles, survive/escape final sequence. Side content optional.
- **Fire Moments (playable unless noted):** Super Smash Brother fusion, Hyper Sonic, Thunder God Pikachu, Legacy Kids joint battle, Kai-Xon Jax-Son Hyper 3-Tails, Final Choir of Heroes, Void King phase 2, Infinite Symphony. Cinematic-only for select flashbacks/interludes.

## Game Modes (12)
1. **Legacy Mode:** Instinct Overdrive meter, skill inheritance, legacy-only missions.
2. **Gauntlet of Gods:** Endless tower, divine modifiers every 5–10 floors, hidden Eternal Choir.
3. **Riftbreak Survival:** 50 waves, mutations every 5 waves, Rift Generals every 10, legacy assists mid-run.
4. **Timeline Paradox:** Alternate hero variants (Corrupted/Purified/Echo-Shifted) with unique movesets.
5. **Lab Mode:** Deep hero customization (stats, abilities, elements, supers, animations, VFX, palettes).
6. **Rift Gauntlet:** Randomized maps/enemies, artifact rewards, scaling difficulty.
7. **Harmonarch Trials:** Divine arenas that alter camera/controls; unlock Harmonarch weapons.
8. **Multiverse Tournament Mode:** Replay Act VIII brackets with dynamic rules and hazards.
9. **Smash Haven Builder:** Base-building, room unlocks, hero role assignments, crafting, deployments.
10. **Echo Simulator:** ML-driven AI mirrors player habits; adaptive mirror matches.
11. **Double Fate Mode:** Light Path vs Void Path variants of every act with alternate bosses/cutscenes.
12. **Cinematic Library Mode:** Unlock and replay every cutscene once earned.

## Combat System Breakdown
- **Movement:** Smash-style dodges/air-dashes, Sonic open-zone sprinting, Zelda guard, Mario jump momentum; camera-relative inputs; kinematic feel with optional Rapier upgrade.
- **Attacks:** Light/heavy combos, specials, parry/counter, launchers, air finishers.
- **Tag-Switch:** Four-hero instant swapping, entrance strikes, passive tag buffs, mid-fight revives.
- **Ultimates:** L1/L2 character ultimates, L3 team ultimate, L4 Saga ultimate (late-game unlock).
- **Element/Status:** Fire/Ice/Lightning/Shadow/Light/Chaos/Gravity; rift corruption inflicts mutations; elemental weaknesses on bosses.

## Character Class Archetypes
- **Vanguard (frontline sustain):** Mario, DK, Primal Juggernaut.
- **Blitzer (speed DPS):** Sonic, Obsidian Echo, Cobalt Blur, Greninja.
- **Mystic (control + AOE):** Zelda, Rosalina, Harmonarch Queen.
- **Support (buff/heal):** Peach, Luigi Phantom Heart, Ash.
- **Wildcard (high-risk burst):** Kirby Star Shaper, Bayonetta, Shadow variants.
- **Tank (mitigation):** Bowser, Wario, Ridley (mutated).
- **Sniper (ranged precision):** Fox, Falco, Samus Chozo Hunter.
- **Controller (CC/zone):** Link Hylian Knight, Robin, Palutena.

## Ability Trees & Leveling
- **Three-track trees per hero:** Offense, Utility, Survivability; transformation perks branch after tier 2.
- **Leveling beats:** Core stats, new cancels, enhanced movement tech, elemental infusions.
- **Team synergies unlock nodes:** Duo tech, trio ultimates, support amplifiers.
- **Transformation nodes:** Gate Saga ultimates and signature forms (Hyper Sonic, Thunder God Pikachu, Starborn Kirby, Celestial Link, Omega Suit Samus, Super Smash Brother fusion).

## Transformation Unlock Paths (examples)
- **Sonic:** Base → Super → Chaos-Control → Celestial → Hyper (Act VIII milestone).
- **Mario/Luigi:** Base → Chaos Star sync → Super Smash Brother fusion (Act III) → Champion of Realms (Act IX).
- **Pikachu:** Base → Stormheart → Thunder God (Act VI trial) → Storm Deity (postgame).
- **Kirby:** Base → Copy Master → Starborn → Cosmic Architect.
- **Legacy Kids:** Instinct → Ascendant Trigger → Hyper 3-Tails (Kai-Xon Jax-Son) or Choir Resonance (Lyra).

## Roster UI + Team Builder Interface
- **Layout:** 4 slots with portrait carousel, role tags, element icons, and synergy preview panel.
- **Panels:**
  - Team Passives & Synergies (auto-calculated bonuses from grid).
  - Transformation tier availability per slot.
  - Combo list & recommended roles (Vanguard/Blitzer/etc.).
  - Loadouts: abilities, artifacts, elemental focus, cosmetic presets.
- **Interactions:** Drag/drop heroes, quick swap presets, path toggles (Light/Void for Double Fate), AI partner behaviors.

## Synergy Grid (100+ team bonuses)
Grouped sets below (10 per grouping → 100 total). Apply when all heroes in set are active.

1. **Speed Demons:** Sonic, Pikachu, Fox, Greninja — +dash speed, crit on sprint.
2. **Ring Runners:** Sonic, Tails — ring pickup heals shields.
3. **Frontier Flyers:** Sonic, Falcon, Falco, Tails — aerial boosts + drift control.
4. **Chaos Sprinters:** Shadow, Sonic — chaos meter gain on parry.
5. **Hyper Instincts:** Kai-Xon Jax-Son, Sonic — chain-dash restores stamina.
6. **Brute Squad:** DK, Kiro Kong, Redlock — super armor on heavy.
7. **Primal Fury:** DK, Diddy, Yoshi — ground-pound shockwaves.
8. **Smash Titans:** DK, Bowser, Wario — taunt grants brief damage resist.
9. **Apex Guardians:** Kiro Kong, Redlock, Primal Juggernaut — guard breaks stagger faster.
10. **Divine Choir:** Rosalina, Zelda, Palutena, Lunara — healing pulses after ultimates.
11. **Triforce Trinity:** Link, Zelda, Ganondorf (redeemed skin) — tri-elemental finisher unlock.
12. **Starborn Echo:** Kirby, Rosalina, Luma — copy ability gains starburst AOE.
13. **Ascendant Light:** Peach, Zelda, Palutena — barrier on revive.
14. **Circuit Breakers:** Tails, Mega Man X, R.O.B. — gadget cooldown reduction.
15. **Predator Wing:** Fox, Falco, Pikachu — crit chance after perfect dodge.
16. **Data Surge:** Mega Man X, Samus — overcharge beam synergy.
17. **Sky Engineers:** Fox, Tails, Wing Commander Vox — aerial melee auto-tracks.
18. **Fist of Fury:** Ryu, Terry, Little Mac — armor on specials.
19. **Silent Killers:** Bayonetta, Snake, Sheik — invisibility window after finisher.
20. **Blade Dancers:** Link, Meta Knight, Shulk — extended dodge i-frames.
21. **Perfect Form:** Shulk, Lucina, Marth — counter windows widen.
22. **Future Echoes:** Solaro, Tempest, Lyra — time-slow proc on crit.
23. **Bash Brothers:** Redlock, Kiro Kong — tandem slam ultimate.
24. **Firestorm Princes:** Solaro, Prince Koopa — fire DOT aura.
25. **Triforce Choir II:** Lyra, Zelda, Palutena — song-based stun pulses.
26. **Hyper Storm:** Kai-Xon Jax-Son, Tempest — chain lightning arcs.
27. **Heroes of Legend:** Mario, Sonic, Link, Samus — team ultimate unlocks early.
28. **Founders:** Mario, Link, Pikachu, Kirby — extra continue in acts I–III.
29. **Smash Royalty:** Peach, Zelda, Rosalina, Samus — group heal on boss phase change.
30. **Outcast Order:** Shadow, Bayonetta, Snake, Meta Knight — stealth opener bonuses.
31. **Starfall Pact:** Kirby, Samus, Fox, Rosalina — aerial juggle damage boost.
32. **Guardian Lights:** Peach, Luigi, Ash — revive speed up.
33. **Stormriders:** Pikachu, Volt Deity Spark, Falco — shockwave on landings.
34. **Echo Resonance:** Silver, Lunara, Starling Kirby — gravity wells after ultimates.
35. **Chozo Vanguard:** Samus, Nova Aran, Adaptation Unit X — shield regen while aiming.
36. **Aether Blades:** Pit, Dark Pit, Link — aerial light arrows pierce.
37. **Chaos Control:** Shadow, Mephiles Echo, Chaos Mario — time freeze proc.
38. **Frontline Medic:** Peach, Isabelle, Toadette — rolling heal kits drop.
39. **Wildwood Trio:** Yoshi, Prince Koopa, DK — movement speed in jungle tiles.
40. **Radiant Core:** Radiant Jumper, Phantom Heart, Harmonarch Queen — aura regen.
41. **Stellar Architects:** Rosalina, Stellar Matron, Star Shaper Kirby — mini black-hole trap.
42. **Tactician’s Net:** Prismatic Strategist, Robin, Zelda — rune traps extend duration.
43. **Flux Raiders:** Ridley, Waluigi, Wario — debuff enemies after taunts.
44. **Aerial Covenant:** Wing Commander Vox, Fox, Falco, Star Fox crew — barrel roll evasion buff.
45. **Divine Guardians:** Palutena, Harmonarchs (trial unlock), Zelda — reflect duration +.
46. **Shadow Agents:** Obsidian Echo, Bayonetta, Meta Knight — ambush crit bonus.
47. **Spark Battalion:** Volt Deity Spark, Pikachu, Raichu Echo — chain stun uptime.
48. **Forge Masters:** R.O.B., Tails, Mega Man X, Tech Link — buildable turrets.
49. **Echo Kids:** Gia, Lyra, Nova Aran — kid-only synergy: instinct gain +25%.
50. **All High’s Verdict:** Harmonarch weapons equipped — phase-change finisher unlocks.
51. **Warp Riders:** Falco, Fox, Samus — mid-air dodge grants micro-warp.
52. **Glacier Guard:** Ice Climbers, Zelda, Link — freeze counter window.
53. **Storm Shield:** Peach, Pikachu, Volt Deity Spark — electric barrier on revive.
54. **Soul Weavers:** Rosalina, Lunara, Harmonarch Queen — aura heal over time.
55. **Twin Blades:** Marth, Lucina, Roy — backstab crit bonus.
56. **Night Watch:** Snake, Sheik, Meta Knight — silent takedown damage.
57. **Pulsefire Crew:** Fox, Falco, Wolf — blaster overheat removed.
58. **Gravity Wells:** Rosalina, Samus, Silver — micro singularities on heavy slam.
59. **Echo Wardens:** Lunara, Silver, Starling Kirby — time-slow on parry.
60. **Chaos Harvest:** Shadow, Ridley, Waluigi — lifesteal on chaos damage.
61. **Shield Wall:** Bowser, DK, Wario — team guard grants stagger immunity.
62. **Heroic Hearts:** Mario, Luigi, Peach — group heal after perfect block.
63. **Starlight Surge:** Kirby, Rosalina, Star Shaper — aerial lightburst finisher.
64. **Quantum Dash:** Sonic, Tails, Mega Man X — dash cancels reset cooldowns.
65. **Skyforge:** Tails, R.O.B., Tech Link — deployable drones.
66. **Arcane Circuit:** Zelda, Prismatic Strategist, Palutena — chain rune fields.
67. **Spectral Steps:** Luigi Phantom Heart, Bayonetta, Obsidian Echo — phase-dodge window.
68. **Wild Stampede:** DK, Kiro Kong, Primal Juggernaut — sprint knocks back.
69. **Luminous Guard:** Peach, Zelda, Harmonarch Queen — light barrier on low HP.
70. **Meteor Smash:** Mario, Radiant Jumper, Falcon — divekick impact shock.
71. **Astro Knights:** Link, Fox, Samus — ranged/melee combo boosts.
72. **Nova Drive:** Nova Aran, Samus, Mega Man X — charge attacks pierce armor.
73. **Riftbreakers:** Mario, Sonic, Link, Kirby — rift anomalies spawn buffs.
74. **Blade Tempest:** Shulk, Cloud (cameo), Link — aerial launcher extension.
75. **Dragonfire Pact:** Bowser, Prince Koopa, Charizard — burn duration +.
76. **Echo Surge:** Sonic, Shadow, Void Echo — chaos meter cap raised.
77. **Harmony Chorus:** Lyra, Zelda, Palutena, Rosalina — song buff extends ultimates.
78. **Star Command:** Fox, Wing Commander Vox, Arwing crew — tag-in airstrike.
79. **Healer’s Oath:** Peach, Ash, Isabelle — heal over time after revive.
80. **Gaia Ward:** Yoshi, DK, Kiro Kong — earth wall summon.
81. **Spark Rampage:** Pikachu, Raichu Echo, Volt Deity — chain lightning crit.
82. **Polarity Shift:** Samus, Adaptation Unit X, R.O.B. — element swap reduces cooldowns.
83. **Moonlight Veil:** Rosalina, Lunara, Zelda — damage reduction at night stages.
84. **Abyss Watchers:** Bayonetta, Obsidian Echo, Meta Knight — shadow clones on ult start.
85. **Mirage Strike:** Sheik, Lucina, Robin — decoy after dash.
86. **Starlance:** Palutena, Pit, Dark Pit — spear projectiles pierce shields.
87. **Hyper Choir:** Legacy Kids ensemble — instinct regen aura.
88. **Smash Cadets:** Prince Koopa, Starling Kirby, Tempest — kid combo finisher unlock.
89. **Tech Uprising:** Tails, Fox, R.O.B., Mega Man X — drone barrage ultimate.
90. **Arc Sentinel:** Harmonarch Queen, Prismatic Strategist, Palutena — auto-cast barrier.
91. **Solar Flare:** Solaro, Mario, Phoenix skin — fire burst on tag-in.
92. **Frozen Time:** Silver, Mephiles Echo, Zelda — brief timestop on team ultimate.
93. **Echo Fury:** Shadow, Chaos Mario, Sonic — chaos crit chain.
94. **Guardians of Light:** Peach, Zelda, Rosalina, Palutena — resurrection once per act (story only).
95. **Rift Vanguard:** Samus, Link, Mario, Sonic — phase-change damage amp.
96. **Stormbound:** Pikachu, Ash, Volt Deity Spark — storm meter builds movement speed.
97. **Celestial Architects:** Rosalina, Harmonarchs, Lunara — construct star pillars.
98. **Voidbreak Accord:** Mario, Sonic, Link, Samus, Kirby — resist corruption debuffs.
99. **Choir of Heroes:** Entire roster threshold — Infinite Symphony finisher unlocked.
100. **Weavekeepers:** Any Light Path quartet — reduced Rift instability in Double Fate.
(Grid can be extended; implementation should load from JSON to support LiveOps beyond 100 sets.)

## Boss Fights & Cutscenes (Acts I–IX)
- **Design Rules:** Phases, weaknesses, elemental hooks, adaptation behaviors, cinematic transitions.
- **Examples:** Void-Gorgon (beam sweep → null zones → anti-power pulse), Chrono-Shade (time-stop traps), Solaris Extreme (solar flares, gravity flips), Void King (multi-form, choir QTE, Infinite Symphony).

## Open World Zone Maps
- **Green Hill Frontier:** Ring highways, loop puzzles, Eggman ruins; speed traversal challenges.
- **Hyrule Plateau:** Climbable towers, guardian ambushes, shrine combat puzzles.
- **Mushroom Kingdom Plains:** Power-up shrines, Koopaling ruins, warp-pipe tunnels.
- **Dreamland Skies:** Star currents, floating islands, gourmet race events.
- **Corneria Outlands:** Arwing dogfights, tech salvage, anti-air turrets.

## Progression & Reward Tiers
- **Acts:** Unlock heroes, transformations, artifacts; milestone cosmetics.
- **Modes:** Gauntlet floors drop divine artifacts; Riftbreak waves drop rift materials; Lab Mode grants mod chips; Tournament awards rare skins.
- **Rewards:** Story clears → transformations; endgame clears → Saga ultimates; base-building → passive buffs; synergy milestones → team passives.

## UI / UX Layout (Menus)
- **Main Hub:** Story, Modes, Lab, Haven Builder, Library, Settings.
- **Story Screen:** Act list with mission counts, Light/Void path toggle, Fire Moment checklist.
- **Team Builder:** 4-slot grid, synergy preview, transformation readiness bar, loadout tabs.
- **Lab:** Stat sliders, ability slotting, element tuning, VFX picker, test arena button.
- **Haven Builder:** Room construction grid, resource timers, assignment dashboard.

## Legacy Kids Battle System
- Instinct Overdrive meter, Ascendant Trigger states, dual ultimates, team echo moves, story-locked upgrades, mini-puzzles requiring unique kid powers.

## Rift Gauntlet & Multiverse Gauntlet Design
- **Rift Gauntlet:** Random arenas, corruption affixes, artifact drops, difficulty scaling without cap.
- **Multiverse Gauntlet (Act VIII):** Brackets with divine rules, hazard maps, unique transformations per round, cameo universes.

## Endgame Content
- **Infinity Trials:** Mutation ladders with rotating modifiers.
- **Rift Raids:** 4-player bosses with coordinated mechanics.
- **Harmony Trials:** Harmonarch weapons + divine arenas.
- **Echo Simulator:** Adaptive AI learns combos/dodges.
- **Double Fate Replays:** Alternate Light/Void acts with different rewards.

## Boss & Act Completion Rules
- Defeat major bosses; complete all Fire Moments; finish joint battles; survive/escape act finale. Side missions optional.

## Cinematic Trailer Script (3–5 minutes)
- **Open:** Stadium rubble, Mario breathing hard, crown cracked; lightning tears sky; Void King descends. Narrator: “When the Weave falls… who rises?”
- **Build:** Sonic skids in Celestial form; Link draws Master Sword; Samus charges Zero Beam; Pikachu ascends to Thunder God; crowds fade to rift howls.
- **Mid:** Tournament collapse; Silver and Lunara awaken; Legacy Kids ignite; Kai-Xon Jax-Son unleashes Hyper 3-Tails; montage of Acts II–VIII battles and Harmonarch judgments.
- **Climax:** All heroes charge across a collapsing multiverse bridge; Void King towers above; Infinite Symphony sting.
- **Title Drop:** SUPER SMASH GRAND SAGA — LEGENDS OF THE WEAVE.
- **Outro CTA:** “Assemble the squad. Break the rifts. Rewrite destiny.”

## Developer Notes
- Keep assets streamable: sectorized maps, instancing, texture atlases.
- Maintain camera-relative controls and facing rotation; upgrade to Rapier Kinematic Controller when available.
- Synergy grid and missions defined in JSON for LiveOps updates; reserve space for seasonal paths and new heroes.
