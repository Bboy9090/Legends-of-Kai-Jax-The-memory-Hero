# LEGENDS OF KAI-JAX - DEPLOYMENT SCRIPT
# Windows PowerShell Deployment Script

Write-Host "🎮 LEGENDS OF KAI-JAX - DEPLOYMENT INITIALIZED" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "❌ Git not initialized. Running git init..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized." -ForegroundColor Green
}

# Check for required files
$requiredFiles = @("index.html", "manifest.json", "sw.js")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ Missing required files:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Please ensure all PWA files are in the root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ All required files found." -ForegroundColor Green
Write-Host ""

# Check if .github/workflows exists
if (-not (Test-Path .github\workflows)) {
    Write-Host "Creating GitHub Actions directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path .github\workflows -Force | Out-Null
    Write-Host "✅ Directory created." -ForegroundColor Green
}

# Add all files to git
Write-Host "📦 Staging files for commit..." -ForegroundColor Cyan
git add .

# Commit with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "Deploy: Legends of Kai-Jax PWA - $timestamp"

Write-Host "💾 Committing changes..." -ForegroundColor Cyan
git commit -m $commitMessage

# Check if remote exists
$remoteExists = git remote | Select-String -Pattern "origin"

if (-not $remoteExists) {
    Write-Host ""
    Write-Host "⚠️  No remote repository configured." -ForegroundColor Yellow
    Write-Host "Please run: git remote add origin YOUR_GITHUB_REPO_URL" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example:" -ForegroundColor Cyan
    Write-Host "git remote add origin https://github.com/YOUR_USERNAME/Legends-of-Kai-Jax-The-memory-Hero.git" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then run this script again to push." -ForegroundColor Yellow
    exit 0
}

# Push to main branch
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your game will be live at:" -ForegroundColor Cyan
    Write-Host "https://YOUR_USERNAME.github.io/Legends-of-Kai-Jax-The-memory-Hero" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "⏳ Wait 2-3 minutes for GitHub Pages to build." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🎮 THE LEGEND IS LIVE!" -ForegroundColor Magenta
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Check your git remote configuration." -ForegroundColor Red
    exit 1
}
