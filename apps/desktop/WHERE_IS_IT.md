# 📍 WHERE IS THE DESKTOP APP?

## 🎯 Quick Answer

**Desktop App Location:**
```
c:\Users\Bobby\Legends-of-Kai-Jax-The-memory-Hero\Legends-of-Kai-Jax-The-memory-Hero\apps\desktop\
```

**After Building, It Will Be:**
```
c:\Users\Bobby\Legends-of-Kai-Jax-The-memory-Hero\Legends-of-Kai-Jax-The-memory-Hero\apps\desktop\dist\
```

**On Your Desktop (After Running Install Script):**
```
C:\Users\Bobby\Desktop\Legends of Kai-Jax-1.0.0-portable.exe
```

---

## 🚀 EASIEST WAY: Run the Install Script

### **Option 1: Double-Click the Script**
1. Go to: `apps/desktop/` folder
2. Right-click `BUILD_AND_INSTALL.ps1`
3. Select "Run with PowerShell"
4. Wait for it to build and install
5. Done! App will be on your Desktop!

### **Option 2: Run from PowerShell**
```powershell
cd "c:\Users\Bobby\Legends-of-Kai-Jax-The-memory-Hero\Legends-of-Kai-Jax-The-memory-Hero\apps\desktop"
.\BUILD_AND_INSTALL.ps1
```

---

## 📂 Folder Structure

```
apps/desktop/
├── src/                    # Source code (TypeScript)
│   ├── main.ts            # Main Electron process
│   ├── preload.ts         # Preload script
│   └── splash.html        # Splash screen
├── dist/                  # Built files (after build)
│   └── *.exe             # Your desktop app!
├── BUILD_AND_INSTALL.ps1  # ⭐ USE THIS SCRIPT!
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

---

## 🎮 Manual Build (If Script Doesn't Work)

### **Step 1: Open PowerShell**
Press `Win + X` and select "Windows PowerShell" or "Terminal"

### **Step 2: Navigate to Desktop App**
```powershell
cd "c:\Users\Bobby\Legends-of-Kai-Jax-The-memory-Hero\Legends-of-Kai-Jax-The-memory-Hero\apps\desktop"
```

### **Step 3: Install Dependencies**
```powershell
pnpm install
```

### **Step 4: Build TypeScript**
```powershell
pnpm build:ts
```

### **Step 5: Build Web App First (if not built)**
```powershell
cd ..\..
pnpm build
cd apps\desktop
```

### **Step 6: Build Windows Executable**
```powershell
pnpm build:win
```

### **Step 7: Copy to Desktop**
```powershell
Copy-Item "dist\Legends of Kai-Jax-1.0.0-portable.exe" "$env:USERPROFILE\Desktop\" -Force
```

---

## ✅ What the Script Does

1. ✅ Installs all dependencies
2. ✅ Builds TypeScript code
3. ✅ Builds web app (if needed)
4. ✅ Creates Windows executable
5. ✅ Copies to your Desktop
6. ✅ Creates a shortcut
7. ✅ Opens Desktop folder to show you!

---

## 🎯 Quick Reference

**To Build & Install:**
```powershell
cd apps\desktop
.\BUILD_AND_INSTALL.ps1
```

**To Just Run (Development):**
```powershell
cd apps\desktop
pnpm dev
```

**To Find Built App:**
```
apps\desktop\dist\*.exe
```

---

**Status:** ✅ Ready to build and install!
