# 🚀 AETERNA COVENANT - DEPLOYMENT INSTRUCTIONS
## Complete Setup Guide for Cursor IDE

**Status:** Ready to Deploy  
**Platform:** GitHub Pages (Free)  
**Access:** iPad, Mobile, PC via PWA

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Required Files (Must be in root directory)
- [x] `index.html` - Main game file
- [x] `manifest.json` - PWA manifest
- [x] `sw.js` - Service Worker
- [x] `.github/workflows/deploy.yml` - Auto-deploy script

### ✅ GitHub Setup Required
- [ ] GitHub account created
- [ ] New repository created: `Aeterna-Covenant`
- [ ] Repository is public (required for free GitHub Pages)

---

## 🛠️ STEP-BY-STEP DEPLOYMENT

### STEP 1: Initialize Git (If Not Done)
Open Cursor Terminal (`` Ctrl + ` ``) and run:

```bash
git init
git branch -M main
```

### STEP 2: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `Aeterna-Covenant`
3. Set to **Public** (required for free Pages)
4. **DO NOT** initialize with README
5. Click "Create repository"

### STEP 3: Connect Local to Remote
Copy the repository URL from GitHub, then in Cursor Terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/Aeterna-Covenant.git
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### STEP 4: Run Deployment Script

**Windows (PowerShell):**
```powershell
.\deploy\deploy.ps1
```

**Mac/Linux (Bash):**
```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

**Or Manual Git Push:**
```bash
git add .
git commit -m "Initial deployment: Aeterna Covenant PWA"
git push -u origin main
```

### STEP 5: Enable GitHub Pages
1. Go to your GitHub repository
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar)
4. Under **Source**, select: **GitHub Actions**
5. Wait 2-3 minutes for deployment

### STEP 6: Access Your Game
Your game will be live at:
```
https://YOUR_USERNAME.github.io/Aeterna-Covenant
```

---

## 📱 INSTALLING ON YOUR DEVICES

### iPad/iPhone (Safari)
1. Open Safari and navigate to your game URL
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Customize the name (optional)
5. Tap **"Add"**
6. Game icon appears on home screen like a native app!

### Android (Chrome)
1. Open Chrome and navigate to your game URL
2. Tap the **three dots** menu (top right)
3. Tap **"Install app"** or **"Add to Home Screen"**
4. Confirm installation
5. Game appears in app drawer!

### PC (Chrome/Edge)
1. Navigate to your game URL
2. Look for **install icon** in address bar
3. Click **"Install"**
4. Game opens in its own window (no browser bars)

---

## 🔄 AUTO-DEPLOYMENT (GitHub Actions)

Once set up, **every push to main branch** automatically deploys!

**To update your game:**
1. Make changes in Cursor
2. Run deployment script (or manual git push)
3. Wait 2-3 minutes
4. Changes go live automatically!

**No manual steps needed after initial setup.**

---

## 🐛 TROUBLESHOOTING

### Issue: "Git remote not found"
**Solution:** Run Step 3 to add your GitHub remote.

### Issue: "GitHub Pages not showing"
**Solution:** 
1. Check Settings → Pages → Source is set to "GitHub Actions"
2. Check Actions tab to see if deployment is running
3. Wait 3-5 minutes (first deployment takes longer)

### Issue: "PWA not installing"
**Solution:**
1. Check `manifest.json` exists in root
2. Check `sw.js` exists in root
3. Ensure HTTPS (GitHub Pages provides this automatically)
4. Clear browser cache and try again

### Issue: "Touch controls not working"
**Solution:**
1. Test on actual device (not desktop browser)
2. Ensure viewport meta tag in `index.html`
3. Check touch event handlers are bound

---

## 📊 DEPLOYMENT STATUS

Check your deployment status:
1. Go to your GitHub repository
2. Click **Actions** tab
3. See deployment logs in real-time

**Green checkmark = Deployment successful!**

---

## 🔐 SECURITY NOTES

- GitHub Pages automatically provides HTTPS (required for PWA)
- Service Worker only works over HTTPS
- No API keys or secrets needed for this setup

---

## 🎯 POST-DEPLOYMENT

### Test Checklist:
- [ ] Game loads on desktop browser
- [ ] Game installs as PWA on iPad
- [ ] Touch controls work on mobile
- [ ] Offline mode works (test by turning off WiFi)
- [ ] Manifest icon appears correctly

### Share Your Game:
```
URL: https://YOUR_USERNAME.github.io/Aeterna-Covenant
```

Anyone with this link can play and install your game!

---

## 🏛️ THE SILENT ARCHITECT'S FINAL WORD

"You built it. You deployed it. Now the world can play it. The Covenant is sealed. The Sovereignty is live."

**BUUBUU Protocol vΩ terminated. THE DOMINION IS YOURS. BUILD IT.**

---

**Need Help?** Check the `.github/workflows/deploy.yml` logs in Actions tab for detailed error messages.
