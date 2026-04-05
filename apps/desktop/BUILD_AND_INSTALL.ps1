# 🚀 BUILD AND INSTALL DESKTOP APP
# This script builds the desktop app and copies it to your Desktop

Write-Host "🚀 Building Legends of Kai-Jax Desktop App..." -ForegroundColor Cyan

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Check if pnpm is installed
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: pnpm is not installed!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}

# Step 1: Install dependencies
Write-Host "`n📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

# Step 2: Build TypeScript
Write-Host "`n🔨 Step 2: Building TypeScript..." -ForegroundColor Yellow
pnpm build:ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript build failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Check if web app is built
Write-Host "`n🔍 Step 3: Checking web app build..." -ForegroundColor Yellow
$webDistPath = Join-Path $scriptDir "..\web\dist"
if (-not (Test-Path $webDistPath)) {
    Write-Host "⚠️  Web app not built. Building web app first..." -ForegroundColor Yellow
    Set-Location (Join-Path $scriptDir "..\..")
    pnpm build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Web app build failed!" -ForegroundColor Red
        exit 1
    }
    Set-Location $scriptDir
}

# Step 4: Build Windows executable
Write-Host "`n🏗️  Step 4: Building Windows executable..." -ForegroundColor Yellow
pnpm build:win
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Windows build failed!" -ForegroundColor Red
    exit 1
}

# Step 5: Find the built executable
Write-Host "`n📂 Step 5: Finding built executable..." -ForegroundColor Yellow
$distPath = Join-Path $scriptDir "dist"
$exeFiles = Get-ChildItem -Path $distPath -Filter "*.exe" -Recurse | Where-Object { $_.Name -like "*Legends*Kai*Jax*" -or $_.Name -like "*portable*" }

if ($exeFiles.Count -eq 0) {
    Write-Host "❌ No executable found in dist folder!" -ForegroundColor Red
    Write-Host "Dist folder contents:" -ForegroundColor Yellow
    Get-ChildItem -Path $distPath -Recurse | Select-Object FullName
    exit 1
}

# Get the portable exe (preferred) or first exe found
$exeFile = $exeFiles | Where-Object { $_.Name -like "*portable*" } | Select-Object -First 1
if (-not $exeFile) {
    $exeFile = $exeFiles | Select-Object -First 1
}

Write-Host "✅ Found: $($exeFile.Name)" -ForegroundColor Green

# Step 6: Copy to Desktop
Write-Host "`n📋 Step 6: Copying to Desktop..." -ForegroundColor Yellow
$desktopPath = [Environment]::GetFolderPath("Desktop")
$desktopExePath = Join-Path $desktopPath $exeFile.Name

# Remove old version if exists
if (Test-Path $desktopExePath) {
    Write-Host "🗑️  Removing old version from Desktop..." -ForegroundColor Yellow
    Remove-Item $desktopExePath -Force
}

Copy-Item $exeFile.FullName $desktopExePath -Force
Write-Host "✅ Copied to: $desktopExePath" -ForegroundColor Green

# Step 7: Create shortcut (optional)
Write-Host "`n🔗 Step 7: Creating desktop shortcut..." -ForegroundColor Yellow
$shortcutPath = Join-Path $desktopPath "Legends of Kai-Jax.lnk"
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $desktopExePath
$shortcut.WorkingDirectory = Split-Path $desktopExePath
$shortcut.Description = "Legends of Kai-Jax: The Memory Hero"
$shortcut.Save()
Write-Host "✅ Shortcut created: $shortcutPath" -ForegroundColor Green

# Done!
Write-Host "`n🎉 SUCCESS! Desktop app is ready!" -ForegroundColor Green
Write-Host "`n📍 Location: $desktopExePath" -ForegroundColor Cyan
Write-Host "🚀 Double-click to run!" -ForegroundColor Cyan
Write-Host "`nPress any key to open the Desktop folder..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process "explorer.exe" -ArgumentList "/select,`"$desktopExePath`""
