# 🚀 INSTALL & RUN DESKTOP APP

## 📍 Where is the Desktop App?

**Location:** `Legends-of-Kai-Jax-The-memory-Hero/apps/desktop/`

**Full Path:** `c:\Users\Bobby\Legends-of-Kai-Jax-The-memory-Hero\Legends-of-Kai-Jax-The-memory-Hero\apps\desktop\`

---

## ⚡ Quick Start (3 Steps)

### **Step 1: Navigate to Desktop App Folder**
```powershell
cd "c:\Users\Bobby\Legends-of-Kai-Jax-The-memory-Hero\Legends-of-Kai-Jax-The-memory-Hero\apps\desktop"
```

### **Step 2: Install Dependencies**
```powershell
pnpm install
```

### **Step 3: Build & Run**
```powershell
# Build TypeScript
pnpm build:ts

# Run in development mode
pnpm dev
```

---

## 📦 Build for Desktop Installation

### **Windows Build (Creates Installer)**
```powershell
# From the desktop folder
cd "c:\Users\Bobby\Legends-of-Kai-Jax-The-memory-Hero\Legends-of-Kai-Jax-The-memory-Hero\apps\desktop"

# Build TypeScript first
pnpm build:ts

# Build Windows installer
pnpm build:win
```

**Output Location:** `apps/desktop/dist/`

**Files Created:**
- `Legends of Kai-Jax-1.0.0-portable.exe` - Portable version (no install needed)
- `Legends of Kai-Jax Setup 1.0.0.exe` - Full installer (if NSIS target is configured)

---

## 🎯 Install on Desktop

### **Option 1: Portable Version (Recommended)**
1. Build the app: `pnpm build:win`
2. Go to: `apps/desktop/dist/`
3. Copy `Legends of Kai-Jax-1.0.0-portable.exe` to your Desktop
4. Double-click to run!

### **Option 2: Full Installer**
1. Build the app: `pnpm build:win`
2. Go to: `apps/desktop/dist/`
3. Run `Legends of Kai-Jax Setup 1.0.0.exe`
4. Follow the installer wizard
5. Choose "Create Desktop Shortcut" during installation

---

## 🔧 Prerequisites

Before building, make sure you have:

1. **Node.js** (v20.0.0 or higher)
   ```powershell
   node --version
   ```

2. **pnpm** (v8.0.0 or higher)
   ```powershell
   pnpm --version
   ```

3. **Web App Built First**
   ```powershell
   # From project root
   cd "c:\Users\Bobby\Legends-of-Kai-Jax-The-memory-Hero\Legends-of-Kai-Jax-The-memory-Hero"
   pnpm build
   ```

---

## 📂 Folder Structure

```
apps/desktop/
├── src/
│   ├── main.ts          # Main Electron process
│   ├── preload.ts       # Preload script
│   └── splash.html      # Splash screen
├── dist/                # Built files (after build:ts)
│   ├── main.js          # Compiled main process
│   └── preload.js       # Compiled preload
├── build/               # Icons and resources
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
└── INSTALL_AND_RUN.md   # This file
```

---

## 🚨 Troubleshooting

### **Error: "Cannot find module 'electron'"**
```powershell
cd apps/desktop
pnpm install
```

### **Error: "Web app not built"**
```powershell
# From project root
cd "c:\Users\Bobby\Legends-of-Kai-Jax-The-memory-Hero\Legends-of-Kai-Jax-The-memory-Hero"
pnpm build
```

### **Error: "TypeScript compilation failed"**
```powershell
cd apps/desktop
pnpm build:ts
# Check for errors in output
```

### **App won't start**
1. Check that web app is built: `apps/web/dist/` should exist
2. Check console for errors
3. Try running in dev mode first: `pnpm dev`

---

## 🎮 Running the App

### **Development Mode**
```powershell
cd apps/desktop
pnpm dev
```
- Opens Electron window
- Connects to `http://localhost:5173` (if web dev server is running)
- Or loads from `apps/web/dist/` if web app is built

### **Production Mode**
1. Build everything:
   ```powershell
   # From project root
   pnpm build
   
   # From desktop folder
   cd apps/desktop
   pnpm build:ts
   pnpm build:win
   ```

2. Run the built executable:
   - Go to `apps/desktop/dist/`
   - Double-click `Legends of Kai-Jax-1.0.0-portable.exe`

---

## 📍 Quick Reference

**Desktop App Folder:**
```
c:\Users\Bobby\Legends-of-Kai-Jax-The-memory-Hero\Legends-of-Kai-Jax-The-memory-Hero\apps\desktop\
```

**Build Output:**
```
c:\Users\Bobby\Legends-of-Kai-Jax-The-memory-Hero\Legends-of-Kai-Jax-The-memory-Hero\apps\desktop\dist\
```

**Desktop Shortcut:**
- After building, copy the `.exe` from `dist/` to your Desktop
- Or use the installer to create a shortcut automatically

---

## ✅ Status

**Ready to build and install!**

Follow the steps above to create your desktop app installer.
