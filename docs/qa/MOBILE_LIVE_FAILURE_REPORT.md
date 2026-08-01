# Mobile Live Failure Report

**Date:** 2026-08-01 UTC (2026-07-31 EDT local)  
**Branch:** fix/mobile-live-release-blockers  
**Base commit:** 038d88d0  
**Status:** INVESTIGATION IN PROGRESS

---

## Executive Summary

Live mobile testing against deployed Vercel instance exposed four mandatory release blockers. The production build is not mobile-ready.

**Failures observed:**
1. Mission-start CTA button positioned outside usable viewport/reach area
2. Story Mode displays incorrect campaign identity ("Beast Wars Campaign")
3. Training Mode fails to load player character
4. Versus Mode shows no visible character models

---

## Failure 1: Mission Selection CTA Unreachable

### Observation
- Mission-start button is positioned at the bottom of the screen
- Button is below practical reach/viewport on mobile device
- User cannot initiate mission start

### Investigation Steps

**Step 1: Viewport measurements needed**
- [ ] Device screen height
- [ ] Browser viewport height (excluding toolbars)
- [ ] Safe-area insets (env(safe-area-inset-bottom))
- [ ] MissionSelectHub container height
- [ ] Button container scroll state
- [ ] Button vertical position relative to viewport

**Step 2: Source code audit needed**
- [ ] apps/web/src/components/game/world/MissionSelectHub.tsx (layout, overflow)
- [ ] apps/web/src/components/game/world/MissionSelectHub.module.css or Tailwind classes
- [ ] apps/web/src/App.tsx (modal/container styling for mission select)
- [ ] apps/web/vite.config.ts (viewport meta configuration)
- [ ] apps/web/public/index.html (viewport meta tag)

**Step 3: Root cause candidates**
- [ ] Fixed positioning of parent container
- [ ] Insufficient viewport height calculation
- [ ] Safe-area insets not applied
- [ ] Overflow:hidden removing scroll capability
- [ ] Modal height exceeding viewport
- [ ] Browser chrome (address bar, bottom nav) overlapping content

### Evidence Required
- Screenshot of mission selection screen on mobile device
- Console errors (if any)
- Computed styles of button and parent containers
- Viewport meta tag content
- Device screen resolution

---

## Failure 2: Campaign Identity ("Beast Wars Campaign")

### Observation
- Story Mode displays "Beast Wars Campaign" instead of correct Legends of Kai-Jax identity
- This appears to be legacy or fallback data

### Investigation Steps

**Step 1: String source audit**
- [ ] apps/web/src/lib/story_missions.ts (campaign name definition)
- [ ] apps/web/src/lib/all_campaigns.ts or similar registry
- [ ] apps/web/src/components/game/story/StoryModeIntro.tsx
- [ ] apps/web/src/components/game/story/StoryModeHubView.tsx
- [ ] Grep for "Beast Wars" across entire codebase
- [ ] Check localization/i18n files

**Step 2: State source audit**
- [ ] localStorage for saved campaign/profile data
- [ ] Zustand store (useRunner, useGameState) initial values
- [ ] Route parameters or defaults
- [ ] Profile selection - does it carry legacy campaign name?

**Step 3: Fallback audit**
- [ ] If registry entry missing, what is the fallback?
- [ ] If campaign data corrupted, what displays?
- [ ] Is there a default/placeholder string?

### Root Cause Candidates
- [ ] Hard-coded string in UI component
- [ ] Legacy campaign registry entry still active
- [ ] Saved profile carries stale campaign name
- [ ] Fallback/placeholder string never updated
- [ ] Localization key points to wrong string

### Evidence Required
- Screenshot of Story Mode title display
- Search results for "Beast Wars" in codebase
- Campaign registry entries (all names)
- LocalStorage dump from profile
- Console errors or warnings

---

## Failure 3: Training Mode Player Load

### Observation
- Training Mode loads but player character does not render
- Mode initializes but character is invisible or missing

### Investigation Steps

**Step 1: Route and mode configuration**
- [ ] apps/web/src/App.tsx - how is Training mode initiated?
- [ ] apps/web/src/lib/story_missions.ts - is there a Training mission entry?
- [ ] apps/web/src/components/game/story/StoryModeSelector.tsx - Training mode selection
- [ ] Training mode configuration/defaults

**Step 2: Character selection and registry**
- [ ] Is a default character selected for Training?
- [ ] apps/web/src/lib/all_playable_characters.ts - who is the Training default?
- [ ] Is character ID passed to Training scene?
- [ ] Character selection state (useRunner.selectedCharacter or similar)

**Step 3: Model loading pipeline**
- [ ] apps/web/src/game/loaders/GLBCharacterLoader.ts - character model load
- [ ] requested model URL
- [ ] HTTP status code
- [ ] GLTF parse success/failure
- [ ] Scene attachment (does loaded model attach to scene?)
- [ ] Mesh visibility state
- [ ] Material opacity

**Step 4: Scene composition**
- [ ] Player entity creation
- [ ] Model attachment to player
- [ ] Camera framing (is player in frustum?)
- [ ] Lighting (is player lit?)
- [ ] Skeleton initialization
- [ ] Animation mixer setup

### Root Cause Candidates
- [ ] Model URL 404 or fetch failure
- [ ] GLTF parse error
- [ ] Model never attached to scene
- [ ] Mesh.visible = false
- [ ] Material opacity = 0 or transparent
- [ ] Incorrect scale/position (off-screen)
- [ ] Camera not positioned to include character
- [ ] Skeleton/rig failure preventing render
- [ ] Animation mixer error preventing display

### Evidence Required
- Screenshot of Training mode (what is visible?)
- Console errors and warnings
- Network requests (what models are requested?)
- HTTP status for model requests
- Computed visibility properties
- Scene graph inspection (is model in tree?)
- Camera position and target
- Lighting setup

---

## Failure 4: Versus Character Visibility

### Observation
- Versus Mode shows no character models
- Expected: 2 fighters visible (based on desktop failures)
- Actual: empty character slots or invisible fighters

### Investigation Steps

**Step 1: Character roster selection**
- [ ] apps/web/src/components/game/versus/CharacterSelect.tsx
- [ ] Which characters are displayed as selectable?
- [ ] apps/web/src/lib/all_playable_characters.ts (roster size)
- [ ] Are all 100+ characters shown, or a subset?

**Step 2: Model loading for each fighter**
For each displayed character:
- [ ] Roster entry exists and is valid
- [ ] Model URL in registry
- [ ] HTTP request made (Network tab)
- [ ] HTTP status 200 or error
- [ ] GLTF parses successfully
- [ ] Mesh attached to scene
- [ ] Mesh.visible = true
- [ ] Material not transparent (opacity = 1)
- [ ] Scale valid (not 0)
- [ ] Position valid (not off-scene)
- [ ] Camera includes character in frustum

**Step 3: Scene composition per fighter**
- [ ] Player 1 entity created
- [ ] Player 1 model attached
- [ ] Player 2 entity created
- [ ] Player 2 model attached
- [ ] Both models lit
- [ ] Skeleton state for each
- [ ] Animation mixer for each

### Root Cause Candidates
- [ ] Model URLs 404 for all/most characters
- [ ] GLTF parse failure
- [ ] Models never attached
- [ ] Mesh.visible false
- [ ] Material opacity 0
- [ ] Scale 0 or invalid
- [ ] Position off-screen
- [ ] Camera not framed for dual fighters
- [ ] Skeleton initialization failed
- [ ] Animation mixer error

### Evidence Required
- Screenshot of Versus Mode character select
- Screenshot of Versus arena (are fighters visible?)
- Network requests for all model URLs
- HTTP status for each request
- Console errors
- Scene graph inspection
- Camera position/target for dual-fighter view
- Material/opacity for each fighter mesh
- Skeleton state

---

## Investigation Findings

### Failure 2: Campaign Identity ("Beast Wars Campaign") - ROOT CAUSE IDENTIFIED

**Location:** apps/web/src/components/game/CampaignMap.tsx, line 58

**Current code:**
```tsx
<h1 className="text-4xl font-black bg-gradient-to-r from-amber-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent mb-2">
  Beast Wars Campaign
</h1>
```

**Root cause:** Hard-coded string "Beast Wars Campaign" in CampaignMap component. This is incorrect branding and should be replaced with "Legends of Kai-Jax Campaign" or similar canonical campaign name.

**Source:** Not in story_missions.ts (which correctly contains "Legends of Kai-Jax: The Memory Hero" in documentation). Appears only in CampaignMap UI component as hard-coded string.

**Severity:** High - incorrect branding displayed to user

---

### Failure 1: Mission CTA Unreachable - ROOT CAUSE ANALYSIS

**Location:** apps/web/src/components/game/CampaignMap.tsx

**Layout structure:**
- Main container: `className="h-screen w-full p-6 overflow-auto"` (line 43)
- Content wrapper: `className="max-w-3xl mx-auto"` (line 46)
- Mission detail panel: `selected && <div>` starts at line 142
- Begin Mission button: lines 189-195

**Root cause candidates:**
1. **Viewport height insufficient on mobile** - Mission detail panel + button may exceed viewport height on portrait mode
2. **Safe-area insets not handled** - No explicit padding for env(safe-area-inset-bottom)
3. **Overflow:auto on parent** - Does scroll work? Is there overflow detection?
4. **No fixed CTA positioning** - Button is inside scrollable content, not fixed/sticky

**Viewport meta tag:** Correctly configured with `viewport-fit=cover` (index.html line 5)

**Safe-area handling:** No env(safe-area-inset-bottom) found in App.tsx or CampaignMap.tsx

**Severity:** High - user cannot complete mission selection on mobile

---

### Failure 3: Training Mode Player Load - ROOT CAUSE IDENTIFIED

**Entry point:** LegendaryMainMenu.tsx lines 76-82 → App.tsx lines 232-271 → AdventureCharacter.tsx

**Character rendering:** AdventureCharacter.tsx uses OptimizedBeastModel (line 192), NOT GLBCharacterModel

**Critical finding (lines 188-189 in AdventureCharacter.tsx):**
```
Use the battle renderer (OptimizedBeastModel) for the player — it renders 
reliably on-device, unlike GLBCharacterModel which came up invisible in 
the adventure scene (only the locator ring showed).
```

**Root cause hypothesis:** OptimizedBeastModel may not be initializing correctly on mobile, or getFighterById() returns undefined/invalid fighter data for 'kai-jax'.

**Fallback detection:** If OptimizedBeastModel fails, the component still renders:
- PlayerLocator (ground ring + floating pointer)
- Dynamic shadow/blob

But the actual character mesh may not render. This would explain "player doesn't load" while the locator ring might be visible.

**Severity:** High - player character invisible on Training mode entry

---

### Failure 4: Versus Mode Character Visibility - INVESTIGATION REQUIRED

**Likely issue:** VersusCharacterSelect component rendering character models before/during selection. Model loading failures would make fighters invisible.

**Need to investigate:**
- VersusCharacterSelect component character rendering
- Character preview mesh/model rendering
- Model HTTP requests for both fighters

---

## Root Cause Summary

(To be populated after investigation completes)

---

## Narrow Fix Plan

(To be populated after root causes identified)

---

## Regression Surface

(To be populated after fix scope determined)

---

## Mobile Retest Checklist

After fixes applied:

- [ ] 1. Mission button visible on screen
- [ ] 2. Mission button within reachable touch area
- [ ] 3. Mission begins without error
- [ ] 4. Story Mode displays correct campaign title (Legends of Kai-Jax)
- [ ] 5. Training Mode: player character visible
- [ ] 6. Training Mode: movement input works
- [ ] 7. Versus Mode: first fighter visible
- [ ] 8. Versus Mode: second fighter visible
- [ ] 9. Versus Mode: both fighters visible together
- [ ] 10. No empty/invisible roster entries selectable

---

**Status:** Investigation phase 1 starting

