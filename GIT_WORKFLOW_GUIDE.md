# 🚀 GIT WORKFLOW GUIDE - Upgrade System

## Branch Strategy

### Main Branches

- **`main`** - Production-ready code
- **`develop`** - Integration branch for features

### Feature Branches

- **`feature/upgrade-system`** - Core upgrade system
- **`feature/advanced-upgrades`** - Advanced features (fusion, evolution, etc.)
- **`feature/quantum-upgrades`** - Quantum/ultra-advanced features
- **`feature/upgrade-ui`** - UI components
- **`feature/upgrade-analytics`** - Analytics and optimization

## Quick Start - Setting Up Branches

### 1. Initialize and Create Branches

```bash
# Make sure you're in the project root
cd Legends-of-Kai-Jax-The-memory-Hero

# Check current branch
git branch

# Create and switch to develop branch
git checkout -b develop

# Create feature branches
git checkout -b feature/upgrade-system
git checkout -b feature/advanced-upgrades
git checkout -b feature/quantum-upgrades

# Switch back to main
git checkout main
```

### 2. Current Work - Push Upgrade System

```bash
# Make sure you're on the right branch
git checkout feature/advanced-upgrades

# Check status
git status

# Add all new files
git add packages/shared/src/types/upgrade.types.ts
git add packages/shared/src/data/upgrade_data.ts
git add packages/shared/src/data/advanced_upgrade_data.ts
git add packages/shared/src/data/quantum_upgrade_data.ts
git add packages/shared/src/utils/UpgradeManager.ts
git add packages/shared/src/utils/AdvancedUpgradeManager.ts
git add packages/shared/src/utils/upgradeUtils.ts
git add packages/shared/src/utils/upgradeSerialization.ts
git add packages/shared/src/utils/upgradeAnalytics.ts
git add apps/web/src/hooks/useUpgrades.ts
git add docs/UNIVERSAL_LEGEND_UPGRADE_SYSTEM.md
git add docs/UPGRADE_SYSTEM_INTEGRATION.md
git add BEYOND_LEGENDARY_UPGRADES.md
git add UPGRADE_SYSTEM_COMPLETE.md

# Or add everything
git add .

# Commit with descriptive message
git commit -m "feat: Add world-class universal legend upgrade system

- Complete upgrade type system with 13+ categories
- 60+ upgrades across 24 systems
- Advanced features: fusion, evolution, mastery, prestige
- Challenge system, synergy system, upgrade trees
- Resource generation and conversion
- Analytics and optimization tools
- Quantum/ultra-advanced upgrades
- Full React integration with hooks
- Complete documentation

BREAKING CHANGE: New upgrade system architecture"

# Push to remote (create branch if doesn't exist)
git push -u origin feature/advanced-upgrades
```

### 3. Create Pull Request

After pushing, create a PR on GitHub:
1. Go to GitHub repository
2. Click "Pull Requests" → "New Pull Request"
3. Select `feature/advanced-upgrades` → `develop`
4. Add description
5. Request review
6. Merge when approved

## Branch Workflow

### Feature Development

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/my-new-feature

# Make changes
# ... edit files ...

# Commit changes
git add .
git commit -m "feat: Add new feature"

# Push feature branch
git push -u origin feature/my-new-feature

# Create PR: feature/my-new-feature → develop
```

### Merge to Develop

```bash
# After PR is approved and merged
git checkout develop
git pull origin develop

# Delete local feature branch (optional)
git branch -d feature/my-new-feature
```

### Release to Main

```bash
# When ready for production
git checkout develop
git pull origin develop
git checkout -b release/v2.0.0

# Final testing, version bumps, etc.
# ... make release changes ...

git commit -m "chore: Release v2.0.0"
git push origin release/v2.0.0

# Create PR: release/v2.0.0 → main
# After merge, tag release
git checkout main
git pull origin main
git tag -a v2.0.0 -m "Release v2.0.0 - Beyond Legendary Upgrade System"
git push origin v2.0.0
```

## Commit Message Convention

Use conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Tests
- `chore:` - Maintenance

Examples:
```bash
git commit -m "feat: Add fusion system to upgrade manager"
git commit -m "fix: Resolve upgrade cost calculation bug"
git commit -m "docs: Update upgrade system documentation"
git commit -m "refactor: Optimize upgrade state management"
```

## Current Status - What to Push

### Files to Commit

**Core System:**
- `packages/shared/src/types/upgrade.types.ts` ✅
- `packages/shared/src/data/upgrade_data.ts` ✅
- `packages/shared/src/data/advanced_upgrade_data.ts` ✅
- `packages/shared/src/data/quantum_upgrade_data.ts` ✅ (NEW)
- `packages/shared/src/utils/UpgradeManager.ts` ✅
- `packages/shared/src/utils/AdvancedUpgradeManager.ts` ✅
- `packages/shared/src/utils/upgradeUtils.ts` ✅
- `packages/shared/src/utils/upgradeSerialization.ts` ✅
- `packages/shared/src/utils/upgradeAnalytics.ts` ✅

**Integration:**
- `apps/web/src/hooks/useUpgrades.ts` ✅
- `apps/web/src/lib/stores/useWorldState.ts` ✅
- `packages/engine/src/game/GameStateManager.ts` ✅
- `packages/engine/src/modes/LabModeManager.ts` ✅
- `packages/engine/src/modes/HavenModeManager.ts` ✅

**Documentation:**
- `docs/UNIVERSAL_LEGEND_UPGRADE_SYSTEM.md` ✅
- `docs/UPGRADE_SYSTEM_INTEGRATION.md` ✅
- `UPGRADE_SYSTEM_COMPLETE.md` ✅
- `BEYOND_LEGENDARY_UPGRADES.md` ✅
- `GIT_WORKFLOW_GUIDE.md` ✅ (NEW)

**CI/CD:**
- `.github/workflows/upgrade-system-ci.yml` ✅ (NEW)

## Quick Push Commands

```bash
# 1. Check status
git status

# 2. Add all changes
git add .

# 3. Commit
git commit -m "feat: Add quantum upgrade system and Git workflow

- Quantum upgrades beyond transcendent
- Multiverse and temporal paradox upgrades
- AI-driven adaptive upgrades
- Reality-bending upgrades
- Infinite scaling upgrades
- Complete Git workflow guide
- CI/CD pipeline setup"

# 4. Push to feature branch
git push -u origin feature/advanced-upgrades

# Or push to new quantum branch
git checkout -b feature/quantum-upgrades
git push -u origin feature/quantum-upgrades
```

## Branch Protection Rules

Set up on GitHub:
1. Go to Settings → Branches
2. Add rule for `main`:
   - Require pull request reviews
   - Require status checks
   - Require branches to be up to date
3. Add rule for `develop`:
   - Require pull request reviews
   - Allow force pushes (for hotfixes)

## Release Checklist

- [ ] All tests passing
- [ ] Type checking passes
- [ ] Documentation updated
- [ ] Version bumped
- [ ] Changelog updated
- [ ] PR created and reviewed
- [ ] Merged to develop
- [ ] Tested in staging
- [ ] Merged to main
- [ ] Tagged release
- [ ] Release notes published

---

**Ready to push!** 🚀
