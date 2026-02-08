# Deploying Legends of Kai-Jax

## Project Structure

```
/                        ← project root
├── apps/web/            ← THE GAME (static React + Three.js)
│   ├── src/             ← game source code
│   ├── dist/            ← build output (after npm run build)
│   ├── vite.config.ts   ← build config
│   └── wrangler.toml    ← Cloudflare Pages config
├── backend/             ← API server (FastAPI + MongoDB)
└── render.yaml          ← Render deployment config
```

The game client (`apps/web/`) is a **static site** — no server needed.
The backend (`backend/`) is optional and only needed for story progression tracking.

---

## Quick Start (Local / Cursor)

```bash
# 1. Clone or open the project root in Cursor
# 2. Install game dependencies
cd apps/web
npm install

# 3. Run the game
npm run dev
# Game opens at http://localhost:5000

# 4. (Optional) Run the backend
cd backend
cp .env.example .env       # fill in your MONGO_URL
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

---

## Cloudflare Pages

### Option A: Dashboard

1. Go to https://dash.cloudflare.com → Pages → Create a project
2. Connect your Git repo
3. Set these build settings:
   - **Root directory:** `apps/web`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Framework preset:** Vite
4. Deploy

### Option B: Wrangler CLI

```bash
cd apps/web
npm install
npm run build
npx wrangler pages deploy dist --project-name legends-of-kai-jax
```

### SPA Routing

Already included — `public/_redirects` handles this automatically:
```
/*  /index.html  200
```

---

## Render

### Static Site (Game Only)

1. Go to https://dashboard.render.com → New → Static Site
2. Connect your Git repo
3. Set these build settings:
   - **Root directory:** `apps/web`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Add a rewrite rule: `/*` → `/index.html` (for SPA routing)
5. Deploy

### Full Stack (Game + API)

The `render.yaml` at project root deploys both:
1. Go to Render Dashboard → Blueprints → New Blueprint Instance
2. Connect your Git repo
3. Render reads `render.yaml` and creates both services
4. Set the `MONGO_URL` and `CORS_ORIGINS` env vars on the API service

---

## Vercel (Alternative)

```bash
cd apps/web
npx vercel
# Framework: Vite
# Root: ./
# Build: npm run build
# Output: dist
```

Or add `apps/web/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Environment Variables

### Game Client (apps/web)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Backend API URL (only if using backend) |

### Backend (backend/)
| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | Yes | MongoDB connection string |
| `DB_NAME` | Yes | Database name (default: `kai_jax_db`) |
| `CORS_ORIGINS` | No | Allowed origins, comma-separated |
| `EMERGENT_LLM_KEY` | No | AI narrative features |

See `.env.example` files in each directory for full details.

---

## Notes

- The game is purely client-side — all character data, stats, and rendering logic runs in the browser
- The backend is only needed for story mode progression tracking (saves to MongoDB)
- For a quick deploy of just the game, use Cloudflare Pages or Render static site — no backend needed
- Build output is standard Vite (`dist/` folder with index.html + JS/CSS bundles)
