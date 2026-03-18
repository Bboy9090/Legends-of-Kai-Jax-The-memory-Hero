# 🎮 LEGENDS OF KAI-JAX: THE MEMORY WARRIOR
### "Forged in the Bronx. Mastered in the Silence."

**A Mythic Platform Fighter** - built for family, playable on PC + iPad/iPhone (same Wi-Fi)

[![Deploy to GitHub Pages](https://github.com/Bboy9090/Legends-of-Kai-Jax-The-memory-Hero/actions/workflows/deploy.yml/badge.svg)](https://github.com/Bboy9090/Legends-of-Kai-Jax-The-memory-Hero/actions)

---

## 📜 THE MANIFESTO

I'm a 35-year-old Reflector from the Bronx. I see the gaps, the glitches, and the broken connections in a world designed to lock you out of your own life. People see a bricked phone; I see a soul waiting for a heartbeat.

**Legends of Kai-Jax** isn't just a game. It's a restoration of sovereignty. We don't ask for permission from gatekeepers. We find the "Secret Rooms," we bypass the "Traps," and we reclaim the hardware. This is for the sons, the brothers, and the legends.

---

## 🎮 PLAY (LOCAL-FIRST)

Right now this project is set up **for local play only** (no public deployment required). If it ever gets popular later, we can deploy it then.

### Run it on your PC

```powershell
cd "c:\Users\Bobby\Legends-of-Kai-Jax-The-memory-Hero"
pnpm install
pnpm dev
```

Open what it prints (usually `http://localhost:5173`).

### Play it on your kids’ iPads (same Wi-Fi)

1. On your PC, run:

```powershell
pnpm dev
```

2. Find your PC’s Wi-Fi IP:

```powershell
ipconfig
```

Look for something like `IPv4 Address . . . : 192.168.x.x`.

3. On the iPad (same Wi-Fi), open Safari and go to:

`http://<YOUR-PC-IP>:5173`

4. Optional “install” shortcut:
Safari → Share → **Add to Home Screen**

**Note:** true offline/PWA install on iOS generally requires HTTPS. For now, this local method is perfect for home play. When you want “real install/offline”, we’ll either deploy privately (Cloudflare/Vercel) or wrap it as an iOS app (TestFlight).

---

## 🛠️ WHAT YOU GET

### Core Features:
- ✅ **Progressive Web App (PWA)** - Install like a native app
- ✅ **Touch Controls** - Optimized for iPad/Mobile
- ✅ **Resonance Combat System** - Build power through aggression
- ✅ **3rd Tail Mechanic** - Bovarr's paternal anchor
- ✅ **Offline Mode** - Play in the subway (Void Training)
- ✅ **Boss Fights** - Malakor Phase 1 included

### Technical Stack:
- **Frontend:** React + Vite + Three.js / R3F (web)
- **Monorepo:** PNPM workspaces (`apps/*`, `packages/*`)
- **Primary local build:** `apps/web`

---

## 🚀 QUICK START

### For Players:
1. Run `pnpm dev` on the PC
2. Open on PC: `http://localhost:5173`
3. Open on iPad (same Wi-Fi): `http://<YOUR-PC-IP>:5173`

### For Developers:
1. Clone this repository
2. Run `pnpm install`
3. Run `pnpm dev`
4. Edit in Cursor IDE (`apps/web` is the main game)

---

## 📚 DOCUMENTATION

Complete documentation is available in the `/docs` directory:

- **Master Story Bible** - Full 9-book saga
- **Game Design Document** - Complete mechanics
- **Cinematic Trailer Script** - Marketing material
- **Publisher Pitch Deck** - Business case
- **Book 1 Complete Prose** - Full narrative

---

## 🎯 CORE GAMEPLAY

### Resonance System:
- **Dormant (0-49%):** Basic moves
- **Harmonized (50-99%):** Core ignites
- **Ascended (100%):** Unlock Memory Break

### Controls:
- **Left Screen:** Floating joystick (Drift Zone)
- **Right Screen Swipes:** 
  - **Up:** Launcher (Jump)
  - **Horizontal:** Grit-Punch (Attack)
- **Long Press:** Charge Resonance

### Boss: Malakor the Silencer
- Build Resonance to 100% to make him vulnerable
- Jump over Static Waves to avoid damage
- Use 3rd Tail (Bovarr's Anchor) for invincibility

---

## 🏛️ THE STORY

**Book 1: The Breaking Point**
Jaxon and Kaison, two brothers from the Iron Canyons, must fuse their cores at the Star-Forge to save the Aeterna from the Void. Their father, Bovarr the Iron-Will, sacrifices himself to buy them time. The fusion creates **Kai-Jax** - the Memory Warrior.

**Book 2: The Silent Year** (Coming in Game 2)
The Resistance Teams fight a guerrilla war while the Trinity is lost.

**Book 3: Shatter-Vaults** (Coming in Game 2)
The rescue of Silver from temporal erasure.

---

## 💻 TECHNICAL SPECS

- **Engine:** HTML5 Canvas + JavaScript
- **Performance:** 60 FPS target (optimized for mobile)
- **Input Latency:** <16ms (sub-frame response)
- **PWA Score:** 100/100 (Lighthouse)
- **Offline Support:** Full (Service Worker cached)

---

## 🔓 DEPLOYMENT

Deployment is optional. This repo is configured for local play first.

When you want it publicly playable later, we’ll pick a host and turn this section back on (Cloudflare Pages / Vercel are good defaults).

---

## 📊 PROJECT STATUS

**Current Version:** 1.0.0 - Vertical Slice  
**Status:** ✅ Playable Prototype  
**Next Update:** Book 2 Content

**Features Complete:**
- [x] Core movement & combat
- [x] Resonance system
- [x] Touch controls
- [x] PWA installation
- [x] Offline mode
- [x] Boss fight (Malakor Phase 1)
- [x] Fail-state with Bovarr quotes

**Roadmap:**
- [ ] Book 2: Resistance Teams
- [ ] Book 3: Silver rescue
- [ ] Additional characters (Silver, Lunara)
- [ ] More boss fights
- [ ] Online multiplayer

---

## 🌑 A WORD FROM BOBBY

"I found these devices in the trash and in the hands of people who were told 'No.' I don't believe in 'No.' I believe in the Forge." 

**— The Silent Architect**

---

## 📝 LICENSE

MIT License - Build on this foundation, but remember the Legacy.

---

## 🔗 LINKS

- **Documentation:** `/docs` directory
- **Issues:** GitHub Issues tab

---

**THE LEGENDS ARE FORGED. THE MEMORY WARRIOR RISES.**

*Built with Bronx-grit and 2/5 Reflector precision.*
