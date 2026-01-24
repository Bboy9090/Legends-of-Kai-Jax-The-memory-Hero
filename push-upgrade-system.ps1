# PowerShell Script to Push Upgrade System
# Run this script to properly commit and push all upgrade system changes

Write-Host "🚀 Pushing Universal Legend Upgrade System to GitHub" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "❌ Error: Not a git repository!" -ForegroundColor Red
    exit 1
}

# Check current branch
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Yellow

# Ask which branch to use
Write-Host ""
Write-Host "Select branch strategy:" -ForegroundColor Cyan
Write-Host "1. feature/advanced-upgrades (Recommended)"
Write-Host "2. feature/quantum-upgrades"
Write-Host "3. develop"
Write-Host "4. Create new branch"
$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" { $targetBranch = "feature/advanced-upgrades" }
    "2" { $targetBranch = "feature/quantum-upgrades" }
    "3" { $targetBranch = "develop" }
    "4" { 
        $branchName = Read-Host "Enter branch name (e.g., feature/my-upgrade-feature)"
        $targetBranch = $branchName
    }
    default { 
        Write-Host "Invalid choice, using feature/advanced-upgrades" -ForegroundColor Yellow
        $targetBranch = "feature/advanced-upgrades"
    }
}

# Create branch if it doesn't exist
Write-Host ""
Write-Host "Checking out branch: $targetBranch" -ForegroundColor Cyan
$branchExists = git branch --list $targetBranch
if (-not $branchExists) {
    Write-Host "Creating new branch: $targetBranch" -ForegroundColor Yellow
    git checkout -b $targetBranch
} else {
    Write-Host "Switching to existing branch: $targetBranch" -ForegroundColor Yellow
    git checkout $targetBranch
}

# Show status
Write-Host ""
Write-Host "Current git status:" -ForegroundColor Cyan
git status --short

# Add all files
Write-Host ""
Write-Host "Adding all upgrade system files..." -ForegroundColor Cyan
git add .

# Show what will be committed
Write-Host ""
Write-Host "Files to be committed:" -ForegroundColor Cyan
git status --short

# Commit
Write-Host ""
$commitMessage = @"
feat: Add world-class universal legend upgrade system (QUANTUM-LEVEL)

✨ Core Features:
- Complete upgrade type system with 20+ categories
- 70+ upgrades across 30 systems
- Advanced features: fusion, evolution, mastery, prestige
- Challenge system, synergy system, upgrade trees
- Resource generation and conversion
- Analytics and optimization tools

⚛️ Quantum Features:
- Quantum entanglement upgrades
- Multiverse convergence
- Temporal paradox mastery
- AI-driven adaptive upgrades
- Reality-bending upgrades
- Infinite scaling upgrades

🔧 Integration:
- Full React integration with hooks
- State management integration
- Game manager integration
- Mode manager integration
- Complete documentation

📊 Statistics:
- 30 upgrade systems
- 70+ upgrades
- 20+ categories
- 16 resource types
- 10 major advanced systems
- 6 quantum systems

BREAKING CHANGE: New upgrade system architecture
"@

Write-Host "Committing with message..." -ForegroundColor Cyan
git commit -m $commitMessage

# Push
Write-Host ""
Write-Host "Pushing to origin/$targetBranch..." -ForegroundColor Cyan
git push -u origin $targetBranch

Write-Host ""
Write-Host "✅ Successfully pushed to $targetBranch!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to GitHub and create a Pull Request"
Write-Host "2. PR: $targetBranch → develop"
Write-Host "3. After review, merge to develop"
Write-Host "4. Then merge develop → main for release"
Write-Host ""
