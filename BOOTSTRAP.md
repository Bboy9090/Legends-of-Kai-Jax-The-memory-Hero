# BOOTSTRAP.md

## Step 0: One-Time Decisions

### Repo Strategy
- One repo for the game: `LEGENDS OF KAI-JAX: THE MEMORY HERO`.
- Keep `engine` and `game logic` in this repo as structured.
- If you later port to Unity, create another repo (`LEGENDS OF KAI-JAX: THE MEMORY HERO`) and reuse mission/boss JSON.

### Branch Strategy
- `main`: Always stable (playable).
- `dev`: Integration branch.
- Feature branches: `feat/<issue-id>-short-name`.

---

## Step 1: GitHub Project (Board + Automations)

### Create the Project Board
1. Go to repo → Projects → Create a New project.
2. Choose Board.
3. Name it: **LEGENDS OF KAI-JAX: THE MEMORY HERO — Mission Factory**
4. Add the following Status fields as columns:
    - `Backlog`
    - `Ready`
    - `In Progress`
    - `In Review`
    - `Done`

### Turn On Built-In Automations
1. Default automation: Closed PR/Issues move to Done.
2. Add workflows to auto-add status:
    - “Item added to project → Status: Ready.”

---

## Step 2: Add Labels and Issue Templates

### Create Labels
Labels will help organize issues. Add the following labels:

#### Type
- `type:foundation`
- `type:mission`
- `type:boss`
- `type:character`
- `type:ui`
- `type:assets`
- `type:build`

#### Priority
- `P0-now`
- `P1-next`
- `P2-later`

#### Platform
- `plat:web`
- `plat:tablet`
- `plat:mobile`

#### AI Readiness
- `agent:ok`
- `agent:needs-design`
- `agent:blocked`

### Add Issue Templates
Create the `.github/ISSUE_TEMPLATE/` folder and include the following templates:

#### Foundation Task
```yaml
name: Foundation Task
description: Engine / pipeline / architecture work
title: "[FOUNDATION] "
labels: ["type:foundation","P0-now","agent:ok"]
body:
  - type: textarea
    id: goal
    attributes:
      label: Goal
      description: What is being built and why.
    validations:
      required: true
  - type: textarea
    id: acceptance
    attributes:
      label: Acceptance Criteria
      description: Bullet list of what must be true to close.
    validations:
      required: true
  - type: textarea
    id: files
    attributes:
      label: Files / Paths
      description: Where this work will land.
```

#### Mission Build
```yaml
name: Mission Build
description: Build a mission definition + hooks + playtest notes
title: "[MISSION] "
labels: ["type:mission","P1-next","agent:ok"]
body:
  - type: input
    id: missionId
    attributes:
      label: Mission ID (e.g., B1M04)
    validations:
      required: true
  - type: textarea
    id: design
    attributes:
      label: Mission Design
      description: Title, summary, locationId, kits, playable, phases.
    validations:
      required: true
  - type: textarea
    id: boss
    attributes:
      label: Boss/Miniboss (if any)
  - type: textarea
    id: acceptance
    attributes:
      label: Acceptance Criteria
      description: Runs end-to-end, checkpoints fire, rewards apply, no console errors.
```

#### Boss Build
```yaml
name: Boss Build
description: Boss phases + patterns + exploit windows + difficulty mods
title: "[BOSS] "
labels: ["type:boss","P1-next","agent:ok"]
body:
  - type: input
    id: bossId
    attributes:
      label: Boss ID
    validations:
      required: true
  - type: textarea
    id: phases
    attributes:
      label: Phase Design
      description: HP thresholds, attacks, hazards, adds.
    validations:
      required: true
  - type: textarea
    id: exploits
    attributes:
      label: Exploits / Counters
      description: Parry windows, weak spots, bait patterns.
    validations:
      required: true
```
---

## Step 3: Add Copilot Agent Guardrails

### Create `COPILOT_INSTRUCTIONS.md`
```markdown
# Copilot Instructions — SSGS Legacy

## Non-Negotiables
- Do not add new frameworks.
- Do not move folders without updating imports.
- Follow existing code style.
- Keep mission definitions in `src/game/missions/`.
- Keep engine code in `src/engine/`.
- Never hardcode asset paths outside `src/game/assets/manifest.ts`.

## Safety
- No shelling out to system tools.
- No remote code downloads.
- No eval / Function constructors.

## PR Requirements
- PR title: [ISSUE-ID] short summary
- Include: what changed, how to test, screenshots if UI.
```

---

(continues with additional step-by-step instructions for GH Actions, Codespaces, and PR Templates.)