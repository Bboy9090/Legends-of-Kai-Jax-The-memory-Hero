# PowerShell script to create desktop shortcut for Aeterna Covenant
$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\Aeterna Covenant.lnk")

# Get the current directory (project root)
$ProjectPath = (Get-Location).Path
$ScriptPath = "$ProjectPath\launch_game.ps1"

# Create a launch script
@"
# Launch Aeterna Covenant Game
cd `"$ProjectPath`"
Write-Host "Launching Aeterna Covenant..." -ForegroundColor Cyan
npm run dev --prefix apps/web
"@ | Out-File -FilePath $ScriptPath -Encoding UTF8

# Set shortcut properties
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-NoExit -ExecutionPolicy Bypass -File `"$ScriptPath`""
$Shortcut.WorkingDirectory = $ProjectPath
$Shortcut.Description = "Launch The Aeterna Covenant - A Mythic Platform Fighter PWA"
$Shortcut.IconLocation = "$env:SystemRoot\System32\shell32.dll,137" # Game controller icon

# Save the shortcut
$Shortcut.Save()

Write-Host "Desktop shortcut created successfully!" -ForegroundColor Green
Write-Host "Location: $DesktopPath\Aeterna Covenant.lnk" -ForegroundColor Yellow
Write-Host "`nDouble-click the shortcut to launch the game!" -ForegroundColor Cyan
