# CURSOR DEPLOYMENT GUIDE
## The Aeterna Covenant - Complete Setup

**Purpose:** Deploy your PWA game to production using Cursor IDE  
**Target:** GitHub Pages (Free Hosting)  
**Platform:** iPad, Mobile, PC

---

## 🚀 QUICK START (3 Steps)

### Step 1: Initialize Repository
```bash
# In Cursor Terminal:
git init
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
```

### Step 2: Run Deployment Script
```bash
# Windows PowerShell:
.\deploy\deploy.ps1

# Or manually:
npm install
npm run deploy
```

### Step 3: Enable GitHub Pages
1. Go to GitHub Repo Settings
2. Pages → Source: GitHub Actions
3. Wait 2-3 minutes for deployment
4. Visit: `https://YOUR_USERNAME.github.io/Aeterna-Covenant`

---

## 📂 PROJECT STRUCTURE

```
/Aeterna-Covenant
├── index.html              # Main game file
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── package.json            # Dependencies
├── .github/
│   └── workflows/
│       └── deploy.yml      # Auto-deploy on push
├── deploy/
│   ├── deploy.ps1          # Windows deployment script
│   └── deploy.sh           # Mac/Linux deployment script
└── docs/                   # All documentation
```

---

## 🛠️ DEPLOYMENT OPTIONS

### Option A: Automatic (GitHub Actions)
**Best for:** Set it and forget it
- Every push auto-deploys
- Zero manual steps after setup

### Option B: Manual (Local Build)
**Best for:** Testing before push
- Build locally first
- Deploy when ready

---

## 📝 NEXT STEPS

See `deploy/DEPLOYMENT_INSTRUCTIONS.md` for detailed steps.
