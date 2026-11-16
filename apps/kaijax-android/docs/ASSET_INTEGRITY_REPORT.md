# Asset & Bundle Integrity Report

## 1. Static Public & PWA Icon Assets (`public/` & `dist/`)
Verified present on disk and precached by Workbox (`dist/sw.js`, 16 entries, `1,387.98 KiB` total precache):

| File | Size | Purpose | Status |
| :--- | :--- | :--- | :--- |
| `public/icon.svg` | 1.3 KB | Scalable Kai-Jax vector emblem | Verified |
| `public/apple-touch-icon.png` | 5.6 KB | iOS home-screen touch icon | Verified |
| `public/pwa-192x192.png` | 6.1 KB | Web App Manifest 192px icon | Verified |
| `public/pwa-512x512.png` | 20 KB | Web App Manifest 512px icon | Verified |
| `public/pwa-maskable-512x512.png` | 20 KB | Android adaptive maskable icon | Verified |

## 2. Procedural 3D & Texture Assets (Zero External Model Bloat)
- **No external `.glb`/`.gltf`/`.hdr` files** are required at runtime; 100% of 3D geometry and textures are generated deterministically inside:
  - `src/game/engine/CharacterBuilder.ts` (501 lines): Articulated sabertooth hero rigs for Kai (4 spider limbs, 0 tails), Jax (7 storm mane spikes, 0 spider limbs, 0 tails), Kai-Jax (4 spider limbs, 7 storm mane spikes, **strictly 3 primary physical tails** — Ember `#F97316`, Memory `#8B5CF6`, Storm `#38BDF8`), and Fang Enforcer/Syndicate enemy rigs.
  - `src/game/engine/WorldBuilder.ts` (416 lines): Ashblock Heights wet alley geometry, rooftops, crane booms, Alley Gate barrier, Disrupted Memory Site crystal, and emissive trims.
  - `src/game/engine/ProceduralTextures.ts` (155 lines): Contact shadow radial maps, wet asphalt normal/roughness maps, brick facades.
  - `RoomEnvironment` IBL (`three/examples/jsm/environments/RoomEnvironment.js`): Generated at engine boot and cleanly disposed.
- **Native Android Placeholder Icons:** Capacitor generated standard launcher mipmaps inside `android/app/src/main/res/mipmap-*` matching `com.bobbyblanco.legendsofkaijax` (`Legends of Kai-Jax`). Prior to Play Store upload, custom branded adaptive mipmaps exported from `public/icon.svg` / `public/pwa-maskable-512x512.png` should replace default Capacitor mipmap icons.

## 3. Production Build Chunk Sizes (`vite build`)
- `dist/index.html`: `1.99 kB` (`0.87 kB` gzip)
- `dist/assets/index-*.css`: `38.80 kB` (`7.53 kB` gzip)
- `dist/assets/index-*.js`: `1,320.55 kB` (`366.20 kB` gzip — includes Three.js + React + Motion)
- `dist/manifest.webmanifest`: `0.55 kB`
- Copied intact into `android/app/src/main/assets/public/` via `npx cap sync android`.

## 4. Offline Legal & Font Dependency Audit
- `src/game/legal/offlineLegal.ts` contains **zero** external `http://` or `https://` URLs (enforced by automated test Suite 10).
- Google Fonts `<link>` in `index.html` is paired with Tailwind system sans/mono fallbacks and `vite-plugin-pwa` `CacheFirst` runtime caching so offline launches render cleanly without blocking first paint.
